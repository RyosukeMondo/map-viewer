/**
 * Error handling utilities for Google Maps integration
 * Provides comprehensive error categorization and handling
 */

import { MapError } from '../components/MapError';

/**
 * Creates a MapError object from various error sources
 */
export function createMapError(
  error: unknown,
  context: 'api_key' | 'api_load' | 'map_init' | 'network' = 'map_init'
): MapError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // API Key related errors
  if (context === 'api_key' || isApiKeyError(errorMessage)) {
    if (errorMessage.includes('missing')) {
      return {
        type: 'api_key_missing',
        message: 'Google Maps API key is not configured',
        details: errorMessage,
        retryable: false
      };
    } else {
      return {
        type: 'api_key_invalid',
        message: 'Google Maps API key is invalid or has insufficient permissions',
        details: errorMessage,
        retryable: false
      };
    }
  }
  
  // Network related errors
  if (context === 'network' || isNetworkError(errorMessage)) {
    return {
      type: 'network_error',
      message: 'Unable to connect to Google Maps services',
      details: errorMessage,
      retryable: true
    };
  }
  
  // API loading errors
  if (context === 'api_load' || isApiLoadError(errorMessage)) {
    return {
      type: 'api_load_failed',
      message: 'Failed to load Google Maps API',
      details: errorMessage,
      retryable: true
    };
  }
  
  // Map initialization errors
  if (context === 'map_init') {
    return {
      type: 'map_init_failed',
      message: 'Failed to initialize the map',
      details: errorMessage,
      retryable: true
    };
  }
  
  // Unknown errors
  return {
    type: 'unknown',
    message: 'An unexpected error occurred',
    details: errorMessage,
    retryable: true
  };
}

/**
 * Checks if an error is related to API key issues
 */
function isApiKeyError(message: string): boolean {
  const apiKeyIndicators = [
    'api key',
    'api_key',
    'invalid key',
    'missing key',
    'unauthorized',
    'forbidden',
    'quota exceeded',
    'billing'
  ];
  
  return apiKeyIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

/**
 * Checks if an error is network-related
 */
function isNetworkError(message: string): boolean {
  const networkIndicators = [
    'network',
    'connection',
    'timeout',
    'offline',
    'fetch',
    'cors',
    'net::',
    'failed to fetch',
    'load failed'
  ];
  
  return networkIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

/**
 * Checks if an error is related to API loading
 */
function isApiLoadError(message: string): boolean {
  const loadIndicators = [
    'script',
    'load',
    'loading',
    'failed to load',
    'script error',
    'resource'
  ];
  
  return loadIndicators.some(indicator => 
    message.toLowerCase().includes(indicator)
  );
}

/**
 * Checks if the user is currently offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Creates a network error specifically for offline scenarios
 */
export function createOfflineError(): MapError {
  return {
    type: 'network_error',
    message: 'You appear to be offline',
    details: 'Internet connection is required to load Google Maps. Please check your connection and try again.',
    retryable: true
  };
}

/**
 * Handles errors with automatic retry logic
 */
export class ErrorHandler {
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Executes a function with automatic retry on failure
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: 'api_key' | 'api_load' | 'map_init' | 'network' = 'map_init'
  ): Promise<T> {
    try {
      const result = await fn();
      this.retryCount = 0; // Reset on success
      return result;
    } catch (error) {
      const mapError = createMapError(error, context);
      
      // Don't retry non-retryable errors
      if (!mapError.retryable || this.retryCount >= this.maxRetries) {
        throw mapError;
      }
      
      // Check if offline for network errors
      if (mapError.type === 'network_error' && isOffline()) {
        throw createOfflineError();
      }
      
      this.retryCount++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount));
      
      // Recursive retry
      return this.executeWithRetry(fn, context);
    }
  }

  /**
   * Resets the retry counter
   */
  reset(): void {
    this.retryCount = 0;
  }

  /**
   * Gets the current retry count
   */
  getRetryCount(): number {
    return this.retryCount;
  }
}