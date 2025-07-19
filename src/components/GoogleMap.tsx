'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const handleRetry = () => {
    setMapError(null);
    setLoadingState({ isLoading: false, isLoaded: false, error: null });
    initializeMap();
  };

  /**
   * Initialize the Google Map instance with comprehensive error handling
   */
  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setLoadingState({ isLoading: true, isLoaded: false, error: null });
      setMapError(null);

      // Check if offline before attempting to load
      if (isOffline()) {
        const offlineError = createOfflineError();
        setMapError(offlineError);
        setLoadingState({ isLoading: false, isLoaded: false, error: offlineError.message });
        return;
      }

      // Load Google Maps API if not already loaded
      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsAPI();
      }

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

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Add interaction event listeners for pan and zoom (Requirement 1.2)
      setupMapInteractionHandlers(map);

      setLoadingState({ isLoading: false, isLoaded: true, error: null });
      setMapError(null);

      // Call onMapLoad callback if provided
      if (onMapLoad) {
        onMapLoad(map);
      }
    } catch (error) {
      // Create comprehensive error object based on error type
      const mapError = createMapError(error, 'map_init');
      setMapError(mapError);
      setLoadingState({ isLoading: false, isLoaded: false, error: mapError.message });
    }
  };

  /**
   * Effect to initialize map on component mount and handle network state changes
   */
  useEffect(() => {
    initializeMap();

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

    // Cleanup function to handle component unmounting
    return () => {
      if (mapInstanceRef.current) {
        // Clear any event listeners or cleanup map instance if needed
        mapInstanceRef.current = null;
      }
      
      // Remove network event listeners
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [config.center.lat, config.center.lng, config.zoom, config.mapTypeId]);

  /**
   * Handle retry functionality for failed map loads
   */
  const handleRetry = () => {
    setMapError(null);
    setLoadingState({ isLoading: false, isLoaded: false, error: null });
    initializeMap();
  };

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
    return (
      <MapError 
        error={mapError}
        onRetry={mapError.retryable ? handleRetry : undefined}
        className={className}
      />
    );
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