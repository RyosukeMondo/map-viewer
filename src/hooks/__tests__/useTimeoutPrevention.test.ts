import { renderHook, act } from '@testing-library/react';
import { useTimeoutPrevention } from '../useTimeoutPrevention';

describe('useTimeoutPrevention', () => {
  it('should initialize with timeout prevention inactive', () => {
    const { result } = renderHook(() => useTimeoutPrevention());
    
    expect(result.current.isActive).toBe(false);
    expect(typeof result.current.toggle).toBe('function');
  });

  it('should toggle timeout prevention state when toggle is called', () => {
    const { result } = renderHook(() => useTimeoutPrevention());
    
    // Initially inactive
    expect(result.current.isActive).toBe(false);
    
    // Toggle to active
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isActive).toBe(true);
    
    // Toggle back to inactive
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isActive).toBe(false);
  });

  it('should maintain toggle function reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useTimeoutPrevention());
    
    const initialToggle = result.current.toggle;
    
    // Force re-render
    rerender();
    
    // Toggle function should be the same reference (memoized)
    expect(result.current.toggle).toBe(initialToggle);
  });

  it('should handle multiple rapid toggles correctly', () => {
    const { result } = renderHook(() => useTimeoutPrevention());
    
    // Perform multiple rapid toggles
    act(() => {
      result.current.toggle();
      result.current.toggle();
      result.current.toggle();
    });
    
    // Should end up active (odd number of toggles)
    expect(result.current.isActive).toBe(true);
  });
});