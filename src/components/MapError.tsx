'use client';

import React from 'react';

export interface MapErrorProps {
  error: MapError;
  onRetry?: () => void;
  className?: string;
}

export interface MapError {
  type: 'api_key_missing' | 'api_key_invalid' | 'network_error' | 'api_load_failed' | 'map_init_failed' | 'unknown';
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * MapError component that displays user-friendly error messages for various map loading failures
 * Provides appropriate messaging and retry options based on error type
 */
export const MapError: React.FC<MapErrorProps> = ({
  error,
  onRetry,
  className = '',
}) => {
  const getErrorIcon = (errorType: MapError['type']): string => {
    switch (errorType) {
      case 'api_key_missing':
      case 'api_key_invalid':
        return '🔑';
      case 'network_error':
        return '🌐';
      case 'api_load_failed':
      case 'map_init_failed':
        return '🗺️';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = (errorType: MapError['type']): string => {
    switch (errorType) {
      case 'api_key_missing':
        return 'API Key Required';
      case 'api_key_invalid':
        return 'Invalid API Key';
      case 'network_error':
        return 'Connection Problem';
      case 'api_load_failed':
        return 'Maps API Failed to Load';
      case 'map_init_failed':
        return 'Map Initialization Failed';
      default:
        return 'Map Error';
    }
  };

  const getErrorSuggestion = (errorType: MapError['type']): string => {
    switch (errorType) {
      case 'api_key_missing':
        return 'Please configure your Google Maps API key in the environment variables.';
      case 'api_key_invalid':
        return 'Please check your Google Maps API key configuration and ensure it has the necessary permissions.';
      case 'network_error':
        return 'Please check your internet connection and try again.';
      case 'api_load_failed':
        return 'There was a problem loading the Google Maps API. Please try again.';
      case 'map_init_failed':
        return 'The map could not be initialized. Please refresh the page and try again.';
      default:
        return 'An unexpected error occurred. Please try refreshing the page.';
    }
  };

  return (
    <div 
      className={`map-error ${className}`}
      data-testid="map-error"
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffebee',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        padding: '32px 24px',
        textAlign: 'center',
        minHeight: '200px'
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        {getErrorIcon(error.type)}
      </div>
      
      <h3 style={{ 
        color: '#c62828', 
        margin: '0 0 12px 0',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        {getErrorTitle(error.type)}
      </h3>
      
      <p style={{ 
        color: '#d32f2f', 
        margin: '0 0 8px 0',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {error.message}
      </p>
      
      <p style={{ 
        color: '#666', 
        margin: '0 0 24px 0',
        fontSize: '13px',
        lineHeight: '1.4',
        maxWidth: '400px'
      }}>
        {getErrorSuggestion(error.type)}
      </p>

      {error.details && (
        <details style={{ 
          marginBottom: '24px',
          fontSize: '12px',
          color: '#888',
          maxWidth: '400px'
        }}>
          <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
            Technical Details
          </summary>
          <pre style={{ 
            textAlign: 'left',
            backgroundColor: '#f5f5f5',
            padding: '8px',
            borderRadius: '4px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {error.details}
          </pre>
        </details>
      )}
      
      {error.retryable && onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1565c0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#1976d2';
          }}
          data-testid="retry-button"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default MapError;