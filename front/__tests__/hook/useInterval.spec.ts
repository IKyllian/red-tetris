import { act, renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, it, vi, expect } from "vitest";
import { useInterval } from 'front/hooks/useInterval';

describe('useInterval', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    })

    afterAll(() => {
        vi.useRealTimers();    
    })

    it('should call the callback at specified intervals', () => {
        const callback = vi.fn();
        const delay = 1000;
    
        renderHook(() => useInterval(callback, delay));
    
        // Fast-forward time
        act(() => {
          vi.advanceTimersByTime(delay * 3); // fast-forward by 3 intervals
        });
    
        // Check if the callback has been called 3 times
        expect(callback).toHaveBeenCalledTimes(3);
      });
    
      it('should clear the interval on unmount', () => {
        const callback = vi.fn();
        const delay = 1000;
    
        const { unmount } = renderHook(() => useInterval(callback, delay));
    
        // Fast-forward time
        act(() => {
          vi.advanceTimersByTime(delay);
        });
    
        // Check if the callback has been called once
        expect(callback).toHaveBeenCalledTimes(1);
    
        // Unmount the hook
        unmount();
    
        // Fast-forward time
        act(() => {
          vi.advanceTimersByTime(delay * 3); // fast-forward by 3 intervals
        });
    
        // Check if the callback was not called again after unmounting
        expect(callback).toHaveBeenCalledTimes(1);
      });

})