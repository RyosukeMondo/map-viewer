'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMapProps, MapLoadingState } from '../types/google-maps';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '../lib/google-maps';
import { MapError, MapError as MapErrorType } from './MapError';
import { MapLoading } from './MapLoading';
import { createMapError, isOffline, createOfflineError } from '../lib/error-handling';

/**
 * GoogleMap component that renders an interactive Google Map
 * Handles map initialization, state management, and proper cleanup
 */
export const GoogleMap: React.FC<GoogleMapProps> = ({
  config,
  className = '',
  onMapLoad,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const initializationAttemptedRef = useRef<boolean>(false);
  const [loadingState, setLoadingState] = useState<MapLoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
  });
  const [mapError, setMapError] = useState<MapErrorType | null>(null);

  /**
   * Set up interaction event handlers for pan and zoom events
   * Implements requirement 1.2 for panning and zooming functionality
   */
  const setupMapInteractionHandlers = (map: google.maps.Map) => {
    // Handle zoom changes
    map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom();
      // Optional: Add custom zoom handling logic here
      console.debug('Map zoom changed to:', newZoom);
    });

    // Handle center changes (panning)
    map.addListener('center_changed', () => {
      const newCenter = map.getCenter();
      // Optional: Add custom pan handling logic here
      console.debug('Map center changed to:', newCenter?.toJSON());
    });

    // Handle drag start
    map.addListener('dragstart', () => {
      console.debug('Map drag started');
    });

    // Handle drag end
    map.addListener('dragend', () => {
      console.debug('Map drag ended');
    });

    // Handle map type changes
    map.addListener('maptypeid_changed', () => {
      const newMapType = map.getMapTypeId();
      console.debug('Map type changed to:', newMapType);
    });
  };

  /**
   * Handle retry functionality for failed map loads
   */
  const handleRetry = useCallback(() => {
    initializationAttemptedRef.current = false;
    setMapError(null);
    setLoadingState({ isLoading: false, isLoaded: false, error: null });
  }, []);

  /**
   * Effect to initialize map on component mount
   */
  useEffect(() => {
    console.log('🔄 GoogleMap useEffect triggered', { 
      attempted: initializationAttemptedRef.current, 
      loaded: loadingState.isLoaded, 
      loading: loadingState.isLoading,
      mapRef: !!mapRef.current,
      config: config
    });
    
    // Only initialize once and if not already loaded/loading
    if (!initializationAttemptedRef.current && !loadingState.isLoaded && !loadingState.isLoading) {
      console.log('✅ Starting initialization process...');
      initializationAttemptedRef.current = true;
      
      let isMounted = true;
      
      const initializeMap = async () => {
        console.log('🚀 initializeMap function called', {
          mapRefCurrent: !!mapRef.current,
          isMounted: isMounted
        });
        
        // Ensure the map container element is available
        if (!mapRef.current || !isMounted) {
          console.log('❌ Map ref not available or component unmounted', {
            mapRefCurrent: !!mapRef.current,
            isMounted: isMounted
          });
          return;
        }

        try {
          console.log('🎯 Starting map initialization...');
          if (!isMounted) {
            console.log('❌ Component unmounted before setting loading state');
            return;
          }
          
          console.log('📝 Setting loading state to true');
          setLoadingState({ isLoading: true, isLoaded: false, error: null });
          setMapError(null);
          console.log('✅ Loading state set successfully');

          // Check if offline before attempting to load
          if (isOffline()) {
            console.log('🌐 Device is offline');
            if (!isMounted) return;
            const offlineError = createOfflineError();
            setMapError(offlineError);
            setLoadingState({ isLoading: false, isLoaded: false, error: offlineError.message });
            return;
          }

          // Store reference to the map container to prevent it from becoming null
          const mapContainer = mapRef.current;
          if (!mapContainer || !isMounted) {
            console.log('❌ Map container not available after storing reference', {
              mapContainer: !!mapContainer,
              isMounted: isMounted
            });
            return;
          }

          console.log('📦 Map container available, checking Google Maps API...', {
            containerElement: mapContainer.tagName,
            containerConnected: mapContainer.isConnected
          });

          // Load Google Maps API if not already loaded
          if (!isGoogleMapsLoaded()) {
            console.log('⬇️ Loading Google Maps API...');
            try {
              await loadGoogleMapsAPI();
              console.log('✅ Google Maps API loaded successfully');
              
              // Double-check that the API is actually available
              if (!window.google || !window.google.maps) {
                console.error('❌ Google Maps API failed to load properly - window.google not available');
                throw new Error('Google Maps API failed to load properly');
              }
              console.log('✅ Google Maps API verified available on window object');
            } catch (apiError) {
              console.error('❌ Failed to load Google Maps API:', apiError);
              throw apiError;
            }
          } else {
            console.log('✅ Google Maps API already loaded');
          }

          // Check if component is still mounted after async operation
          // In development mode, use the current ref instead of stored reference
          const currentContainer = mapRef.current;
          if (!isMounted || !currentContainer) {
            console.log('❌ Component unmounted or current container not available after API load', {
              isMounted: isMounted,
              currentContainer: !!currentContainer,
              storedContainerConnected: mapContainer.isConnected
            });
            
            // Reset initialization flag to allow retry
            initializationAttemptedRef.current = false;
            setLoadingState({ isLoading: false, isLoaded: false, error: null });
            
            // Schedule a retry after a short delay
            console.log('🔄 Scheduling retry in 500ms...');
            setTimeout(() => {
              if (isMounted && mapRef.current) {
                console.log('🔄 Retrying initialization...');
                initializeMap();
              } else {
                console.log('❌ Cannot retry - component unmounted or ref unavailable');
              }
            }, 500);
            return;
          }
          
          console.log('✅ Using current container for map creation', {
            currentContainer: currentContainer.tagName,
            isConnected: currentContainer.isConnected
          });

          console.log('🗺️ Creating Google Maps instance...');

          // Create map instance with enhanced controls
          const mapOptions: google.maps.MapOptions = {
            center: config.center,
            zoom: config.zoom,
            mapTypeId: config.mapTypeId || google.maps.MapTypeId.ROADMAP,

            // Enable zoom controls (Requirement 5.1)
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER,
            },

            // Enable map type controls (Requirement 5.2)
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_CENTER,
              mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID,
                google.maps.MapTypeId.TERRAIN,
              ],
            },

            // Enable street view controls (Requirement 5.3)
            streetViewControl: true,
            streetViewControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP,
            },

            // Enable fullscreen control
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP,
            },

            // Enable pan and zoom interactions (Requirement 1.2)
            gestureHandling: 'auto',
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
          };

          if (!isMounted) {
            console.log('❌ Component unmounted before creating map instance');
            return;
          }
          
          console.log('🎨 Creating map with options:', mapOptions);
          console.log('📍 Map container details:', {
            tagName: currentContainer.tagName,
            className: currentContainer.className,
            id: currentContainer.id,
            offsetWidth: currentContainer.offsetWidth,
            offsetHeight: currentContainer.offsetHeight,
            isConnected: currentContainer.isConnected
          });
          
          const map = new google.maps.Map(currentContainer, mapOptions);
          mapInstanceRef.current = map;
          console.log('✅ Google Maps instance created successfully', map);

          if (!isMounted) {
            console.log('❌ Component unmounted before setting up handlers');
            return;
          }
          
          // Add interaction event listeners for pan and zoom (Requirement 1.2)
          console.log('🎧 Setting up map interaction handlers...');
          setupMapInteractionHandlers(map);
          console.log('✅ Map interaction handlers set up');

          if (!isMounted) {
            console.log('❌ Component unmounted before completing initialization');
            return;
          }
          
          console.log('🏁 Setting final loading state...');
          setLoadingState({ isLoading: false, isLoaded: true, error: null });
          setMapError(null);
          console.log('🎉 Map initialization completed successfully!');

          // Call onMapLoad callback if provided
          if (onMapLoad && isMounted) {
            console.log('📞 Calling onMapLoad callback');
            onMapLoad(map);
          }
        } catch (error) {
          console.error('💥 Map initialization failed:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          if (!isMounted) {
            console.log('❌ Component unmounted, not setting error state');
            return;
          }
          
          // Create comprehensive error object based on error type
          const mapError = createMapError(error, 'map_init');
          console.log('🚨 Setting error state:', mapError);
          setMapError(mapError);
          setLoadingState({ isLoading: false, isLoaded: false, error: mapError.message });
        }
      };
      
      // Use a small delay to ensure the component is fully mounted
      console.log('⏰ Setting up initialization timer...');
      const initTimer = setTimeout(() => {
        console.log('⏰ Timer fired, checking if mounted:', isMounted);
        if (isMounted) {
          console.log('✅ Component still mounted, calling initializeMap');
          initializeMap();
        } else {
          console.log('❌ Component unmounted, skipping initialization');
        }
      }, 100);

      return () => {
        console.log('🧹 Cleanup function called');
        isMounted = false;
        clearTimeout(initTimer);
      };
    } else {
      console.log('⏭️ Skipping initialization', {
        reason: initializationAttemptedRef.current ? 'already attempted' : 
                loadingState.isLoaded ? 'already loaded' : 
                loadingState.isLoading ? 'currently loading' : 'unknown'
      });
    }
  }, [config.center.lat, config.center.lng, config.zoom, config.mapTypeId]);

  /**
   * Cleanup effect for component unmounting
   */
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        // Clear any event listeners or cleanup map instance if needed
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /**
   * Separate effect for network state changes to avoid re-initialization
   */
  useEffect(() => {
    // Network state change handlers for offline scenarios
    const handleOnline = () => {
      console.debug('Network connection restored');
      // If there was a network error, automatically retry
      if (mapError && mapError.type === 'network_error' && !loadingState.isLoaded) {
        handleRetry();
      }
    };

    const handleOffline = () => {
      console.debug('Network connection lost');
      // If map is currently loading, show offline error
      if (loadingState.isLoading) {
        const offlineError = createOfflineError();
        setMapError(offlineError);
        setLoadingState({ isLoading: false, isLoaded: false, error: offlineError.message });
      }
    };

    // Add network event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      // Remove network event listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [mapError, loadingState.isLoaded, loadingState.isLoading, handleRetry]);

  /**
   * Render loading state with MapLoading component
   */
  if (loadingState.isLoading) {
    return (
      <MapLoading
        message="Loading Google Maps..."
        showProgress={true}
        className={className}
      />
    );
  }

  /**
   * Render error state with MapError component
   */
  if (mapError) {
    const errorProps: React.ComponentProps<typeof MapError> = {
      error: mapError,
      className,
    };

    if (mapError.retryable) {
      errorProps.onRetry = handleRetry;
    }

    return <MapError {...errorProps} />;
  }

  /**
   * Render map container
   */
  return (
    <div
      ref={mapRef}
      className={`google-map ${className}`}
      data-testid="google-map"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default GoogleMap;