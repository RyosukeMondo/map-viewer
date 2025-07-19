'use client';

import React from 'react';

export interface MapLoadingProps {
  message?: string;
  showProgress?: boolean;
  className?: string;
}

/**
 * MapLoading component that displays a user-friendly loading state
 * Provides visual feedback during map initialization
 */
export const MapLoading: React.FC<MapLoadingProps> = ({
  message = 'Loading map...',
  showProgress = true,
  className = '',
}) => {
  return (
    <div 
      className={`map-loading ${className}`}
      data-testid="map-loading"
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '32px 24px',
        textAlign: 'center',
        minHeight: '200px'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        🗺️
      </div>
      
      {showProgress && (
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e3f2fd',
            borderTop: '3px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}
          data-testid="loading-spinner"
        />
      )}
      
      <p style={{ 
        color: '#495057', 
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '500'
      }}>
        {message}
      </p>
      
      <p style={{ 
        color: '#6c757d', 
        margin: '0',
        fontSize: '13px'
      }}>
        Please wait while we initialize the map...
      </p>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MapLoading;