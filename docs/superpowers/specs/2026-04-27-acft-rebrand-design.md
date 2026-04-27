# ACFT Rebrand — Design Brief

**Date:** 2026-04-27
**Status:** Approved for planning
**Phase:** B (visual rebrand; precedes Phase C product expansion)
**Source:** `$impeccable shape` against `PRODUCT.md`

## Feature Summary

Rebrand the ACFT score calculator's visual surface to match the strategic context captured in `PRODUCT.md`: a light, warm-paper scorecard with a single committed wordmark beat in the header, an inline scoresheet topology where each event row shows its own input and computed points, and a sticky top strip that holds the running total and pass/fail status. Replaces the current dark "Operations" theme that drifted into generic dark-SaaS reflex. The scoring engine, reducer, persistence, and data layer are unchanged.

## Primary User Action

Type six event results and read the resulting score and pass/fail status, fast and trustingly, on a phone in dim light.

## Design Direction

**Register:** `product` (with one committed brand moment in the header). Per `PRODUCT.md`.

**Theme:** **Light, warm-paper.**

Scene sentence: *"A soldier the night before record APFT, on their phone in the barracks, plugging in training numbers to see if they'd pass."* Dark was the category-reflex pick; the brand's anchor references (Hardgraft, WORN, Strava segment leaderboards) all live in the light/paper lane, and a warm-cream surface reads honestly under any ambient condition because the user's phone OS already dims the surface to taste.

**Color strategy:** **Restrained with semantic pass/fail.** Cream paper, deep warm ink, one brand accent for the wordmark + focus + the total when the user has finished (and passed), and muted forest/rust used only where pass/fail is being communicated — the per-event points number and the overall status word in the sticky strip. Nowhere else takes color; no gradients, no glassmorphism, no decorative color.

**Anchor references:**
- **Hardgraft / WORN Journal** — honest material, editorial type, paper-and-ink palette, no theater.
- **Strava segment leaderboards** — numbers as the visual, single restrained accent, scorecard topology.
- **Linear (light mode)** — tool precision, system-feeling type, restraint.

## Scope

- **Fidelity:** Production-ready. This ships.
- **Breadth:** The whole calculator surface (header, form, total/status strip, footer). One screen, no router.
- **Interactivity:** Shipped-quality React component, not a prototype. All states wired.
- **Time intent:** Polish until it ships.
- **Non-goals:** No backend changes. No scoring logic changes. No data restructure. No new product features (those are Phase C). The reducer, persistence, scoring engine, and `standards.json` shape stay exactly as they are.

## Layout Strategy

**Topology: scoresheet.** The form *is* the result. Each event row is a single horizontal unit that contains label + input + computed points + a pass/fail indicator on the points itself. There is no separate "results panel" and no dial.

**Vertical structure (mobile, top-to-bottom):**

1. **Wordmark strip.** "ACFT" set large in Fraunces, with a small descriptor underneath ("Score Calculator" or similar — exact copy in §8). Generous top margin; this is the single brand beat.
2. **Sticky total/status strip.** Sticks to the top of the viewport once the wordmark scrolls off. Shows: total points (huge mono numerals, tabular), `/600` set smaller after, and a pass / fail / "—" status word. This strip is the only "always visible" UI after scroll.
3. **Identity row.** Age input + Sex toggle. Small, quiet. Not part of the scoresheet rhythm — visually a setup step.
4. **Scoresheet.** Six event rows, one per line, with consistent rhythm. See "Scoresheet row" below.
5. **Footer.** Small credit line, unchanged in spirit from current.

**Desktop:** the same vertical structure, centered on a max-width column (~720px). No two-pane layout. Desktop is the wide-screen variant of mobile, not the inverse — this is `PRODUCT.md` principle 3 made structural.

**Scoresheet row (single horizontal unit):**

```
MDL    [240 lb              ]    88
SPT    [9.2 m               ]    74
HRP    [38 reps             ]    82
SDC    [2:14                ]    52  ← rust (fail) on this number only
PLK    [2:38                ]    71
2MR    [14:42               ]    79
```

- Event code on the left in small uppercase grotesk (Inter), tracked.
- Input field flexes to fill the row width.
- Computed points sit at the right edge, set in JetBrains Mono, tabular, the same column edge across all six rows.
- The points number itself takes the pass/fail color (forest if ≥60, rust if <60). The rest of the row stays ink.
- Empty input → empty points slot. No "0" placeholder; no dash. Just blank.
- A single thin paper-tinted divider between rows. No card backgrounds. No nested containers.

