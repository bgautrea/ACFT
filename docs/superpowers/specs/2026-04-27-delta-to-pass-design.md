# Delta-to-Pass — Design

**Date:** 2026-04-27
**Status:** Approved for planning
**Phase:** Post-URL-share product feature
**Source:** `superpowers:brainstorming` Q&A

## Feature Summary

For each failing event (`points < 60` with a parseable user input), render a small annotation in a new 4th column showing the smallest input change that would bring the user to a passing score for that event. Passing events, empty inputs, and unparseable inputs leave the column empty.

The annotation uses the same micro-caption typography as the row labels and reads as a brief sign-prefixed delta: `+8 reps`, `+10 lb`, `+0.4 m`, `−0:23`, `+0:15`. No editorial copy. No advice. Numbers continue to be the product.

A total-level delta is intentionally absent — the existing scoring rules make "all events pass but total < 360" mathematically unreachable, so there is no corresponding failure mode to surface.

## Primary User Action

Type six event results and read the resulting score. When an event falls short, the new 4th column tells the user exactly how much further they need to go in their own units, with no other change to the surface.

## Design Direction

**Voice unchanged.** Spare, instrument, no theater. The delta column is empty more often than it's full and never shouts. Annotations live in the same `text-[10px]` micro-caption style as the row labels, right-aligned, monospace, in `text-ink-md` so they recede behind the points number itself.

**Sign-carries-direction.** A positive sign means "add this much to your number." A negative sign on time-to-completion events (SDC, TMR) means "shave this much off." PLK is the one floor event with mm:ss units; its sign stays `+` because the user needs to *hold* longer.

**No tutorialization.** The delta is the gap to threshold, full stop. We do not tell the user *how* to close it (sets/reps/program). That is a different product.

## Sign and format conventions

| Event | Direction | Format | Example |
|-------|-----------|--------|---------|
| MDL | floor (more weight = better) | `+N lb` | `+10 lb` |
| SPT | floor (farther = better) | `+N.M m` (1 decimal) | `+0.4 m` |
| HRP | floor (more reps = better) | `+N reps` | `+8 reps` |
| SDC | ceiling (less time = better) | `−M:SS` | `−0:08` |
| PLK | floor (longer hold = better) | `+M:SS` | `+0:15` |
| TMR | ceiling (less time = better) | `−M:SS` | `−0:23` |

The minus sign is U+2212 (typographic minus), not U+002D (hyphen-minus), to match the existing brand's typographic stance.

## Scope

- **Fidelity:** Production-ready. This ships.
- **Breadth:** One new pure module (`src/lib/delta.ts`), one new exported helper in `scoring.ts`, EventRow grid update, EventForm prop threading, App-level `useMemo`.
- **Interactivity:** None new. The delta updates as the user types, via the existing reducer-driven render cycle.
- **Non-goals:**
  - No "distance to next 10-pt threshold" (rejected during brainstorming as brand-incompatible).
  - No editorial training advice — separate feature, separate product.
  - No total-level delta (unreachable per scoring rules).
  - No animation beyond the existing `transition-colors` reuse.
  - No "weakest event" highlighting beyond what the column already conveys.
  - No reducer changes, no persistence changes, no `standards.json` changes.

## Architecture

One new module, one export added to existing `scoring.ts`, two component edits, one App-level glue.

### New files

```
src/lib/delta.ts        deltaForEvent(...) → string | null ; deltaAll(state, result) → Record<EventCode, string|null>
src/lib/delta.test.ts
```

### Edits

```
src/lib/scoring.ts                  add and export thresholdFor(code, age, sex): number; export the existing parseRaw helper
src/components/EventRow.tsx         accept delta?: string | null prop; expand grid to 4 columns
src/components/EventRow.test.tsx    add tests for the 4th cell
src/components/EventForm.tsx        accept and thread per-event delta prop into rows
src/App.tsx                         useMemo(deltaAll(state, result)); pass into EventForm
tests/integration.test.tsx          one new integration test for type-failing → see-delta → bring-to-pass → delta-clears
```

