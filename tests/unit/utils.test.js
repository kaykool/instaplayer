import { describe, it, expect, vi } from 'vitest';
import { formatTime, debounce } from '../../src/utils.js';

describe('src/utils.js', () => {
  describe('formatTime', () => {
    it('formats seconds to M:SS correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(35)).toBe('0:35');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(600)).toBe('10:00');
    });

    it('handles invalid or negative inputs gracefully', () => {
      expect(formatTime(-10)).toBe('0:00');
      expect(formatTime(NaN)).toBe('0:00');
      expect(formatTime(Infinity)).toBe('0:00');
      expect(formatTime(null)).toBe('0:00');
    });
  });

  describe('debounce', () => {
    it('debounces function execution', async () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      const debouncedFn = debounce(callback, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
