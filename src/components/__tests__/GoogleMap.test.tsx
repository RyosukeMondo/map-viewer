import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GoogleMap } from '../GoogleMap';
import { MapConfig } from '../../types/google-maps';
import * as googleMapsLib from '../../lib/google-maps';

// Mock the google-maps library
jest.mock('../../lib/google-maps');
const mockGoogleMapsLib = googleMapsLib as jest.Mocked<typeof googleMapsLib>;

// Mock Google Maps API
const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  getCenter: jest.fn(),
  getZoom: jest.fn(),
  addListener: jest.fn(),
  getMapTypeId: jest.fn(() => 'roadmap'),
};

// Mock global google object
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

// Setup global mocks
beforeAll(() => {
  (global as unknown as { google: typeof mockGoogle }).google = mockGoogle;
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);
  mockGoogleMapsLib.loadGoogleMapsAPI.mockResolvedValue();
  // Reset the Map mock to not throw by default
  mockGoogle.maps.Map.mockImplementation(() => mockMap);
});

describe('GoogleMap Component', () => {
  const defaultConfig: MapConfig = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 10,
  };

  it('renders loading state initially', () => {
    mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
    mockGoogleMapsLib.loadGoogleMapsAPI.mockImplementation(() => new Promise(() => { })); // Never resolves

    render(<GoogleMap config={defaultConfig} />);

    expect(screen.getByTestId('map-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument();
  });

  it('renders map container after successful load', async () => {
    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        center: defaultConfig.center,
        zoom: defaultConfig.zoom,
        mapTypeId: 'roadmap',
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })
    );
  });

  it('calls onMapLoad callback when map is loaded', async () => {
    const onMapLoad = jest.fn();

    render(<GoogleMap config={defaultConfig} onMapLoad={onMapLoad} />);

    await waitFor(() => {
      expect(onMapLoad).toHaveBeenCalledWith(mockMap);
    });
  });

  it('applies custom className', async () => {
    const customClass = 'custom-map-class';

    render(<GoogleMap config={defaultConfig} className={customClass} />);

    await waitFor(() => {
      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveClass('google-map', customClass);
    });
  });

  it('uses custom mapTypeId when provided', async () => {
    const configWithMapType: MapConfig = {
      ...defaultConfig,
      mapTypeId: mockGoogle.maps.MapTypeId.SATELLITE as google.maps.MapTypeId,
    };

    render(<GoogleMap config={configWithMapType} />);

    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          mapTypeId: 'satellite',
        })
      );
    });
  });

  it('renders error state when API loading fails', async () => {
    const errorMessage = 'Failed to load Google Maps API';
    mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
    mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(new Error(errorMessage));

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('map-error')).toBeInTheDocument();
      expect(screen.getByText('Maps API Failed to Load')).toBeInTheDocument();
    });
  });

  it('renders error state when map initialization fails', async () => {
    mockGoogle.maps.Map.mockImplementation(() => {
      throw new Error('Map initialization failed');
    });

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('map-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to initialize the map')).toBeInTheDocument();
    });
  });

  it('loads Google Maps API when not already loaded', async () => {
    mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(mockGoogleMapsLib.loadGoogleMapsAPI).toHaveBeenCalled();
    });
  });

  it('does not load Google Maps API when already loaded', async () => {
    mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    expect(mockGoogleMapsLib.loadGoogleMapsAPI).not.toHaveBeenCalled();
  });

  it('reinitializes map when config changes', async () => {
    const { rerender } = render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledTimes(1);
    });

    const newConfig: MapConfig = {
      center: { lat: 40.7128, lng: -74.0060 }, // New York
      zoom: 12,
    };

    rerender(<GoogleMap config={newConfig} />);

    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledTimes(2);
      expect(mockGoogle.maps.Map).toHaveBeenLastCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: newConfig.center,
          zoom: newConfig.zoom,
        })
      );
    });
  });

  it('configures enhanced map controls with proper options', async () => {
    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          // Enhanced zoom controls (Requirement 5.1)
          zoomControl: true,
          zoomControlOptions: {
            position: 'RIGHT_CENTER',
          },

          // Enhanced map type controls (Requirement 5.2)
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: 'HORIZONTAL_BAR',
            position: 'TOP_CENTER',
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
          },

          // Enhanced street view controls (Requirement 5.3)
          streetViewControl: true,
          streetViewControlOptions: {
            position: 'RIGHT_TOP',
          },

          // Pan and zoom interactions (Requirement 1.2)
          gestureHandling: 'auto',
          draggable: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
        })
      );
    });
  });

  it('sets up interaction event listeners for map events', async () => {
    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      // Verify that event listeners are set up for pan and zoom interactions
      expect(mockMap.addListener).toHaveBeenCalledWith('zoom_changed', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('center_changed', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('dragstart', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('dragend', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('maptypeid_changed', expect.any(Function));
    });
  });

  it('shows retry button for retryable errors', async () => {
    mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
    mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(new Error('Network error'));

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('map-error')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
  });

  it('handles offline scenarios', async () => {
    // Mock navigator.onLine to simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<GoogleMap config={defaultConfig} />);

    await waitFor(() => {
      expect(screen.getByTestId('map-error')).toBeInTheDocument();
      expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
    });

    // Restore online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });
});