### Module boundaries

- `scoring.ts` owns standards-table lookups. It already exports `bucketAge`. It will additionally export a single new helper, `thresholdFor(code, age, sex): number`, that returns the smallest internal-units key whose score for the given age-bucket and sex is ≥ 60. Floor events return the smallest such key; ceiling events return the largest such key. This is the only new scoring-layer concern.
- `delta.ts` owns the *user-facing* concerns: computing the delta in user units and formatting. It depends on `scoring.ts` for `bucketAge`, `thresholdFor`, and the existing per-event raw-parsing logic. The current private `parseRaw` in `scoring.ts` will be exported under the same name and reused in `delta.ts`; this is a minor surface-area expansion to a function that already exists, not a behavior change.
- `EventRow` is dumb: it receives a `delta: string | null` prop and renders it. It has no knowledge of standards or thresholds.

## Data flow

```
state changes
  └─ App.tsx
       result  = scoreAll(state)                       [existing]
       deltas  = deltaAll(state, result)               [new useMemo]
     props pass-through:
       EventForm receives raw, result, deltas, dispatch
EventForm.tsx
  └─ for each EventCode:
       <EventRow
         points = result.events[code].points
         pass   = result.events[code].pass
         delta  = deltas[code]              ← new
         ...
       />
EventRow.tsx
  └─ 4-column grid; renders delta in column 4 when non-null, else empty
```

## How `deltaForEvent` works

```
deltaForEvent(code, rawInput, age, sex, pass) → string | null

1. If rawInput is empty / whitespace → return null
2. If rawInput is unparseable (parseRaw equivalent returns null) → return null
3. If pass === true → return null
4. threshold = thresholdFor(code, age, sex)        // internal units
5. current  = parsed raw                            // internal units
6. delta_internal = floor:   threshold - current
                  | ceiling: current - threshold   // both produce a positive magnitude
   If delta_internal <= 0 (defensive): return null
7. Convert delta_internal to display units:
     MDL: lb (identity)
     SPT: meters = decimeters / 10
     HRP: reps  (identity)
     SDC/PLK/TMR: mmss = mm*100 + ss → mm:ss display string
8. Format with the per-event template; prefix sign:
     floor events:   "+" + value + " " + unit  (or "+M:SS" for PLK)
     ceiling events: "−" + value (which is M:SS)
9. Return formatted string.
```

### Threshold lookup detail

For each `(code, age-bucket, sex)`:
- Walk the standards table for that event/sex.
- For floor events (MDL, SPT, HRP, PLK): find the smallest numeric key whose value at the age-bucket is ≥ 60.
- For ceiling events (SDC, TMR): find the largest numeric key whose value at the age-bucket is ≥ 60.
- If no such key exists (defensive), `thresholdFor` returns a sentinel that causes `deltaForEvent` to return `null`. In practice this should never happen for the shipped `standards.json`.

`thresholdFor` reuses the existing `sortedNumericKeys` cache pattern in `scoring.ts` so per-event threshold lookups are O(log n) after the first call per event.

## EventRow grid change

Current:
```tsx
className="grid grid-cols-[3.5rem_1fr_3rem] items-center gap-4 py-3 ..."
```

New:
```tsx
className="grid grid-cols-[3.5rem_1fr_3rem_4.5rem] items-center gap-3 py-3 ..."
```

The gap shrinks from `4` to `3` (16px → 12px) to recover horizontal budget. The 4th column is `4.5rem` (72px) — wide enough for the worst-case delta string `−10:00` (6 chars at the monospace `num` size) without crowding.

The delta cell renders with:
```tsx
<span
  data-testid={`acft-delta-${code}`}
  className="num text-right text-[10px] tracking-[0.1em] uppercase text-ink-md"
>
  {delta}
</span>
```

