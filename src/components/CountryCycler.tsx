'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Country } from '../types/google-maps';
import { useCountryCycling } from '../hooks/useCountryCycling';

/**
 * Props interface for CountryCycler component
 */
export interface CountryCyclerProps {
  /** Google Maps instance to control */
  map: google.maps.Map | null;
  /** Whether cycling is currently active */
  isActive?: boolean;
  /** Callback when country changes */
  onCountryChange?: (country: Country) => void;
  /** Callback when user interaction is detected */
  onUserInteraction?: () => void;
  /** Cycling interval in milliseconds (default: 10000) */
  cycleInterval?: number;
  /** Idle timeout before resuming cycling after user interaction in milliseconds (default: 30000) */
  idleTimeout?: number;
  /** Whether to start cycling automatically (default: true) */
  autoStart?: boolean;
  /** Whether timeout prevention is active (default: false) */
  timeoutPrevented?: boolean;
}

/**
 * CountryCycler component that manages automatic country navigation
 * Integrates with useCountryCycling hook for state management and provides
 * smooth map transition animations between countries
 * 
 * Requirements addressed:
 * - 6.1: Automatic cycling through random countries
 * - 6.2: Navigate to new random country every 10 seconds
 * - 6.3: Center map on country with appropriate zoom level
 */
export const CountryCycler: React.FC<CountryCyclerProps> = ({
  map,
  isActive = true,
  onCountryChange,
  cycleInterval = 10000, // 10 seconds
  idleTimeout = 30000,   // 30 seconds
  autoStart = true,
  timeoutPrevented = false
}) => {
  const mapElementRef = useRef<HTMLElement | null>(null);
  
  // Initialize the country cycling hook
  const {
    state,
    start,
    stop,
    setupUserInteractionDetection
  } = useCountryCycling(map, {
    cycleInterval,
    idleTimeout,
    autoStart: autoStart && isActive,
    timeoutPrevented
  });

  /**
   * Handle smooth map transitions to new countries
   * Implements smooth animation between country locations
   */
  const handleCountryTransition = useCallback((country: Country) => {
    if (!map || !country) {
      console.warn('CountryCycler: Cannot transition - map or country not available');
      return;
    }

    try {
      console.debug('CountryCycler: Transitioning to country:', country.name);
      
      // Use panTo for smooth animation to new center
      map.panTo(country.center);
      
      // Smoothly transition zoom level if different from current
      const currentZoom = map.getZoom();
      if (currentZoom !== country.zoom) {
        // Use a slight delay to ensure pan animation starts first
        setTimeout(() => {
          if (map) {
            map.setZoom(country.zoom);
          }
        }, 200);
      }

      // Call the country change callback
      if (onCountryChange) {
        onCountryChange(country);
      }

      console.debug('CountryCycler: Successfully transitioned to:', {
        country: country.name,
        center: country.center,
        zoom: country.zoom
      });
    } catch (error) {
      console.error('CountryCycler: Error during country transition:', error);
    }
  }, [map, onCountryChange]);



  /**
   * Set up user interaction detection when map becomes available
   */
  useEffect(() => {
    if (!map) {
      return;
    }

    // Get the map's DOM element for interaction detection
    const mapDiv = map.getDiv();
    if (mapDiv) {
      mapElementRef.current = mapDiv;
      setupUserInteractionDetection(mapDiv);
      
      console.debug('CountryCycler: User interaction detection set up on map element');
    } else {
      console.warn('CountryCycler: Could not get map DOM element for interaction detection');
    }

    return () => {
      // Cleanup is handled by the useCountryCycling hook
      mapElementRef.current = null;
    };
  }, [map, setupUserInteractionDetection]);

  /**
   * Handle country changes from the cycling hook
   */
  useEffect(() => {
    if (state.currentCountry) {
      handleCountryTransition(state.currentCountry);
    }
  }, [state.currentCountry, handleCountryTransition]);

  /**
   * Control cycling based on isActive prop
   */
  useEffect(() => {
    if (isActive && !state.isActive) {
      console.debug('CountryCycler: Starting cycling (isActive prop changed to true)');
      start();
    } else if (!isActive && state.isActive) {
      console.debug('CountryCycler: Stopping cycling (isActive prop changed to false)');
      stop();
    }
  }, [isActive, state.isActive, start, stop]);



  // This component doesn't render any UI - it's a logic-only component
  // All visual feedback should be handled by parent components or through callbacks
  return null;
};

export default CountryCycler;