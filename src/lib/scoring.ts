import standards from '../data/standards.json';
import { parseTime } from './time';
import {
  AGE_BUCKETS, EVENT_CODES,
  type AgeBucket, type EventCode, type EventResult, type ScoreResult,
  type Sex, type State,
} from './types';

const PASS_THRESHOLD = 60;
const TOTAL_PASS = 360;

/** Convert age in years to a bucket key. Clamps below 22 to 17-21 and 62+ for ≥62. */
export function bucketAge(age: number): AgeBucket {
  if (!Number.isFinite(age) || age < 22) return '17-21';
  if (age >= 62) return '62+';
  for (const b of AGE_BUCKETS) {
    if (b === '17-21' || b === '62+') continue;
    const [lo, hi] = b.split('-').map(Number);
    if (age >= lo && age <= hi) return b;
  }
  return '17-21';
}

type Direction = 'floor' | 'ceiling';

type EventTable = Record<string, Record<AgeBucket, number>>;

const sortedKeysCache = new Map<EventTable, number[]>();

function sortedNumericKeys(table: EventTable): number[] {
  let keys = sortedKeysCache.get(table);
  if (!keys) {
    keys = Object.keys(table).map(Number).sort((a, b) => a - b);
    sortedKeysCache.set(table, keys);
  }
  return keys;
}

function pad4(n: number): string {
  return n.toString().padStart(4, '0');
}

/**
 * Look up the score for `value` in `table`.
 * - 'floor':   pick the largest key ≤ value (more weight = better).
 *   Below the smallest key returns 0; at-or-above the largest returns the largest's score.
 * - 'ceiling': pick the smallest key ≥ value (less time = better).
 *   Above the largest key returns 0; at-or-below the smallest returns the smallest's score.
 */
function lookup(
  table: EventTable,
  value: number,
  age: AgeBucket,
  direction: Direction,
  keyFormat: 'plain' | 'pad4' = 'plain',
): number {
  const keys = sortedNumericKeys(table);
  if (keys.length === 0) return 0;

  const min = keys[0];
  const max = keys[keys.length - 1];

  let chosenKey: number;
  if (direction === 'floor') {
    if (value < min) return 0;
    if (value >= max) chosenKey = max;
    else {
      let lo = 0, hi = keys.length - 1, best = min;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (keys[mid] <= value) { best = keys[mid]; lo = mid + 1; }
        else hi = mid - 1;
      }
      chosenKey = best;
    }
  } else {
    if (value > max) return 0;
    if (value <= min) chosenKey = min;
    else {
      let lo = 0, hi = keys.length - 1, best = max;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (keys[mid] >= value) { best = keys[mid]; hi = mid - 1; }
        else lo = mid + 1;
      }
      chosenKey = best;
    }
  }

  const k = keyFormat === 'pad4' ? pad4(chosenKey) : String(chosenKey);
  const row = table[k];
  return row?.[age] ?? 0;
}

function passOf(points: number): boolean {
  return points >= PASS_THRESHOLD;
}

function tableFor(sex: Sex, event: EventCode): EventTable {
  return (standards as unknown as Record<Sex, Record<EventCode, EventTable>>)[sex][event];
}

export function scoreMDL(weightLb: number, age: number, sex: Sex): EventResult {
  const points = lookup(tableFor(sex, 'MDL'), weightLb, bucketAge(age), 'floor');
  return { points, pass: passOf(points) };
}

export function scoreSPT(meters: number, age: number, sex: Sex): EventResult {
  const decimeters = Math.floor(meters * 10);
  const points = lookup(tableFor(sex, 'SPT'), decimeters, bucketAge(age), 'floor');
  return { points, pass: passOf(points) };
}

export function scoreHRP(reps: number, age: number, sex: Sex): EventResult {
  const points = lookup(tableFor(sex, 'HRP'), reps, bucketAge(age), 'floor');
  return { points, pass: passOf(points) };
}

export function scoreSDC(seconds: number, age: number, sex: Sex): EventResult {
  const mmss = Math.floor(seconds / 60) * 100 + (seconds % 60);
  const points = lookup(tableFor(sex, 'SDC'), mmss, bucketAge(age), 'ceiling', 'pad4');
  return { points, pass: passOf(points) };
}

export function scorePLK(seconds: number, age: number, sex: Sex): EventResult {
  const mmss = Math.floor(seconds / 60) * 100 + (seconds % 60);
  const points = lookup(tableFor(sex, 'PLK'), mmss, bucketAge(age), 'floor', 'pad4');
  return { points, pass: passOf(points) };
}

export function scoreTMR(seconds: number, age: number, sex: Sex): EventResult {
  const mmss = Math.floor(seconds / 60) * 100 + (seconds % 60);
  const points = lookup(tableFor(sex, 'TMR'), mmss, bucketAge(age), 'ceiling', 'pad4');
  return { points, pass: passOf(points) };
}

function parseRaw(event: EventCode, raw: string): number | null {
  if (raw.trim() === '') return 0;
  if (event === 'SPT') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (event === 'MDL' || event === 'HRP') {
    const n = Number(raw);
    return Number.isFinite(n) ? Math.floor(n) : null;
  }
  return parseTime(raw);
}

export function scoreAll(state: State): ScoreResult {
  const events = {} as Record<EventCode, EventResult>;
  let total = 0;
  for (const code of EVENT_CODES) {
    const v = parseRaw(code, state.raw[code]);
    if (v === null || v === 0) {
      events[code] = { points: 0, pass: false };
      continue;
    }
    let result: EventResult;
    switch (code) {
      case 'MDL': result = scoreMDL(v, state.age, state.sex); break;
      case 'SPT': result = scoreSPT(v, state.age, state.sex); break;
      case 'HRP': result = scoreHRP(v, state.age, state.sex); break;
      case 'SDC': result = scoreSDC(v, state.age, state.sex); break;
      case 'PLK': result = scorePLK(v, state.age, state.sex); break;
      case 'TMR': result = scoreTMR(v, state.age, state.sex); break;
    }
    events[code] = result;
    total += result.points;
  }
  const overallPass =
    total >= TOTAL_PASS && EVENT_CODES.every(c => events[c].pass);
  return { events, total, overallPass };
}
