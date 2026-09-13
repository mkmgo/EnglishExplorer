# EduPuzzle Showroom — Requirements for the Third-Party Provider

Status: **DRAFT** — agreed scope so far; remaining unknowns to be confirmed tomorrow.

## Background

The English Explorer platform embeds third-party interactive content (codename
**EduPuzzle**) inside a "showroom" panel on the thematic lesson decks. The host
page provides the container; the provider supplies the content logic.

- Host container: the `.panel` box in `template/thematic-layout.html`
  (and its copied lesson decks). Light amber background `#ffd54f`, rounded
  corners, `max-width: 900px`, centered, grows with content.
- Embedding mechanism: **injectable bundle** (self-contained HTML + CSS + JS
  delivered by the provider, mounted into the host page — not an iframe).
- Host mounts the bundle into a **Shadow root** so CSS never leaks either way.
- Orientation: optimised for **landscape** (iPad / desktop / Tizen), must
  also run on **mobile portrait**.
- Tizen TV specifics (gamepad steering, dialogs) are intentionally **out of
  scope** for this contract — handled by the host if ever needed.

## Deliverable (what the provider supplies)

1. **One self-contained bundle** — HTML + CSS + JS in a single injectable
   payload (e.g. a `<script type="text/html">` template or one file).
2. **No external runtime requests** — no CDN libs, fonts, or images at load.
   Fonts/images must be bundled/inlined or pre-agreed.
3. **One entry point** — a single `mount(containerEl)` function (or a single
   global namespace) the host calls to start the activity.

## Constraints (non-negotiable)

| # | Rule |
|---|---|
| C1 | No `<html>` / `<body>` style overrides; no document-level layout assumptions. |
| C2 | No bare `id`s — every id prefixed (e.g. `elpz-*`). |
| C3 | Exactly **one** global name (e.g. `Elpz` or `mount`) — everything else module-scoped. |
| C4 | No hijacking of `key`, `contextmenu`, `scroll`, `beforeunload` or other window/document events. |
| C5 | Must function inside a **Shadow root** (no reliance on `document` inherited styles). |
| C6 | No redirects; `window.top` / parent navigation forbidden. External links (if any) open in a new tab. |
| C7 | HTTPS-only for anything external (should be none per deliverable). |

## Styling & layout

- Background the widget sits on: **`#ffd54f`** (light amber / yellow).
- Default text colour: **`#14213d`**.
- Accent colour available: **`#b8860b`**.
- White/neutral cards with borders are fine; assume nothing about the page
  background; no dark-mode dependency.
- Responsive from **~320px to 900px+** wide.
- **Landscape (primary target):** the stage should fill the panel with **no
  inner scrolling** — size via `clamp()`, `aspect-ratio`, container queries
  (`cqw`), or flex that fills available space.
- **Portrait / narrow:** content may reflow or stack; overflow may scroll via
  the **page** (host never locks page scroll).
- Typography: sans-serif, legible ≥16px on phones, all text readable on amber.

## Interaction

- Input: **tap / click / drag only** — standard pointer + touch events.
- Touch targets ≥ 44px.
- No right-click or keyboard-only flows required.
- **Sound:** own mute control inside the widget; **no audio before a user
  gesture**.

## Data & persistence

- `localStorage` (if used) only under the namespace: **`elpz.*`**.

## Optional bridge (deferred — can be added later without changing the contract)

- **Height reporting** (for "no scrolling" fit): expose a `height(px)` callback
  or accept `ResizeObserver` on the widget root so the host can auto-fit the
  wrapper. *(Not required to start.)*
- **Results** (moves, choices, score): optionally call
  `postMessage({type:"elpz:result", ...})` or a `result(...)` callback when the
  activity finishes. Host will then show a "Finished" note and log the event.
  *(Not decided yet — can be added later.)*

## Open questions (to confirm tomorrow)

1. Landscape stage height / aspect-ratio target for the embed.
2. Whether results (moves / choices / score) should be captured and displayed.
3. Initial activity: what EduPuzzle delivers first and in what orientation.

## Showroom boundaries (memo for the host, not part of the provider contract)

- Lives in the copied lesson deck, not in `template/thematic-layout.html`.
- Mount point: a `<div class="ep-host">` inside `.panel` with a "Start activity"
  button; bundle mounted into a Shadow root.
- Bridge stubbed as `window.EduPuzzleBridge = { mount, result }`.