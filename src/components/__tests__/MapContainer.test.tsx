import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapContainer, LoadingSpinner, MapContainerWithLoading } from '../MapContainer';

// Mock CSS modules
jest.mock('../MapContainer.module.css', () => ({
  mapContainer: 'mapContainer',
  loadingContainer: 'loadingContainer',
  spinner: 'spinner',
  loadingText: 'loadingText',
}));

describe('MapContainer', () => {
  describe('Basic MapContainer Component', () => {
    it('renders with default props', () => {
      render(
        <MapContainer>
          <div data-testid="map-content">Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mapContainer');
      expect(screen.getByTestId('map-content')).toBeInTheDocument();
    });

    it('applies default height of 400px', () => {
      render(
        <MapContainer>
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('accepts custom height as string', () => {
      render(
        <MapContainer height="500px">
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveStyle({ height: '500px' });
    });

    it('accepts custom height as number', () => {
      render(
        <MapContainer height={600}>
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveStyle({ height: '600px' });
    });

    it('applies custom className', () => {
      render(
        <MapContainer className="custom-class">
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveClass('mapContainer');
      expect(container).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
      render(
        <MapContainer>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </MapContainer>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('renders loading spinner with correct elements', () => {
      render(<LoadingSpinner />);

      const loadingContainer = screen.getByTestId('loading-spinner');
      expect(loadingContainer).toBeInTheDocument();
      expect(loadingContainer).toHaveClass('loadingContainer');

      const loadingText = screen.getByText('Loading map...');
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toHaveClass('loadingText');
    });

    it('has proper structure for spinner animation', () => {
      render(<LoadingSpinner />);

      const loadingContainer = screen.getByTestId('loading-spinner');
      const spinner = loadingContainer.querySelector('.spinner');
      
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('spinner');
    });
  });

  describe('MapContainerWithLoading Component', () => {
    it('renders children when not loading', () => {
      render(
        <MapContainerWithLoading isLoading={false}>
          <div data-testid="map-content">Map Content</div>
        </MapContainerWithLoading>
      );

      expect(screen.getByTestId('map-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('renders loading spinner when loading', () => {
      render(
        <MapContainerWithLoading isLoading={true}>
          <div data-testid="map-content">Map Content</div>
        </MapContainerWithLoading>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('map-content')).not.toBeInTheDocument();
    });

    it('defaults to not loading when isLoading prop is not provided', () => {
      render(
        <MapContainerWithLoading>
          <div data-testid="map-content">Map Content</div>
        </MapContainerWithLoading>
      );

      expect(screen.getByTestId('map-content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('passes through height and className props', () => {
      render(
        <MapContainerWithLoading height="300px" className="custom-loading-class">
          <div>Map Content</div>
        </MapContainerWithLoading>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveStyle({ height: '300px' });
      expect(container).toHaveClass('custom-loading-class');
    });

    it('switches between loading and content states', () => {
      const { rerender } = render(
        <MapContainerWithLoading isLoading={true}>
          <div data-testid="map-content">Map Content</div>
        </MapContainerWithLoading>
      );

      // Initially loading
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('map-content')).not.toBeInTheDocument();

      // Switch to loaded
      rerender(
        <MapContainerWithLoading isLoading={false}>
          <div data-testid="map-content">Map Content</div>
        </MapContainerWithLoading>
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('map-content')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Requirements', () => {
    it('has proper data attributes for responsive testing', () => {
      render(
        <MapContainer>
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveAttribute('data-testid', 'map-container');
    });

    it('maintains container structure for CSS responsive rules', () => {
      render(
        <MapContainer>
          <div data-testid="inner-content">Inner Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      const innerContent = screen.getByTestId('inner-content');
      
      expect(container).toContainElement(innerContent);
      expect(container).toHaveClass('mapContainer');
    });
  });

  describe('Accessibility', () => {
    it('provides proper container structure for screen readers', () => {
      render(
        <MapContainer>
          <div role="application" aria-label="Interactive map">
            Map Content
          </div>
        </MapContainer>
      );

      const mapApplication = screen.getByRole('application');
      expect(mapApplication).toBeInTheDocument();
      expect(mapApplication).toHaveAttribute('aria-label', 'Interactive map');
    });

    it('loading state is accessible', () => {
      render(<LoadingSpinner />);

      const loadingText = screen.getByText('Loading map...');
      expect(loadingText).toBeInTheDocument();
      
      // The loading text should be visible to screen readers
      expect(loadingText).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Error Handling', () => {
    it('handles undefined children gracefully', () => {
      render(<MapContainer>{undefined}</MapContainer>);

      const container = screen.getByTestId('map-container');
      expect(container).toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });

    it('handles null children gracefully', () => {
      render(<MapContainer>{null}</MapContainer>);

      const container = screen.getByTestId('map-container');
      expect(container).toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    });

    it('handles empty string className', () => {
      render(
        <MapContainer className="">
          <div>Map Content</div>
        </MapContainer>
      );

      const container = screen.getByTestId('map-container');
      expect(container).toHaveClass('mapContainer');
      expect(container.className).toBe('mapContainer ');
    });
  });
});