**Spacing rhythm:** Generous vertical breathing room between sections (wordmark → identity row → scoresheet) and tighter spacing within the scoresheet itself. Avoid the "same padding everywhere" failure mode. Section breaks earn extra space; row breaks within a section don't.

## Color tokens

All OKLCH. Replace the current `@theme` block in `src/index.css`.

```css
@theme {
  /* Surfaces */
  --color-paper:     oklch(0.96 0.01 85);   /* warm cream */
  --color-paper-2:   oklch(0.93 0.012 85);  /* slightly tinted, for dividers / hover */

  /* Text */
  --color-ink:       oklch(0.22 0.015 60);  /* deep warm near-black */
  --color-ink-md:    oklch(0.45 0.012 60);  /* secondary text, labels */
  --color-ink-lo:    oklch(0.62 0.01 60);   /* tertiary, placeholders */

  /* Brand accent (single-use: wordmark, focus, total when complete) */
  --color-accent:    oklch(0.42 0.13 30);   /* oxblood */
  --color-accent-hi: oklch(0.50 0.14 30);   /* hover/focus brightening */

  /* Semantic — used ONLY on the points number */
  --color-pass:      oklch(0.45 0.10 145);  /* deep forest, muted */
  --color-fail:      oklch(0.50 0.16 25);   /* rust, muted */
}
```

No `#fff` or `#000` anywhere. All neutrals tinted toward warm.

## Typography

All free, all SIL OFL.

| Role | Family | Source | Notes |
| --- | --- | --- | --- |
| Wordmark | **Fraunces** | Google Fonts (variable) | The single brand beat. Used at one large size in the header only. Lean into the optical-size axis (`opsz` ~96+) and modest `SOFT` / `WONK` for character. Not used anywhere else. |
| UI / labels / body | **Inter** | Google Fonts (variable) | Everything that isn't wordmark or numerals. System-feeling, recedes. |
| Numerals (all) | **JetBrains Mono** | Google Fonts (variable, already in project) | Total, points, all numeric inputs. `font-variant-numeric: tabular-nums` on every numeric element so columns align. |

Self-host via `@fontsource` packages or load via Google Fonts CSS, depending on PWA caching needs. Fallbacks:
- Fraunces → `Georgia, "Times New Roman", serif`
- Inter → `system-ui, -apple-system, "Segoe UI", sans-serif`
- JetBrains Mono → `ui-monospace, "SF Mono", Menlo, Consolas, monospace`

**Scale:** 1.2 ratio between steps (tighter than the current 1.125 because the wordmark is now a real type moment that needs separation from body sizes). Fixed rem, no fluid clamping.

**Weights:** Fraunces 700 wordmark only. Inter 400 body, 500 labels, 600 selected/active states. JetBrains Mono 500 numerals.

## Key states

| State | Behavior |
| --- | --- |
| **First load, no input** | Wordmark + sticky strip showing "—" for total and "—" for status. All event rows show empty input + blank points slot. No "fill out the form" copy. The form IS the call to action. |
| **Hydrated from localStorage** | Same as a fully-or-partially filled form. No flicker; SSR not relevant for SPA. |
| **Partial input** | Some rows show points (forest or rust), others remain blank. Total is the sum of filled events. Status: still "—" until all six are present. |
| **Complete, passing** | Total in the strip takes the brand accent color (oxblood) — used only here, on the wordmark, and on the focus ring. The "user has done the thing" cue. Status: `PASS` set in forest. |
| **Complete, failing** | Total stays ink (the brand accent is reserved for "the user has done the thing"). Status: `FAIL` set in rust. |
| **Input parse error** (e.g. "abc" in HRP, malformed time) | Points slot stays blank for that row. No error toast, no red border, no inline message. The blank itself communicates "this didn't parse." Users correct it and the points appear. |
| **Reduced motion** | Status strip transitions disabled. Number changes still happen instantly (no animation needed). |

## Interaction model

