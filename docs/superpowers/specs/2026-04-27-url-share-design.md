# URL Share — Design

**Date:** 2026-04-27
**Status:** Approved for planning
**Phase:** Post-rebrand product feature (follows merged `rebrand-2026`)
**Source:** `superpowers:brainstorming` Q&A

## Feature Summary

Encode the calculator's current state — `age`, `sex`, and the six raw event scores — into a shareable URL that, when opened, restores those inputs. The URL auto-syncs to state as the user types, and a small affordance in the header invokes Web Share / clipboard for the explicit "send this to someone" case. When a shared link is opened over an existing local state, the URL wins but a quiet, time-limited "Restore mine" banner lets the user revert to their prior inputs.

A single URL format serves three distinct intents: soldier sharing their result with a peer or NCO, a soldier bookmarking a hypothetical scenario for themselves, and an NCO sending a target scorecard to a soldier. The framing in the UI is just "share / copy current state"; the URL doesn't know or care about intent.

## Primary User Action

Two flows.

1. **Share flow.** User taps the share affordance in the header → on mobile, OS share sheet opens with the URL pre-populated; on desktop, URL is copied to clipboard and the affordance flashes "Copied" for 1.5s.
2. **Receive flow.** User taps a shared link → app loads with the link's inputs applied, score visible immediately. If their own prior state was different, a thin banner above the score offers `Restore mine` for 8s.

## Design Direction

**Voice unchanged.** Small, monochrome, subordinate to the wordmark. No icons that fight the type, no toasts, no modals. The URL itself is plain query params — `?age=25&sex=M&mdl=240&spt=12.5&hrp=45&sdc=85&plk=120&tmr=15:30` — readable, hand-editable, ~90 characters fully populated. This matches `PRODUCT.md`'s "honest material, not theater" principle: the URL is exactly what it looks like, an honest description of the state.

**Header earns one brand beat — and one quiet utility.** The wordmark stays anchored left at the existing scale and weight. The share affordance hugs the right edge of the header band, baseline-aligned with the `Score Calculator` micro-caption beneath the wordmark, and uses the same micro-caption styling (`text-[10px] tracking-[0.18em] uppercase text-ink-md`) so it visually subordinates to the wordmark rather than competing with it. Touch target is padded to ≥40×40 without growing the visual mass.

## Scope

- **Fidelity:** Production-ready. This ships.
- **Breadth:** New URL encode/decode module, one new hook for sync, one new header child component, one banner component, one reducer action.
- **Interactivity:** Web Share API on mobile, clipboard fallback elsewhere, last-resort selectable readonly input if clipboard is also unavailable.
- **Non-goals:**
  - No `Reset` button (separate ticket).
  - No "view-only" mode for received links — recipients can edit freely. The link encodes inputs, not permissions.
  - No analytics on share invocations.
  - No back-end. Static SPA, query params only.
  - No `popstate` handling — back/forward navigation does not re-load URL state. URL is a one-way mirror after initial mount.

## Architecture

Five new files, four edits, one reducer addition.

### New files

```
src/lib/url.ts                       encode(state) → string ; decode(URLSearchParams) → Partial<State>
src/lib/initialState.ts              composeInitialState() → { state, undoSnapshot } merging hydrate() + URL
src/lib/useUrlSync.ts                hook: outgoing replaceState on state change (debounced)
src/components/ShareButton.tsx       header-right share affordance (Web Share + clipboard fallback)
src/components/RestoreBanner.tsx     "Loaded shared scorecard. [Restore mine]" — 8s auto-dismiss
```

### Edits

```
src/lib/reducer.ts                   add { type: 'load-from-url'; partial: Partial<State> } action
src/lib/types.ts                     add the action variant to the Action union
src/components/Wordmark.tsx          accept a right-slot child, lay out as flex row with justify-between
src/App.tsx                          use composeInitialState() in the useReducer initializer; call useUrlSync(state); render <ShareButton/> in the Wordmark right slot; render <RestoreBanner/> when undoSnapshot is non-null
```

### Data flow

