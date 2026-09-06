# English Explorer — Dev Conventions

## Project structure

Follow this layout (all paths relative to repo root):

```
EnglishExplorer/
├── index.html                  <-- Stable, production-ready release
├── advanced.html               <-- Active sandbox / current development version
├── dev.html                    <-- Dev Hub (developer entry point)
├── updates.html                <-- Updates / changelog page
├── README.md                   <-- Project overview for humans & visitors
├── AGENTS.md                   <-- This file
├── .gitignore                  <-- Ignores system metadata files (e.g. Desktop.ini)
├── tracker.js                  <-- Visitor tracking helper (posts to the worker; see "Backend worker")
├── english-explorer-tracker/   <-- Cloudflare Worker backend (airtable + GitHub proxy; see below)
├── junior/                     <-- Ages 6-9 ecosystem
│   ├── thematic/               <-- Thematic lesson decks
│   │   ├── animals.html
│   │   ├── food-and-drinks.html
│   │   ├── house-home.html             <-- House & Home lesson deck
│   │   ├── in-on-under.html            <-- Prepositions: in, on, under
│   │   ├── my-family-my-classroom.html
│   │   ├── numbers.html
│   │   ├── toys-things.html
│   ├── others/                  <-- Standalone classroom activity games (formerly empty placeholder)
│   │   ├── indoor-outdoor-quest.html  <-- QR quest: scan, find something inside/outside the house
│   │   └── handwriting-practice-01.html  <-- iPad handwriting: fill the word on help lines
│   └── minigames/              <-- Highly gamified mini-games (formerly /Features)
│       ├── abc-world.html
│       ├── mb-grid-shift.html  <-- Grid Shift: flip bricks (front/back) from a stack, drag onto 7x5 grid; Airtable table GridShift
│       ├── mystery-base.html   <-- FLAGSHIP: most-viewed, most-developed version; keep pristine, treat as base for feature integration
│       ├── mystery-phrases.html
│       ├── new-words-wizard.html
│       ├── unlock-mystery.html
│       └── unlock-mystery-plus.html
├── breakthrough/               <-- Older pupils (EEBT - Advanced / Breakthrough)
│   ├── protocols/              <-- Daily Protocols (YYYY-MM-DD.html)
│   └── tools/                  <-- Standalone utility collection (formerly EEBTools/)
│       ├── bt-spotlight-pro.html
│       └── bt-study-hub.html        <-- Study Hub (Airtable-powered, dark mode; formerly bt-reading-list.html)
├── archive/                    <-- Older versions and backups for mobile/Tizen testing
│   ├── develop.html
│   └── eebt-translator.html    <-- Retired EEBT Translator tool
└── template/                   <-- Reusable layouts (see "template/" below)
    └── thematic-layout.html    <-- Base thematic lesson deck scaffold
```

### template/

Reusable layouts for building lesson decks. `thematic-layout.html` is the base
layout scaffold (topbar, banner, ribbon, panel) copied from `junior/thematic/` —
`junior/thematic/house-home.html` is its live instance in development.

The `assets/`, `presentations/` (both ecosystems) and `breakthrough/modules/` folders from the
target template do **not** exist yet — only create them when there is real shared content to
put in them (see "Self-contained files" below).

### File placement rules

- New themed lesson deck → `junior/thematic/`.
- New gamified activity → `junior/minigames/`.
- New Breakthrough tool/utility → `breakthrough/tools/`.
- Superseded/old versions → `archive/` (keep them; do not delete without asking).
- Keep `index.html` as the stable release; do new development in `advanced.html` and promote when stable.
- **Keep the structure listing above in sync**: whenever a new file is released (moved out of development into its final folder), add it to the tree under the correct folder.

### Self-contained files — no cross-file dependencies

- Every HTML file is fully self-contained: inline `<style>` and inline `<script>`, no external JS/CSS libraries, no local assets folder.
- Images and videos are hosted on Cloudinary and referenced by absolute `https://res.cloudinary.com/...` URLs.
- No HTML file links to another HTML file (no local `href`/`src`/`window.open` to sibling files). **Do not introduce relative file references** — if two files must share code, treat that as a deliberate refactor and discuss it first.
- When moving/renaming a file, move it without editing (git detects byte-identical copies as renames), then apply any edits on the new path.

