import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoogleMap } from '../GoogleMap';
import { MapContainer } from '../MapContainer';
import { MapConfig } from '../../types/google-maps';
import * as googleMapsLib from '../../lib/google-maps';

// Mock the google-maps library
jest.mock('../../lib/google-maps');
const mockGoogleMapsLib = googleMapsLib as jest.Mocked<typeof googleMapsLib>;

// Mock CSS modules
jest.mock('../MapContainer.module.css', () => ({
  mapContainer: 'mapContainer',
  loadingContainer: 'loadingContainer',
  spinner: 'spinner',
  loadingText: 'loadingText',
}));

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

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

beforeAll(() => {
  (global as unknown as { google: typeof mockGoogle }).google = mockGoogle;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(mockMatchMedia),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);
  mockGoogleMapsLib.loadGoogleMapsAPI.mockResolvedValue();
  mockGoogle.maps.Map.mockImplementation(() => mockMap);
});

describe('GoogleMap Responsive Design Tests (Requirements 4.1, 4.2, 4.3)', () => {
  const defaultConfig: MapConfig = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 10,
  };

  describe('Desktop Responsive Behavior (Requirement 4.1)', () => {
    it('displays at full available width on desktop', async () => {
      render(
        <div style={{ width: '1200px', height: '600px' }}>
          <MapContainer>
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      const containerElement = screen.getByTestId('map-container');

      // Map should fill container completely
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });

      // Container should have proper responsive class
      expect(containerElement).toHaveClass('mapContainer');
    });

    it('maintains proper aspect ratio on large screens', async () => {
      render(
        <MapContainer height="500px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '500px' });
    });

    it('handles wide screen layouts properly', async () => {
      render(
        <div style={{ width: '1920px', height: '800px' }}>
          <MapContainer>
            <GoogleMap config={defaultConfig} className="desktop-map" />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveClass('google-map', 'desktop-map');
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });
  });

  describe('Mobile Responsive Behavior (Requirement 4.2)', () => {
    it('adapts map size appropriately on mobile devices', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <div style={{ width: '375px', height: '300px' }}>
          <MapContainer height="300px">
            <GoogleMap config={defaultConfig} className="mobile-map" />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      const containerElement = screen.getByTestId('map-container');

      expect(mapElement).toHaveClass('google-map', 'mobile-map');
      expect(containerElement).toHaveStyle({ height: '300px' });
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });

    it('handles small screen heights appropriately', async () => {
      render(
        <MapContainer height="200px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '200px' });
    });

    it('maintains touch interactions on mobile', async () => {
      render(
        <MapContainer>
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            gestureHandling: 'auto', // Allows touch gestures
            draggable: true,
            scrollwheel: true,
          })
        );
      });
    });
  });

  describe('Screen Size Change Handling (Requirement 4.3)', () => {
    it('maintains map functionality when screen size changes', async () => {
      const { rerender } = render(
        <div style={{ width: '1200px', height: '600px' }}>
          <MapContainer>
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      // Simulate screen size change to mobile
      rerender(
        <div style={{ width: '375px', height: '300px' }}>
          <MapContainer>
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      // Map should still be functional
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });

    it('maintains readability across different screen sizes', async () => {
      const screenSizes = [
        { width: '320px', height: '200px', name: 'small-mobile' },
        { width: '768px', height: '400px', name: 'tablet' },
        { width: '1024px', height: '500px', name: 'desktop' },
        { width: '1920px', height: '800px', name: 'large-desktop' }
      ];

      for (const size of screenSizes) {
        const { unmount } = render(
          <div style={{ width: size.width, height: size.height }}>
            <MapContainer>
              <GoogleMap config={defaultConfig} className={size.name} />
            </MapContainer>
          </div>
        );

        await waitFor(() => {
          expect(screen.getByTestId('google-map')).toBeInTheDocument();
        });

        const mapElement = screen.getByTestId('google-map');
        expect(mapElement).toHaveClass('google-map', size.name);
        expect(mapElement).toHaveStyle({
          width: '100%',
          height: '100%'
        });

        unmount();
      }
    });

    it('handles orientation changes properly', async () => {
      // Portrait mode
      render(
        <div style={{ width: '375px', height: '667px' }}>
          <MapContainer height="400px">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      let containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '400px' });

      // Simulate orientation change to landscape
      const { rerender } = render(
        <div style={{ width: '667px', height: '375px' }}>
          <MapContainer height="300px">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      rerender(
        <div style={{ width: '667px', height: '375px' }}>
          <MapContainer height="300px">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '300px' });
    });
  });

  describe('Container Integration for Responsive Design', () => {
    it('works properly with MapContainer responsive features', async () => {
      render(
        <MapContainer height="calc(100vh - 200px)" className="responsive-container">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveClass('mapContainer', 'responsive-container');
      expect(containerElement).toHaveStyle({ height: 'calc(100vh - 200px)' });
    });

    it('supports percentage-based responsive heights', async () => {
      render(
        <div style={{ height: '600px' }}>
          <MapContainer height="80%">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '80%' });
    });

    it('supports viewport-based responsive units', async () => {
      render(
        <MapContainer height="50vh">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const containerElement = screen.getByTestId('map-container');
      expect(containerElement).toHaveStyle({ height: '50vh' });
    });
  });

  describe('Loading and Error States Responsive Behavior', () => {
    it('loading state adapts to container size', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockImplementation(() => new Promise(() => {}));

      render(
        <MapContainer height="300px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('map-loading')).toBeInTheDocument();
      });

      const loadingElement = screen.getByTestId('map-loading');
      expect(loadingElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });

    it('error state adapts to container size', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(new Error('API loading failed'));

      render(
        <MapContainer height="400px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
      });

      const errorElement = screen.getByTestId('map-error');
      expect(errorElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });
  });

  describe('Map Controls Responsive Behavior', () => {
    it('configures controls appropriately for different screen sizes', async () => {
      render(
        <MapContainer>
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            // Controls should be positioned for responsive design
            zoomControlOptions: {
              position: 'RIGHT_CENTER',
            },
            mapTypeControlOptions: {
              style: 'HORIZONTAL_BAR',
              position: 'TOP_CENTER',
              mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
            },
            streetViewControlOptions: {
              position: 'RIGHT_TOP',
            },
            fullscreenControlOptions: {
              position: 'RIGHT_TOP',
            },
          })
        );
      });
    });

    it('maintains control accessibility across screen sizes', async () => {
      render(
        <MapContainer>
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          })
        );
      });
    });
  });

  describe('Performance Considerations for Responsive Design', () => {
    it('does not cause unnecessary re-renders on container size changes', async () => {
      const { rerender } = render(
        <MapContainer height="400px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledTimes(1);
      });

      // Change container size
      rerender(
        <MapContainer height="500px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      // Should not reinitialize map just for container size change
      expect(mockGoogle.maps.Map).toHaveBeenCalledTimes(1);
    });

    it('efficiently handles multiple responsive breakpoints', async () => {
      const breakpoints = ['320px', '768px', '1024px', '1200px'];

      for (const width of breakpoints) {
        const { unmount } = render(
          <div style={{ width }}>
            <MapContainer>
              <GoogleMap config={defaultConfig} />
            </MapContainer>
          </div>
        );

        await waitFor(() => {
          expect(screen.getByTestId('google-map')).toBeInTheDocument();
        });

        // Each render should be efficient
        const mapElement = screen.getByTestId('google-map');
        expect(mapElement).toHaveStyle({
          width: '100%',
          height: '100%'
        });

        unmount();
      }
    });
  });

  describe('Edge Cases for Responsive Design', () => {
    it('handles very small container sizes gracefully', async () => {
      render(
        <div style={{ width: '100px', height: '100px' }}>
          <MapContainer height="100px">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });

    it('handles very large container sizes gracefully', async () => {
      render(
        <div style={{ width: '3000px', height: '2000px' }}>
          <MapContainer height="2000px">
            <GoogleMap config={defaultConfig} />
          </MapContainer>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });

    it('handles zero or negative dimensions gracefully', async () => {
      render(
        <MapContainer height="0px">
          <GoogleMap config={defaultConfig} />
        </MapContainer>
      );

      // Should still render without crashing
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByTestId('map-container')).toHaveStyle({ height: '0px' });
    });
  });
});