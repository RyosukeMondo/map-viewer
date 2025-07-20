import { useState, useCallback } from 'react';

/**
 * Interface for timeout prevention state and controls
 */
export interface TimeoutPreventionState {
  isActive: boolean;
  toggle: () => void;
}

/**
 * Custom hook for managing timeout prevention functionality
 * 
 * This hook provides state management for preventing automatic cycling timeouts
 * in the Google Maps viewer application. When active, it should override all
 * automatic cycling behavior.
 * 
 * @returns {TimeoutPreventionState} Object containing isActive state and toggle function
 */
export const useTimeoutPrevention = (): TimeoutPreventionState => {
  // Initialize timeout prevention as inactive by default
  const [isActive, setIsActive] = useState<boolean>(false);

  /**
   * Toggle function to switch timeout prevention on/off
   * Uses useCallback to prevent unnecessary re-renders
   */
  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  return {
    isActive,
    toggle
  };
};