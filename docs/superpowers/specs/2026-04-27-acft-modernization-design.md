# ACFT Calculator — Modernization Design

**Date:** 2026-04-27
**Status:** Approved for planning
**Phase:** A1 (modernization only; product expansion deferred to a separate phase)

## Goal

Modernize the ACFT calculator's stack and visual language without adding new product features. Replace the 2017-era Create React App / React 16 / class-component foundation with a current toolchain, fix the correctness bugs in the existing implementation, and deliver a redesigned UI in the "Operations" visual direction.

A separate, future phase may add product features (history, goal-targeting, share/export, DA Form 705 pre-fill, MOS minimums). Those are explicitly **out of scope here**.

## Stack

| Concern | Choice |
| --- | --- |
| Build / dev server | Vite 5 |
| Framework | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind v4 with a small OKLCH theme block |
| Tests | Vitest + React Testing Library |
| PWA | `vite-plugin-pwa` |
| Container | Multi-stage Docker, pinned base images |
| Serve | nginx (existing config, target `dist/`) |

The output remains a static SPA. Same Dockerhub repo, same port 8080.

Removed: `react-scripts@1.0.14`, `node-sass`/`sass`, `react-validation`, `gh-pages`, `npm-run-all`, the CRA-style `registerServiceWorker.js`, all `*.scss` files, `src/asset-manifest.json`, the empty `pwd` file at repo root.

## Visual language ("Operations")

Dark theme with a warm copper accent and monospace numerals throughout. Resists the category-reflex of military design (no OD green, no camo, no stencil typography). Tactical without being themed.

### Tokens

```css
--bg:        oklch(0.18 0.012 45);
--surface:   oklch(0.22 0.012 45);
--divider:   oklch(0.28 0.012 45);
--text-hi:   oklch(0.95 0.005 60);
--text-lo:   oklch(0.65 0.01 60);
--accent:    oklch(0.78 0.16 50);  /* copper */
--pass:      oklch(0.78 0.13 145);
--fail:      oklch(0.7 0.18 25);
--focus:     oklch(0.78 0.16 50);
```

No `#fff` or `#000` anywhere. All neutrals tinted toward the accent hue.

### Typography

- UI / labels: system sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`).
- All numerals: `JetBrains Mono` with `ui-monospace` fallback, `font-variant-numeric: tabular-nums`.
- Tight 1.125 scale between steps. Fixed rem sizes (no fluid clamping).

### Color strategy

Restrained: tinted neutrals, single accent for primary affordance + dial fill + focus ring, semantic pass/fail used only on numeric scores.

## Layout (Workbench)

Single-page calculator with a top header strip and a two-pane workbench below.

```
┌────────────────────────────────────────────────────────────┐
│  AGE [28]   SEX [M|F]                          STATUS PASS │
├──────────────────────────────────┬─────────────────────────┤
│  MDL  [240 lb           ]        │        ╭───────╮        │
│  SPT  [9.2 m            ]        │        │  446  │        │
│  HRP  [38 reps          ]        │        │ / 600 │        │
│  SDC  [2:14             ]        │        ╰───────╯        │
│  PLK  [2:38             ]        │   MDL 88   SDC 52✕      │
│  2MR  [14:42            ]        │   SPT 74   PLK 71       │
│                                  │   HRP 82   2MR 79       │
└──────────────────────────────────┴─────────────────────────┘
```

- Desktop: two-pane, results panel sticky on the right.
- Mobile: collapses to one column. Dial moves above the inputs; per-event scores follow.

## Component breakdown

```
App.tsx                 layout shell, owns reducer
├ Header.tsx            Age / Sex / Overall status pill
├ EventForm.tsx         renders the six EventRows
│  └ EventRow.tsx       label + typed input
├ ResultsPanel.tsx      sticky right column
│  ├ Dial.tsx           SVG progress ring (0–600)
│  └ EventScores.tsx    per-event points grid with pass/fail color
└ Footer.tsx
```

All function components. Props are typed. No class components anywhere.

## State

Single source of truth: a `useReducer` in `App.tsx`.

```ts
type Sex = 'M' | 'F';
type Event = 'mdl' | 'spt' | 'hrp' | 'sdc' | 'plk' | 'tmr';

type State = {
  age: number;             // user-entered, bucketed at selection time
  sex: Sex;
  raw: Record<Event, string>;  // user-typed strings, unparsed
};

type Action =
  | { type: 'set-age'; age: number }
  | { type: 'set-sex'; sex: Sex }
  | { type: 'set-raw'; event: Event; value: string }
  | { type: 'reset' };
```

- Inputs are **controlled**. State and DOM cannot drift.
- Derived values (parsed inputs, points, pass flags, total) are computed via a pure `select(state)` function on every render. Never stored.
- The reducer's switch is exhaustive; TypeScript catches missing action types at compile time. The current `alert('Something went wrong.')` fallback is removed.

### Persistence

- Hydrate `state` from `localStorage` on mount under key `acft:v1`.
- Write through on every state change (debounced 200ms).
- Version key allows future migrations.

## Scoring engine

Pure module `src/lib/scoring.ts`, no React imports.

```ts
scoreEvent(event: Event, raw: ParsedRaw, age: number, sex: Sex):
  { points: number; pass: boolean }