### File naming rules

- Use **kebab-case**, all **lowercase**: `my-new-module.html`, never `MyNewModule.html`, `my_new_module.html`, or `my module.html`.
- No spaces, underscores, or uppercase letters in file names.
- Existing product display names are unaffected — only file names are constrained (e.g. the translator stays "EEBT Translator" while its file is `eebt-translator.html`; the presenter hub is `bt-spotlight-pro.html`, shown on screen as "SpotlightPro").

## Backend worker (tracking + GitHub proxy)

There is **no `config.js`** — all secrets live server-side in the Cloudflare Worker
(`english-explorer-tracker/`). The Worker reads them from its environment secrets
(`AIRTABLE_BASE_ID`, `AIRTABLE_PAT`, `GITHUB_TOKEN`), never from the client.

- `tracker.js` is the only shared, linked front-end script. It is **approved exception to
  "self-contained files"**: linked from **every** HTML page (including new ones) via
  `<script src="tracker.js">` right before `</body>`:
  - Root pages (`index.html`, `advanced.html`, `dev.html`, `updates.html`): `src="tracker.js"`
  - One level deep (`archive/`): `src="../tracker.js"`
  - Two levels deep (`junior/...`, `breakthrough/...`): `src="../../tracker.js"`
- `tracker.js` exposes `logActivity(pupil, pagePath, section, actionType, details)` and
  auto-logs a `Page_View` on every page load. The worker POSTs it to Airtable
  (`SiteVisitorLogs`) using `env.AIRTABLE_BASE_ID` / `env.AIRTABLE_PAT`. Reuse `logActivity`
  for custom events instead of writing new fetch calls.
- **GitHub proxy** (used by `dev.html` to avoid API rate limiting): the Worker also serves
  `GET /github?url=<encoded GitHub URL>` and re-fetches the target with
  `env.GITHUB_TOKEN` as a Bearer header. It only proxies `api.github.com`,
  `raw.githubusercontent.com`, and `github.com`. `dev.html`'s `gh()` helper routes all
  GitHub API calls through this endpoint — do not put a token in front-end code.
- Worker endpoints:
  - `GET /github?url=...` — GitHub API proxy (Bearer token added server-side).
  - `GET /airtable?table=<TableName>` — read-only Airtable reader (PAT stays server-side).
    Only **allowlisted** tables are readable. Each table is sorted by its own field (or its
    natural Airtable order when it has no sort field): `ReadingList` (sorted by `DisplayOrder`,
    used by `bt-study-hub.html`) and `GridShift` (natural order, used by `mb-grid-shift.html`).
    Returns `{ records: [...] }`.
  - `POST /` — Airtable visitor tracking.
  - `OPTIONS` — CORS preflight (`GET, POST, OPTIONS`).
- Deploy with `npx wrangler deploy` from `english-explorer-tracker/`; set secrets with
  `npx wrangler secret put <NAME>`. Run tests with `npm test` in that folder.

## Platforms

- Must work on **Tizen** smart TVs and **mobile devices** (iOS/Android phones and tablets).
- When a feature behaves differently per platform (e.g., clipboard, dialogs, video autoplay), test and handle both: Tizen first, then mobile. Avoid `window.prompt`/`window.confirm` on Tizen — use in-page modals (e.g., `#inputModal`) so users can type or paste.
- Keep layouts responsive: desktop, tablet, and portrait/landscape phones must all fit without overflow.

## Dialogue layout (slide 3 "Greeting and Introduction" and similar)

- Dialogue bubbles alternate sides: Sam speaks on the **left** (`icardst` / accent background), Onza speaks on the **right** (`icardstb` / accent2 background).
- When adding a new phrase to an existing dialogue, place it **underneath the last phrase**, continuing the left/right alternation (left if Sam speaks, right if Onza speaks).
- `icardstb` cards always speak with the other voice automatically (via the delegated click handler) — no `onclick` needed.
- Slide 3's dialogue is currently wrapped in a `.panel` card. This was a tentative experiment — it can be **undone later** by removing the two `panel` wrapper divs around the `grid--2`.

