import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapLoading } from '../MapLoading';

describe('MapLoading Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<MapLoading />);

      expect(screen.getByTestId('map-loading')).toBeInTheDocument();
      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we initialize the map...')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      const customMessage = 'Initializing Google Maps...';
      render(<MapLoading message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText('Loading map...')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<MapLoading className="custom-loading-class" />);

      const loadingElement = screen.getByTestId('map-loading');
      expect(loadingElement).toHaveClass('map-loading');
      expect(loadingElement).toHaveClass('custom-loading-class');
    });
  });

  describe('Progress Spinner', () => {
    it('shows progress spinner by default', () => {
      render(<MapLoading />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows progress spinner when showProgress is true', () => {
      render(<MapLoading showProgress={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('hides progress spinner when showProgress is false', () => {
      render(<MapLoading showProgress={false} />);

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    it('spinner has proper styling for animation', () => {
      render(<MapLoading />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveStyle({
        width: '40px',
        height: '40px',
        border: '3px solid #e3f2fd',
        borderTop: '3px solid #1976d2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      });
    });
  });

  describe('Styling and Layout', () => {
    it('has proper container styling', () => {
      render(<MapLoading />);

      const loadingElement = screen.getByTestId('map-loading');
      expect(loadingElement).toHaveStyle({
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        minHeight: '200px'
      });
    });

    it('has proper text styling', () => {
      render(<MapLoading />);

      const mainMessage = screen.getByText('Loading map...');
      const subMessage = screen.getByText('Please wait while we initialize the map...');

      expect(mainMessage).toHaveStyle({
        color: '#495057',
        fontSize: '16px',
        fontWeight: '500'
      });

      expect(subMessage).toHaveStyle({
        color: '#6c757d',
        fontSize: '13px'
      });
    });
  });

  describe('Responsive Design (Requirements 4.1, 4.2, 4.3)', () => {
    it('maintains proper structure for responsive behavior', () => {
      render(<MapLoading />);

      const loadingElement = screen.getByTestId('map-loading');
      
      // Should fill container completely
      expect(loadingElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });

      // Should be centered for all screen sizes
      expect(loadingElement).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
    });

    it('provides consistent loading experience across screen sizes', () => {
      const { rerender } = render(<MapLoading />);

      // Test with different custom messages (simulating different contexts)
      const messages = [
        'Loading map for desktop...',
        'Loading map for mobile...',
        'Loading map for tablet...'
      ];

      messages.forEach(message => {
        rerender(<MapLoading message={message} />);
        
        expect(screen.getByTestId('map-loading')).toBeInTheDocument();
        expect(screen.getByText(message)).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides accessible loading state', () => {
      render(<MapLoading />);

      const loadingElement = screen.getByTestId('map-loading');
      
      // Loading content should be visible to screen readers
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we initialize the map...')).toBeInTheDocument();
      
      // Container should not have aria-hidden
      expect(loadingElement).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('loading messages are properly structured', () => {
      render(<MapLoading />);

      // Main message should be more prominent
      const mainMessage = screen.getByText('Loading map...');
      const subMessage = screen.getByText('Please wait while we initialize the map...');

      expect(mainMessage).toHaveStyle({ fontWeight: '500' });
      expect(subMessage).toHaveStyle({ fontSize: '13px' });
    });
  });

  describe('Integration with MapContainer', () => {
    it('works properly when used as loading state', () => {
      render(
        <div style={{ width: '500px', height: '300px' }}>
          <MapLoading />
        </div>
      );

      const loadingElement = screen.getByTestId('map-loading');
      expect(loadingElement).toBeInTheDocument();
      
      // Should fill the parent container
      expect(loadingElement).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently with minimal DOM elements', () => {
      render(<MapLoading />);

      const loadingElement = screen.getByTestId('map-loading');
      
      // Should have a reasonable number of child elements
      expect(loadingElement.children.length).toBeLessThanOrEqual(4);
      
      // Essential elements should be present
      expect(screen.getByText('🗺️')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });
  });

  describe('CSS Animation', () => {
    it('includes CSS animation styles', () => {
      render(<MapLoading />);

      // Check that the component includes the spin animation
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveStyle({
        animation: 'spin 1s linear infinite'
      });
    });
  });

  describe('Props Validation', () => {
    it('handles undefined props gracefully', () => {
      render(<MapLoading message={undefined} showProgress={undefined} className={undefined} />);

      // Should use defaults
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByTestId('map-loading')).toHaveClass('map-loading');
    });

    it('handles empty string props', () => {
      render(<MapLoading message="" className="" />);

      // Empty message should still show something
      expect(screen.queryByText('Loading map...')).not.toBeInTheDocument();
      expect(screen.getByTestId('map-loading')).toHaveClass('map-loading');
    });
  });
});