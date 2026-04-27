import standardsData from '../data/standards.json';
import type { UrlPayload } from './url';

export type Sex = 'M' | 'F';

export type EventCode = 'MDL' | 'SPT' | 'HRP' | 'SDC' | 'PLK' | 'TMR';

export const EVENT_CODES: readonly EventCode[] = ['MDL', 'SPT', 'HRP', 'SDC', 'PLK', 'TMR'];

export const AGE_BUCKETS = [
  '17-21', '22-26', '27-31', '32-36', '37-41',
  '42-46', '47-51', '52-56', '57-61', '62+',
] as const;

export type AgeBucket = typeof AGE_BUCKETS[number];

export type RawScores = Record<EventCode, string>;

export type State = {
  age: number;
  sex: Sex;
  raw: RawScores;
};

export type Action =
  | { type: 'set-age'; age: number }
  | { type: 'set-sex'; sex: Sex }
  | { type: 'set-raw'; event: EventCode; value: string }
  | { type: 'reset' }
  | { type: 'load-from-url'; partial: UrlPayload };

export type EventResult = { points: number; pass: boolean };

export type ScoreResult = {
  events: Record<EventCode, EventResult>;
  total: number;
  overallPass: boolean;
};

export type Standards = typeof standardsData;
