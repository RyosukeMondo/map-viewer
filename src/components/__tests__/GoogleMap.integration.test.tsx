import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { GoogleMap } from '../GoogleMap';
import { MapContainer } from '../MapContainer';
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
  (global as any).google = mockGoogle;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);
  mockGoogleMapsLib.loadGoogleMapsAPI.mockResolvedValue();
  mockGoogle.maps.Map.mockImplementation(() => mockMap);
});

describe('GoogleMap Integration', () => {
  const defaultConfig: MapConfig = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 10,
  };

  it('integrates properly with MapContainer', async () => {
    render(
      <MapContainer height="500px">
        <GoogleMap config={defaultConfig} />
      </MapContainer>
    );
    
    // Check that both container and map are rendered
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });
    
    // Verify map was initialized with correct config
    expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        center: defaultConfig.center,
        zoom: defaultConfig.zoom,
        mapTypeId: 'roadmap',
      })
    );
  });

  it('handles default map settings correctly', async () => {
    const sanFranciscoConfig: MapConfig = {
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 10,
    };
    
    render(<GoogleMap config={sanFranciscoConfig} />);
    
    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 10,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        })
      );
    });
  });

  it('supports all required map controls', async () => {
    render(<GoogleMap config={defaultConfig} />);
    
    await waitFor(() => {
      expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          zoomControl: true,        // Requirement 5.1
          mapTypeControl: true,     // Requirement 5.2
          streetViewControl: true,  // Requirement 5.3
          fullscreenControl: true,
        })
      );
    });
  });

  it('configures enhanced map controls with proper positioning', async () => {
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

  it('sets up interaction event handlers for pan and zoom', async () => {
    render(<GoogleMap config={defaultConfig} />);
    
    await waitFor(() => {
      expect(mockMap.addListener).toHaveBeenCalledWith('zoom_changed', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('center_changed', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('dragstart', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('dragend', expect.any(Function));
      expect(mockMap.addListener).toHaveBeenCalledWith('maptypeid_changed', expect.any(Function));
    });
  });
});