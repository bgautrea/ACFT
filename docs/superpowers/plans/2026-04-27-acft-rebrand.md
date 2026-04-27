# ACFT Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark "Operations" theme with a light/warm-paper scorecard surface per `docs/superpowers/specs/2026-04-27-acft-rebrand-design.md`. Visual rebrand only — scoring engine, reducer, persistence, and `standards.json` are untouched.

**Architecture:** Single-page SPA, no router. The current two-pane workbench layout is replaced with a single-column scoresheet topology: wordmark header, sticky total/status strip, identity row (age + sex), six event rows that each render their own inline points + pass/fail color, footer. Components decompose along that vertical structure: `Wordmark`, `TotalStrip`, `IdentityRow`, `EventRow` (refactored), `EventForm` (thinned), `Footer` (restyled). The components `Header`, `ResultsPanel`, `Dial`, and `EventScores` are deleted — their responsibilities collapse into the new structure.

**Tech Stack:** Vite 5, React 19, TypeScript strict, Tailwind v4, Vitest + React Testing Library. New runtime deps: `@fontsource-variable/fraunces`, `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` (all SIL OFL via Fontsource). Tests are co-located with source files (the existing pattern in `src/lib/`).

**Working environment:** A dedicated git branch is recommended (`git checkout -b rebrand-2026` before starting). The plan does not require a worktree, but using one is fine. All tasks should pass `npm test` and `npm run typecheck` at their commit point.

---

## File structure

**New files:**
- `src/components/Wordmark.tsx` — header brand mark ("ACFT" + sub)
- `src/components/Wordmark.test.tsx`
- `src/components/TotalStrip.tsx` — sticky top strip with total + status
- `src/components/TotalStrip.test.tsx`
- `src/components/IdentityRow.tsx` — age input + sex toggle
- `src/components/IdentityRow.test.tsx`
- `src/components/EventRow.test.tsx` — co-located test for the refactored row

**Modified files:**
- `package.json` — add three `@fontsource-variable` deps
- `src/index.css` — full `@theme` rewrite, font imports, body styles, `.num` and `.wordmark` utilities
- `src/components/EventRow.tsx` — render inline points + pass/fail
- `src/components/EventForm.tsx` — thread `ScoreResult` through to rows
- `src/components/Footer.tsx` — restyled, copy unchanged
- `src/App.tsx` — restructured layout, computes `isComplete`, passes result down
- `tests/integration.test.tsx` — selectors updated for new layout

**Deleted files:**
- `src/components/Header.tsx` (split into Wordmark + IdentityRow)
- `src/components/ResultsPanel.tsx`
- `src/components/Dial.tsx`
- `src/components/EventScores.tsx`

---

### Task 1: Install fonts and rewrite theme tokens

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`

- [ ] **Step 1: Install Fontsource variable packages**

```bash
npm install @fontsource-variable/fraunces @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

Expected: three packages added under `dependencies` in `package.json`, lockfile updated.

- [ ] **Step 2: Rewrite `src/index.css`**

Replace the entire file contents with:

```css
@import "tailwindcss";

@import "@fontsource-variable/fraunces";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

@theme {
  --color-paper:     oklch(0.96 0.01 85);
  --color-paper-2:   oklch(0.93 0.012 85);
  --color-ink:       oklch(0.22 0.015 60);
  --color-ink-md:    oklch(0.45 0.012 60);
  --color-ink-lo:    oklch(0.62 0.01 60);
  --color-accent:    oklch(0.42 0.13 30);
  --color-accent-hi: oklch(0.50 0.14 30);
  --color-pass:      oklch(0.45 0.10 145);
  --color-fail:      oklch(0.50 0.16 25);

  --font-display: "Fraunces Variable", Georgia, "Times New Roman", serif;
  --font-sans:    "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:    "JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

html, body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.num {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.wordmark {
  font-family: var(--font-display);
  font-variation-settings: "opsz" 96, "SOFT" 50, "WONK" 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

- [ ] **Step 3: Verify the dev build still compiles**

Run: `npm run build`
Expected: build succeeds; no TS errors. (The old `Header`/`ResultsPanel`/`Dial`/`EventScores` components still reference removed token names like `text-text-hi`, `bg-surface`, `border-divider` — those will fail to render correctly until App.tsx removes them in Task 8, but the build itself does not type-check classNames so the build passes.)

If the build fails for an actual TS reason, stop and fix before continuing.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/index.css
git commit -m "$(cat <<'EOF'
feat(theme): rewrite tokens to light/warm-paper, add Fraunces/Inter/JBM

Switches the @theme block from the dark Operations palette to the
light/warm-paper tokens defined in the rebrand design brief: cream
paper, deep warm ink, oxblood accent, muted forest/rust for pass/fail.
Self-hosts Fraunces, Inter, and JetBrains Mono via @fontsource-variable.
Adds .wordmark and .num utilities and a global prefers-reduced-motion
guard.
EOF
)"
```

