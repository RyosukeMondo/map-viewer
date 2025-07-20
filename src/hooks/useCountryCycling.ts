/**
 * Custom hook for managing automatic country cycling functionality
 * Handles timer management, user interaction detection, and pause/resume logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Country } from '../types/google-maps';
import { getRandomCountryWithoutRepetition } from '../lib/countries';

/**
 * State interface for country cycling
 */
export interface CountryCyclingState {
  currentCountry: Country | null;
  isActive: boolean;
  isPaused: boolean;
}

/**
 * Configuration options for the country cycling hook
 */
export interface CountryCyclingOptions {
  /** Interval between country changes in milliseconds (default: 10000) */
  cycleInterval?: number;
  /** Idle timeout before resuming cycling after user interaction in milliseconds (default: 30000) */
  idleTimeout?: number;
  /** Whether to start cycling automatically (default: true) */
  autoStart?: boolean;
  /** Whether timeout prevention is active (default: false) */
  timeoutPrevented?: boolean;
}

/**
 * Return type for the useCountryCycling hook
 */
export interface UseCountryCyclingReturn {
  /** Current cycling state */
  state: CountryCyclingState;
  /** Start the country cycling */
  start: () => void;
  /** Stop the country cycling */
  stop: () => void;
  /** Pause the cycling (can be resumed automatically after idle timeout) */
  pause: () => void;
  /** Resume the cycling */
  resume: () => void;
  /** Manually go to the next country */
  nextCountry: () => void;
  /** Set up user interaction detection on a map element */
  setupUserInteractionDetection: (element: HTMLElement | null) => void;
}

/**
 * Custom hook for managing automatic country cycling with user interaction detection
 * 
 * @param map - Google Maps instance (optional, used for smooth transitions)
 * @param options - Configuration options for cycling behavior
 * @returns Object with cycling state and control functions
 */
