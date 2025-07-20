/**
 * Google Maps API loading utility
 * Handles dynamic loading of the Google Maps JavaScript API
 */

import { validateGoogleMapsApiKey } from "./env";
import {
  createMapError,
  isOffline,
  createOfflineError,
  ErrorHandler,
} from "./error-handling";

// Global variable to track loading state
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Error handler instance for retry logic
const errorHandler = new ErrorHandler(3, 1000);

/**
 * Loads the Google Maps JavaScript API with comprehensive error handling
 * @returns Promise that resolves when the API is loaded
 * @throws MapError if API key validation fails or loading fails
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

  // Check if offline before attempting to load
  if (isOffline()) {
    throw createOfflineError();
  }

  // Use error handler with retry logic
  loadPromise = errorHandler.executeWithRetry(async () => {
    // Validate API key before attempting to load
    let apiKey: string;
    try {
      apiKey = validateGoogleMapsApiKey();
    } catch (error) {
      throw createMapError(error, "api_key");
    }

    isLoading = true;

    return new Promise<void>((resolve, reject) => {
      // Check if Google Maps is already available
      if (window.google && window.google.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      // Set up timeout for loading
      const timeoutId = setTimeout(() => {
        isLoading = false;
        loadPromise = null;
        script.remove();
        reject(
          createMapError(
            new Error("Google Maps API loading timed out"),
            "network"
          )
        );
      }, 15000); // 15 second timeout

      // Handle successful load
      script.onload = () => {
        clearTimeout(timeoutId);
        
        // Additional check to ensure Google Maps API is fully initialized
        // This prevents race conditions on slower devices
        const checkApiReady = () => {
          if (window.google && window.google.maps && window.google.maps.MapTypeId) {
            console.log('✅ Google Maps API fully initialized with MapTypeId');
            isLoaded = true;
            isLoading = false;
            resolve();
          } else {
            console.log('⏳ Google Maps API loading, waiting for full initialization...');
            // Retry check after a short delay
            setTimeout(checkApiReady, 50);
          }
        };
        
        checkApiReady();
      };

      // Handle load error
      script.onerror = () => {
        clearTimeout(timeoutId);
        isLoading = false;
        loadPromise = null;
        script.remove();

        // Check if it's a network error
        if (isOffline()) {
          reject(createOfflineError());
        } else {
          reject(
            createMapError(
              new Error(
                "Failed to load Google Maps API script. This could be due to network issues, invalid API key, or API restrictions."
              ),
              "api_load"
            )
          );
        }
      };

      // Add script to document head
      document.head.appendChild(script);
    });
  }, "api_load");

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
