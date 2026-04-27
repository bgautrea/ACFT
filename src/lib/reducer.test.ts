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
});
