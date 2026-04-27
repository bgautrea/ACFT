// Vitest global test setup
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// @testing-library/react's built-in asyncWrapper only advances Jest fake timers.
// This override also handles Vitest fake timers so that userEvent.setup() works
// correctly when vi.useFakeTimers() is active in a test. We advance by 0ms to
// drain only immediately-queued 0-delay timers (e.g. the ones userEvent itself
// schedules between events) without running long-lived component timers like a
// 1500ms "Copied" flash.
configure({
  asyncWrapper: async (cb) => {
    const result = await cb();
    if (vi.isFakeTimers()) {
      await vi.advanceTimersByTimeAsync(0);
    }
    return result;
  },
});