## Retired slides

- Slides marked `data-retired` are excluded from progress count, navigation, and rewards. Reactivate by removing the attribute.

## Unfold (phrases shown step by step)

- **"Unfold"** is the mechanism for revealing dialogue/phrase cards one at a time: only the first phrase is visible, and clicking a phrase speaks it and reveals the next hidden phrase.
- Implemented on slide 4 (`#likePhrasesScreen`, "Do You Like?") and slide 10 (`#ynDialogueScreen`, "Do You Have A…?" educational dialogue). Phrase cards are direct children of the slide's `.grid--2` panel.
- Hide all but the first card with: `#likePhrasesScreen .grid--2 > .phraseCard:not(:first-of-type) { display: none; }` (mirror for `#ynDialogueScreen`).
- Reveal the next card with the delegated click listener set up by `setupUnfold(slideId)` (walk up to the clicked `.phraseCard`, then set the following card's `style.display` to `inline-flex`). Call `setupUnfold("id")` once per unfold slide.
- The next card is revealed **only after the clicked phrase finishes speaking** (`flushReveal`). Speech-end is detected via the utterance's `onend` (web) or Tizen's `onfinish` listener, wired in `say()`. If sound is off or no TTS is available, the reveal happens immediately. A 30s fallback timer guarantees the next card is never stuck hidden.
- Every phrase card must stay in the HTML — unfold only hides/unhides them, it never removes content. Cards keep their normal `speakPhrase(...)` / `say(...)` onclick so clicking still speaks.
- To apply unfold to a new slide, replicate the CSS rule and the delegated listener, swapping in the new slide's id.

## Daily Protocols

When creating a new protocol, first read `breakthrough/protocols/README.md` for the required template and section order. Save the file as `breakthrough/protocols/YYYY-MM-DD.html`.

## Grid Shift minigame (Airtable-powered)

`junior/minigames/mb-grid-shift.html` is a mystery-base-derived game: a stack of
96×84 bricks with **front + back** faces (3D flip). Bricks start backs-up; tapping
the top card turns it, and the revealed front can be dragged onto any empty cell of
a fixed 7×5 grid (35 cells, sized to fit an iPad landscape board). No placement
rules yet — any card may go in any empty square.

- Built minimal (only the code needed): theme toggle, pointer drag & drop (ghost +
  drop-zone highlight + edge auto-scroll), and `logActivity` (Turn / Place) via
  the shared `tracker.js` (`../../tracker.js`).
- The deck keeps cards in Airtable's natural order (the worker applies **no** sort
  for this table). When a card is placed the next one is revealed for turning.
- The game fetches `GET /airtable?table=GridShift` (allowlisted in the worker).

### Airtable `GridShift` table schema

The minigame reads fields **by name**, not position. Note: for colour-only rows the
CSS colour variable arrives in `PrimaryColour` (not `Fill`) — the game accepts both.

| Field | Type | Purpose |
|---|---|---|
| `GridShiftID` | Autonumber | Stable per-brick id (also logs Turn/Place actions). |
| `TileName` | Single line text | Internal machine name (e.g. `Living-Room`). |
| `Display` | Single line text | Word shown on the brick front (e.g. `Lounge`) — falls back to `TileName`. |
| `Category` | Single line text | Grouping (Numbers, Clothes, Animals, Colours, Rooms, Directions) — currently unused by the UI. |
| `CategoryColour` | Single line text | Category accent (Beige/Blue/…) — currently unused. |
| `RenderMode` | Single line text | `cloudinary-img` (image front), `colour-only` (coloured circle), or `lucide-icon` (inline icon). |
| `TileFront` | URL *(optional)* | Front asset for `cloudinary-img` (absolute Cloudinary URL). |
| `TileBack` | URL *(optional)* | Back-of-brick art, shown on the mystery stack (cover). |
| `Lucide` | Single line text *(optional)* | Icon name for `lucide-icon` mode (`cooking-pot`, `sun`, `sofa`, `tent-tree`, `library-big`). |
| `Stroke` | Number *(optional)* | Icon stroke width (2). |
| `IconSize` | Single line text *(optional)* | `Medium` etc. |
| `PrimaryColour` | Single line text *(optional)* | Icon stroke colour (`#060606`) **or** the CSS colour var for `colour-only` (`var(--color-red)`). |
| `SecondColour`/`Fill`/`Subtext` | *optional* | Reserved; `Fill` is accepted as a colour-only fallback. |

