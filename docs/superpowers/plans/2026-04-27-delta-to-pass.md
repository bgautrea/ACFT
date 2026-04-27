# Delta-to-Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a small annotation in a new 4th column of each `EventRow` showing the smallest input change that would bring a failing event to a passing score per `docs/superpowers/specs/2026-04-27-delta-to-pass-design.md`.

**Architecture:** One pure compute module (`src/lib/delta.ts`) using two helpers added to `scoring.ts` (`parseRaw` made public, new `thresholdFor`). EventRow grid expands from 3 columns to 4. EventForm and App thread the per-event delta strings down. No reducer changes, no persistence changes, no `standards.json` changes.

**Tech Stack:** Vite 5, React 19, TypeScript strict, Tailwind v4, Vitest + React Testing Library + jsdom. No new runtime deps. Tests are co-located with source files.

**Working environment:** A dedicated git branch is recommended (`git checkout -b delta-to-pass-2026` before starting). All tasks should pass `npm test` and `npm run typecheck` at their commit point.

**Reference fixtures (M, age 22-26, derived from `src/data/standards.json`):**
- MDL threshold = 140 lb (60 pts); 130 lb = 50 pts
- SPT threshold = 6.3 m (= 63 dm); 5.9 m = 52 pts (= 59 dm rounded down)
- HRP threshold = 10 reps (60 pts); 2 reps fails
- SDC threshold = 2:31 (= 151s, mmss = 231); 2:39 (= 159s) = 52 pts
- PLK threshold = 1:25 (= 85s, mmss = 125); 0:55 (= 55s) fails
- TMR threshold = 22:00 (= 1320s, mmss = 2200); 24:00 (= 1440s) fails

These are the values the tests below assume.

---

## File structure

**New files:**
- `src/lib/delta.ts` — `deltaForEvent(...) → string | null`, `deltaAll(state, result) → Record<EventCode, string | null>`
- `src/lib/delta.test.ts`

**Modified files:**
- `src/lib/scoring.ts` — export `parseRaw` (currently private); add `thresholdFor(code, age, sex): number | null`
- `src/lib/scoring.test.ts` — extend with `thresholdFor` cases
- `src/components/EventRow.tsx` — accept `delta?: string | null`; expand grid from 3 to 4 columns; render the delta cell
- `src/components/EventRow.test.tsx` — extend with delta-cell tests
- `src/components/EventForm.tsx` — accept `deltas: Record<EventCode, string | null>`; thread per-event delta into rows
- `src/App.tsx` — `useMemo(deltaAll(state, result))`; pass to `EventForm`
- `tests/integration.test.tsx` — new test: type a failing MDL → see delta → bring to passing → delta clears

**Deleted files:** none.

---

## Setup

### Task 0: Create feature branch

- [ ] **Step 1: Cut a feature branch from `main`**

```bash
git checkout main
git pull --ff-only
git checkout -b delta-to-pass-2026
```

Expected: working tree clean, branch `delta-to-pass-2026` checked out.

- [ ] **Step 2: Verify baseline tests pass**

```bash
npm test
npm run typecheck
```

Expected: all tests green, no TypeScript errors. If anything fails, stop and report.

---

### Task 1: Extend `scoring.ts` — export `parseRaw`, add `thresholdFor`

**Files:**
- Modify: `src/lib/scoring.ts`
- Modify: `src/lib/scoring.test.ts`

- [ ] **Step 1: Add the failing `thresholdFor` tests**

Append to `src/lib/scoring.test.ts` (at the bottom of the file, outside any existing `describe`):

