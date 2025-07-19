/**
 * Google Maps API loading utility
 * Handles dynamic loading of the Google Maps JavaScript API
 */

import { validateGoogleMapsApiKey } from './env';

// Global variable to track loading state
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Loads the Google Maps JavaScript API
 * @returns Promise that resolves when the API is loaded
 * @throws Error if API key validation fails or loading fails
 */
export async function loadGoogleMapsAPI(): Promise<void> {
  // Return existing promise if already loading
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  // Return immediately if already loaded
  if (isLoaded) {
    return Promise.resolve();
  }
  
  // Validate API key before attempting to load
  const apiKey = validateGoogleMapsApiKey();
  
  isLoading = true;
  
  loadPromise = new Promise<void>((resolve, reject) => {
    // Check if Google Maps is already available
    if (window.google && window.google.maps) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Handle successful load
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };
    
    // Handle load error
    script.onerror = () => {
      isLoading = false;
      loadPromise = null;
      reject(new Error('Failed to load Google Maps API. Please check your API key and network connection.'));
    };
    
    // Add script to document head
    document.head.appendChild(script);
  });
  
  return loadPromise;
}

/**
 * Checks if Google Maps API is currently loaded
 * @returns boolean indicating if the API is loaded
 */
export function isGoogleMapsLoaded(): boolean {
  // Check if Google Maps is available in the window object
  const googleMapsAvailable = !!(window.google && window.google.maps);
  
  // Update internal state if Google Maps is available but not marked as loaded
  if (googleMapsAvailable && !isLoaded) {
    isLoaded = true;
  }
  
  // Return true if either Google Maps is available OR we've marked it as loaded
  // (the latter handles test scenarios where window.google might not be set)
  return googleMapsAvailable || isLoaded;
}

/**
 * Checks if Google Maps API is currently loading
 * @returns boolean indicating if the API is being loaded
 */
export function isGoogleMapsLoading(): boolean {
  return isLoading;
}

/**
 * Resets the loading state (useful for testing)
 */
export function resetGoogleMapsLoadingState(): void {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
}