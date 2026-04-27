import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { composeInitialState } from './initialState';
import { initialState } from './reducer';
import { STORAGE_KEY } from './persist';

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search },
    writable: true,
  });
}

describe('composeInitialState', () => {
  beforeEach(() => {
    localStorage.clear();
    setSearch('');
  });

  afterEach(() => {
    setSearch('');
  });

  it('returns hydrated state with no snapshot when URL is empty', () => {
    const out = composeInitialState();
    expect(out.state).toEqual(initialState);
    expect(out.undoSnapshot).toBeNull();
  });

  it('returns merged state and snapshot when URL changes localStorage values', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: 1, state: { age: 22, sex: 'M', raw: initialState.raw } }),
    );
    setSearch('?age=35&sex=F');
    const out = composeInitialState();
    expect(out.state.age).toBe(35);
    expect(out.state.sex).toBe('F');
    expect(out.undoSnapshot).not.toBeNull();
    expect(out.undoSnapshot?.age).toBe(22);
    expect(out.undoSnapshot?.sex).toBe('M');
  });

  it('returns no snapshot when URL matches hydrated state exactly', () => {
    setSearch('?age=22&sex=M');
    const out = composeInitialState();
    expect(out.undoSnapshot).toBeNull();
    expect(out.state).toEqual(initialState);
  });

  it('preserves localStorage raw fields not present in URL', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: 1,
        state: {
          age: 22,
          sex: 'M',
          raw: { ...initialState.raw, MDL: '240', SPT: '12.5' },
        },
      }),
    );
    setSearch('?hrp=45');
    const out = composeInitialState();
    expect(out.state.raw.MDL).toBe('240');
    expect(out.state.raw.SPT).toBe('12.5');
    expect(out.state.raw.HRP).toBe('45');
    expect(out.undoSnapshot?.raw.HRP).toBe('');
  });

  it('returns no snapshot when URL has no recognized fields', () => {
    setSearch('?foo=bar');
    const out = composeInitialState();
    expect(out.undoSnapshot).toBeNull();
    expect(out.state).toEqual(initialState);
  });
});
