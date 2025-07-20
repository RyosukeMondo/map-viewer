'use client';

import React, { useState } from 'react';
import { GoogleMap, MapContainer, TimeoutToggle, VideoOverlay } from '../components';
import { MapConfig } from '../types/google-maps';
import { useTimeoutPrevention } from '../hooks/useTimeoutPrevention';


/**
 * Main page component for the Google Maps Viewer application
 * Integrates GoogleMap component with responsive layout and default settings
 * 
 * Requirements implemented:
 * - 1.1: Display Google Map centered on default location (San Francisco)
 * - 1.3: Use provided Google Maps API key for authentication
 * - 4.1: Display map at full available width on desktop
 * - 4.2: Adapt map size appropriately on mobile devices
 * - 4.3: Maintain map functionality and readability across screen sizes
 */
export default function Home() {
  // Default map configuration as specified in design document
  // San Francisco center coordinates with zoom level 10
  const defaultMapConfig: MapConfig = {
    center: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
    zoom: 10,
    // mapTypeId will default to ROADMAP in GoogleMap component if not specified
  };
  
  // Use the timeout prevention hook to manage timeout prevention state
  const { isActive: timeoutPrevented, toggle: toggleTimeoutPrevention } = useTimeoutPrevention();
  
  // Track user interaction for country cycling
  const [userInteracted, setUserInteracted] = useState(false);
  
  /**
   * Handle user interaction with the map
   */
  const handleUserInteraction = React.useCallback(() => {
    setUserInteracted(true);
  }, []);

  /**
   * Handle map load callback for additional initialization if needed
   */
  const handleMapLoad = React.useCallback((map: google.maps.Map) => {
    console.log('Google Map loaded successfully:', map);
    // Additional map initialization can be added here if needed
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Google Maps Viewer
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Interactive map viewer built with Next.js and TypeScript
          </p>
        </div>
      </header>

      {/* Main content area with responsive map */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Map container with responsive height */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
            <MapContainer
              height="calc(100vh - 200px)" // Responsive height calculation
              className="w-full"
            >
              <GoogleMap
                config={defaultMapConfig}
                onMapLoad={handleMapLoad}
                onUserInteraction={handleUserInteraction}
                timeoutPrevented={timeoutPrevented}
                className="w-full h-full"
              />
              
              {/* Video overlay positioned absolutely over the map */}
              <VideoOverlay 
                videoSrc="/black.mp4" 
                className="absolute inset-0 pointer-events-none" 
              />
            </MapContainer>
            
            {/* The TimeoutToggle component has its own fixed positioning */}
            <TimeoutToggle 
              isActive={timeoutPrevented} 
              onToggle={toggleTimeoutPrevention} 
            />
          </div>

          {/* Optional info section */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Map Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Pan and zoom interactions
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Multiple map types (roadmap, satellite, etc.)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Street view integration
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Responsive design
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Error handling and offline support
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Fullscreen mode
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Built with Next.js, TypeScript, and Google Maps API
          </p>
        </div>
      </footer>
    </div>
  );
}
