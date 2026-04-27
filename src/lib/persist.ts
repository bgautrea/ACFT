import { initialState } from './reducer';
import { EVENT_CODES, type State } from './types';

export const STORAGE_KEY = 'acft:v1';
const VERSION = 1;

function isValidState(s: unknown): s is State {
  if (typeof s !== 'object' || s === null) return false;
  const o = s as Record<string, unknown>;
  if (typeof o.age !== 'number') return false;
  if (o.sex !== 'M' && o.sex !== 'F') return false;
  if (typeof o.raw !== 'object' || o.raw === null) return false;
  const raw = o.raw as Record<string, unknown>;
  return EVENT_CODES.every(c => typeof raw[c] === 'string');
}

export function hydrate(): State {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
    if (parsed?.v !== VERSION) return initialState;
    if (!isValidState(parsed.state)) return initialState;
    return parsed.state;
  } catch {
    return initialState;
  }
}

export function save(state: State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, state }));
  } catch {
    // Quota exceeded or storage disabled — silently ignore.
  }
}
