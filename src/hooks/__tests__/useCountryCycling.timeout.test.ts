import { renderHook, act } from '@testing-library/react';
import { useCountryCycling } from '../useCountryCycling';

// Mock the countries module
jest.mock('../../lib/countries', () => ({
  getRandomCountryWithoutRepetition: jest.fn(() => ({
    name: 'Test Country',
    center: { lat: 0, lng: 0 },
    zoom: 5
  }))
}));

describe('useCountryCycling - Timeout Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should pause cycling when timeout is prevented', () => {
    const { result, rerender } = renderHook(
      ({ timeoutPrevented }) => useCountryCycling(null, { 
        autoStart: true, 
        timeoutPrevented,
        cycleInterval: 1000 
      }),
      { initialProps: { timeoutPrevented: false } }
    );

    // Initially should be active and not paused
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);

    // Enable timeout prevention
    rerender({ timeoutPrevented: true });

    // Should now be paused
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(true);
  });

  it('should resume cycling when timeout prevention is disabled', async () => {
    const { result, rerender } = renderHook(
      ({ timeoutPrevented }) => useCountryCycling(null, { 
        autoStart: true, 
        timeoutPrevented,
        cycleInterval: 1000 
      }),
      { initialProps: { timeoutPrevented: true } }
    );

    // Initially should be paused due to timeout prevention
    expect(result.current.state.isActive).toBe(false);
    expect(result.current.state.isPaused).toBe(false);

    // Start cycling manually
    act(() => {
      result.current.start();
    });

    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(true);

    // Disable timeout prevention
    rerender({ timeoutPrevented: false });

    // Allow effects to run
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should now be active and not paused
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);
  });

  it('should handle multiple timeout prevention toggles correctly', () => {
    const { result, rerender } = renderHook(
      ({ timeoutPrevented }) => useCountryCycling(null, { 
        autoStart: true, 
        timeoutPrevented,
        cycleInterval: 1000 
      }),
      { initialProps: { timeoutPrevented: false } }
    );

    // Start with cycling active
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);

    // Toggle timeout prevention on
    rerender({ timeoutPrevented: true });
    expect(result.current.state.isPaused).toBe(true);

    // Toggle timeout prevention off
    rerender({ timeoutPrevented: false });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);

    // Toggle timeout prevention on again
    rerender({ timeoutPrevented: true });
    expect(result.current.state.isPaused).toBe(true);

    // Toggle timeout prevention off again
    rerender({ timeoutPrevented: false });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);
  });

  it('should not auto-start when timeout is prevented initially', () => {
    const { result } = renderHook(() => 
      useCountryCycling(null, { 
        autoStart: true, 
        timeoutPrevented: true,
        cycleInterval: 1000 
      })
    );

    // Should not be active initially due to timeout prevention
    expect(result.current.state.isActive).toBe(false);
    expect(result.current.state.isPaused).toBe(false);
    expect(result.current.state.currentCountry).toBeTruthy(); // Should still select initial country
  });

  it('should properly clean up timers when timeout prevention changes', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { result, rerender } = renderHook(
      ({ timeoutPrevented }) => useCountryCycling(null, { 
        autoStart: true, 
        timeoutPrevented,
        cycleInterval: 1000 
      }),
      { initialProps: { timeoutPrevented: false } }
    );

    // Verify initial state
    expect(result.current.state.isActive).toBe(true);
    expect(result.current.state.isPaused).toBe(false);

    // Clear the initial calls
    clearIntervalSpy.mockClear();
    clearTimeoutSpy.mockClear();

    // Enable timeout prevention - should clear timers
    rerender({ timeoutPrevented: true });

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(result.current.state.isPaused).toBe(true);
  });
});