- **Inputs are controlled.** Same reducer model as today; no logic change.
- **Computation is synchronous and per-keystroke.** Points update on every input change; no debouncing of the display.
- **Persistence is debounced 200ms** (current behavior, unchanged).
- **Focus state:** 2px oxblood ring with 2px offset, on every focusable element. No box-shadow glow. No animated focus.
- **Sex toggle:** segmented control, current shape, restyled — paper background, ink text, oxblood underline (not full-fill) under the active option. The current "filled accent button" treatment is too loud for the new lane.
- **Sticky total strip:** fixed to top after the wordmark scrolls past. Subtle paper-tinted divider underneath, no shadow. Position changes are CSS `position: sticky`; no JS scroll listener.
- **No animations on layout properties.** Color transitions on the points number are 150ms ease-out-quart when pass/fail flips. Disabled under `prefers-reduced-motion`.
- **No hover decoration on inputs** — they are inputs, not buttons.

## Content requirements

| Element | Copy |
| --- | --- |
| Wordmark | `ACFT` |
| Wordmark sub | `Score Calculator` (Inter, small caps, tracked, ink-md) |
| Identity labels | `Age` `Sex` (Inter small caps tracked, ink-md) |
| Sex options | `M` `F` |
| Status labels | `—` (no input or partial), `PASS`, `FAIL` |
| Event labels | `MDL` `SPT` `HRP` `SDC` `PLK` `2MR` (existing event codes) |
| Input placeholders | `240 lb` `9.2 m` `38 reps` `2:14` `2:38` `14:42` (existing pattern; unchanged) |
| Total label | `/600` (small, ink-md, after the total number) |
| Footer | Existing credit line, unchanged in copy; restyled to ink-lo / Inter small. |

No instructional copy, no empty-state messages, no toasts. `PRODUCT.md` principle 2: respect the user's expertise.

## Recommended impeccable references for implementation

When the implementation plan runs, these reference files will help:

- `reference/product.md` — already loaded; the product register guides component vocabulary.
- `reference/typeset.md` — for the Fraunces wordmark execution; this is the most fragile-to-execute piece.
- `reference/layout.md` — for the scoresheet rhythm and section spacing.
- `reference/clarify.md` — to verify the minimal copy actually reads correctly with no instructional crutches.
- `reference/audit.md` — at the end, to verify a11y, mobile responsiveness, and motion preferences.

## Component impact

What changes in `src/`:

- **`src/index.css`** — full `@theme` rewrite (new color tokens, new font stacks). New `@font-face` or `@fontsource` imports for Fraunces and Inter. JetBrains Mono kept.
- **`src/App.tsx`** — layout restructure: wordmark + sticky total/status strip + identity row + scoresheet. Two-pane grid removed.
- **`src/components/Header.tsx`** — split. Wordmark moves out into a new `Wordmark.tsx`; the age + sex inputs become an `IdentityRow.tsx`; total + status become `TotalStrip.tsx`. The current single-`Header` shape doesn't survive.
- **`src/components/EventForm.tsx` + `EventRow.tsx`** — restructured. `EventRow` now takes its own computed points + pass flag and renders them inline. `EventForm` becomes a thin list, no separate results coupling.
- **`src/components/ResultsPanel.tsx`** — **deleted.** Replaced by inline points in each `EventRow` plus the `TotalStrip`.
- **`src/components/Dial.tsx`** — **deleted.**
- **`src/components/EventScores.tsx`** — **deleted** (its job — per-event points grid — moves into the rows).
- **`src/components/Footer.tsx`** — restyled, content unchanged.

Tests:
- `tests/App.test.tsx` (the integration smoke test) — selectors update for the new layout (no more dial / no separate scores grid). The same input → expected total assertions still apply.
- Scoring, reducer, time-parser, persistence tests — **unchanged**. Pure-logic tests are insulated from the visual rebrand.

## Open questions

1. **Wordmark sub copy.** I've drafted `Score Calculator`. Alternatives: `Scorecard`, `Calculator`, no sub at all. Resolve during implementation when the wordmark is visible at real size.
2. **Sticky strip behavior on iOS Safari with the URL bar.** `position: sticky` interacts oddly with the iOS chrome on scroll. Verify in browser; fall back to a non-sticky inline strip if it misbehaves.
3. **Self-host vs Google Fonts CDN.** Self-hosting via `@fontsource` is friendlier to the existing `vite-plugin-pwa` cache strategy. Decide during implementation; default to self-host.
4. **Footer content.** Out of scope to redesign the credit line copy; just restyle. If the existing copy looks wrong in the new lane, surface for a separate decision rather than rewriting silently.