When `delta` is `null`, the span is omitted entirely (cleaner DOM than rendering an empty span). The grid still allocates the column, leaving the cell visibly empty.

The micro-caption tracking on this cell is `0.1em` (tighter than the `0.18em` on row labels) because the delta strings are dense numeric tokens, not labels — looser tracking would read as breathing room rather than letterspacing.

### Narrow-viewport notes

The total of `3.5 + ?(1fr) + 3 + 4.5 = 11rem + flex` plus three 12px gaps fits inside the existing `max-w-[720px]` and the `px-4` page gutter on phones at 360px width. If field-testing reveals pinching on smaller screens, we'll narrow the 4th column to `4rem` in implementation. Flagged here, not pre-optimized.

## Error handling

| Case | Handling |
|------|----------|
| No input / whitespace-only | `delta = null`, cell empty |
| Unparseable input | `delta = null`, cell empty |
| Input that scores 0 (below smallest table key) | Delta computed normally against the threshold key; reads as a real (large) positive number, e.g. `+80 lb`. We do not soften this — it's accurate. |
| Input above max (already at 100 pts) | `pass = true` → `delta = null` |
| Threshold table somehow has no ≥60 entry for this age-bucket/sex | `thresholdFor` returns a sentinel → `delta = null`. Should be unreachable in practice. |
| Display string longer than column width | Tolerated — column sized for worst case (`−10:00`). Real-world maxima fit. |

## Accessibility

- The delta cell is decorative supplementary information; it is not announced as a status change because the points cell already conveys the pass/fail state. No `aria-live` on the delta cell.
- The cell uses sufficient contrast in `text-ink-md` against `bg-paper`; matches the existing label color so passes the same contrast bar the labels do.
- No icon-only content; all delta text is readable.

## Testing

- `src/lib/delta.test.ts`
  - Happy paths per event type:
    - MDL fail-by-a-little (current 240, threshold 250 at age-bucket 22-26 male) → `+10 lb`.
    - SPT fail-by-a-little → `+0.4 m`.
    - HRP fail-by-a-little → `+8 reps` (or whatever the standards yield).
    - SDC fail-by-a-little → `−0:08`.
    - PLK fail-by-a-little → `+0:15`.
    - TMR fail-by-a-little → `−0:23`.
  - Empty input → `null`.
  - Whitespace input → `null`.
  - Unparseable input (e.g. MDL `"abc"`) → `null`.
  - Passing input → `null`.
  - Above-max input → `null`.
  - Decimal formatting for SPT (always 1 decimal, no trailing zeros stripped: `+0.4 m`, `+1.0 m`).
  - mm:ss formatting (zero-pad seconds, no leading zero on minutes: `+0:15`, `−1:05`, not `+00:15` / `−01:05`).
  - Sign uses U+2212 for ceiling events.
  - Sex- and age-bucket-sensitive: same input passes for one bucket, fails for another, returns the correct delta only for the failing case.
- `src/components/EventRow.test.tsx`
  - Renders the delta string in column 4 when prop is non-null.
  - Renders nothing in column 4 when prop is null.
  - Existing 5 tests continue to pass.
- `tests/integration.test.tsx`
  - One new test: type a failing MDL (e.g. `200`), assert the MDL row shows a delta string starting with `+`. Type up to a passing value, assert the delta clears.

## Out of scope (and why)

- **"Distance to next 10-pt threshold."** Explicitly rejected during brainstorming as supplement-ad-adjacent.
- **Total-level delta.** Mathematically unreachable given the scoring rules.
- **Editorial training copy.** Different product (Option B/C in the earlier comparison).
- **Animation of the delta value beyond reusing `transition-colors`.** YAGNI; the existing motion is enough.
- **Mobile pinching pre-optimization.** Sized for current worst case; revisit only if real testing reveals an issue.
- **Reducer / persistence / standards.json changes.** None needed; pure read-side computation.