```ts
import { thresholdFor, parseRaw } from './scoring';

describe('thresholdFor', () => {
  it('M/MDL 22-26 → 140 (smallest floor key with ≥60 pts)', () => {
    expect(thresholdFor('MDL', 22, 'M')).toBe(140);
  });
  it('M/SPT 22-26 → 63 (smallest floor key with ≥60 pts, in decimeters)', () => {
    expect(thresholdFor('SPT', 22, 'M')).toBe(63);
  });
  it('M/HRP 22-26 → 10', () => {
    expect(thresholdFor('HRP', 22, 'M')).toBe(10);
  });
  it('M/SDC 22-26 → 231 (largest ceiling key with ≥60 pts, in mmss)', () => {
    expect(thresholdFor('SDC', 22, 'M')).toBe(231);
  });
  it('M/PLK 22-26 → 125 (smallest floor key with ≥60 pts, in mmss)', () => {
    expect(thresholdFor('PLK', 22, 'M')).toBe(125);
  });
  it('M/TMR 22-26 → 2200 (largest ceiling key with ≥60 pts, in mmss)', () => {
    expect(thresholdFor('TMR', 22, 'M')).toBe(2200);
  });
  it('F/MDL 22-26 → 120 (sex-sensitive)', () => {
    expect(thresholdFor('MDL', 22, 'F')).toBe(120);
  });
  it('cached repeat call returns same value', () => {
    expect(thresholdFor('MDL', 22, 'M')).toBe(140);
    expect(thresholdFor('MDL', 22, 'M')).toBe(140);
  });
});

describe('parseRaw (public)', () => {
  it('returns 0 for empty string', () => {
    expect(parseRaw('MDL', '')).toBe(0);
  });
  it('returns 0 for whitespace', () => {
    expect(parseRaw('MDL', '   ')).toBe(0);
  });
  it('returns parsed number for MDL', () => {
    expect(parseRaw('MDL', '240')).toBe(240);
  });
  it('floors fractional reps for HRP', () => {
    expect(parseRaw('HRP', '38.7')).toBe(38);
  });
  it('returns the meters value for SPT', () => {
    expect(parseRaw('SPT', '9.2')).toBe(9.2);
  });
  it('parses time for TMR (returns seconds)', () => {
    expect(parseRaw('TMR', '15:00')).toBe(900);
  });
  it('returns null for unparseable input', () => {
    expect(parseRaw('MDL', 'abc')).toBeNull();
  });
});
```

- [ ] **Step 2: Run scoring tests — new ones should fail**

```bash
npm test -- --run src/lib/scoring.test.ts
```

Expected: 14 new tests fail (`thresholdFor` and public `parseRaw` not exported).

- [ ] **Step 3: Add `thresholdFor` and export `parseRaw` in `src/lib/scoring.ts`**

Make two changes to the file. First, change the existing `parseRaw` function from `function` (private) to `export function`:

```ts
export function parseRaw(event: EventCode, raw: string): number | null {
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
```

Second, add the following new code BEFORE the `scoreAll` function (so it can use the existing `bucketAge`, `tableFor`, `sortedNumericKeys`, and `pad4` helpers in the same file):

```ts
const thresholdCache = new Map<string, number | null>();

const PAD4_EVENTS: ReadonlySet<EventCode> = new Set(['SDC', 'PLK', 'TMR']);
const CEILING_EVENTS: ReadonlySet<EventCode> = new Set(['SDC', 'TMR']);

/**
 * Returns the smallest internal-units key whose score for this age-bucket and sex
 * is ≥ 60 (the per-event pass threshold). For ceiling events (SDC, TMR), returns
 * the largest such key — the user's actual time must be ≤ that key. Returns null
 * if no key in the table meets the threshold (defensive; should not occur for the
 * shipped standards.json).
 */
export function thresholdFor(code: EventCode, age: number, sex: Sex): number | null {
  const bucket = bucketAge(age);
  const cacheKey = `${sex}.${code}.${bucket}`;
  const cached = thresholdCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const table = tableFor(sex, code);
  const keys = sortedNumericKeys(table);
  const isPad4 = PAD4_EVENTS.has(code);
  const isCeiling = CEILING_EVENTS.has(code);

  let result: number | null = null;
  if (isCeiling) {
    for (let i = keys.length - 1; i >= 0; i--) {
      const k = keys[i];
      const tableKey = isPad4 ? pad4(k) : String(k);
      if ((table[tableKey]?.[bucket] ?? 0) >= 60) {
        result = k;
        break;
      }
    }
  } else {
    for (const k of keys) {
      const tableKey = isPad4 ? pad4(k) : String(k);
      if ((table[tableKey]?.[bucket] ?? 0) >= 60) {
        result = k;
        break;
      }
    }
  }

  thresholdCache.set(cacheKey, result);
  return result;
}
```

