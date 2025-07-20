/**
 * Unit tests for useCountryCycling custom hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCountryCycling } from '../useCountryCycling';
import { getRandomCountryWithoutRepetition } from '../../lib/countries';

// Mock the countries module
jest.mock('../../lib/countries', () => ({
  getRandomCountryWithoutRepetition: jest.fn()
}));

// Mock Google Maps
const mockMap = {
  panTo: jest.fn(),
  setZoom: jest.fn()
} as unknown as google.maps.Map;

// Mock country data
const mockCountries = [
  {
    name: 'Test Country 1',
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 10,
    code: 'TC1'
  },
  {
    name: 'Test Country 2',
    center: { lat: 51.5074, lng: -0.1278 },
    zoom: 8,
    code: 'TC2'
  },
  {
    name: 'Test Country 3',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 9,
    code: 'TC3'
  }
];

const mockGetRandomCountryWithoutRepetition = getRandomCountryWithoutRepetition as jest.MockedFunction<typeof getRandomCountryWithoutRepetition>;

describe('useCountryCycling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup mock to return different countries on each call
    let callCount = 0;
    mockGetRandomCountryWithoutRepetition.mockImplementation(() => {
      const country = mockCountries[callCount % mockCountries.length];
      callCount++;
      return country;
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    test('should initialize with correct default state', () => {
      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      expect(result.current.state).toEqual({
        currentCountry: null,
        isActive: false,
        isPaused: false
      });
    });

    test('should auto-start by default', () => {
      const { result } = renderHook(() => useCountryCycling());

      expect(result.current.state.isActive).toBe(true);
      expect(result.current.state.isPaused).toBe(false);
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalled();
    });

    test('should not auto-start when autoStart is false', () => {
      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      expect(result.current.state.isActive).toBe(false);
      expect(mockGetRandomCountryWithoutRepetition).not.toHaveBeenCalled();
    });
  });

  describe('Start and Stop Functionality', () => {
    test('should start cycling when start() is called', () => {
      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      act(() => {
        result.current.start();
      });

      expect(result.current.state.isActive).toBe(true);
      expect(result.current.state.isPaused).toBe(false);
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalled();
    });

    test('should stop cycling when stop() is called', () => {
      const { result } = renderHook(() => useCountryCycling());

      act(() => {
        result.current.stop();
      });

      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.isPaused).toBe(false);
    });

    test('should pause cycling when pause() is called', () => {
      const { result } = renderHook(() => useCountryCycling());

      act(() => {
        result.current.pause();
      });

      expect(result.current.state.isActive).toBe(true);
      expect(result.current.state.isPaused).toBe(true);
    });

    test('should resume cycling when resume() is called', () => {
      const { result } = renderHook(() => useCountryCycling());

      act(() => {
        result.current.pause();
      });

      expect(result.current.state.isPaused).toBe(true);

      act(() => {
        result.current.resume();
      });

      expect(result.current.state.isPaused).toBe(false);
    });
  });

  describe('Timer Management', () => {
    test('should cycle to next country after specified interval', () => {
      const cycleInterval = 5000;
      const { result } = renderHook(() => 
        useCountryCycling(null, { cycleInterval, autoStart: false })
      );

      act(() => {
        result.current.start();
      });

      // Initial country selection
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(1);

      // Fast-forward time to trigger next cycle
      act(() => {
        jest.advanceTimersByTime(cycleInterval);
      });

      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(2);
    });

    test('should continue cycling at regular intervals', () => {
      const cycleInterval = 3000;
      const { result } = renderHook(() => 
        useCountryCycling(null, { cycleInterval, autoStart: false })
      );

      act(() => {
        result.current.start();
      });

      // Initial country selection
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(1);

      // Advance through multiple cycles - advance by multiple intervals at once
      act(() => {
        jest.advanceTimersByTime(cycleInterval * 3);
      });
      
      // Should have called the function 4 times total (1 initial + 3 intervals)
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(4);
    });

    test('should not cycle when paused', () => {
      const cycleInterval = 2000;
      const { result } = renderHook(() => 
        useCountryCycling(null, { cycleInterval, autoStart: false })
      );

      act(() => {
        result.current.start();
        result.current.pause();
      });

      const initialCallCount = mockGetRandomCountryWithoutRepetition.mock.calls.length;

      act(() => {
        jest.advanceTimersByTime(cycleInterval * 3);
      });

      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Map Integration', () => {
    test('should call map methods when navigating to country', () => {
      const { result } = renderHook(() => useCountryCycling(mockMap, { autoStart: false }));

      act(() => {
        result.current.nextCountry();
      });

      expect(mockMap.panTo).toHaveBeenCalledWith(mockCountries[0].center);
      expect(mockMap.setZoom).toHaveBeenCalledWith(mockCountries[0].zoom);
    });

    test('should handle map navigation during cycling', () => {
      const cycleInterval = 1000;
      const { result } = renderHook(() => 
        useCountryCycling(mockMap, { cycleInterval, autoStart: false })
      );

      act(() => {
        result.current.start();
      });

      // Advance timer to trigger automatic cycling
      act(() => {
        jest.advanceTimersByTime(cycleInterval);
      });

      expect(mockMap.panTo).toHaveBeenCalledTimes(2); // Initial + first cycle
      expect(mockMap.setZoom).toHaveBeenCalledTimes(2);
    });

    test('should work without map instance', () => {
      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      expect(() => {
        act(() => {
          result.current.nextCountry();
        });
      }).not.toThrow();

      expect(result.current.state.currentCountry).toEqual(mockCountries[0]);
    });
  });

  describe('User Interaction Detection', () => {
    test('should set up event listeners on element', () => {
      const mockElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      act(() => {
        result.current.setupUserInteractionDetection(mockElement);
      });

      // Should add listeners for multiple event types
      expect(mockElement.addEventListener).toHaveBeenCalledTimes(6);
      expect(mockElement.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), { passive: true });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), { passive: true });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: true });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), { passive: true });
    });

    test('should handle null element gracefully', () => {
      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      expect(() => {
        act(() => {
          result.current.setupUserInteractionDetection(null);
        });
      }).not.toThrow();
    });

    test('should clean up previous listeners when setting up new ones', () => {
      const mockElement1 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const mockElement2 = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      act(() => {
        result.current.setupUserInteractionDetection(mockElement1);
      });

      act(() => {
        result.current.setupUserInteractionDetection(mockElement2);
      });

      // Should remove listeners from first element
      expect(mockElement1.removeEventListener).toHaveBeenCalledTimes(6);
      // Should add listeners to second element
      expect(mockElement2.addEventListener).toHaveBeenCalledTimes(6);
    });
  });

  describe('Idle Timeout and Resume Logic', () => {
    test('should resume cycling after idle timeout', () => {
      const idleTimeout = 2000;
      const mockElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const { result } = renderHook(() => 
        useCountryCycling(null, { idleTimeout, autoStart: false })
      );

      act(() => {
        result.current.start();
        result.current.setupUserInteractionDetection(mockElement);
      });

      expect(result.current.state.isPaused).toBe(false);

      // Get the mousedown event listener that was added
      const mousedownCall = mockElement.addEventListener.mock.calls.find(
        call => call[0] === 'mousedown'
      );
      const mousedownListener = mousedownCall?.[1];

      // Simulate user interaction by calling the event listener
      act(() => {
        if (mousedownListener) {
          mousedownListener(new MouseEvent('mousedown'));
        }
      });

      expect(result.current.state.isPaused).toBe(true);

      // Fast-forward past idle timeout
      act(() => {
        jest.advanceTimersByTime(idleTimeout);
      });

      expect(result.current.state.isPaused).toBe(false);
    });

    test('should not resume if cycling was stopped', () => {
      const idleTimeout = 1000;
      const { result } = renderHook(() => 
        useCountryCycling(null, { idleTimeout })
      );

      act(() => {
        result.current.stop();
      });

      // Fast-forward past idle timeout
      act(() => {
        jest.advanceTimersByTime(idleTimeout);
      });

      expect(result.current.state.isActive).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in country selection gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetRandomCountryWithoutRepetition.mockImplementation(() => {
        throw new Error('Country selection failed');
      });

      const { result } = renderHook(() => useCountryCycling(null, { autoStart: false }));

      expect(() => {
        act(() => {
          result.current.nextCountry();
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Error selecting next country:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Custom Options', () => {
    test('should use custom cycle interval', () => {
      const customInterval = 15000;
      const { result } = renderHook(() => 
        useCountryCycling(null, { cycleInterval: customInterval, autoStart: false })
      );

      act(() => {
        result.current.start();
      });

      // Should not cycle before custom interval
      act(() => {
        jest.advanceTimersByTime(customInterval - 1000);
      });
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(1);

      // Should cycle after custom interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockGetRandomCountryWithoutRepetition).toHaveBeenCalledTimes(2);
    });

    test('should use custom idle timeout', () => {
      const customIdleTimeout = 45000;
      const mockElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const { result } = renderHook(() => 
        useCountryCycling(null, { idleTimeout: customIdleTimeout, autoStart: false })
      );

      act(() => {
        result.current.start();
        result.current.setupUserInteractionDetection(mockElement);
      });

      // Get the mousedown event listener that was added
      const mousedownCall = mockElement.addEventListener.mock.calls.find(
        call => call[0] === 'mousedown'
      );
      const mousedownListener = mousedownCall?.[1];

      // Simulate user interaction
      act(() => {
        if (mousedownListener) {
          mousedownListener(new MouseEvent('mousedown'));
        }
      });

      expect(result.current.state.isPaused).toBe(true);

      // Should not resume before custom timeout
      act(() => {
        jest.advanceTimersByTime(customIdleTimeout - 1000);
      });
      expect(result.current.state.isPaused).toBe(true);

      // Should resume after custom timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.state.isPaused).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should clean up timers on unmount', () => {
      const { result, unmount } = renderHook(() => useCountryCycling());

      act(() => {
        result.current.start();
      });

      // Verify cycling is active
      expect(result.current.state.isActive).toBe(true);

      // Unmount should clean up without errors
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    test('should clean up event listeners on unmount', () => {
      const mockElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as unknown as HTMLElement;

      const { result, unmount } = renderHook(() => useCountryCycling());

      act(() => {
        result.current.setupUserInteractionDetection(mockElement);
      });

      unmount();

      // Should have cleaned up event listeners
      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(6);
    });
  });
});