---

### Task 2: Wordmark component

**Files:**
- Create: `src/components/Wordmark.tsx`
- Test: `src/components/Wordmark.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/Wordmark.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Wordmark from './Wordmark';

describe('Wordmark', () => {
  it('renders the ACFT mark as a level-1 heading', () => {
    render(<Wordmark />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'ACFT' }),
    ).toBeInTheDocument();
  });

  it('renders the descriptor sub-line', () => {
    render(<Wordmark />);
    expect(screen.getByText(/score calculator/i)).toBeInTheDocument();
  });

  it('applies the wordmark font utility to the mark', () => {
    render(<Wordmark />);
    const heading = screen.getByRole('heading', { level: 1, name: 'ACFT' });
    expect(heading.className).toContain('wordmark');
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/Wordmark.test.tsx`
Expected: FAIL with `Failed to resolve import "./Wordmark"`.

- [ ] **Step 3: Implement `Wordmark.tsx`**

Create `src/components/Wordmark.tsx`:

```tsx
export default function Wordmark() {
  return (
    <header className="pt-10 pb-6">
      <h1 className="wordmark text-7xl leading-none text-ink">ACFT</h1>
      <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-ink-md">
        Score Calculator
      </p>
    </header>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/Wordmark.test.tsx`
Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/Wordmark.tsx src/components/Wordmark.test.tsx
git commit -m "feat(wordmark): add ACFT wordmark header component"
```

---

### Task 3: TotalStrip component

**Files:**
- Create: `src/components/TotalStrip.tsx`
- Test: `src/components/TotalStrip.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/TotalStrip.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TotalStrip from './TotalStrip';

