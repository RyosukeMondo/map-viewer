'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMapProps, MapLoadingState } from '../types/google-maps';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '../lib/google-maps';

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
   * Initialize the Google Map instance
   */
  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      setLoadingState({ isLoading: true, isLoaded: false, error: null });

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

      // Call onMapLoad callback if provided
      if (onMapLoad) {
        onMapLoad(map);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
      setLoadingState({ isLoading: false, isLoaded: false, error: errorMessage });
    }
  };

  /**
   * Effect to initialize map on component mount
   */
  useEffect(() => {
    initializeMap();

    // Cleanup function to handle component unmounting
    return () => {
      if (mapInstanceRef.current) {
        // Clear any event listeners or cleanup map instance if needed
        mapInstanceRef.current = null;
      }
    };
  }, [config.center.lat, config.center.lng, config.zoom, config.mapTypeId]);

  /**
   * Render loading state
   */
  if (loadingState.isLoading) {
    return (
      <div 
        className={`google-map-loading ${className}`}
        data-testid="google-map-loading"
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#666'
        }}
      >
        Loading map...
      </div>
    );
  }

  /**
   * Render error state
   */
  if (loadingState.error) {
    return (
      <div 
        className={`google-map-error ${className}`}
        data-testid="google-map-error"
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div>
          <strong>Error loading map:</strong>
          <br />
          {loadingState.error}
        </div>
      </div>
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