```
mount (synchronous, in useReducer's lazy initializer)
  ├─ hydrate() → state₀          (existing localStorage path)
  ├─ decode(window.location.search) → urlPartial | null
  ├─ if urlPartial && it would change state₀:
  │     stateInitial = merge(state₀, urlPartial)
  │     undoSnapshot = state₀                        (kept in App-level useState)
  │     show <RestoreBanner/>
  └─ else: stateInitial = state₀; no banner

The URL merge happens before the first render, so there is no flash of pre-URL state.

user edits
  └─ existing reducer flow, debounced save() to localStorage AND replaceState() to URL  (200ms)

user taps Share
  ├─ try navigator.share?.({ url: location.href, title: 'ACFT scorecard' })
  ├─ catch AbortError → silently swallow (user dismissed share sheet)
  ├─ catch other / undefined → navigator.clipboard.writeText(location.href); affordance → "Copied" for 1.5s
  └─ catch clipboard fail → render selectable readonly <input> with URL pre-selected

user taps Restore mine
  └─ dispatch('load-from-url', undoSnapshot); clear banner
```

The URL is a **mirror** of state, not the source of truth after initial load. There is no `popstate` listener; we use `history.replaceState` exclusively to avoid feedback loops and avoid polluting browser history.

## Encoding rules

### `encode(state: State): string`

- Always emits `age` and `sex`.
- For each `EventCode` in `EVENT_CODES`: emits the lowercased key with the raw value if `state.raw[code].trim() !== ''`. Empty raw fields are omitted to keep the URL minimal.
- Implementation builds via `URLSearchParams`, which handles encoding for the colon in `tmr` (`15:30` → `15%3A30`). Browsers display this as `15:30` in most contexts.
- Returns a query string suitable for `window.history.replaceState`, including the leading `?`.

### `decode(searchParams: URLSearchParams): Partial<State> | null`

