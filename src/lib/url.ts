import { EVENT_CODES, type EventCode, type RawScores, type Sex, type State } from './types';

export type UrlPayload = {
  age?: number;
  sex?: Sex;
  raw?: Partial<RawScores>;
};

const MAX_RAW_LEN = 8;

export function encode(state: State): string {
  const params = new URLSearchParams();
  params.set('age', String(state.age));
  params.set('sex', state.sex);
  for (const code of EVENT_CODES) {
    const v = state.raw[code];
    if (v.trim() !== '') {
      params.set(code.toLowerCase(), v);
    }
  }
  return '?' + params.toString();
}

export function decode(params: URLSearchParams): UrlPayload | null {
  const out: UrlPayload = {};

  const ageRaw = params.get('age');
  if (ageRaw !== null) {
    const n = parseInt(ageRaw, 10);
    if (Number.isFinite(n)) {
      out.age = Math.min(99, Math.max(17, n));
    }
  }

  const sexRaw = params.get('sex');
  if (sexRaw === 'M' || sexRaw === 'F') {
    out.sex = sexRaw;
  }

  const raw: Partial<RawScores> = {};
  let anyEvent = false;
  for (const code of EVENT_CODES) {
    const v = params.get(code.toLowerCase());
    if (v !== null) {
      raw[code as EventCode] = v.trim().slice(0, MAX_RAW_LEN);
      anyEvent = true;
    }
  }
  if (anyEvent) out.raw = raw;

  if (out.age === undefined && out.sex === undefined && !anyEvent) return null;
  return out;
}
