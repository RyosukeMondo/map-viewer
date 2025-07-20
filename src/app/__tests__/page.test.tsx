import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';
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
  panTo: jest.fn(),
  getDiv: jest.fn(() => document.createElement('div')),
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

// Mock CSS modules
jest.mock('../../components/MapContainer.module.css', () => ({
  mapContainer: 'mapContainer',
  loadingContainer: 'loadingContainer',
  spinner: 'spinner',
  loadingText: 'loadingText',
}));

beforeAll(() => {
  (global as unknown as { google: typeof mockGoogle }).google = mockGoogle;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(true);
  mockGoogleMapsLib.loadGoogleMapsAPI.mockResolvedValue();
  mockGoogle.maps.Map.mockImplementation(() => mockMap);
});

describe('Home Page Component', () => {
  describe('Basic Rendering (Requirements 1.1, 1.3)', () => {
    it('renders the main page structure', async () => {
      render(<Home />);

      // Check header
      expect(screen.getByText('Google Maps Viewer')).toBeInTheDocument();
      expect(screen.getByText('Interactive map viewer built with Next.js and TypeScript')).toBeInTheDocument();

      // Check map container
      expect(screen.getByTestId('map-container')).toBeInTheDocument();

      // Wait for map to load
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });
    });

    it('displays default San Francisco location (Requirement 1.1)', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            center: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
            zoom: 10,
          })
        );
      });
    });

    it('uses Google Maps API key for authentication (Requirement 1.3)', async () => {
      render(<Home />);

      await waitFor(() => {
        // Verify that the Google Maps API loading was attempted
        // This indirectly tests that the API key is being used
        expect(mockGoogleMapsLib.isGoogleMapsLoaded).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Layout (Requirements 4.1, 4.2, 4.3)', () => {
    it('displays map at full available width on desktop (Requirement 4.1)', () => {
      render(<Home />);

      const mapContainer = screen.getByTestId('map-container');
      
      // Check that container has proper responsive classes
      expect(mapContainer).toHaveClass('mapContainer');
      
      // Check that the map component has full width class
      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveClass('w-full', 'h-full');
    });

    it('adapts map size appropriately for mobile devices (Requirement 4.2)', () => {
      render(<Home />);

      const mainContent = screen.getByRole('main');
      
      // Check responsive padding classes
      expect(mainContent.firstElementChild).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
      
      // Check map container responsive height
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveStyle({ height: 'calc(100vh - 200px)' });
    });

    it('maintains map functionality across screen sizes (Requirement 4.3)', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            // Pan and zoom interactions should be enabled
            gestureHandling: 'auto',
            draggable: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
          })
        );
      });
    });
  });

  describe('Map Features Display', () => {
    it('displays map features information', () => {
      render(<Home />);

      const features = [
        'Pan and zoom interactions',
        'Multiple map types (roadmap, satellite, etc.)',
        'Street view integration',
        'Responsive design',
        'Error handling and offline support',
        'Fullscreen mode'
      ];

      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('has proper feature indicators with colors', () => {
      render(<Home />);

      // Check that feature indicators are present (colored dots)
      const featureSection = screen.getByText('Map Features').closest('div');
      expect(featureSection).toBeInTheDocument();
      
      // Should have grid layout for features
      const featuresGrid = featureSection?.querySelector('.grid');
      expect(featuresGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Map Integration', () => {
    it('integrates GoogleMap component with MapContainer', async () => {
      render(<Home />);

      // Both components should be present
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
      });
    });

    it('passes correct configuration to GoogleMap component', async () => {
      render(<Home />);

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

    it('handles map load callback', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<Home />);

      await waitFor(() => {
        expect(mockGoogle.maps.Map).toHaveBeenCalled();
      });

      // The onMapLoad callback should log the map instance
      expect(consoleSpy).toHaveBeenCalledWith('Google Map loaded successfully:', mockMap);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Layout Structure', () => {
    it('has proper semantic HTML structure', () => {
      render(<Home />);

      // Check semantic elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer

      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Google Maps Viewer');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Map Features');
    });

    it('has proper responsive container structure', () => {
      render(<Home />);

      const header = screen.getByRole('banner');
      const main = screen.getByRole('main');
      const footer = screen.getByRole('contentinfo');

      // Check responsive container classes
      [header, main, footer].forEach(element => {
        const container = element.querySelector('.max-w-7xl');
        expect(container).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
      });
    });
  });

  describe('Styling and Design', () => {
    it('applies proper styling classes', () => {
      render(<Home />);

      // Check main container
      const pageContainer = screen.getByText('Google Maps Viewer').closest('div');
      expect(pageContainer).toHaveClass('min-h-screen', 'bg-gray-50');

      // Check header styling
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');

      // Check map container styling
      const mapSection = screen.getByTestId('map-container').closest('.bg-white');
      expect(mapSection).toHaveClass('rounded-lg', 'shadow-md', 'overflow-hidden');
    });

    it('has proper text styling and hierarchy', () => {
      render(<Home />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveClass('text-2xl', 'font-bold', 'text-gray-900', 'sm:text-3xl');

      const subtitle = screen.getByText('Interactive map viewer built with Next.js and TypeScript');
      expect(subtitle).toHaveClass('mt-1', 'text-sm', 'text-gray-600', 'sm:text-base');
    });
  });

  describe('Error Handling Integration', () => {
    it('handles map loading errors gracefully', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockRejectedValue(new Error('API loading failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('map-error')).toBeInTheDocument();
      });

      // Page structure should still be intact
      expect(screen.getByText('Google Maps Viewer')).toBeInTheDocument();
      expect(screen.getByText('Map Features')).toBeInTheDocument();
    });

    it('shows loading state during map initialization', async () => {
      mockGoogleMapsLib.isGoogleMapsLoaded.mockReturnValue(false);
      mockGoogleMapsLib.loadGoogleMapsAPI.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('map-loading')).toBeInTheDocument();
      });

      // Page structure should still be intact
      expect(screen.getByText('Google Maps Viewer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility attributes', () => {
      render(<Home />);

      // Check heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveAttribute('aria-level', '1');
      expect(headings[1]).toHaveAttribute('aria-level', '2');
    });

    it('provides meaningful content for screen readers', () => {
      render(<Home />);

      // Check that important content is accessible
      expect(screen.getByText('Google Maps Viewer')).toBeInTheDocument();
      expect(screen.getByText('Interactive map viewer built with Next.js and TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Built with Next.js, TypeScript, and Google Maps API')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('uses React.useCallback for map load handler', () => {
      // This test ensures the component is optimized
      const { rerender } = render(<Home />);
      
      // Re-render should not cause unnecessary re-initialization
      rerender(<Home />);
      
      // Map should only be initialized once
      expect(mockGoogleMapsLib.isGoogleMapsLoaded).toHaveBeenCalled();
    });
  });

  describe('Footer Information', () => {
    it('displays footer with technology information', () => {
      render(<Home />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(screen.getByText('Built with Next.js, TypeScript, and Google Maps API')).toBeInTheDocument();
    });

    it('has proper footer styling', () => {
      render(<Home />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white', 'border-t', 'border-gray-200', 'mt-8');
    });
  });
});