- To add bricks: they already fill a 35-cell board; add/remove rows in Airtable
  and the deck + grid self-size (`COLS`/`ROWS` in the file are fixed while the grid
  is 7×5; padding/empty cells are fine if fewer).
- The worker fetch is capped at 200 records — ample for the current 35.

## Nimza's Reading List (Airtable-powered)

`breakthrough/tools/bt-study-hub.html` renders a reading list for the Breakthrough tutee, pulling content from Airtable at runtime (no hardcoded content).

- The page fetches `GET /airtable?table=ReadingList` from the tracker worker and renders one tappable card per record.
- It is responsive, has a dark-mode toggle (persisted in `localStorage["eebt-theme"]`, matching `updates.html`), and speaks each reading title via TTS (Tizen + Web Speech), consistent with the rest of the platform.
- Voice selection prefers smooth **female/natural** voices (Samantha, Google US English, Natural, Hazel, Aria…) via a scoring heuristic (`voiceScore()`), instead of blind `en-GB` first-match. Tizen uses OS TTS and ignores this.
- Not currently linked from `updates.html` (the Reading List row was removed until the page is confirmed working on-device). Re-add the link (class `nima-col`) once verified.

### Airtable `ReadingList` table schema

Simple, content-agnostic table. Column order in Airtable (autonumber first) is cosmetics-driven — the reader reads fields **by name**, not position:

| Field | Type | Purpose |
|---|---|---|
| `ReadingListID` | Autonumber | First column; only Airtable seems to require a unique first field. Not used by the reader. |
| `Title` | Single line text | Reading name shown on the card (also spoken via TTS). |
| `Subtitle` | Single line text *(optional)* | Short note under the title (scene label, programme theme, etc.). |
| `Feature` | Single select *(optional)* | Card emphasis. `Background (Accent)` fills the card with the subtle accent (Nimza purple); `Border` gives the card a visible accent-coloured border. Left empty for the default flat card. |
| `Text` | Long text *(optional)* | Passage/paragraph. Cards with text get a **READ** button that opens the passage in an in-page modal (Tizen-safe) with a LISTEN button (chunked TTS). Used for story passages, the monthly programme overviews, and the profile template. |
| `Link` | URL *(optional)* | Asset link — Cloudinary image/video, PDF, or external page. If it's an image, it's shown as a thumbnail; becomes the card's **OPEN** button. |
| `DisplayOrder` | Number *(optional)* | Sort order (ascending, via the worker). Rows **without** a value sort to the **top** (Airtable orders empty numbers first); set it on every new row to control position. |

- Only `Title` is required (`Text`/`Link` optional, at least one recommended). The reader also accepts `Name`/`URL`/`Note`/`Passage` aliases.
- To add a reading: create a new row in the `ReadingList` table (same base as visitor tracking) with the title and the asset URL. No code change needed — the page updates on reload (meta tags force no-cache).
- The worker fetch is capped at 200 records (`maxRecords=200&pageSize=100`) — plenty for the current ~21, but paginate if it ever grows.

### Blocked Cloudinary assets

The `dp455m4rk` Cloudinary account requires **signed delivery** and returns `401` for anonymous image/video URLs (see `asset-cloud-issues.MD`). When adding asset links to `ReadingList`, use a working account (`dqwm4pdbz` / `dmkhsyfzf`) — i.e. re-upload any blocked assets to one of those and paste the working URL. The reader renders whatever `Link` points to, so valid URLs just work.
