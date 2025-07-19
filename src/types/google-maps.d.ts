/**
 * TypeScript declarations for Google Maps API
 * Extends the global Window interface to include Google Maps
 */

declare global {
  interface Window {
    google: typeof google;
  }
}

/**
 * Configuration interface for Google Maps initialization
 */
export interface MapConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
  mapTypeId?: google.maps.MapTypeId;
}

/**
 * Props interface for GoogleMap component
 */
export interface GoogleMapProps {
  config: MapConfig;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

/**
 * Props interface for MapContainer component
 */
export interface MapContainerProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
}

/**
 * Interface for Google Maps API loading utility
 */
export interface GoogleMapsLoaderOptions {
  apiKey: string;
  libraries?: string[];
  version?: string;
}

/**
 * Interface for map loading state
 */
export interface MapLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
}
