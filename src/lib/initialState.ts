import { hydrate } from './persist';
import { reducer } from './reducer';
import { decode } from './url';
import type { State } from './types';

export type ComposedInitialState = {
  state: State;
  undoSnapshot: State | null;
};

function statesEqual(a: State, b: State): boolean {
  if (a.age !== b.age || a.sex !== b.sex) return false;
  for (const k of Object.keys(a.raw) as Array<keyof typeof a.raw>) {
    if (a.raw[k] !== b.raw[k]) return false;
  }
  return true;
}

export function composeInitialState(): ComposedInitialState {
  const hydrated = hydrate();
  const params = new URLSearchParams(window.location.search);
  const partial = decode(params);
  if (!partial) return { state: hydrated, undoSnapshot: null };

  const merged = reducer(hydrated, { type: 'load-from-url', partial });
  if (statesEqual(merged, hydrated)) {
    return { state: hydrated, undoSnapshot: null };
  }
  return { state: merged, undoSnapshot: hydrated };
}
