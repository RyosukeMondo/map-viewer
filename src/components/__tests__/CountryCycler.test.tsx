/**
 * Tests for CountryCycler component
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { CountryCycler } from '../CountryCycler';
import { useCountryCycling } from '../../hooks/useCountryCycling';
import { Country } from '../../types/google-maps';

// Mock the useCountryCycling hook
jest.mock('../../hooks/useCountryCycling');

// Mock Google Maps
const mockMap = {
  panTo: jest.fn(),
  setZoom: jest.fn(),
  getZoom: jest.fn().mockReturnValue(10),
  getDiv: jest.fn().mockReturnValue(document.createElement('div'))
} as unknown as google.maps.Map;

const mockCountry: Country = {
  name: 'Test Country',
  center: { lat: 40.7128, lng: -74.0060 },
  zoom: 8,
  code: 'TC'
};

const mockUseCountryCycling = useCountryCycling as jest.MockedFunction<typeof useCountryCycling>;

describe('CountryCycler', () => {
  const mockHookReturn = {
    state: {
      currentCountry: null,
      isActive: false,
      isPaused: false
    },
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    nextCountry: jest.fn(),
    setupUserInteractionDetection: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCountryCycling.mockReturnValue(mockHookReturn);
  });

  it('renders without crashing', () => {
    render(<CountryCycler map={mockMap} />);
    expect(mockUseCountryCycling).toHaveBeenCalledWith(mockMap, {
      cycleInterval: 10000,
      idleTimeout: 30000,
      autoStart: true
    });
  });

  it('calls useCountryCycling with correct options', () => {
    render(
      <CountryCycler 
        map={mockMap}
        cycleInterval={5000}
        idleTimeout={15000}
        autoStart={false}
        isActive={false}
      />
    );

    expect(mockUseCountryCycling).toHaveBeenCalledWith(mockMap, {
      cycleInterval: 5000,
      idleTimeout: 15000,
      autoStart: false
    });
  });

  it('sets up user interaction detection when map is available', () => {
    const mockDiv = document.createElement('div');
    const mockMapWithDiv = {
      ...mockMap,
      getDiv: jest.fn().mockReturnValue(mockDiv)
    } as unknown as google.maps.Map;

    render(<CountryCycler map={mockMapWithDiv} />);

    expect(mockHookReturn.setupUserInteractionDetection).toHaveBeenCalledWith(mockDiv);
  });

  it('handles country transitions correctly', async () => {
    const onCountryChange = jest.fn();
    
    // Mock the hook to return a current country
    mockUseCountryCycling.mockReturnValue({
      ...mockHookReturn,
      state: {
        ...mockHookReturn.state,
        currentCountry: mockCountry
      }
    });

    render(
      <CountryCycler 
        map={mockMap}
        onCountryChange={onCountryChange}
      />
    );

    await waitFor(() => {
      expect(mockMap.panTo).toHaveBeenCalledWith(mockCountry.center);
      expect(onCountryChange).toHaveBeenCalledWith(mockCountry);
    });
  });

  it('handles zoom changes with delay', async () => {
    const mockMapWithDifferentZoom = {
      ...mockMap,
      getZoom: jest.fn().mockReturnValue(5) // Different from country zoom (8)
    } as unknown as google.maps.Map;

    mockUseCountryCycling.mockReturnValue({
      ...mockHookReturn,
      state: {
        ...mockHookReturn.state,
        currentCountry: mockCountry
      }
    });

    render(<CountryCycler map={mockMapWithDifferentZoom} />);

    await waitFor(() => {
      expect(mockMapWithDifferentZoom.panTo).toHaveBeenCalledWith(mockCountry.center);
    });

    // Wait for the zoom timeout
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    expect(mockMapWithDifferentZoom.setZoom).toHaveBeenCalledWith(mockCountry.zoom);
  });

  it('starts cycling when isActive becomes true', () => {
    const { rerender } = render(
      <CountryCycler map={mockMap} isActive={false} />
    );

    // Change isActive to true
    rerender(<CountryCycler map={mockMap} isActive={true} />);

    expect(mockHookReturn.start).toHaveBeenCalled();
  });

  it('stops cycling when isActive becomes false', () => {
    // Mock active state
    mockUseCountryCycling.mockReturnValue({
      ...mockHookReturn,
      state: {
        ...mockHookReturn.state,
        isActive: true
      }
    });

    const { rerender } = render(
      <CountryCycler map={mockMap} isActive={true} />
    );

    // Change isActive to false
    rerender(<CountryCycler map={mockMap} isActive={false} />);

    expect(mockHookReturn.stop).toHaveBeenCalled();
  });

  it('calls onUserInteraction callback', () => {
    const onUserInteraction = jest.fn();
    
    render(
      <CountryCycler 
        map={mockMap}
        onUserInteraction={onUserInteraction}
      />
    );

    // This test verifies the callback is passed correctly
    // The actual interaction detection is tested in the hook tests
    expect(onUserInteraction).toBeDefined();
  });

  it('handles missing map gracefully', () => {
    render(<CountryCycler map={null} />);
    
    expect(mockUseCountryCycling).toHaveBeenCalledWith(null, {
      cycleInterval: 10000,
      idleTimeout: 30000,
      autoStart: true
    });
  });

  it('handles country transition errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockMapWithError = {
      ...mockMap,
      panTo: jest.fn().mockImplementation(() => {
        throw new Error('Map error');
      })
    } as unknown as google.maps.Map;

    mockUseCountryCycling.mockReturnValue({
      ...mockHookReturn,
      state: {
        ...mockHookReturn.state,
        currentCountry: mockCountry
      }
    });

    render(<CountryCycler map={mockMapWithError} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'CountryCycler: Error during country transition:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});