describe('TotalStrip', () => {
  it('shows em-dashes for total and status when there is no input', () => {
    render(
      <TotalStrip
        total={0}
        hasInput={false}
        isComplete={false}
        overallPass={false}
      />,
    );
    expect(screen.getByTestId('acft-total')).toHaveTextContent('—');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('shows the running total in ink while input is partial', () => {
    render(
      <TotalStrip
        total={120}
        hasInput={true}
        isComplete={false}
        overallPass={false}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('120');
    expect(total.className).toContain('text-ink');
    expect(total.className).not.toContain('text-accent');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('renders FAIL in fail color when complete and failing', () => {
    render(
      <TotalStrip
        total={359}
        hasInput={true}
        isComplete={true}
        overallPass={false}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('359');
    expect(total.className).toContain('text-ink');
    const status = screen.getByTestId('acft-status');
    expect(status).toHaveTextContent('FAIL');
    expect(status.className).toContain('text-fail');
  });

  it('renders PASS in pass color and accents the total when complete and passing', () => {
    render(
      <TotalStrip
        total={500}
        hasInput={true}
        isComplete={true}
        overallPass={true}
      />,
    );
    const total = screen.getByTestId('acft-total');
    expect(total).toHaveTextContent('500');
    expect(total.className).toContain('text-accent');
    const status = screen.getByTestId('acft-status');
    expect(status).toHaveTextContent('PASS');
    expect(status.className).toContain('text-pass');
  });

  it('marks the total as an aria-live region', () => {
    render(
      <TotalStrip
        total={0}
        hasInput={false}
        isComplete={false}
        overallPass={false}
      />,
    );
    expect(screen.getByTestId('acft-total')).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/TotalStrip.test.tsx`
Expected: FAIL with `Failed to resolve import "./TotalStrip"`.

- [ ] **Step 3: Implement `TotalStrip.tsx`**

Create `src/components/TotalStrip.tsx`:

```tsx
type Props = {
  total: number;
  hasInput: boolean;
  isComplete: boolean;
  overallPass: boolean;
};

export default function TotalStrip({
  total,
  hasInput,
  isComplete,
  overallPass,
}: Props) {
  const totalDisplay = hasInput ? String(total) : '—';
  const totalClass =
    isComplete && overallPass ? 'text-accent' : 'text-ink';

  const status = !isComplete ? '—' : overallPass ? 'PASS' : 'FAIL';
  const statusClass = !isComplete
    ? 'text-ink-lo'
    : overallPass
      ? 'text-pass'
      : 'text-fail';

  return (
    <div className="sticky top-0 z-10 bg-paper border-b border-paper-2">
      <div className="mx-auto w-full max-w-[720px] px-4 py-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span
            data-testid="acft-total"
            aria-live="polite"
            className={`num text-5xl font-medium ${totalClass}`}
          >
            {totalDisplay}
          </span>
          <span className="num text-base text-ink-md">/600</span>
        </div>
        <span
          data-testid="acft-status"
          className={`text-xs tracking-[0.18em] uppercase ${statusClass}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/TotalStrip.test.tsx`
Expected: 5 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/TotalStrip.tsx src/components/TotalStrip.test.tsx
git commit -m "feat(total): add sticky TotalStrip with semantic pass/fail"
```

---

### Task 4: IdentityRow component

**Files:**
- Create: `src/components/IdentityRow.tsx`
- Test: `src/components/IdentityRow.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/IdentityRow.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IdentityRow from './IdentityRow';

describe('IdentityRow', () => {
  it('renders the age input with the supplied value', () => {
    render(<IdentityRow age={28} sex="M" dispatch={() => {}} />);
    expect(screen.getByLabelText(/age/i)).toHaveValue(28);
  });

  it('marks the active sex with aria-pressed=true', () => {
    render(<IdentityRow age={22} sex="F" dispatch={() => {}} />);
    expect(screen.getByRole('button', { name: 'F' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('dispatches set-age when the age input changes', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<IdentityRow age={22} sex="M" dispatch={dispatch} />);
    const input = screen.getByLabelText(/age/i);
    await user.clear(input);
    await user.type(input, '30');
    expect(dispatch).toHaveBeenCalledWith({ type: 'set-age', age: 30 });
  });

  it('dispatches set-sex when a sex button is clicked', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<IdentityRow age={22} sex="M" dispatch={dispatch} />);
    await user.click(screen.getByRole('button', { name: 'F' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'set-sex', sex: 'F' });
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/IdentityRow.test.tsx`
Expected: FAIL with `Failed to resolve import "./IdentityRow"`.

- [ ] **Step 3: Implement `IdentityRow.tsx`**

Create `src/components/IdentityRow.tsx`:

```tsx
import type { Action, Sex } from '../lib/types';

type Props = {
  age: number;
  sex: Sex;
  dispatch: (action: Action) => void;
};

export default function IdentityRow({ age, sex, dispatch }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-8 py-6">
      <div>
        <label
          htmlFor="acft-age"
          className="block mb-1 text-[10px] tracking-[0.18em] uppercase text-ink-md"
        >
          Age
        </label>
        <input
          id="acft-age"
          type="number"
          min={17}
          max={99}
          value={age}
          onChange={(e) =>
            dispatch({ type: 'set-age', age: Number(e.target.value) })
          }
          className="num w-20 bg-transparent border-0 border-b border-paper-2 px-1 py-1 text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <span className="block mb-1 text-[10px] tracking-[0.18em] uppercase text-ink-md">
          Sex
        </span>
        <div className="inline-flex text-sm">
          {(['M', 'F'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => dispatch({ type: 'set-sex', sex: s })}
              aria-pressed={sex === s}
              className={
                sex === s
                  ? 'px-3 py-1 border-b-2 border-accent text-ink font-semibold'
                  : 'px-3 py-1 border-b-2 border-transparent text-ink-md hover:text-ink'
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/IdentityRow.test.tsx`
Expected: 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/IdentityRow.tsx src/components/IdentityRow.test.tsx
git commit -m "feat(identity): add IdentityRow with age input and sex toggle"
```

---

### Task 5: Refactor EventRow to render inline points

**Files:**
- Modify: `src/components/EventRow.tsx`
- Create: `src/components/EventRow.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/EventRow.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventRow from './EventRow';

describe('EventRow', () => {
  const baseProps = {
    code: 'MDL' as const,
    label: 'MDL',
    placeholder: '240 lb',
    value: '',
    points: 0,
    pass: false,
    dispatch: () => {},
  };

  it('renders the label and the placeholder on an empty row', () => {
    render(<EventRow {...baseProps} />);
    expect(screen.getByText('MDL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('240 lb')).toBeInTheDocument();
  });

  it('shows an empty points slot when value is empty', () => {
    render(<EventRow {...baseProps} />);
    expect(screen.getByTestId('acft-points-MDL')).toHaveTextContent('');
  });

  it('renders points in pass color when value is present and pass is true', () => {
    render(
      <EventRow
        {...baseProps}
        value="240"
        points={88}
        pass={true}
      />,
    );
    const points = screen.getByTestId('acft-points-MDL');
    expect(points).toHaveTextContent('88');
    expect(points.className).toContain('text-pass');
  });

  it('renders points in fail color when value is present and pass is false', () => {
    render(
      <EventRow
        {...baseProps}
        value="140"
        points={50}
        pass={false}
      />,
    );
    const points = screen.getByTestId('acft-points-MDL');
    expect(points).toHaveTextContent('50');
    expect(points.className).toContain('text-fail');
  });

  it('dispatches set-raw on input change', async () => {
    const dispatch = vi.fn();
    const user = userEvent.setup();
    render(<EventRow {...baseProps} dispatch={dispatch} />);
    await user.type(screen.getByPlaceholderText('240 lb'), '240');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'set-raw',
      event: 'MDL',
      value: '240',
    });
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/EventRow.test.tsx`
Expected: FAIL — the current `EventRow` props don't include `points`, `pass`, or `dispatch` (uses `onChange` instead). TypeScript / runtime errors expected.

- [ ] **Step 3: Replace `src/components/EventRow.tsx`**

Replace the entire file contents with:

```tsx
import type { Action, EventCode } from '../lib/types';

type Props = {
  code: EventCode;
  label: string;
  placeholder: string;
  value: string;
  points: number;
  pass: boolean;
  dispatch: (action: Action) => void;
};

export default function EventRow({
  code,
  label,
  placeholder,
  value,
  points,
  pass,
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
    <div className="grid grid-cols-[3.5rem_1fr_3rem] items-center gap-4 py-3 border-b border-paper-2 last:border-b-0">
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
        className={`num text-right text-base ${pointsClass}`}
      >
        {pointsDisplay}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/EventRow.test.tsx`
Expected: 5 passing tests.

Note: `EventForm` will fail to typecheck after this step because it still passes the old props (`onChange`). That's expected and is fixed in Task 6. Do NOT run `npm test` (full suite) yet — `npm run typecheck` will fail until Task 6 commits. Run only the row test.

- [ ] **Step 5: Commit**

```bash
git add src/components/EventRow.tsx src/components/EventRow.test.tsx
git commit -m "feat(event-row): show inline points with pass/fail color"
```

---

### Task 6: Thread ScoreResult through EventForm

**Files:**
- Modify: `src/components/EventForm.tsx`

- [ ] **Step 1: Replace `src/components/EventForm.tsx`**

Replace the entire file contents with:

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
  dispatch: (action: Action) => void;
};

export default function EventForm({ raw, result, dispatch }: Props) {
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
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Run the typechecker**

Run: `npm run typecheck`
Expected: typecheck passes for `EventForm.tsx` and `EventRow.tsx`. **It will still fail for `App.tsx`** (the old props are passed there). That's expected and is fixed in Task 8.

- [ ] **Step 3: Run the row test alone**

Run: `npx vitest run src/components/EventRow.test.tsx`
Expected: 5 passing tests (sanity check that the new `EventForm` plays with the updated `EventRow`).

- [ ] **Step 4: Commit**

```bash
git add src/components/EventForm.tsx
git commit -m "refactor(event-form): thread ScoreResult through to rows"
```

---

### Task 7: Restyle Footer

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace `src/components/Footer.tsx`**

Replace the entire file contents with:

```tsx
export default function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-paper-2 text-xs text-ink-lo">
      <p>
        ACFT Calculator. Modified from APFT by{' '}
        <a
          href="https://josephfus.co/"
          className="text-ink-md hover:text-accent underline-offset-2 hover:underline"
        >
          Joseph Fusco
        </a>
        .
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Run the typechecker**

Run: `npm run typecheck`
Expected: same status as after Task 6 — `App.tsx` still fails, nothing else.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "style(footer): restyle to paper/ink palette"
```

---

### Task 8: Restructure App.tsx and update integration test

**Files:**
- Modify: `src/App.tsx`
- Modify: `tests/integration.test.tsx`

- [ ] **Step 1: Update the integration test for the new layout**

Replace `tests/integration.test.tsx` contents with:

```tsx
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with initial empty state', () => {
    render(<App />);
    expect(screen.getByLabelText(/age/i)).toHaveValue(22);
    expect(
      screen.getByRole('heading', { level: 1, name: 'ACFT' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('acft-total')).toHaveTextContent('—');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('—');
  });

  it('typing in MDL updates the total in the strip', async () => {
    const user = userEvent.setup();
    render(<App />);
    const mdl = screen.getByLabelText(/^MDL$/);
    await user.type(mdl, '240');
    const total = screen.getByTestId('acft-total');
    expect(total.textContent).toMatch(/^[1-9]\d*$/);
  });

  it('switching sex updates aria-pressed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const fButton = screen.getByRole('button', { name: 'F' });
    await user.click(fButton);
    expect(fButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows PASS once all six events have passing inputs', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/^MDL$/), '240');
    await user.type(screen.getByLabelText(/^SPT$/), '9.2');
    await user.type(screen.getByLabelText(/^HRP$/), '40');
    await user.type(screen.getByLabelText(/^SDC$/), '2:00');
    await user.type(screen.getByLabelText(/^PLK$/), '2:30');
    await user.type(screen.getByLabelText(/^2MR$/), '15:00');
    expect(screen.getByTestId('acft-status')).toHaveTextContent('PASS');
  });
});
```

- [ ] **Step 2: Replace `src/App.tsx`**

Replace the entire file contents with:

```tsx
import { useEffect, useMemo, useReducer } from 'react';
import Wordmark from './components/Wordmark';
import TotalStrip from './components/TotalStrip';
import IdentityRow from './components/IdentityRow';
import EventForm from './components/EventForm';
import Footer from './components/Footer';
import { reducer } from './lib/reducer';
import { hydrate, save } from './lib/persist';
import { scoreAll } from './lib/scoring';
import { EVENT_CODES } from './lib/types';

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, hydrate);

  useEffect(() => {
    const handle = setTimeout(() => save(state), 200);
    return () => clearTimeout(handle);
  }, [state]);

  const result = useMemo(() => scoreAll(state), [state]);

  const hasInput = useMemo(
    () => EVENT_CODES.some((c) => state.raw[c].trim() !== ''),
    [state.raw],
  );

  const isComplete = useMemo(
    () => EVENT_CODES.every((c) => state.raw[c].trim() !== ''),
    [state.raw],
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-[720px] px-4 flex-1">
        <Wordmark />
      </div>
      <TotalStrip
        total={result.total}
        hasInput={hasInput}
        isComplete={isComplete}
        overallPass={result.overallPass}
      />
      <main className="mx-auto w-full max-w-[720px] px-4 flex-1">
        <IdentityRow age={state.age} sex={state.sex} dispatch={dispatch} />
        <EventForm raw={state.raw} result={result} dispatch={dispatch} />
        <Footer />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Run the typechecker**

Run: `npm run typecheck`
Expected: PASS. (The old `Header`/`ResultsPanel`/`Dial`/`EventScores` files are no longer imported anywhere — they still exist on disk but TypeScript doesn't fail on unused files.)

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all tests pass — the four new component test files (Wordmark, TotalStrip, IdentityRow, EventRow), the four updated integration tests, and the unchanged `lib/*` tests.

If a test fails on the time inputs (`SDC '2:00'`, `PLK '2:30'`, `2MR '15:00'`) because the time parser rejects them, the failing case is in the existing `time.ts` parser, not in this rebrand — narrow the offending input to a known-good value (e.g., look up a standards-table value for the user's age/sex bucket) and update the integration test. Do not modify the parser.

- [ ] **Step 5: Run the dev server and visually verify**

Run: `npm run dev`

Open http://localhost:5173 in a browser. Verify:
- Cream paper background, deep ink text, Fraunces wordmark "ACFT" at the top.
- Sticky strip below the wordmark shows `— /600` and `—`.
- Age input + M/F toggle work.
- Typing into MDL shows the points appear inline at the row's right edge in fail color (rust) for low values, pass color (forest) for passing values.
- Filling all six events flips the status to PASS or FAIL accordingly.
- The total in the strip turns oxblood once the user is complete and passing.
- Resize to mobile width: the layout stays single-column, the strip stays sticky to the top.

Stop the dev server (Ctrl-C) when satisfied.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx tests/integration.test.tsx
git commit -m "$(cat <<'EOF'
feat(app): restructure to scoresheet topology

App.tsx now composes the new components in the vertical scoresheet
layout: wordmark, sticky total strip, identity row, event form, footer.
Drops the two-pane workbench grid. Computes isComplete (all six events
present) alongside hasInput. Integration test selectors updated to
target the new strip and assert PASS-state on a fully-filled form.
EOF
)"
```

---

### Task 9: Delete obsolete components

**Files:**
- Delete: `src/components/Header.tsx`
- Delete: `src/components/ResultsPanel.tsx`
- Delete: `src/components/Dial.tsx`
- Delete: `src/components/EventScores.tsx`

- [ ] **Step 1: Confirm none of these are still imported**

Run: `grep -rEn "Header|ResultsPanel|Dial|EventScores" src/ tests/ --include="*.ts" --include="*.tsx"`
Expected: no matches in `src/App.tsx`, `src/components/EventForm.tsx`, or anywhere outside the four files about to be deleted.

If a stray import shows up, stop and remove it before deleting files.

- [ ] **Step 2: Delete the four obsolete component files**

```bash
rm src/components/Header.tsx
rm src/components/ResultsPanel.tsx
rm src/components/Dial.tsx
rm src/components/EventScores.tsx
```

- [ ] **Step 3: Verify the build and tests still pass**

Run: `npm run typecheck && npm test && npm run build`
Expected: all three pass green.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/
git commit -m "$(cat <<'EOF'
chore: remove components superseded by the rebrand

Header, ResultsPanel, Dial, and EventScores are all replaced by the
new scoresheet topology (Wordmark + TotalStrip + IdentityRow + the
inline points inside each EventRow).
EOF
)"
```

---

## Self-review notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-04-27-acft-rebrand-design.md` maps to a task. Color tokens → Task 1. Typography → Task 1. Wordmark → Task 2. TotalStrip → Task 3. IdentityRow → Task 4. EventRow inline points → Task 5. EventForm thinning → Task 6. Footer restyle → Task 7. Layout restructure + dial removal → Task 8. Component deletions → Task 9. Open Questions are flagged in the spec; they're judgment calls for the implementer to settle during Task 8's visual verification step.

- **Type consistency:** `EventRow` props (`code`, `label`, `placeholder`, `value`, `points`, `pass`, `dispatch`) are defined in Task 5 and consumed in Task 6 with the same names. `TotalStrip` props (`total`, `hasInput`, `isComplete`, `overallPass`) defined in Task 3 and consumed in Task 8 with the same names. `IdentityRow` props match between Task 4 and Task 8. The `ScoreResult` type imported in Task 6 already exists in `src/lib/types.ts:32-36` (verified).

- **Test data:** the integration test in Task 8 uses passing numbers for a 22-year-old M (the default state). If standards differ in the local `standards.json`, the test note in Task 8 Step 4 explains how to narrow the inputs without touching the parser.

- **Commit cadence:** nine commits, each representing one logically self-contained change. Suitable for either subagent-driven review (one task per agent) or inline batched execution.
