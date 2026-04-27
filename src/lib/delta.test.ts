import { describe, expect, it } from 'vitest';
import { deltaForEvent, deltaAll } from './delta';
import type { State, ScoreResult } from './types';

const M22 = { age: 22, sex: 'M' as const };

describe('deltaForEvent (M, 22-26)', () => {
  it('returns null for empty input', () => {
    expect(deltaForEvent('MDL', '', M22.age, M22.sex, false)).toBeNull();
  });

  it('returns null for whitespace input', () => {
    expect(deltaForEvent('MDL', '   ', M22.age, M22.sex, false)).toBeNull();
  });

  it('returns null when pass=true', () => {
    expect(deltaForEvent('MDL', '240', M22.age, M22.sex, true)).toBeNull();
  });

  it('returns null for unparseable input', () => {
    expect(deltaForEvent('MDL', 'abc', M22.age, M22.sex, false)).toBeNull();
  });

  it('MDL: 130 lb (50 pts) → "+10 lb"', () => {
    expect(deltaForEvent('MDL', '130', M22.age, M22.sex, false)).toBe('+10 lb');
  });

  it('SPT: 5.9 m (52 pts) → "+0.4 m"', () => {
    expect(deltaForEvent('SPT', '5.9', M22.age, M22.sex, false)).toBe('+0.4 m');
  });

  it('SPT: 6.2 m (57 pts) → "+0.1 m"', () => {
    expect(deltaForEvent('SPT', '6.2', M22.age, M22.sex, false)).toBe('+0.1 m');
  });

  it('HRP: 2 reps → "+8 reps"', () => {
    expect(deltaForEvent('HRP', '2', M22.age, M22.sex, false)).toBe('+8 reps');
  });

  it('SDC: 2:39 (52 pts) → "−0:08" (uses U+2212)', () => {
    expect(deltaForEvent('SDC', '2:39', M22.age, M22.sex, false)).toBe('−0:08');
  });

  it('PLK: 0:55 → "+0:30"', () => {
    expect(deltaForEvent('PLK', '0:55', M22.age, M22.sex, false)).toBe('+0:30');
  });

  it('TMR: 24:00 → "−2:00"', () => {
    expect(deltaForEvent('TMR', '24:00', M22.age, M22.sex, false)).toBe('−2:00');
  });

  it('zero-pads single-digit seconds in mm:ss', () => {
    expect(deltaForEvent('SDC', '2:34', M22.age, M22.sex, false)).toBe('−0:03');
  });

  it('does not zero-pad minutes', () => {
    // PLK threshold 1:25 (85s); user 0:01 → delta 84s = 1:24 → "+1:24"
    expect(deltaForEvent('PLK', '0:01', M22.age, M22.sex, false)).toBe('+1:24');
  });

  it('SPT formatting always uses 1 decimal place', () => {
    // user 5.0 m (50 dm); threshold 63 dm; delta 13 dm = 1.3 m
    expect(deltaForEvent('SPT', '5.0', M22.age, M22.sex, false)).toBe('+1.3 m');
  });

  it('returns null when input is at or above the floor table max (already passing)', () => {
    // Defensive: above-threshold input produces non-positive magnitude → null
    expect(deltaForEvent('MDL', '350', M22.age, M22.sex, false)).toBeNull();
  });
});

describe('deltaForEvent (F, 22-26)', () => {
  it('MDL: 110 lb → "+10 lb" (F threshold is 120)', () => {
    expect(deltaForEvent('MDL', '110', 22, 'F', false)).toBe('+10 lb');
  });
});

describe('deltaAll', () => {
  it('returns a delta entry for every event code', () => {
    const state: State = {
      age: 22,
      sex: 'M',
      raw: { MDL: '130', SPT: '5.9', HRP: '2', SDC: '2:39', PLK: '0:55', TMR: '24:00' },
    };
    const result: ScoreResult = {
      events: {
        MDL: { points: 50, pass: false },
        SPT: { points: 52, pass: false },
        HRP: { points: 0,  pass: false },
        SDC: { points: 52, pass: false },
        PLK: { points: 0,  pass: false },
        TMR: { points: 0,  pass: false },
      },
      total: 154,
      overallPass: false,
    };
    const out = deltaAll(state, result);
    expect(out.MDL).toBe('+10 lb');
    expect(out.SPT).toBe('+0.4 m');
    expect(out.HRP).toBe('+8 reps');
    expect(out.SDC).toBe('−0:08');
    expect(out.PLK).toBe('+0:30');
    expect(out.TMR).toBe('−2:00');
  });

  it('returns null for events that pass', () => {
    const state: State = {
      age: 22,
      sex: 'M',
      raw: { MDL: '240', SPT: '', HRP: '', SDC: '', PLK: '', TMR: '' },
    };
    const result: ScoreResult = {
      events: {
        MDL: { points: 82, pass: true },
        SPT: { points: 0,  pass: false },
        HRP: { points: 0,  pass: false },
        SDC: { points: 0,  pass: false },
        PLK: { points: 0,  pass: false },
        TMR: { points: 0,  pass: false },
      },
      total: 82,
      overallPass: false,
    };
    const out = deltaAll(state, result);
    expect(out.MDL).toBeNull();
    expect(out.SPT).toBeNull();
    expect(out.HRP).toBeNull();
  });
});
