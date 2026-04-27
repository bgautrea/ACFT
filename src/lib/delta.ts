import { parseRaw, thresholdFor } from './scoring';
import { EVENT_CODES, type EventCode, type ScoreResult, type Sex, type State } from './types';

const MINUS = '−';

function mmssToSec(mmss: number): number {
  return Math.floor(mmss / 100) * 60 + (mmss % 100);
}

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function deltaForEvent(
  code: EventCode,
  rawInput: string,
  age: number,
  sex: Sex,
  pass: boolean,
): string | null {
  if (rawInput.trim() === '' || pass) return null;

  const user = parseRaw(code, rawInput);
  if (user === null || user === 0) return null;

  const threshold = thresholdFor(code, age, sex);
  if (threshold === null) return null;

  switch (code) {
    case 'MDL': {
      const delta = threshold - user;
      return delta > 0 ? `+${delta} lb` : null;
    }
    case 'HRP': {
      const delta = threshold - user;
      return delta > 0 ? `+${delta} reps` : null;
    }
    case 'SPT': {
      const userDm = Math.floor(user * 10);
      const deltaDm = threshold - userDm;
      if (deltaDm <= 0) return null;
      const meters = (deltaDm / 10).toFixed(1);
      return `+${meters} m`;
    }
    case 'PLK': {
      const thresholdSec = mmssToSec(threshold);
      const delta = thresholdSec - user;
      return delta > 0 ? `+${formatTime(delta)}` : null;
    }
    case 'SDC':
    case 'TMR': {
      const thresholdSec = mmssToSec(threshold);
      const delta = user - thresholdSec;
      return delta > 0 ? `${MINUS}${formatTime(delta)}` : null;
    }
  }
}

export function deltaAll(
  state: State,
  result: ScoreResult,
): Record<EventCode, string | null> {
  const out = {} as Record<EventCode, string | null>;
  for (const code of EVENT_CODES) {
    out[code] = deltaForEvent(
      code,
      state.raw[code],
      state.age,
      state.sex,
      result.events[code].pass,
    );
  }
  return out;
}
