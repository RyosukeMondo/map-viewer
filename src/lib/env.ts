/**
 * Environment variable validation utility
 * Validates required environment variables for the Google Maps application
 */

export interface EnvConfig {
  googleMapsApiKey: string;
}

/**
 * Validates and returns the Google Maps API key from environment variables
 * @throws Error if the API key is missing or invalid
 */
export function validateGoogleMapsApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.'
    );
  }
  
  if (apiKey === 'your-google-maps-api-key-here') {
    throw new Error(
      'Please replace the placeholder Google Maps API key with your actual API key in .env.local'
    );
  }
  
  if (apiKey.length < 10) {
    throw new Error(
      'Google Maps API key appears to be invalid. Please check your API key.'
    );
  }
  
  return apiKey;
}

/**
 * Gets validated environment configuration
 * @returns EnvConfig object with validated environment variables
 */
export function getEnvConfig(): EnvConfig {
  return {
    googleMapsApiKey: validateGoogleMapsApiKey(),
  };
}

/**
 * Checks if the Google Maps API key is configured (non-throwing version)
 * @returns boolean indicating if the API key is properly configured
 */
export function isGoogleMapsApiKeyConfigured(): boolean {
  try {
    validateGoogleMapsApiKey();
    return true;
  } catch {
    return false;
  }
}