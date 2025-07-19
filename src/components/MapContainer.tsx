'use client';

import React from 'react';
import { MapContainerProps } from '../types/google-maps';
import styles from './MapContainer.module.css';

/**
 * MapContainer component provides a responsive wrapper for Google Maps
 * with loading state management and proper styling across screen sizes
 */
export const MapContainer: React.FC<MapContainerProps> = ({
  children,
  height = '400px',
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`${styles.mapContainer} ${className}`}
      style={containerStyle}
      data-testid="map-container"
    >
      {children}
    </div>
  );
};

/**
 * LoadingSpinner component for displaying loading state
 */
export const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingContainer} data-testid="loading-spinner">
    <div className={styles.spinner}></div>
    <p className={styles.loadingText}>Loading map...</p>
  </div>
);

/**
 * MapContainer with loading state support
 */
interface MapContainerWithLoadingProps extends MapContainerProps {
  isLoading?: boolean;
}

export const MapContainerWithLoading: React.FC<MapContainerWithLoadingProps> = ({
  children,
  height = '400px',
  className = '',
  isLoading = false,
}) => {
  return (
    <MapContainer height={height} className={className}>
      {isLoading ? <LoadingSpinner /> : children}
    </MapContainer>
  );
};

export default MapContainer;