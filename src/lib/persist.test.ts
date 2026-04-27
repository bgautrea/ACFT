import { beforeEach, describe, expect, it } from 'vitest';
import { hydrate, save, STORAGE_KEY } from './persist';
import { initialState } from './reducer';

describe('persist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrate returns initialState when storage is empty', () => {
    expect(hydrate()).toEqual(initialState);
  });

  it('hydrate returns initialState when storage has wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, '{"garbage":true}');
    expect(hydrate()).toEqual(initialState);
  });

  it('hydrate returns initialState when JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(hydrate()).toEqual(initialState);
  });

  it('save then hydrate round-trips state', () => {
    const state = { ...initialState, age: 33, sex: 'F' as const };
    save(state);
    expect(hydrate()).toEqual(state);
  });

  it('hydrate ignores stored state with mismatched version', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 99, state: { age: 50 } }));
    expect(hydrate()).toEqual(initialState);
  });
});