export function useCountryCycling(
  map?: google.maps.Map | null,
  options: CountryCyclingOptions = {}
): UseCountryCyclingReturn {
  const {
    cycleInterval = 10000, // 10 seconds
    idleTimeout = 30000,   // 30 seconds
    autoStart = true,
    timeoutPrevented = false
  } = options;

  // State management
  const [state, setState] = useState<CountryCyclingState>({
    currentCountry: null,
    isActive: false,
    isPaused: false
  });

  // Refs for timers and cleanup
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionListenersRef = useRef<(() => void)[]>([]);

  /**
   * Clear all active timers
   */
  const clearTimers = useCallback(() => {
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  /**
   * Clear user interaction event listeners
   */
  const clearUserInteractionListeners = useCallback(() => {
    userInteractionListenersRef.current.forEach(cleanup => cleanup());
    userInteractionListenersRef.current = [];
  }, []);

  /**
   * Navigate to a new random country
   */
  const navigateToCountry = useCallback((country: Country) => {
    if (map && country) {
      // Smooth transition to the new country
      map.panTo(country.center);
      map.setZoom(country.zoom);
    }
  }, [map]);

  /**
   * Select and navigate to the next country
   */
  const nextCountry = useCallback(() => {
    try {
      const newCountry = getRandomCountryWithoutRepetition();
      setState(prev => ({
        ...prev,
        currentCountry: newCountry
      }));
      navigateToCountry(newCountry);
    } catch (error) {
      console.error('Error selecting next country:', error);
    }
  }, [navigateToCountry]);

  /**
   * Start the cycling timer
   */
  const startCycleTimer = useCallback(() => {
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
    }
    
    cycleTimerRef.current = setInterval(() => {
      nextCountry();
    }, cycleInterval);
  }, [nextCountry, cycleInterval]);

  /**
   * Handle user interaction - pause cycling and start idle timer
   * If timeout prevention is active, don't resume automatically
   */
  const handleUserInteraction = useCallback(() => {
    // If timeout prevention is active, don't pause or set timers
    if (timeoutPrevented) {
      return;
    }
    
    setState(prev => {
      if (!prev.isActive || prev.isPaused) return prev;
      return {
        ...prev,
        isPaused: true
      };
    });

    clearTimers();

    // Start idle timer to resume cycling after inactivity
    idleTimerRef.current = setTimeout(() => {
      setState(resumePrev => {
        if (!resumePrev.isActive) return resumePrev;
        return {
          ...resumePrev,
          isPaused: false
        };
      });
    }, idleTimeout);
  }, [clearTimers, idleTimeout, timeoutPrevented]);

  /**
   * Start country cycling
   */
  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false
    }));

    // Select initial country if none is set
    if (!state.currentCountry) {
      nextCountry();
    }

    startCycleTimer();
  }, [state.currentCountry, nextCountry, startCycleTimer]);

  /**
   * Stop country cycling
   */
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false
    }));
    clearTimers();
  }, [clearTimers]);

  /**
   * Pause country cycling
   */
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true
    }));
    clearTimers();
  }, [clearTimers]);

  /**
   * Resume country cycling
   */
  const resume = useCallback(() => {
    if (!state.isActive) return;

    setState(prev => ({
      ...prev,
      isPaused: false
    }));
    startCycleTimer();
  }, [state.isActive, startCycleTimer]);

  /**
   * Set up user interaction detection on a DOM element
   */
  const setupUserInteractionDetection = useCallback((element: HTMLElement | null) => {
    // Clear existing listeners
    clearUserInteractionListeners();

    if (!element) return;

    // Event types to detect user interaction
    const eventTypes = [
      'mousedown',
      'mousemove',
      'wheel',
      'touchstart',
      'touchmove',
      'keydown'
    ];

    // Add event listeners
    eventTypes.forEach(eventType => {
      const listener = (event: Event) => {
        // Ignore programmatic events or very small mouse movements
        if (eventType === 'mousemove') {
          const mouseEvent = event as MouseEvent;
          // Only trigger on significant mouse movement
          if (Math.abs(mouseEvent.movementX) < 2 && Math.abs(mouseEvent.movementY) < 2) {
            return;
          }
        }
        handleUserInteraction();
      };

      element.addEventListener(eventType, listener, { passive: true });

      // Store cleanup function
      userInteractionListenersRef.current.push(() => {
        element.removeEventListener(eventType, listener);
      });
    });
  }, [handleUserInteraction, clearUserInteractionListeners]);

  // Auto-start cycling when hook is initialized
  useEffect(() => {
    // Always select an initial country on mount, regardless of timeoutPrevented
    if (!state.currentCountry) {
      console.log('Selecting initial country on mount');
      nextCountry();
    }
    
    // Only start the cycling timer if not prevented
    if (autoStart && !timeoutPrevented) {
      console.log('Auto-starting country cycling');
      start();
    }

    // Cleanup on unmount
    return () => {
      clearTimers();
      clearUserInteractionListeners();
    };
  }, [autoStart, timeoutPrevented, start, clearTimers, clearUserInteractionListeners, state.currentCountry, nextCountry]);

  // Update cycling when state changes
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      if (!cycleTimerRef.current) {
        startCycleTimer();
      }
    } else {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    }
  }, [state.isActive, state.isPaused, startCycleTimer]);
  
  // Handle timeout prevention changes
  useEffect(() => {
    console.log('Timeout prevention state changed:', { 
      timeoutPrevented, 
      isActive: state.isActive, 
      isPaused: state.isPaused,
      hasCycleTimer: !!cycleTimerRef.current
    });
    
    if (timeoutPrevented) {
      // When timeout prevention is activated, pause cycling and clear all timers
      if (state.isActive) {
        console.log('Pausing cycling due to timeout prevention');
        clearTimers();
        setState(prev => ({ ...prev, isPaused: true }));
      }
    } else {
      // When timeout prevention is deactivated
      if (state.isActive && state.isPaused) {
        console.log('Resuming cycling after timeout prevention deactivated');
        
        // Update state to ensure it's not paused
        setState(prev => ({ ...prev, isPaused: false }));
      } else if (!state.isActive && autoStart) {
        // If cycling should be active but isn't, start it
        console.log('Auto-starting cycling after timeout prevention deactivated');
        setTimeout(() => start(), 0);
      }
    }
  }, [timeoutPrevented, state.isActive, state.isPaused, clearTimers, autoStart, start]);

  // Handle resuming cycling after timeout prevention is lifted
  useEffect(() => {
    if (!timeoutPrevented && state.isActive && !state.isPaused && !cycleTimerRef.current) {
      console.log('Starting cycle timer after timeout prevention lifted');
      // Use a small delay to ensure state has settled
      const timeoutId = setTimeout(() => {
        startCycleTimer();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Return undefined for other code paths
    return undefined;
  }, [timeoutPrevented, state.isActive, state.isPaused, startCycleTimer]);

  return {
    state,
    start,
    stop,
    pause,
    resume,
    nextCountry,
    setupUserInteractionDetection
  };
}