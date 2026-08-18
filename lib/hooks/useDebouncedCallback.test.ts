import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls the callback once, after the delay, with the latest args', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 250));

    act(() => {
      result.current('a');
      result.current('ab');
      result.current('abc');
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(250));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('abc');
  });
});
