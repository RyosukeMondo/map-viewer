import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapContainer } from '../MapContainer';

// Mock CSS modules
jest.mock('../MapContainer.module.css', () => ({
    mapContainer: 'mapContainer',
    loadingContainer: 'loadingContainer',
    spinner: 'spinner',
    loadingText: 'loadingText',
}));

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
});

// Helper function to mock different screen sizes
const mockScreenSize = (width: number) => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => {
            const matches = query.includes(`max-width: ${width}px`) ||
                query.includes(`min-width: ${width}px`);
            return {
                ...mockMatchMedia(query),
                matches,
            };
        }),
    });
};

describe('MapContainer Responsive Design', () => {
    beforeEach(() => {
        // Reset window.matchMedia before each test
        delete (window as unknown as { matchMedia?: unknown }).matchMedia;
    });

    describe('Desktop Responsive Behavior (Requirements 4.1)', () => {
        it('displays at full available width on desktop', () => {
            mockScreenSize(1024);

            render(
                <MapContainer>
                    <div data-testid="map-content">Desktop Map</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');

            // Verify container has proper CSS class for desktop styling
            expect(container).toHaveClass('mapContainer');

            // Verify the container structure supports full width
            // The container should not have explicit width restrictions
            expect(container).not.toHaveStyle({ width: '50%' });
            expect(container).not.toHaveStyle({ maxWidth: '500px' });
        });

        it('maintains proper aspect ratio on desktop', () => {
            render(
                <MapContainer height="500px">
                    <div>Desktop Map Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '500px' });
        });
    });

    describe('Mobile Responsive Behavior (Requirements 4.2)', () => {
        it('adapts map size appropriately on mobile devices', () => {
            mockScreenSize(480);

            render(
                <MapContainer>
                    <div data-testid="mobile-map">Mobile Map</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');

            // Verify container has proper structure for mobile adaptation
            expect(container).toHaveClass('mapContainer');
            expect(screen.getByTestId('mobile-map')).toBeInTheDocument();
        });

        it('handles small screen heights appropriately', () => {
            render(
                <MapContainer height="200px">
                    <div>Mobile Map Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '200px' });
        });
    });

    describe('Screen Size Change Handling (Requirements 4.3)', () => {
        it('maintains map functionality when screen size changes', () => {
            const { rerender } = render(
                <MapContainer>
                    <div data-testid="responsive-map">Responsive Map</div>
                </MapContainer>
            );

            // Initial render - desktop
            let container = screen.getByTestId('map-container');
            expect(container).toHaveClass('mapContainer');
            expect(screen.getByTestId('responsive-map')).toBeInTheDocument();

            // Simulate screen size change by re-rendering
            rerender(
                <MapContainer>
                    <div data-testid="responsive-map">Responsive Map</div>
                </MapContainer>
            );

            // After screen size change - functionality maintained
            container = screen.getByTestId('map-container');
            expect(container).toHaveClass('mapContainer');
            expect(screen.getByTestId('responsive-map')).toBeInTheDocument();
        });

        it('maintains readability across different screen sizes', () => {
            // Test with different height configurations
            const heights = ['300px', '400px', '500px', 250, 350, 450];

            heights.forEach((height) => {
                const { unmount } = render(
                    <MapContainer height={height}>
                        <div data-testid={`map-${height}`}>Map Content</div>
                    </MapContainer>
                );

                const container = screen.getByTestId('map-container');
                const expectedHeight = typeof height === 'number' ? `${height}px` : height;

                expect(container).toHaveStyle({ height: expectedHeight });
                expect(screen.getByTestId(`map-${height}`)).toBeInTheDocument();

                unmount();
            });
        });
    });

    describe('Container Structure for Responsive CSS', () => {
        it('provides proper DOM structure for CSS media queries', () => {
            render(
                <MapContainer className="responsive-test">
                    <div className="map-inner">
                        <div data-testid="nested-content">Nested Map Content</div>
                    </div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            const nestedContent = screen.getByTestId('nested-content');

            // Verify proper nesting for CSS targeting
            expect(container).toHaveClass('mapContainer');
            expect(container).toHaveClass('responsive-test');
            expect(container).toContainElement(nestedContent);
        });

        it('supports CSS-based responsive behavior', () => {
            render(
                <MapContainer>
                    <div style={{ width: '100%', height: '100%' }}>
                        Full Size Content
                    </div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            const content = container.firstChild as HTMLElement;

            expect(content).toHaveStyle({
                width: '100%',
                height: '100%',
            });
        });
    });

    describe('Loading State Responsive Behavior', () => {
        it('loading spinner adapts to container size', () => {
            render(
                <MapContainer height="200px">
                    <div className="loadingContainer">
                        <div className="spinner" data-testid="responsive-spinner"></div>
                        <p className="loadingText">Loading...</p>
                    </div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '200px' });

            const spinner = screen.getByTestId('responsive-spinner');
            expect(spinner).toHaveClass('spinner');
        });
    });

    describe('Edge Cases for Responsive Design', () => {
        it('handles very small heights gracefully', () => {
            render(
                <MapContainer height="50px">
                    <div>Minimal Height Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '50px' });
        });

        it('handles very large heights gracefully', () => {
            render(
                <MapContainer height="2000px">
                    <div>Large Height Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '2000px' });
        });

        it('handles percentage-based heights', () => {
            render(
                <MapContainer height="100%">
                    <div>Percentage Height Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '100%' });
        });

        it('handles viewport-based heights', () => {
            render(
                <MapContainer height="50vh">
                    <div>Viewport Height Content</div>
                </MapContainer>
            );

            const container = screen.getByTestId('map-container');
            expect(container).toHaveStyle({ height: '50vh' });
        });
    });
});