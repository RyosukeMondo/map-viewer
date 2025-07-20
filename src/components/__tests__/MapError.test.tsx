import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapError } from '../MapError';
import { MapError as MapErrorType } from '../MapError';

describe('MapError Component', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Display', () => {
    it('renders API key missing error correctly', () => {
      const error: MapErrorType = {
        type: 'api_key_missing',
        message: 'Google Maps API key is not configured',
        details: 'API key validation failed',
        retryable: false
      };

      render(<MapError error={error} />);

      expect(screen.getByTestId('map-error')).toBeInTheDocument();
      expect(screen.getByText('🔑')).toBeInTheDocument();
      expect(screen.getByText('API Key Required')).toBeInTheDocument();
      expect(screen.getByText('Google Maps API key is not configured')).toBeInTheDocument();
      expect(screen.getByText('Please configure your Google Maps API key in the environment variables.')).toBeInTheDocument();
    });

    it('renders API key invalid error correctly', () => {
      const error: MapErrorType = {
        type: 'api_key_invalid',
        message: 'Invalid API key provided',
        retryable: false
      };

      render(<MapError error={error} />);

      expect(screen.getByText('🔑')).toBeInTheDocument();
      expect(screen.getByText('Invalid API Key')).toBeInTheDocument();
      expect(screen.getByText('Invalid API key provided')).toBeInTheDocument();
      expect(screen.getByText('Please check your Google Maps API key configuration and ensure it has the necessary permissions.')).toBeInTheDocument();
    });

    it('renders network error correctly', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Unable to connect to Google Maps services',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('🌐')).toBeInTheDocument();
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to Google Maps services')).toBeInTheDocument();
      expect(screen.getByText('Please check your internet connection and try again.')).toBeInTheDocument();
    });

    it('renders API load failed error correctly', () => {
      const error: MapErrorType = {
        type: 'api_load_failed',
        message: 'Failed to load Google Maps API',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByText('Maps API Failed to Load')).toBeInTheDocument();
      expect(screen.getByText('Failed to load Google Maps API')).toBeInTheDocument();
      expect(screen.getByText('There was a problem loading the Google Maps API. Please try again.')).toBeInTheDocument();
    });

    it('renders map initialization failed error correctly', () => {
      const error: MapErrorType = {
        type: 'map_init_failed',
        message: 'Failed to initialize the map',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByText('Map Initialization Failed')).toBeInTheDocument();
      expect(screen.getByText('Failed to initialize the map')).toBeInTheDocument();
      expect(screen.getByText('The map could not be initialized. Please refresh the page and try again.')).toBeInTheDocument();
    });

    it('renders unknown error correctly', () => {
      const error: MapErrorType = {
        type: 'unknown',
        message: 'An unexpected error occurred',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Map Error')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try refreshing the page.')).toBeInTheDocument();
    });
  });

  describe('Technical Details', () => {
    it('displays technical details when provided', () => {
      const error: MapErrorType = {
        type: 'api_load_failed',
        message: 'Failed to load Google Maps API',
        details: 'Script loading failed with status 404',
        retryable: true
      };

      render(<MapError error={error} />);

      const detailsElement = screen.getByText('Technical Details');
      expect(detailsElement).toBeInTheDocument();
      
      // Click to expand details
      fireEvent.click(detailsElement);
      expect(screen.getByText('Script loading failed with status 404')).toBeInTheDocument();
    });

    it('does not display technical details section when not provided', () => {
      const error: MapErrorType = {
        type: 'api_load_failed',
        message: 'Failed to load Google Maps API',
        retryable: true
      };

      render(<MapError error={error} />);

      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('displays retry button for retryable errors', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Network connection failed',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('Try Again');
    });

    it('does not display retry button for non-retryable errors', () => {
      const error: MapErrorType = {
        type: 'api_key_missing',
        message: 'API key is missing',
        retryable: false
      };

      render(<MapError error={error} />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('does not display retry button when onRetry is not provided', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Network connection failed',
        retryable: true
      };

      render(<MapError error={error} />);

      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Network connection failed',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('handles retry button hover effects', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Network connection failed',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      
      // Test hover effects
      fireEvent.mouseOver(retryButton);
      expect(retryButton).toHaveStyle({ backgroundColor: '#1565c0' });
      
      fireEvent.mouseOut(retryButton);
      expect(retryButton).toHaveStyle({ backgroundColor: '#1976d2' });
    });
  });

  describe('Styling and Layout', () => {
    it('applies custom className', () => {
      const error: MapErrorType = {
        type: 'unknown',
        message: 'Test error',
        retryable: false
      };

      render(<MapError error={error} className="custom-error-class" />);

      const errorElement = screen.getByTestId('map-error');
      expect(errorElement).toHaveClass('map-error');
      expect(errorElement).toHaveClass('custom-error-class');
    });

    it('has proper container styling', () => {
      const error: MapErrorType = {
        type: 'unknown',
        message: 'Test error',
        retryable: false
      };

      render(<MapError error={error} />);

      const errorElement = screen.getByTestId('map-error');
      expect(errorElement).toHaveStyle({
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffebee',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        minHeight: '200px'
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      const error: MapErrorType = {
        type: 'api_key_missing',
        message: 'API key is missing',
        retryable: false
      };

      render(<MapError error={error} />);

      // Check for proper heading structure
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('API Key Required');
    });

    it('retry button is accessible', () => {
      const error: MapErrorType = {
        type: 'network_error',
        message: 'Network error',
        retryable: true
      };

      render(<MapError error={error} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('Error Type Coverage (Requirements 3.2, 3.3)', () => {
    it('handles all error types correctly', () => {
      const errorTypes: Array<{ type: MapErrorType['type'], expectedIcon: string, expectedTitle: string }> = [
        { type: 'api_key_missing', expectedIcon: '🔑', expectedTitle: 'API Key Required' },
        { type: 'api_key_invalid', expectedIcon: '🔑', expectedTitle: 'Invalid API Key' },
        { type: 'network_error', expectedIcon: '🌐', expectedTitle: 'Connection Problem' },
        { type: 'api_load_failed', expectedIcon: '🗺️', expectedTitle: 'Maps API Failed to Load' },
        { type: 'map_init_failed', expectedIcon: '🗺️', expectedTitle: 'Map Initialization Failed' },
        { type: 'unknown', expectedIcon: '⚠️', expectedTitle: 'Map Error' }
      ];

      errorTypes.forEach(({ type, expectedIcon, expectedTitle }) => {
        const error: MapErrorType = {
          type,
          message: `Test ${type} error`,
          retryable: true
        };

        const { unmount } = render(<MapError error={error} />);

        expect(screen.getByText(expectedIcon)).toBeInTheDocument();
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();

        unmount();
      });
    });
  });
});