- [ ] **Step 4: Run scoring tests — should pass**

```bash
npm test -- --run src/lib/scoring.test.ts
```

Expected: all scoring tests pass (existing 22+ + 15 new = at least 37).

- [ ] **Step 5: Run full suite + typecheck**

```bash
npm test
npm run typecheck
```

Expected: green. The change to make `parseRaw` public is non-breaking; existing callers in `scoreAll` continue to work.

- [ ] **Step 6: Commit**

```bash
git add src/lib/scoring.ts src/lib/scoring.test.ts
git commit -m "feat(scoring): export parseRaw and add thresholdFor for delta lookups"
```

---

### Task 2: Implement `delta.ts`

**Files:**
- Create: `src/lib/delta.ts`
- Test: `src/lib/delta.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/delta.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { deltaForEvent, deltaAll } from './delta';
import type { State, ScoreResult } from './types';

const M22 = { age: 22, sex: 'M' as const };

describe('deltaForEvent (M, 22-26)', () => {
  it('returns null for empty input', () => {
    expect(deltaForEvent('MDL', '', M22.age, M22.sex, false)).toBeNull();
  });

  it('returns null for whitespace input', () => {
    expect(deltaForEvent('MDL', '   ', M22.age, M22.sex, false)).toBeNull();
  });

  it('returns null when pass=true', () => {
    expect(deltaForEvent('MDL', '240', M22.age, M22.sex, true)).toBeNull();
  });

  it('returns null for unparseable input', () => {
    expect(deltaForEvent('MDL', 'abc', M22.age, M22.sex, false)).toBeNull();
  });

  it('MDL: 130 lb (50 pts) → "+10 lb"', () => {
    expect(deltaForEvent('MDL', '130', M22.age, M22.sex, false)).toBe('+10 lb');
  });

  it('SPT: 5.9 m (52 pts) → "+0.4 m"', () => {
    expect(deltaForEvent('SPT', '5.9', M22.age, M22.sex, false)).toBe('+0.4 m');
  });

  it('SPT: 6.2 m (57 pts) → "+0.1 m"', () => {
    expect(deltaForEvent('SPT', '6.2', M22.age, M22.sex, false)).toBe('+0.1 m');
  });

  it('HRP: 2 reps → "+8 reps"', () => {
    expect(deltaForEvent('HRP', '2', M22.age, M22.sex, false)).toBe('+8 reps');
  });

  it('SDC: 2:39 (52 pts) → "−0:08" (uses U+2212)', () => {
    expect(deltaForEvent('SDC', '2:39', M22.age, M22.sex, false)).toBe('−0:08');
  });

  it('PLK: 0:55 → "+0:30"', () => {
    expect(deltaForEvent('PLK', '0:55', M22.age, M22.sex, false)).toBe('+0:30');
  });

  it('TMR: 24:00 → "−2:00"', () => {
    expect(deltaForEvent('TMR', '24:00', M22.age, M22.sex, false)).toBe('−2:00');
  });

  it('zero-pads single-digit seconds in mm:ss', () => {
    // SDC threshold 2:31 (151s); user 2:34 (154s) → delta 3s → "−0:03"
    expect(deltaForEvent('SDC', '2:34', M22.age, M22.sex, false)).toBe('−0:03');
  });

  it('does not zero-pad minutes', () => {
    // PLK threshold 1:25 (85s); user 0:00 → delta 85s = 1:25 → "+1:25"
    expect(deltaForEvent('PLK', '0:01', M22.age, M22.sex, false)).toBe('+1:24');
  });

  it('SPT formatting always uses 1 decimal place', () => {
    // user 5.0 m (50 dm); threshold 63 dm; delta 13 dm = 1.3 m
    expect(deltaForEvent('SPT', '5.0', M22.age, M22.sex, false)).toBe('+1.3 m');
  });

  it('returns null when input is at or above the floor table max (already passing)', () => {
    // Defensive: even if pass=false were passed wrongly, an above-threshold input
    // produces a non-positive magnitude, which should yield null.
    expect(deltaForEvent('MDL', '350', M22.age, M22.sex, false)).toBeNull();
  });
});

describe('deltaForEvent (F, 22-26)', () => {
  it('MDL: 110 lb → "+10 lb" (F threshold is 120)', () => {
    expect(deltaForEvent('MDL', '110', 22, 'F', false)).toBe('+10 lb');
  });
});

describe('deltaAll', () => {
  it('returns a delta entry for every event code', () => {
    const state: State = {
      age: 22,
      sex: 'M',
      raw: { MDL: '130', SPT: '5.9', HRP: '2', SDC: '2:39', PLK: '0:55', TMR: '24:00' },
    };
    const result: ScoreResult = {
      events: {
        MDL: { points: 50, pass: false },
        SPT: { points: 52, pass: false },
        HRP: { points: 0,  pass: false },
        SDC: { points: 52, pass: false },
        PLK: { points: 0,  pass: false },
        TMR: { points: 0,  pass: false },
      },
      total: 154,
      overallPass: false,
    };
    const out = deltaAll(state, result);
    expect(out.MDL).toBe('+10 lb');
    expect(out.SPT).toBe('+0.4 m');
    expect(out.HRP).toBe('+8 reps');
    expect(out.SDC).toBe('−0:08');
    expect(out.PLK).toBe('+0:30');
    expect(out.TMR).toBe('−2:00');
  });

  it('returns null for events that pass', () => {
    const state: State = {
      age: 22,
      sex: 'M',
      raw: { MDL: '240', SPT: '', HRP: '', SDC: '', PLK: '', TMR: '' },
    };
    const result: ScoreResult = {
      events: {
        MDL: { points: 82, pass: true },
        SPT: { points: 0,  pass: false },
        HRP: { points: 0,  pass: false },
        SDC: { points: 0,  pass: false },
        PLK: { points: 0,  pass: false },
        TMR: { points: 0,  pass: false },
      },
      total: 82,
      overallPass: false,
    };
    const out = deltaAll(state, result);
    expect(out.MDL).toBeNull();
    expect(out.SPT).toBeNull(); // empty input
    expect(out.HRP).toBeNull(); // empty input
  });
});
```

