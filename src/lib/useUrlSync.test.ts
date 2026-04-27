import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUrlSync } from './useUrlSync';
import { initialState } from './reducer';

describe('useUrlSync', () => {
  let replaceSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    replaceSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    replaceSpy.mockRestore();
  });

  it('does not call replaceState during initial render', () => {
    renderHook(() => useUrlSync(initialState));
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('calls replaceState 200ms after a state change with the encoded URL', () => {
    const { rerender } = renderHook(({ s }) => useUrlSync(s), {
      initialProps: { s: initialState },
    });
    expect(replaceSpy).not.toHaveBeenCalled();

    rerender({ s: { ...initialState, age: 30 } });
    expect(replaceSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(replaceSpy).toHaveBeenCalledTimes(1);
    const url = replaceSpy.mock.calls[0][2] as string;
    expect(url).toContain('age=30');
  });

  it('coalesces multiple rapid state changes into a single replaceState call', () => {
    const { rerender } = renderHook(({ s }) => useUrlSync(s), {
      initialProps: { s: initialState },
    });
    rerender({ s: { ...initialState, age: 23 } });
    vi.advanceTimersByTime(50);
    rerender({ s: { ...initialState, age: 24 } });
    vi.advanceTimersByTime(50);
    rerender({ s: { ...initialState, age: 25 } });
    vi.advanceTimersByTime(200);
    expect(replaceSpy).toHaveBeenCalledTimes(1);
    const url = replaceSpy.mock.calls[0][2] as string;
    expect(url).toContain('age=25');
  });

  it('cleans up pending timer on unmount', () => {
    const { rerender, unmount } = renderHook(({ s }) => useUrlSync(s), {
      initialProps: { s: initialState },
    });
    rerender({ s: { ...initialState, age: 30 } });
    unmount();
    vi.advanceTimersByTime(500);
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('swallows errors thrown by replaceState', () => {
    replaceSpy.mockImplementation(() => {
      throw new Error('sandboxed');
    });
    const { rerender } = renderHook(({ s }) => useUrlSync(s), {
      initialProps: { s: initialState },
    });
    rerender({ s: { ...initialState, age: 30 } });
    expect(() => vi.advanceTimersByTime(200)).not.toThrow();
  });
});
