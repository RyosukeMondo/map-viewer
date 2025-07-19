/**
 * TypeScript declarations for Google Maps API
 * Extends the global Window interface to include Google Maps
 */

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};