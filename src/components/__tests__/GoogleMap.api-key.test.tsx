import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoogleMap } from '../GoogleMap';
import { MapConfig } from '../../types/google-maps';
import * as googleMapsLib from '../../lib/google-maps';
import * as env from '../../lib/env';

// Mock the libraries
jest.mock('../../lib/google-maps');
jest.mock('../../lib/env');

const mockGoogleMapsLib = googleMapsLib as jest.Mocked<typeof googleMapsLib>;
const mockEnv = env as jest.Mocked<typeof env>;

// Mock Google Maps API
const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  getCenter: jest.fn(),
  getZoom: jest.fn(),
  addListener: jest.fn(),
  getMapTypeId: jest.fn(() => 'roadmap'),
};

const mockGoogle = {
  maps: {
    Map: jest.fn(() => mockMap),
    MapTypeId: {
      ROADMAP: 'roadmap',
      SATELLITE: 'satellite',
      HYBRID: 'hybrid',
      TERRAIN: 'terrain',
    },
    ControlPosition: {
      RIGHT_CENTER: 'RIGHT_CENTER',
      TOP_CENTER: 'TOP_CENTER',
      RIGHT_TOP: 'RIGHT_TOP',
    },
    MapTypeControlStyle: {
      HORIZONTAL_BAR: 'HORIZONTAL_BAR',
    },
  },
};

beforeAll(() => {
  (global as unknown as { google: typeof mockGoogle }).google = mockGoogle;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);
  mockGoogleMapsLib.loadGoogleMapsAPI.mockResolvedValue();
  mockGoogle.maps.Map.mockImplementation(() => mockMap);
});

describe('GoogleMap API Key Integration Tests (Requirements 3.2, 3.3)', () => {
  const defaultConfig: MapConfig = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 10,
  };

  describe('API Key Missing Scenarios', () => {
    it('displays error when API key is missing', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        // The error is correctly categorized as API key missing
        expect(screen.getByText('API Key Required')).toBeInTheDocument();
      });

      // Should not show retry button for API key errors (non-retryable)
      expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });

    it('handles API key validation errors', async () => {
      mockEnv.validateGoogleMapsApiKey.mockImplementation(() => {
        throw new Error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
      });

      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('API Key Required')).toBeInTheDocument();
      });
    });

    it('displays appropriate error message for missing API key', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('API key missing from request')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        // The error should be categorized as API key missing since it contains "API key missing"
        expect(screen.getByText('API Key Required')).toBeInTheDocument();
      });
    });
  });

  describe('API Key Invalid Scenarios', () => {
    it('displays error when API key is invalid', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('The provided API key is invalid')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Invalid API Key')).toBeInTheDocument();
      });
    });

    it('handles API key permission errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('This API key does not have permission to use the Maps JavaScript API')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Invalid API Key')).toBeInTheDocument();
      });
    });

    it('handles quota exceeded errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('You have exceeded your daily request quota for this API')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Map Initialization Failed')).toBeInTheDocument();
      });
    });

    it('handles billing not enabled errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Billing has not been enabled on this account')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Invalid API Key')).toBeInTheDocument();
      });
    });
  });

  describe('Network Error Scenarios', () => {
    it('handles network connection failures', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Failed to fetch Google Maps API')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Connection Problem')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    it('handles CORS errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('CORS error: Cross-origin request blocked')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Connection Problem')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    it('handles timeout errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Request timeout while loading Google Maps API')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('Connection Problem')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality for API Errors', () => {
    it('allows retry for network-related API loading errors', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI
        .mockRejectedValueOnce(new Error('Network connection failed'))
        .mockResolvedValueOnce(undefined);

      render(<GoogleMap config={defaultConfig} />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      // Click retry button
      fireEvent.click(screen.getByTestId('retry-button'));

      // Should attempt to load again and succeed
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      expect(mockGoogleMapsLib.loadGoogleMapsAPI).toHaveBeenCalledTimes(2);
    });

    it('handles retry for script loading failures', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI
        .mockRejectedValueOnce(new Error('Script loading failed'))
        .mockResolvedValueOnce(undefined);

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('retry-button'));

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });
    });
  });

  describe('Online/Offline State Handling', () => {
    beforeEach(() => {
      // Reset online state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('detects offline state and shows appropriate error', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    it('automatically retries when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
      });

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Trigger online event
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      // Should automatically retry and succeed
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });
    });

    it('shows offline error when going offline during loading', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockImplementation(() => {
        // Simulate going offline during loading
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        return new Promise(() => {}); // Never resolves
      });

      render(<GoogleMap config={defaultConfig} />);

      // Trigger offline event
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
        expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery and State Management', () => {
    it('clears error state on successful retry', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI
        .mockRejectedValueOnce(new Error('Temporary network error'))
        .mockResolvedValueOnce(undefined);

      render(<GoogleMap config={defaultConfig} />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
      });

      // Retry
      fireEvent.click(screen.getByTestId('retry-button'));

      // Error should be cleared and map should load
      await waitFor(() => {
        expect(screen.queryByTestId('map-error')).not.toBeInTheDocument();
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });
    });

    it('maintains error state for persistent failures', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(
        new Error('Persistent API error')
      );

      render(<GoogleMap config={defaultConfig} />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
      });

      // Retry should still show error
      fireEvent.click(screen.getByTestId('retry-button'));

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
      });

      expect(mockGoogleMapsLib.loadGoogleMapsAPI).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Message Accuracy', () => {
    it('provides specific error messages for different failure types', async () => {
      const errorScenarios = [
        {
          error: new Error('Failed to load Google Maps API'),
          expectedTitle: 'Maps API Failed to Load',
          expectedMessage: 'Failed to load Google Maps API'
        },
        {
          error: new Error('Network connection timeout'),
          expectedTitle: 'Maps API Failed to Load',
          expectedMessage: 'Network connection timeout'
        },
        {
          error: new Error('Script loading failed'),
          expectedTitle: 'Maps API Failed to Load',
          expectedMessage: 'Script loading failed'
        }
      ];

      for (const scenario of errorScenarios) {
        mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
        mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(scenario.error);

        const { unmount } = render(<GoogleMap config={defaultConfig} />);

        await waitFor(() => {
          expect(screen.getByText(scenario.expectedTitle)).toBeInTheDocument();
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument();
        });

        unmount();
        jest.clearAllMocks();
      }
    });
  });
});