- `age`: `parseInt(value, 10)`. If NaN, omit. Otherwise clamp to `[17, 99]` to match the existing `IdentityRow` `min`/`max`.
- `sex`: accept exact `M` or `F` (case-sensitive). Anything else → omit.
- For each `EventCode`: lookup the lowercased key. If present, trim, cap at 8 characters (defensive: prevents a hostile or fat-fingered URL from injecting massive strings into state — existing scoring logic already handles invalid raws as 0/fail, so we don't validate format). If absent → omit.
- Returns `null` if no recognized fields were present at all (caller treats as "no URL state"); otherwise returns a `Partial<State>` containing only the validated fields.
- `decode` never throws.

### Reducer action

```ts
| { type: 'load-from-url'; partial: Partial<State> }
```

Shallow-merges `partial` into state. `raw` is merged at the field level, not replaced wholesale, so a URL containing only `age` and `mdl` doesn't wipe other event inputs.

## UX details

### `<ShareButton/>`

- Renders inside the `<header>`, right-aligned, baseline-aligned with the existing `Score Calculator` micro-caption.
- Default state: text "Share" in `text-[10px] tracking-[0.18em] uppercase text-ink-md` (matches caption styling). Padded to ≥40×40 touch target via `p-2 -m-2` (so visual size stays small but hit area is comfortable).
- Active state (after clipboard copy): text changes to "Copied" for 1.5s, then reverts. Width is reserved for the longer label so the layout doesn't shift.
- Hover (desktop): `hover:text-ink`. Focus: visible focus ring matching existing `focus:border-accent` token.
- `aria-label="Share scorecard"` always; updates to `"Link copied"` during the 1.5s flash.

### `<RestoreBanner/>`

- Renders above `<TotalStrip/>`, only when an undo snapshot exists.
- Strip styling: full-width, `text-xs text-ink-md`, single line on mobile (truncates if needed), inline button.
- Copy: `Loaded shared scorecard.` + button `Restore mine`.
- 8s auto-dismiss timer; cleared on click. Click → dispatch `load-from-url` with the snapshot, then unmount.
- `prefers-reduced-motion`: appears/disappears with no transition. Otherwise, a 150ms opacity fade in and out.
- `role="status"` and `aria-live="polite"` so screen readers announce the load without being intrusive.

### Initial state composition

The `useReducer` lazy initializer is changed from `hydrate` to a small composed initializer that calls `hydrate()`, then `decode(new URLSearchParams(window.location.search))`, and returns:

```ts
{ state: merged, undoSnapshot: hydrated | null }
```

where `undoSnapshot` is non-null only if the URL changed at least one field. The reducer state is initialized from `merged`. `undoSnapshot` is held in an App-level `useState` and rendered into `<RestoreBanner/>` until the user clicks Restore mine or the 8s timer fires.

This composition runs synchronously before the first render, eliminating any flash.

### `useUrlSync(state)`

- Outgoing only. Subscribes to state changes; debounces `history.replaceState` at 200ms (same cadence as `persist.save`). Uses the existing scheduling pattern from `App.tsx` for consistency.
- Cleanup on unmount clears any pending replaceState timeout.
- Does not read `state` until after first render; the initial URL is left in place during initial paint.

## Error handling

| Case | Handling |
|------|----------|
| Malformed URL param (e.g., `age=abc`, `sex=Q`) | Field silently dropped; valid fields still applied. |
| URL has no recognized fields at all | `decode` returns `null`; no banner; localStorage state unchanged. |
| `navigator.share` throws `AbortError` (user cancels share sheet) | Silently swallow. No clipboard fallback — the user explicitly dismissed. |
| `navigator.share` undefined or throws non-Abort | Fall through to clipboard. |
| `navigator.clipboard.writeText` rejects | Render a selectable readonly `<input>` containing the URL, pre-selected, focused, for 4s. Last-resort path. |
| `history.replaceState` throws (sandboxed iframe) | Wrapped in try/catch; swallowed. localStorage continues to work. |
| URL exceeds 2k chars | Cannot happen — current schema caps at ~120 chars even with maxed values. No special handling. |
| User pastes a URL with mixed-case event keys (`?MDL=240`) | `decode` only accepts lowercase keys. Mixed case → field omitted. Documented in `url.test.ts`. |

## Accessibility

- ShareButton: `aria-label`, focus ring, ≥40×40 touch target, keyboard-activatable (`<button type="button">`).
- RestoreBanner: `role="status"`, `aria-live="polite"`. Restore button has visible text, no icon-only.
- `prefers-reduced-motion` honored on banner fade.
- All copy is ASCII, no emoji.

## Testing

- `src/lib/url.test.ts`
  - encode produces expected query string for full state, partial state, all-empty raw.
  - decode round-trips a freshly-encoded URL.
  - decode rejects malformed `age` (NaN, negative, out of range — clamped or dropped per spec).
  - decode rejects malformed `sex` (lowercase, other letters).
  - decode caps event values at 8 chars.
  - decode returns `null` when no fields recognized.
  - `tmr` colon round-trips correctly (`15:30` ↔ `15%3A30`).
- `src/lib/useUrlSync.test.ts` (mocked `window.location` and `window.history`)
  - On state change, `replaceState` called within debounce window with encoded URL.
  - Multiple state changes within the debounce window collapse to a single `replaceState` call.
  - Cleanup clears pending timer.
- `src/lib/initialState.test.ts` (mocked `window.location` and `localStorage`)
  - With empty URL, returns `{ state: hydrated, undoSnapshot: null }`.
  - With URL matching localStorage, returns `{ state: hydrated, undoSnapshot: null }`.
  - With URL differing from localStorage, returns merged state and `undoSnapshot = hydrated`.
  - With URL containing only some fields, merges those fields and leaves the rest from localStorage.
- `src/components/ShareButton.test.tsx`
  - Web Share path: mock `navigator.share`, assert called with current URL.
  - AbortError path: button does not flash "Copied".
  - Clipboard fallback path: mock `navigator.share = undefined`, mock `navigator.clipboard.writeText`, assert button text changes and reverts after 1.5s.
  - Clipboard failure: assert readonly input rendered.
  - aria-label updates correctly.
- `src/components/RestoreBanner.test.tsx`
  - Renders only when snapshot present.
  - Click `Restore mine` dispatches `load-from-url` with snapshot, unmounts banner.
  - 8s timer auto-dismisses, no dispatch fired.
  - `prefers-reduced-motion` removes transitions.
- `src/lib/reducer.test.ts` — extend with `load-from-url` cases (full partial, partial-raw merge, empty partial is a no-op).

## Out of scope

- `Reset` action / button — separate ticket.
- View-only / read-only mode for received links.
- Analytics or telemetry on share events.
- QR-code rendering of the URL.
- A short-link service (URL is plenty short already).
- Server-side rendering or any back-end work.
- Browser back/forward navigation handling between successive shared states.
