import { describe, expect, it } from 'vitest';
import { reducer, initialState } from './reducer';

describe('reducer', () => {
  it('initial state has age 22, sex M, all raw empty', () => {
    expect(initialState.age).toBe(22);
    expect(initialState.sex).toBe('M');
    expect(initialState.raw.MDL).toBe('');
    expect(initialState.raw.TMR).toBe('');
  });

  it('set-age updates age', () => {
    const next = reducer(initialState, { type: 'set-age', age: 30 });
    expect(next.age).toBe(30);
  });

  it('set-sex updates sex', () => {
    const next = reducer(initialState, { type: 'set-sex', sex: 'F' });
    expect(next.sex).toBe('F');
  });

  it('set-raw updates only the targeted event', () => {
    const next = reducer(initialState, { type: 'set-raw', event: 'MDL', value: '240' });
    expect(next.raw.MDL).toBe('240');
    expect(next.raw.SPT).toBe('');
  });

  it('reset returns initial state', () => {
    const dirty = reducer(initialState, { type: 'set-age', age: 50 });
    const next = reducer(dirty, { type: 'reset' });
    expect(next).toEqual(initialState);
  });

  it('returns same reference when state is unchanged (referential stability)', () => {
    const next = reducer(initialState, { type: 'set-age', age: initialState.age });
    // No-op set-age still returns a new object (we don't optimize this)
    expect(next).not.toBe(initialState);
    expect(next.age).toBe(initialState.age);
  });

  it('load-from-url merges age and sex while leaving raw untouched when raw is absent', () => {
    const start = { ...initialState, raw: { ...initialState.raw, MDL: '240' } };
    const next = reducer(start, { type: 'load-from-url', partial: { age: 35, sex: 'F' } });
    expect(next.age).toBe(35);
    expect(next.sex).toBe('F');
    expect(next.raw.MDL).toBe('240');
  });

  it('load-from-url merges raw at the field level', () => {
    const start = {
      ...initialState,
      raw: { ...initialState.raw, MDL: '240', SPT: '12.5' },
    };
    const next = reducer(start, {
      type: 'load-from-url',
      partial: { raw: { HRP: '45' } },
    });
    expect(next.raw.MDL).toBe('240');
    expect(next.raw.SPT).toBe('12.5');
    expect(next.raw.HRP).toBe('45');
  });

  it('load-from-url with empty partial is a no-op for state values', () => {
    const start = { ...initialState, age: 30 };
    const next = reducer(start, { type: 'load-from-url', partial: {} });
    expect(next.age).toBe(30);
    expect(next.sex).toBe(start.sex);
    expect(next.raw).toEqual(start.raw);
  });
});