- [ ] **Step 2: Run — should fail (module missing)**

```bash
npm test -- --run src/lib/delta.test.ts
```

Expected: FAIL — `Cannot find module './delta'`.

- [ ] **Step 3: Implement `src/lib/delta.ts`**

Create the file with:

```ts
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
```

- [ ] **Step 4: Run — should pass**

```bash
npm test -- --run src/lib/delta.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/delta.ts src/lib/delta.test.ts
git commit -m "feat(delta): add deltaForEvent and deltaAll for delta-to-pass annotations"
```

---

### Task 3: EventRow — accept `delta` prop, expand to 4-col grid

**Files:**
- Modify: `src/components/EventRow.tsx`
- Modify: `src/components/EventRow.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to `src/components/EventRow.test.tsx` inside the existing `describe('EventRow', ...)` block, before the closing `});`:

```tsx
  it('renders the delta string in the 4th column when provided', () => {
    render(
      <EventRow
        code="MDL"
        label="MDL"
        placeholder="240 lb"
        value="130"
        points={50}
        pass={false}
        delta="+10 lb"
        dispatch={() => {}}
      />,
    );
    expect(screen.getByTestId('acft-delta-MDL')).toHaveTextContent('+10 lb');
  });

  it('does not render the delta cell when delta is null', () => {
    render(
      <EventRow
        code="MDL"
        label="MDL"
        placeholder="240 lb"
        value=""
        points={0}
        pass={false}
        delta={null}
        dispatch={() => {}}
      />,
    );
    expect(screen.queryByTestId('acft-delta-MDL')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run — should fail (prop not accepted)**

```bash
npm test -- --run src/components/EventRow.test.tsx
```

Expected: TypeScript or runtime failure on the new `delta` prop.

- [ ] **Step 3: Update `src/components/EventRow.tsx`**

Replace the file contents with the following. Note that `delta` is declared OPTIONAL (`?:`) so existing callers that haven't been updated yet (EventForm) continue to typecheck.

```tsx
import type { Action, EventCode } from '../lib/types';

type Props = {
  code: EventCode;
  label: string;
  placeholder: string;
  value: string;
  points: number;
  pass: boolean;
  delta?: string | null;
  dispatch: (action: Action) => void;
};

export default function EventRow({
  code,
  label,
  placeholder,
  value,
  points,
  pass,
  delta,
  dispatch,
}: Props) {
  const id = `acft-${code.toLowerCase()}`;
  const hasValue = value.trim() !== '';
  const pointsClass = !hasValue
    ? 'text-ink-lo'
    : pass
      ? 'text-pass'
      : 'text-fail';
  const pointsDisplay = hasValue ? String(points) : '';

  return (
    <div className="grid grid-cols-[3.5rem_1fr_3rem_4.5rem] items-center gap-3 py-3 border-b border-paper-2 last:border-b-0">
      <label
        htmlFor={id}
        className="text-[11px] tracking-[0.18em] uppercase text-ink-md font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          dispatch({ type: 'set-raw', event: code, value: e.target.value })
        }
        className="num bg-transparent border-0 border-b border-paper-2 px-1 py-1 text-ink placeholder:text-ink-lo focus:border-accent focus:outline-none w-full"
      />
      <span
        data-testid={`acft-points-${code}`}
        className={`num text-right text-base transition-colors duration-150 ${pointsClass}`}
      >
        {pointsDisplay}
      </span>
      {delta ? (
        <span
          data-testid={`acft-delta-${code}`}
          className="num text-right text-[10px] tracking-[0.1em] uppercase text-ink-md transition-colors duration-150"
        >
          {delta}
        </span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run EventRow tests — should pass**

```bash
npm test -- --run src/components/EventRow.test.tsx
```

Expected: all tests pass (existing 5 + 2 new). Because `delta` is optional, the existing test renders that don't pass `delta` continue to typecheck and run unchanged.

- [ ] **Step 5: Run full suite + typecheck**

```bash
npm test
npm run typecheck
```

Expected: green. EventForm has not been updated yet, but because `delta?` is optional, EventForm typechecks unchanged. The visible app behavior is also unchanged at this commit point — EventRow renders with no delta cells until Task 4 wires the data through.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventRow.tsx src/components/EventRow.test.tsx
git commit -m "feat(event-row): accept optional delta prop and render in 4th column"
```

---

### Task 4: Wire EventForm + App, add integration test

**Files:**
- Modify: `src/components/EventForm.tsx`
- Modify: `src/App.tsx`
- Modify: `tests/integration.test.tsx`

- [ ] **Step 1: Add the failing integration test**

Append to `tests/integration.test.tsx` inside the existing `describe('App integration', ...)` block, before the closing `});`:

```tsx
  it('shows a delta on a failing event and clears it once passing', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default state is age 22, sex M. MDL threshold is 140 lb.
    const mdl = screen.getByLabelText(/^MDL$/);

    // Type a failing value (130 lb → 50 pts)
    await user.type(mdl, '130');
    expect(screen.getByTestId('acft-delta-MDL')).toHaveTextContent('+10 lb');

    // Bring it to passing (240 lb → 82 pts)
    await user.clear(mdl);
    await user.type(mdl, '240');
    expect(screen.queryByTestId('acft-delta-MDL')).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run — should fail (delta not wired)**

```bash
npm test -- --run tests/integration.test.tsx
```

Expected: the new test fails — `acft-delta-MDL` is not in the document because EventForm hasn't been wired.

- [ ] **Step 3: Update `src/components/EventForm.tsx`**

Replace the file contents with:

```tsx
import EventRow from './EventRow';
import {
  EVENT_CODES,
  type Action,
  type EventCode,
  type RawScores,
  type ScoreResult,
} from '../lib/types';

const LABELS: Record<EventCode, string> = {
  MDL: 'MDL',
  SPT: 'SPT',
  HRP: 'HRP',
  SDC: 'SDC',
  PLK: 'PLK',
  TMR: '2MR',
};

const PLACEHOLDERS: Record<EventCode, string> = {
  MDL: '240 lb',
  SPT: '9.2 m',
  HRP: '38 reps',
  SDC: '2:14',
  PLK: '2:38',
  TMR: '14:42',
};

type Props = {
  raw: RawScores;
  result: ScoreResult;
  deltas: Record<EventCode, string | null>;
  dispatch: (action: Action) => void;
};

export default function EventForm({ raw, result, deltas, dispatch }: Props) {
  return (
    <div>
      {EVENT_CODES.map((code) => (
        <EventRow
          key={code}
          code={code}
          label={LABELS[code]}
          placeholder={PLACEHOLDERS[code]}
          value={raw[code]}
          points={result.events[code].points}
          pass={result.events[code].pass}
          delta={deltas[code]}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Update `src/App.tsx`**

Replace the file contents with:

```tsx
import { useEffect, useMemo, useReducer, useState } from 'react';
import Wordmark from './components/Wordmark';
import TotalStrip from './components/TotalStrip';
import IdentityRow from './components/IdentityRow';
import EventForm from './components/EventForm';
import Footer from './components/Footer';
import ShareButton from './components/ShareButton';
import RestoreBanner from './components/RestoreBanner';
import { reducer } from './lib/reducer';
import { save } from './lib/persist';
import { scoreAll } from './lib/scoring';
import { deltaAll } from './lib/delta';
import { EVENT_CODES, type State } from './lib/types';
import { composeInitialState } from './lib/initialState';
import { useUrlSync } from './lib/useUrlSync';

export default function App() {
  const [initial] = useState(composeInitialState);
  const [reducerState, dispatch] = useReducer(reducer, initial.state);
  const [snapshot, setSnapshot] = useState<State | null>(initial.undoSnapshot);

  useEffect(() => {
    const handle = setTimeout(() => save(reducerState), 200);
    return () => clearTimeout(handle);
  }, [reducerState]);

  useUrlSync(reducerState);

  const result = useMemo(() => scoreAll(reducerState), [reducerState]);

  const deltas = useMemo(() => deltaAll(reducerState, result), [reducerState, result]);

  const hasInput = useMemo(
    () => EVENT_CODES.some((c) => reducerState.raw[c].trim() !== ''),
    [reducerState.raw],
  );

  const isComplete = useMemo(
    () => EVENT_CODES.every((c) => reducerState.raw[c].trim() !== ''),
    [reducerState.raw],
  );

  function handleRestore(snap: State) {
    dispatch({
      type: 'load-from-url',
      partial: { age: snap.age, sex: snap.sex, raw: snap.raw },
    });
    setSnapshot(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-[720px] px-4">
        <Wordmark right={<ShareButton />} />
      </div>
      {snapshot ? (
        <RestoreBanner
          snapshot={snapshot}
          onRestore={handleRestore}
          onDismiss={() => setSnapshot(null)}
        />
      ) : null}
      <TotalStrip
        total={result.total}
        hasInput={hasInput}
        isComplete={isComplete}
        overallPass={result.overallPass}
      />
      <main className="mx-auto w-full max-w-[720px] px-4 flex-1">
        <IdentityRow age={reducerState.age} sex={reducerState.sex} dispatch={dispatch} />
        <EventForm
          raw={reducerState.raw}
          result={result}
          deltas={deltas}
          dispatch={dispatch}
        />
        <Footer />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Run — integration test should pass**

```bash
npm test -- --run tests/integration.test.tsx
```

Expected: all integration tests pass (including the new delta test).

- [ ] **Step 6: Run the full suite + typecheck**

```bash
npm test
npm run typecheck
```

Expected: green across the board.

- [ ] **Step 7: Commit**

```bash
git add src/components/EventForm.tsx src/App.tsx tests/integration.test.tsx
git commit -m "feat(app): wire delta-to-pass through EventForm and App"
```

---

### Task 5: Manual smoke test in dev server

**Files:** none modified.

This is a manual verification step. Run the app, look at it, exercise it.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: dev server starts (port 5173 or similar). No console errors.

- [ ] **Step 2: Verify the delta column on default state**

Open the app fresh (incognito to avoid prior localStorage). Default state is age 22, sex M, all events empty. The delta column should be visually present (each row reserves the space) but every row's 4th cell should be empty.

- [ ] **Step 3: Verify failing-event deltas**

Type each value below; the indicated delta should appear in the 4th column of that row.

| Event | Type | Expected delta |
|-------|------|----------------|
| MDL | `130` | `+10 lb` |
| SPT | `5.9` | `+0.4 m` |
| HRP | `2` | `+8 reps` |
| SDC | `2:39` | `−0:08` (with U+2212 minus, not hyphen) |
| PLK | `0:55` | `+0:30` |
| 2MR | `24:00` | `−2:00` |

If any delta is wrong (off by one, wrong sign, wrong format), stop and debug — likely a unit-conversion bug in `delta.ts`.

- [ ] **Step 4: Verify deltas clear on passing input**

For each event still showing a delta, type a passing value (e.g. MDL `240`, SPT `9.0`, HRP `40`, SDC `2:00`, PLK `2:30`, 2MR `15:00`). Each delta should disappear (cell empties) as the event flips to passing.

- [ ] **Step 5: Verify the column doesn't crowd the layout on a phone**

Open Chrome DevTools, switch to mobile emulation (e.g. iPhone 13). Type one failing value to populate a delta. Confirm the row reads cleanly: label, input, points, delta — no horizontal scroll, no clipping, no overlap.

- [ ] **Step 6: Verify visual subordination**

The delta cell should read as quiet supplementary info — same weight as the row label, smaller than the points number, never competing with the input or points cells. If it reads as the loudest thing in the row, the styling is off and the brand brief is being violated; flag it.

- [ ] **Step 7: Stop the dev server**

`Ctrl-C` in the terminal running `npm run dev`.

- [ ] **Step 8: No commit needed.** If anything failed, return to the relevant task.

---

### Task 6: Open a pull request

**Files:** none modified.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin delta-to-pass-2026
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat: delta-to-pass annotations on failing events" --body "$(cat <<'EOF'
## Summary
- Render a small annotation in a new 4th column of each `EventRow` showing the smallest input change to bring a failing event to a passing score
- Pure math against `standards.json`, no LLM, no editorial copy
- Sign convention: `+` for "add this much", `−` (U+2212) for "shave this much off time"

Implements `docs/superpowers/specs/2026-04-27-delta-to-pass-design.md`.

## Test plan
- [ ] `npm test` green
- [ ] `npm run typecheck` clean
- [ ] Dev server: type failing values per the table in the plan, confirm each delta string matches expected format
- [ ] Bring each event to passing, confirm delta clears
- [ ] Mobile viewport: row layout doesn't crowd on iPhone-sized screens

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Note the PR URL** in the conversation so the user can review.

---

## Self-review checklist (already run at plan-write time)

Spec coverage verified:
- Encoding/format conventions per spec table → Task 2 tests assert each format
- Sign carries direction (U+2212 for ceiling, `+` for everything else) → Task 2 tests assert U+2212 explicitly
- 4-column grid, gap shrinks `4` → `3` → Task 3 component change
- Delta cell empty when null (span omitted) → Task 3 conditional render
- `thresholdFor` returns smallest floor key / largest ceiling key with ≥60 pts → Task 1 tests
- Cache thresholds across calls → Task 1 cache test
- Empty / whitespace / unparseable / passing → null → Task 2 tests
- App-level `useMemo` for deltas → Task 4 App.tsx
- Integration test for type-fail → see-delta → bring-to-pass → delta-clear → Task 4

No placeholders — every step has concrete code or a concrete command. Type names consistent throughout: `deltaForEvent`, `deltaAll`, `thresholdFor`, `parseRaw`, `string | null`. Test fixtures use the standards-table values verified against `src/data/standards.json` at plan-write time.