scoreAll(state: State):
  { events: Record<Event, EventResult>; total: number; overallPass: boolean }
```

`overallPass = total >= 360 && every event points >= 60`.

The current `getNextHighestKey` / `getNextLowestKey` helpers are replaced. They silently rely on V8's auto-sort of integer-like string keys, and break the moment a JSON shape changes. The new lookup:

1. At module load, sort each event's keys numerically once.
2. Use a typed lookup that takes `{ table, value, direction: 'ceiling' | 'floor' }` and returns the bracketing key explicitly.

Direction per event:

| Event | Direction | Reason |
| --- | --- | --- |
| MDL | floor | more weight, better; bracket downward |
| SPT | floor | more distance, better |
| HRP | floor | more reps, better |
| PLK | floor | more time, better |
| SDC | ceiling | less time, better |
| 2MR | ceiling | less time, better |

(The current code also gets these right by accident; the new code makes it explicit and tested.)

## Data model

`src/data/standards.json` is restructured.

**Before:**
```json
{ "male": { "max-dead-lift": { "240": [{"17-21":82, ...}] } } }
```

**After:**
```json
{
  "__meta__": { "source": "DA Pam 600-21, FY24 update", "version": "2024-09-01" },
  "M": { "MDL": { "240": {"17-21":82, ...} } }
}
```

- Flatten the useless 1-element array wrapper.
- Use the same event-code keys as the runtime (`MDL`, `SPT`, etc.).
- Top-level `__meta__` block documents the source-of-truth and version.
- TypeScript type generated from the JSON shape; lookups are type-checked.

## Bug fixes (S2 explicit list)

| # | Bug | Fix |
| --- | --- | --- |
| 1 | `Dial.getOffset` divides by 300; total maxes at 600 (ring half-fills then refills) | `offset = circumference * (1 - score / 600)`; clamp 0..1 |
| 2 | `pass` prop passed to `ResultsDial` but never used | Wire pass/fail color into `EventScores` per event |
| 3 | `error` state declared, never written | Delete; derive parse errors from input strings inline |
| 4 | `getPassFail` returns `'pass'`/`'fail'` strings into a boolean-typed `pass` state | Return `boolean` |
| 5 | Helper functions silently rely on V8 numeric-string key sort | Replace with explicit numeric sort + typed lookup |
| 6 | `alert('Something went wrong.')` fallback in `handleChange` | Exhaustive reducer switch; TypeScript enforces |
| 7 | Empty `pwd` file in repo root (accidental commit) | Delete |
| 8 | `react-scripts@1.0.14` (deprecated, security advisories) | Replaced wholesale by Vite |

## UX improvements (S2)

- **Age as a number** — single input, bucketed at selection time. Replaces the 10-pill sidebar.
- **Time as `MM:SS` single field** — parser accepts `2:14`, `2:4`, `134`. Replaces paired MM / SS inputs.
- **Units in placeholders** — `240 lb`, `9.2 m`, `38 reps`, `2:14`. Replaces "RAW SCORE" generic labels.
- **Overall status pill** — surfaces `PASS` / `FAIL` (total ≥ 360 and every event ≥ 60) in the header.
- **`localStorage` persistence** — refresh keeps your inputs.
- **`aria-live="polite"`** on the total — screen readers announce score changes.
- **Real labels** on every input (replacing the current `<label>...&nbsp;</label>` stand-ins for the seconds field, which were invisible to screen readers). With time inputs collapsed to a single `MM:SS` field, this resolves automatically.

## Testing

- **`scoring.test.ts`** — table-driven, every event × edge cases:
  - Below floor (returns 0)
  - Above ceiling (returns 100)
  - Exact match
  - Gap-in-table value (e.g., SPT skips 127, expect score for 126 not 128)
  - Age boundary (17 → 17-21, 22 → 22-26)
- **`time.test.ts`** — parser tolerance for `MM:SS`, `M:SS`, raw seconds, garbage input.
- **One RTL integration test** — renders `<App/>`, types known inputs, asserts the total displayed.
- No coverage gate. Scoring helpers should be exhaustive; UI tests are smoke-level.

## Build & deploy

- `vite build` produces `dist/`.
- Dockerfile multi-stage:
  - Build: `node:22-alpine`
  - Serve: `nginx:1.27-alpine`
- Existing `default.conf` reused; only the COPY source changes from `build/` to `dist/`.
- Same Dockerhub repo, same port 8080.

## Out of scope (Phase C, deferred)

These ideas came up during brainstorming and are intentionally not part of this work:

- Share / export (URL-encoded inputs, DA Form 705 PDF pre-fill)
- History / progress tracking across sessions
- Goal-target solver ("what do I need on the run to hit 540?")
- MOS-specific minimums (combat MOS thresholds)
- User accounts / cloud sync

## Risks

| Risk | Mitigation |
| --- | --- |
| Tailwind v4 is newer; some patterns may shift | Use stable APIs only; pin to a known-good minor |
| OKLCH browser support gates older Safari | OKLCH is supported in Safari 15.4+ (2022); acceptable |
| Standards data may be out-of-date | `__meta__` block surfaces version; verify against current DA Pam 600-21 during implementation |
| PWA migration from old `registerServiceWorker.js` may leave stale caches | `vite-plugin-pwa` ships a clean upgrade path; bump cache version on first deploy |
