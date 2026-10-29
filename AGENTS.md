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
│   │   ├── adventure-outside.html    <-- Adventure / Outside standard slots deck (slot-machine + Where Is...? puzzle, 10 Cloudinary crops: bridge…treasure)
│   │   ├── animals.html
│   │   ├── food-and-drinks.html
│   │   ├── house-home.html             <-- House & Home lesson deck
│   │   ├── in-on-under.html            <-- Prepositions: in, on, under
│   │   ├── my-family-my-classroom.html
│   │   ├── numbers.html
│   │   ├── signs-directions.html            <-- Signs & Directions lesson deck
│   │   ├── toys-things.html
│   ├── others/                  <-- Standalone classroom activity games (formerly empty placeholder)
│   │   ├── indoor-outdoor-quest.html  <-- QR quest: scan, find something inside/outside the house
│   │   ├── handwriting-practice-01.html  <-- iPad handwriting: fill the word on help lines
│   │   └── handwriting-practice-02.html  <-- Airtable-powered writing practice (fetches from HandWriting table)
│   └── minigames/              <-- Highly gamified mini-games (formerly /Features)
│       ├── abc-world.html
│       ├── mb-grid-shift.html  <-- Grid Shift: flip bricks (front/back) from two 20-card stacks onto a shared 8x5 grid; Airtable table GridShift
│       ├── mb-gs-pure-match.html  <-- Single-player Grid Shift: place flipped cards onto randomized matching text imprints
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
    ├── thematic-layout.html    <-- Base thematic lesson deck scaffold
    └── edupuzzle-layout.html   <-- EduPuzzle showroom deck scaffold: no banner under the ribbon; banner (inverted) lives in the topbar left, stage fills the freed space
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

- Every HTML file is fully self-contained: inline `<style>` and inline `<script>`, no local assets folder.
- **Approved exception for external JS**: the Lucide icon library (`https://unpkg.com/lucide@latest`,
  loaded right before `tracker.js`) — used by `junior/minigames/mystery-base.html` and
  both Grid Shift pages. Icons are declared as `<i data-lucide="name">` placeholders and swapped
  for real SVGs with `lucide.createIcons()` via a `renderIcons()` helper. Do **not** add any other
  external JS/CSS library without discussion.
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
    natural Airtable order when it has no sort field): `BTStudyHub` (sorted by `DisplayOrder`,
    used by `bt-study-hub.html`), `GridShift` (used by both Grid Shift games), and
    `GridShiftVariants` (used by `mb-gs-pure-match.html`).
    Returns `{ records: [...] }`.
  - `POST /` — Airtable visitor tracking.
  - `OPTIONS` — CORS preflight (`GET, POST, OPTIONS`).
- Deploy with `npx wrangler deploy` from `english-explorer-tracker/`; set secrets with
  `npx wrangler secret put <NAME>`. Run tests with `npm test` in that folder.

## Platforms

- Must work on **Tizen** smart TVs and **mobile devices** (iOS/Android phones and tablets).
- When a feature behaves differently per platform (e.g., clipboard, dialogs, video autoplay), test and handle both: Tizen first, then mobile. Avoid `window.prompt`/`window.confirm` on Tizen — use in-page modals (e.g., `#inputModal`) so users can type or paste.
- Keep layouts responsive: desktop, tablet, and portrait/landscape phones must all fit without overflow.

### PS4 controller steering (gamepad bridge)

Tizen (USB gamepad) exposes the controller only via the raw **Gamepad API**, so
the minigames poll it each frame with a "pointer bridge" that moves a visible
cursor and fires synthetic `PointerEvent`s (Cross-press/release) into the
existing document-level drag-and-drop handlers.

- Implemented in **`junior/minigames/mystery-base.html`** (flagship) and
  both **Grid Shift** pages. Steering is confirmed working on-device (Tizen +
  PS4 controller) in the flagship and original Grid Shift game. **Keep all three
  copies in sync** when changing the bridge.
- Layout pieces required: the `#gamepadCursor` div, its CSS block (`.connected`,
  `.grabbing`, `.hovering`), and the poller starting with
  `if (typeof navigator !== "undefined" && navigator.getGamepads) { padPoll(); }`.
- Button map: **Cross** = grab/drop (a short Cross tap on an unflipped brick
  turns it), **Circle** = cancel drag (mystery-base: snap back to inventory;
  grid-shift: snap back onto the deck), **D-pad** = move cursor and, when not
  grabbing, Up/Down scroll the page, **R2** = toggle light/dark theme (reuses
  the `#themeToggle` click handler so it persists to `localStorage["miniGameTheme"]`),
  **Right stick** = fine cursor movement.
- The bridge is inert (page unchanged) when no gamepad is present, so it is
  safe on mobile/desktop too.
- When porting to a new game, adapt the hover/click selector lists to that
  game's interactive elements (`.flipCard, .cell, #themeToggle` in grid-shift)
  and re-tune `padTapDist` / D-pad repeat speed only on real hardware if needed.

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

Protocols, message sheets and tests are generated from the **Markdown tab** (screen 3)
of `breakthrough/tools/bt-spotlight-pro.html` via the **Generate** button
(`generateOutput()`). The flow takes the Markdown source (story text), the current
word list (`clipHistory`) and a recipient choice, then builds a self-contained
HTML document. Steps:

1. Write the story in the Markdown pane (screen 3). Each `##` heading becomes a
   story section; `###` headings and paragraphs become the scene content. The
   first `#` heading is auto-detected as the story title.
2. Collect vocabulary in the **Translator** tab (screen 2) — each word/phrase
   translated is added to `clipHistory` and will appear in the Vocabulary table
   (only when the list isn't empty).
3. Tap **Generate** → choose a document type (**Protocol** / **Message sheet** /
   **Test**) → choose a recipient (**Onza** / **Nimza** / typed **email**) →
   enter/confirm the title. The document downloads as `YYYY-MM-DD.html` for
   protocols, `message_YYYY-MM-DD.html` for message sheets and
   `test_YYYY-MM-DD.html` for tests. No document type requires vocabulary —
   a protocol can be generated with an empty word list.

Generated documents are fully self-contained with a **dark-mode toggle** (top-right
button, persists via `localStorage["eebt-theme"]` with a `prefers-color-scheme`
fallback) and a `For: <recipient>` line. Documents are **English only** — the
intro instructions have no Chinese translation. Chinese appears only in the
Vocabulary table, and only when vocabulary was added in the Translator: the
table renders `English | Chinese` (the Chinese column is dropped when no word
has a translation). A **Test** document is built from the Markdown content
itself (paste the test/questions in the Markdown pane before generating) with a
test-specific intro — it skips the Vocabulary table.

Translator and presenter documents (screen 2/3) use **Save words / Load words /
Save / Load** instead of CSV: bundles are JSON files (`spotlight-words` for the
translator, `spotlight-presentation` for the presenter — the latter embeds the
current `words` too). Loading **merges** (appends, skipping exact `en`+`zh`
duplicates) rather than replacing, so you can accumulate words across sessions.

### Class Prep (next-class stash)

The **Prep** button (clipboard icon in the top bar, `#prepBtn`) stashes the whole
live lesson as the next class's material in `localStorage["spotlight-prep"]`
(`{type:"spotlight-prep", savedAt, md, words, media}`):

- **Stash current** snapshots the markdown (`#mdSourceInput`), the translator word
  list (`clipHistory`) and the media links (`mediaHistory`); overwriting an
  existing stash is confirmed in-page (existing `#inputModal` choice buttons —
  never `window.confirm`, Tizen-safe).
- **Load into stage** replaces the markdown and media and **merges** the words
  (Clear the word list first for a strict swap), then jumps to the Markdown
  screen (`show(2)`).
- **Clear** removes the stash (confirmed the same way).
- The `#prepModal` status card shows live stage counts plus the stash's title
  preview (first non-empty markdown line), word/media counts and timestamp.
- The modal is placed **before** `#inputModal` in the DOM so confirms stack on
  top (both `z-index: 90`).

### File placement & overwrite rule

- Save (or overwrite) the downloaded protocol file as
  `breakthrough/protocols/YYYY-MM-DD.html` — always use **today's date**.
- If a second protocol is created on the same day, it **overwrites** the
  existing file for that date (the file name is the same).
- Message sheets (`message_YYYY-MM-DD.html`) and tests
  (`test_YYYY-MM-DD.html`) are not tracked in `updates.html`.

### Nimza entry in updates.html

After placing the protocol file, add (or update) a row in the **Nimza** (left)
column table of `updates.html`:

- **Date**: today in `DD/MM/YYYY` format.
- **File**: link text `Lesson Protocol DD/MM/YYYY`, href
  `https://mkmgo.github.io/EnglishExplorer/breakthrough/protocols/YYYY-MM-DD.html`,
  class `nima-col`, `target="_blank"`.
- **Note**: `For tomorrow`.
- Place the row **at the top** of Nimza's `<tbody>`, above any existing rows.
- If a protocol was already added today, **overwrite** that row (same date)
  rather than creating a duplicate.

## Grid Shift minigame (Airtable-powered)

`junior/minigames/mb-grid-shift.html` is a mystery-base-derived game: **two** player
stacks of 96×84 bricks with **front + back** faces (3D flip), played on one shared
grid (sized to fit an iPad landscape board). The active Airtable bricks are
**shuffled and dealt evenly**: the Red deck (left) shows `TileBackA` backs, the
Orange deck (right) shows `TileBackB` backs — every card in a deck shares its back
art. Bricks start backs-up; tapping a deck's top card turns it, and the revealed
front can be dragged onto any empty cell. No placement rules yet — any card may go
in any empty square.

### Grid sizing (dynamic, driven by active card count)

The grid **self-sizes from the number of `Active` cards**, not a fixed 8×5. Valid
card counts are **20 / 30 / 40** (steps of 10 — 25 and 35 are skipped on purpose):

| Active cards | Grid | Cells |
|---|---|---|
| 20 | 5 columns × 4 rows | 20 |
| 30 | 6 columns × 5 rows | 30 |
| 40 | 8 columns × 5 rows | 40 |

`gridDimensions(count)` picks the size and `buildGrid(cols, rows)` rebuilds the
cells after the fetch (the old fixed 40-cell grid is gone). Cards are dealt evenly
across the two decks (`Math.ceil(count / 2)`) — e.g. 20 → 10/10, 30 → 15/15,
40 → 20/20.

- Built minimal (only the code needed): theme toggle, pointer drag & drop (ghost +
  drop-zone highlight + edge auto-scroll), and `logActivity` (Turn / Place) via
  the shared `tracker.js` (`../../tracker.js`).
- Each deck **randomises** its deal on load (`shuffle`, Fisher–Yates) and both decks
  self-size from the Airtable fetch — only cards with the `Active` checkbox checked
  are used. When a card is placed the next one is revealed for turning.
  "Grid complete!" fires only when **both** decks are empty.
- The game fetches `GET /airtable?table=GridShift` (allowlisted in the worker).

### Grid Shift Pure Match variant

`junior/minigames/mb-gs-pure-match.html` is a separate one-player game.
It uses the `GridShiftVariants` row with `VarName: Pure Match` for its settings.
`VarName` is only the **internal name of the puzzle kind** — it selects the
variant row and titles the browser tab; it is never displayed on the page. The
visible top-bar title comes from `H1Text`; `H3Text` is shown as the initial
subheadline, then replaced by the active task's instruction.
`Deck` names the checkbox field on `GridShift` (currently `PM-Active`); every
card checked in that field is included. `DeckCount` must be `Variable`,
`GridDimension (horizontal)` accepts a cell count or `rows x columns`
(so the Airtable value `4x5` creates 5 columns × 4 rows),
`Placing` currently supports `Random`, and `Hints` must be
`Imprints of Display (Text)`. Each checked card's `Display` text is placed at a
random unique cell; cards can only be placed on a matching imprint. Before
turning, each card uses its `TileBack` asset. Both Airtable tables must be
allowlisted by the worker.
In wide layouts the single player deck sits left of the board with a 10px gap;
the deck + board group is centred on the page (`grid-template-columns: 148px
auto` + `justify-content: center` on `.stage`). In narrow layouts it moves
above the board.

The top bar has a horizontal / vertical layout toggle and the light/dark theme
toggle. In light mode the bar uses the darker `PartColour` with white title and
controls; the theme toggle uses the inverse treatment for contrast. Horizontal
is the default; vertical stacks the deck above the board,
uses at most four grid columns, and scales cells/cards and the stack and success
panels to fit portrait mobile screens. The EVENT LOG panel matches the Stack panel's
size: it sits below the stack in horizontal mode and beside it in vertical mode.
The current task instruction replaces H3Text in the prompt area above the game.
Event log entries are left-aligned, newest first, and older entries are dropped
as needed to avoid scrolling. A wrong turn or drop at any stage adds a red
`Mismatch` entry. Changing layout preserves the current board and progress.

**The stack shows its front.** Only the **first** card of the stack has to be
turned by the pupil — the cards below it show their front from the beginning
(`renderDeck` flips them; the first one carries `needsTurn` until it is
turned). A card that was turned and discarded keeps its back.

**The board stays fixed.** Grid cells and imprints remain in place throughout
the game. Completed turn-task cards return face-down to the covered stack
(immediately if there is no bridge message, otherwise when its bridge is
tapped); their cells remain open for the rest of the game. Product cards keep
their source cells when moved onto their related tile. Wrong turns and drops
show a red mark at the selected card/cell rather than a text message under the
grid.

**The finale.** When every task is solved, the `WPIMG2` picture covers the full
grid area as a slightly dimmed, top-aligned trophy; once it loads, the grid
cells remain subtly visible beneath the translucent image. The finale runs once
(`finaleStarted`); a bridge message that still waits for its tap postpones it.
Without `WPIMG2`, the full grid still turns green and remains visible.

The variant row also drives the page chrome:

| Field | Type | Purpose |
|---|---|---|
| `VarName` | Single line text | Internal name of the puzzle kind — selects the variant row (the page matches `Pure Match`) and titles the browser tab. It is **never shown on the page**. |
| `H1Text` | Single line text | Theme title shown in the top bar (currently `Topic: On the Farm`). Empty = the built-in `MY BASE` title stays. |
| `H3Text` | Single line text | Initial prompt shown below the top bar. Once the game starts, the active task's `taskNText` replaces it there. |
| `PartLabel` | Single line text | Deck badge label (replaces the hardcoded `Player` / `PLAYER`). Currently `Onza`. |
| `task1Text` | Single line text | Instruction of task 1 (the matching puzzle) — shown in the prompt area below the top bar, replacing `H3Text`. Empty = the built-in default instruction stays. |
| `task1DoneText` | Single line text | Message shown when the matching puzzle is solved (replaces the old hardcoded "Grid complete!"). Shown in the Log; older messages may leave the panel as newer ones are added. Empty = no message. |
| `task2Text` | Single line text | Instruction of task 2 — shown in the prompt area below the top bar, like every other task instruction. Empty = nothing shown. |
| `task2DoneText` | Single line text | Message shown in the Log when task 2 is solved (added to the list of accomplished tasks). Empty = `CorrectText` (default "✔ Correct!") is added instead. |
| `task2Result` | Link to `GridShift` | The card(s) that solve task 2 (e.g. the Tractor, `GridShiftID` 75). The tutee **turns** the card(s) to the back on the finished board. Holds the Airtable **record id(s)** of the GridShift row(s); a plain `GridShiftID` is accepted too. Empty = the task has no solution (nothing to turn). The older names `SolutionTaskN`, `SolutionNextTask(N-1)` and `task(N-1)Result` are still accepted. |
| `task3Spoken` | Long text *(optional)* | The words that are **spoken aloud** in task 3. The words are spoken slowly and without commas (one word per line or separated by commas). The tutee turns the cards of the spoken words to the back. Empty = the task is solved by reading the instruction only. |
| `task3DoneBridge` | Single line text *(optional)* | The **bridge message** of task 3: it appears in the stack spot when task 3 is solved. It is a button — a tap on it returns the turned cards to the stack; when the next task is an intro task, its new cards wait for that tap. Empty = no bridge message. |
| `task4Text` | Single line text | Instruction of task 4 — shown in the prompt area below the top bar, like every other task instruction. Empty = nothing shown. |
| `task4Result` | Single line text | The **action** that finishes task 4 (currently `Each card needs to be moved on related tile`). It describes the action, it holds no card ids; the cards of the task are the ones of `TileRelated` (see "Intro tasks" below). |
| `task4DoneText` | Single line text | Message shown in the Log when task 4 is solved (added to the list of accomplished tasks). Empty = `CorrectText` (default "✔ Correct!") is added instead. |
| `task4Intro` | Single line text *(optional)* | The **intro marker** of task 4: it activates the intro step (the new cards are added to the board and have to be moved onto their tiles). Its text is **never shown** — only the fact that it is filled matters. Empty = task 4 is an ordinary task. |
| `task4IntroAction` | Single line text *(optional)* | What the intro step does (currently `TileRelated cards reserved in empty cells and revealed for the intro task.`). It is a description only — it is not shown on the page. Empty = the step still runs. Either of the two fields activates the intro step, so the marker may also be written here. Related cards are reserved in hidden cells at game start, then revealed for the intro task. |
| `WPIMG1` | URL | Subtle backdrop picture across the page and through the board gutters. Set at runtime as the `--wp-img` CSS custom property. Empty = no backdrop. |
| `WPIMG2` | URL | Slightly dimmed, top-aligned trophy picture that covers the whole grid area when every task is solved. The grid remains subtly visible through the translucent image. Empty = no picture, but the full grid still turns green. |
| `WrongCardText` | Single line text *(optional)* | Retained for compatibility; wrong turns now show a red mark on the selected card instead of text. |
| `WrongSpotText` | Single line text *(optional)* | Retained for compatibility; wrong drops now show a red mark on the selected cell instead of text. |
| `WrongProductText` | Single line text *(optional)* | Retained for compatibility; a product dropped on the wrong animal shows a red mark on that cell instead of text. |
| `CorrectText` | Single line text *(optional)* | Added to the Log when a task is solved and the variant row has no own done text (default: `✔ Correct!`). |
| `PartColour` | Single line text | Overall theme accent and deck badge dot. The color is darkened slightly for light-mode toolbar background; toolbar text and controls are white, with the theme toggle inverted for contrast. Accepts a palette name (`Blue`), a hex / `rgb()` / `hsl()` value, a plain CSS colour name, or `var(--color-x)`. Palette names map to the page's theme-aware vars (`--color-blue`, `--color-yellow`, `--color-green`, `--color-red`, `--color-orange`, `--color-purple`). Empty = `var(--color-red)`. |
| `NoParticipants` | Number | Number of players. Only `1` is supported so far — a higher value stops the game with an in-page error instead of silently running one deck. |
| `VarID` | Number | Variant id (not used by the game). |

### Multi-task flow (Pure Match)

The variant row turns the single matching puzzle into a **sequence of tasks**.
Task 1 is the matching puzzle itself; every further task is described by the
triple `taskNText` + `taskNResult` + `taskNDoneText` (N = the task number):

| Field | Task | Effect |
|---|---|---|
| `task1Text` | 1 (the matching puzzle) | The instruction shown in the prompt area below the top bar. |
| `task1DoneText` | 1 (the matching puzzle) | Green message in the Log when every card is placed. |
| `task2Text` | 2 | The instruction shown in the prompt area below the top bar. |
| `task2Result` | 2 | The GridShift card(s) that solve task 2. |
| `task2DoneText` | 2 | Green message when the last card of task 2 is turned. |
| `task3Text` / `task3Result` / `task3DoneText` / `task3Spoken` / `task3DoneBridge` | 3 | …and so on, as far as the row goes. |
| `task4Text` / `task4Result` / `task4DoneText` / `task4Intro` / `task4IntroAction` | 4 | The intro task — see "Intro tasks (`taskNIntro`)" below. |

- Task 1 (the matching puzzle) needs **no result field**: its result is
  inherent — the `Deck` checkbox on `GridShift` together with each card's
  `Display` text defines which imprint belongs to which card.
- The **instructions** (`taskNText`) replace the initial `H3Text` in the
  prompt area below the top bar. The instruction of the open task is always
  shown there.
- The **done messages** (`taskNDoneText`) accumulate in a separate Log panel
  the same size as the stack panel: below it in horizontal mode, beside it in
  vertical mode. They are left-aligned and newest-first; oldest messages are
  removed as needed so the panel never scrolls. Wrong answers show a red mark
  at the selected card/cell rather than text under the grid.
- The field names of the previous scheme (`DeckText`, `NextTaskN`,
  `TaskNAccText`, `NextTaskNAccText`, `SolutionTaskN`, `SolutionNextTaskN`,
  `task(N-1)Result`) are still accepted as fallbacks, so a row that was only
  partly renamed keeps working. As soon as the row holds one `taskNResult`
  field, the current scheme is used and **every task reads only its own
  result field** — no task inherits the result of the task before it.
- `taskNResult` is an Airtable **link** to the `GridShift` table, so it
  holds the record id(s) of the solution card(s). In Airtable the link is made
  from the card row's `GridShiftVariants` field (the Tractor, `GridShiftID` 75,
  links back to the "Pure Match" variant) and then shows up in the variant's
  `task2Result` field. The same card may serve more than one task (a card can
  answer several questions) — link it in each task's own result field.
- A task without an instruction (`taskNText`, `taskNSpoken` and `taskNIntro` all
  empty) does not exist: the game ends with the task before it.
- A task whose **result field names no card of the board** does not exist
  either: the result field of a turn task holds card ids, a text there (the
  description of an intro task) has no solution. Such a task is skipped — it
  shows no instruction, the game ends with the task before it and the tracker
  logs it (`task N: no solution cards`).
- The accomplished messages **accumulate**: every solved task adds its message
  to the green EVENT LOG. The newest messages appear at the top; older ones are
  removed as needed to avoid a scrollbar. The Log is below the stack in
  horizontal layout and beside it in vertical layout.
- The board turns **green only when every task is solved** (`.grid.done`): after
  the matching puzzle it stays in its normal colours, the green frame and the
  green completion background arrive with the last task.
- **Every task with a result is solved by turning the cards to the back** —
  there is no "click the right card" mechanic any more. The cards of
  `taskNResult` are turned one by one; a wrong card shakes and gets a red mark
  before turning back to the front, a right card stays turned and keeps its
  green frame (`.solved-cell`). The task ends when
  **all** of them are turned. **No rings are drawn on the other cells** — the
  board must stay free of blue overlays, the messages carry the feedback.
- Two traps make the click land on nothing, both handled in code:
  a matched card is normally inert (`.cell .flipCard.matched { pointer-events:
  none }`) and has to be woken up in turn mode (`.grid.turning …`), and the
  card (96×84) is smaller than its cell (104×92), so a click in the cell
  padding is resolved to the card that sits in that cell. The frame of the
  solved cell is drawn on the **cell**, not on the card - an outline on the
  card is swallowed by its 3D flip.
- Turning the last card of a task completes it, adds its message to the Log,
  replaces the prompt below the top bar and loads the next task (if the row
  has one). With no `taskNDoneText` configured, `CorrectText` (default
  "✔ Correct!") is added to the Log.
- A card that was turned **stays turned** for the rest of the game (it keeps
  its green frame). A card that was turned in an earlier task is therefore not
  part of a later task — remove it from the later `taskNResult`, otherwise the
  later task is already solved before the tutee does anything.

**Spoken tasks (`taskNSpoken`).** A task that carries spoken words is solved
by *turning* the spoken cards **to the back**:

- The words are read aloud slowly (web `SpeechSynthesis` rate 0.55, Tizen
  `tizen.tts` rate 0.55) and **without commas** — the field may hold one word
  per line or a comma-separated list; the commas are dropped and the words
  are spoken one after the other.
- The board stays **face-up**: the tutee has to see the words on the cards to
  know which card to turn.
- The tutee turns the cards of the spoken words to the back; the cards that
  have to be turned are the ones listed in `taskNResult`. A wrong card shakes,
  gets a red mark and turns back to the front; a right card stays turned and
  keeps its green frame. The task ends when **all** of them are turned.
- Tapping the task prompt below the top bar repeats the words.

**Bridge message (`taskNDoneBridge`).** A task that carries a bridge message
ends with a button in the **empty stack field**:

- When the task is solved, the text appears **centred horizontally and
  vertically in the stack field** (the dashed box next to the board, `.deck`
  grows to fit the text, `.bridgeText`).
- The bridge message is a **button**: a tap on it returns every turned card
  from the board **back into the stack**. The cards **stay turned** (face
  down) and are **discarded** from then on (`.flipCard.discarded` — they
  cannot be touched any more). The stack count shows them; their grid cells
  remain open.
- The bridge message disappears once it has been used, the stack field then
  holds the discarded cards.
- When the **next** task is an intro task, its new cards **wait for the tap**:
  the turned cards return to the stack first, then the new cards join the open
  cells.
- Exception: `task3DoneBridge` appears briefly in the H3 prompt line instead
  of the stack; its turned cards return to the stack automatically.

**Intro tasks (`taskNIntro`).** A task that carries an intro marker is not
solved by turning cards — it **adds new cards to the board** and asks the
tutee to move them onto the tile they belong to:

- The marker itself is **never shown**: only the fact that it is filled
  matters. The same is true for `taskNIntroAction`, which describes what the
  step does (it is not shown either). **Either of the two fields activates the
  step**, so the marker may also be written in `taskNIntroAction`.
- The **new cards** are the `GridShift` records that carry a `TileRelated`
  value: their cells are assigned randomly and reserved from the start; the
  product cards stay hidden until the intro task. A product card never overlays
  a cell that already contains another card.
  The grid adds rows if needed so every active card and related product has a
  unique cell.
- The **look** of a new card follows the `FillTileRelated` checkbox of its
  record: **checked** the picture fills the whole card and carries no word,
  **unchecked** the picture sits in a round with the word of the `Related`
  field underneath (e.g. `Milk`, `Cheese`) — like a normal card whose
  `FillTile` is not checked.
- The new cards are revealed **after** the bridge message of the previous
  task has been used: the tap on the bridge discards the turned cards first,
  then the product cards appear in their preassigned cells.
- The **tile** a new card belongs to is the card of the record the picture
  came from (the animal). The tutee **drags** the new card onto that tile; a
  wrong tile flashes red without showing text under the grid.
- A placed new card shrinks into the corner of its cell
  (`.flipCard.relatedPlaced`, 48×44 at the top left; a round picture shrinks
  to 22px and its word to 0.5rem) so that the animal and its product stay
  visible together, and the cell keeps its green frame (`.solved-cell`). The
  product's original grid cell remains in place.
- The task is done when **every** new card sits on its tile: the message of
  `taskNDoneText` joins the Log and the next task opens (the board
  turns green when there is none).
- `taskNResult` of such a task holds no card ids — it describes the action
  that finishes it ("Each card needs to be moved on related tile"). When it
  holds record ids anyway, only the named records are used.
- The **marker is the switch**: without `taskNIntro` the task is an ordinary
  task, and a result field that only holds a description has no solution — the
  task is then skipped (see the multi-task flow above).
- Only the records whose card lies on the board are used: a record without a
  tile on the board has nothing to be matched to. The grid reserves one empty
  cell for each active `TileRelated` asset, expanding rows when necessary.
- When **no** new card is available (no eligible record carries a
  `TileRelated` value), the intro step is skipped: the game goes on with the
  next task instead of waiting for a card that never comes.

**WPIMG1 backdrop.** The picture is a subtle, fixed CSS underlay across the
whole page, with a second layer over the board so it also shows through the
cell gutters and board padding. The cells stay opaque (they carry the imprints
and the placed bricks). When the board is finished its copy of the picture
fades to ~55% so the green completion colour (`.grid.done` → `--goal-bg`
background + `--good` border) reads at full strength. The board only reaches
that state when **every** task is solved. Tune with `--wp-opacity` (picture
strength) in the `:root` block.

### Airtable `GridShift` table schema

The minigame reads fields **by name**, not position. Note: for colour-only rows the
CSS colour variable arrives in `PrimaryColour` (not `Fill`) — the game accepts both.

| Field | Type | Purpose |
|---|---|---|
| `GridShiftID` | Autonumber | Stable per-brick id (also logs Turn/Place actions). |
| `Active` | Checkbox | Whether this brick is included in the game. Only checked cards are fetched, shuffled and dealt; the grid self-sizes to the checked count (see "Grid sizing" above). |
| `PM-Active` | Checkbox *(optional)* | Whether this brick is included in Grid Shift Pure Match; the variant uses every checked row and matches against `Display`. |
| `TileRelated` | URL *(optional)* | The picture of the product that belongs to this brick (the farm products). The intro task of the Pure Match variant turns it into a new card that the tutee has to move onto this brick. Empty = the brick takes part in no intro task. |
| `Related` | Single line text *(optional)* | The word of the product (e.g. `Milk`, `Cheese`). It is written under the picture of the new card of the intro task when `FillTileRelated` is not checked. Empty = the new card carries no word. |
| `FillTileRelated` | Checkbox *(optional)* | The look of the new card of the intro task: **checked** the product picture fills the whole card (no word), **unchecked** it sits in a round with the `Related` word underneath. Empty = not filled. |
| `TileName` | Single line text | Internal machine name (e.g. `Living-Room`). |
| `Display` | Single line text | Word shown on the brick front (e.g. `Lounge`) — falls back to `TileName`. |
| `Category` | Single line text | Grouping (Numbers, Clothes, Animals, Colours, Rooms, Directions) — currently unused by the UI. |
| `CategoryColour` | Single line text | Category accent (Beige/Blue/…) — currently unused. |
| `RenderMode` | Single line text | `cloudinary-img` (image front), `colour-only` (coloured circle), or `lucide-icon` (inline icon). |
| `TileFront` | URL *(optional)* | Front asset for `cloudinary-img` (absolute Cloudinary URL). |
| `TileBackA` | URL *(optional)* | Back art for the **Red** deck (left). Falls back to legacy `TileBack`. The Pure Match page uses `TileBack` and falls back to `TileBackA`. |
| `TileBackB` | URL *(optional)* | Back art for the **Orange** deck (right). |
| `Lucide` | Single line text *(optional)* | Any Lucide icon name for `lucide-icon` mode (e.g. `corner-right-down`, `rotate-cw`). Loaded at runtime from the CDN — no per-icon code needed. |
| `Stroke` | Number *(optional)* | Icon stroke width (2). It is applied to the icon via the CSS var `--icon-stroke`. |
| `IconSize` | Single line text *(optional)* | Icon size preset: `Small` (22px) / `Medium` (28px, default) / `Large` (36px) or a px value. Wired via a `--icon-size` CSS var on `.round`. |
| `PrimaryColour` | Single line text *(optional)* | Icon stroke colour (`#060606`) **or** the CSS colour var for `colour-only` (`var(--color-red)`). |
| `SecondColour` | Single line text *(optional)* | Lucide-only: second stroke colour rendered as a soft drop-shadow glow behind the icon stroke (any CSS colour, e.g. `#f97316` or `var(--color-orange)`). Empty = no glow. |
| `Frame` | Single line text *(optional)* | Shape of the asset frame (`.round`): `round` (default), `square`, `r10` (10px radius), a px/rem/% value, or empty. |
| `FrameSize` | Number *(optional)* | Frame diameter in px; empty = 48. |
| `FrameBorder` | Single line text *(optional)* | Full CSS border shorthand (e.g. `3px solid #ef4444`); empty = theme border (`lucide-icon` keeps a 0 border). Column not yet in Airtable — supported in code if added. |
| `FrameColour` | Single line text *(optional)* | Explicit frame fill background, overrides the mode default (incl. invert neutral); empty = auto. |
| `TextColour` | Single line text *(optional)* | Word colour on the brick front; empty = `var(--text)`. |
| `TextSize` | Single line text *(optional)* | Word size: `Small` / `Medium` (0.85rem, default) / `Large`, or a px/rem value. |
| `ColourOutsideFrame` | Checkbox *(optional)* | Invert colour placement: the frame stays neutral and the **card face** fills with `PrimaryColour` (colour-only / lucide-icon). Empty = colour stays inside the frame (current behaviour). |
| `FillTile` | Checkbox *(optional)* | Full-tile mode: the asset fills the whole brick face edge-to-edge and the word label is hidden (icon boosts to 52px). Works with all three render modes; overrides `Frame`/`FrameSize`/`FrameBorder` for that card. Empty = framed asset + label (default). The face keeps its 10px radius (`.frontFace.fulltile`) so filled and framed bricks share the same corner rounding. |
| `Fill` | Single line text *(optional)* | Colour-only frame background — any CSS colour (hex `#ef4444`, name `red`, or palette var `var(--color-red)`). Empty = falls back to `PrimaryColour`. |

- Shared CSS colour palette available to `Fill` / `PrimaryColour` (theme-aware vars):
  `--color-blue`, `--color-yellow`, `--color-green`, `--color-red`, `--color-orange`,
  `--color-purple`. Deck badges are Red `#ef4444` (left) and Orange `#f97316` (right).
- To add bricks: they already fill a 40-cell board; add/remove rows in Airtable
  and the decks + grid self-size (see "Grid sizing" above — valid counts are
  20 / 30 / 40 and the grid matches).
- The worker fetch is capped at 200 records — ample for the current 40.

## Handwriting Practice 02 (Airtable-powered)

`junior/others/handwriting-practice-02.html` is the Airtable-driven sibling of
`handwriting-practice-01.html`: the words and pictures are pulled from Airtable
at runtime instead of a hardcoded array. The writing check is the **same relaxed
algorithm** (max 6 strokes, 5% min coverage, word passes when at most one letter
is imperfect).

- The page fetches `GET /airtable?table=HandWriting` (allowlisted in the worker)
  and renders one writing pad per letter. Records without a `Text` value are
  skipped; words are shuffled (Fisher–Yates) at runtime.
- A word with a missing `Asset` shows a blank (neutral) picture block instead of
  a broken image.
- Loading and error states are in-page (`#loadingMsg` / `#errorMsg`) — Tizen-safe,
  no dialogs.

### Airtable `HandWriting` table schema

| Field | Type | Purpose |
|---|---|---|
| `WritingID` | Autonumber | Stable per-row id — not used by the app. |
| `Text` | Single line text | The word to write (e.g. `tree`). Required — rows without it are skipped. |
| `Asset` | URL *(optional)* | Picture hint (any absolute image URL, e.g. Cloudinary). Empty = blank placeholder. |

- Every row is included (no `Active` checkbox). Natural Airtable row order —
  the page shuffles anyway.

## Nimza's Reading List (Airtable-powered)

`breakthrough/tools/bt-study-hub.html` renders a reading list for the Breakthrough tutee, pulling content from Airtable at runtime (no hardcoded content).

- The page fetches `GET /airtable?table=BTStudyHub` from the tracker worker and renders one tappable card per record.
- It is responsive, has a dark-mode toggle (persisted in `localStorage["eebt-theme"]`, matching `updates.html`), and speaks each reading title via TTS (Tizen + Web Speech), consistent with the rest of the platform.
- Voice selection prefers smooth **female/natural** voices (Samantha, Google US English, Natural, Hazel, Aria…) via a scoring heuristic (`voiceScore()`), instead of blind `en-GB` first-match. Tizen uses OS TTS and ignores this.
- Not currently linked from `updates.html` (the Reading List row was removed until the page is confirmed working on-device). Re-add the link (class `nima-col`) once verified.

### Airtable `BTStudyHub` table schema

Simple, content-agnostic table. Column order in Airtable (autonumber first) is cosmetics-driven — the reader reads fields **by name**, not position:

| Field | Type | Purpose |
|---|---|---|
| `BTStudyHubID` | Autonumber | First column; only Airtable seems to require a unique first field. Not used by the reader. |
| `Title` | Single line text | Reading name shown on the card (also spoken via TTS). |
| `Subtitle` | Single line text *(optional)* | Short note under the title (scene label, programme theme, etc.). |
| `Background` | Single select *(optional)* | Card background fill (`Strong` / `Subtle` / `None`). `Strong` fills the card with the Nimza-purple accent (`var(--accent)`) with contrast-aware text — the "spotlight" card; `Subtle` fills the card with the soft violet tint (`var(--accent2)`). `None` or empty = default flat card. |
| `Border` | Single select *(optional)* | Card border (`Strong` / `Subtle` / `None`). `Strong` gives an accent-coloured border (3px `var(--accent)`); `Subtle` gives a soft violet-coloured border (3px `var(--accent2)`). `None` or empty = no border. |
| `Text` | Long text *(optional)* | Passage/paragraph. Cards with text get a **READ** button that opens the passage in an in-page modal (Tizen-safe) with a LISTEN button (chunked TTS). Used for story passages, the monthly programme overviews, and the profile template. |
| `AssetLink` | URL *(optional)* | Asset link — Cloudinary image/video, PDF, or external page. If it's an image, it's shown as a thumbnail; becomes the card's **OPEN** button. (Formerly named `Link`; the reader still accepts `Link`/`URL` as fallbacks.) |
| `LinkedProtocols` | Long text *(optional)* | One protocol URL per line (e.g. `https://mkmgo.github.io/EnglishExplorer/breakthrough/protocols/YYYY-MM-DD.html`). Each URL is rendered as a small thumbnail button in the read modal, at the bottom of the content just above the CLOSE/LISTEN buttons. Tapping a thumbnail opens the protocol in an in-modal viewer (iframe or image) with a MINIMIZE button that collapses it back to the thumbnail strip. |
| `DisplayOrder` | Number *(optional)* | Sort order (ascending, via the worker). Rows **without** a value sort to the **top** (Airtable orders empty numbers first); set it on every new row to control position. Whole numbers **10–99** render as full-width top-level chapters; a **decimal** (e.g. `10.1`, `10.2`) is a **subchapter** of the chapter formed by its integer part (`10`) — it sorts right after its parent and the card shifts right ~`clamp(14px, 2.5vw, 28px)` while its right edge stays aligned (e.g. `10, 10.1, 10.2, 11, 12...`). |

Both fields are independent and composable — any combination is supported (e.g. `Background: Strong` + `Border: Strong` = spotlight card with an accent ring). The retired legacy `Visual`/`Feature` field is no longer read. The card's READ (Content) button adapts to the combo: Strong background → inverted white fill; Subtle background or Strong border → outline (accent ring/text); Subtle border on a flat card → soft violet fill; flat cards keep the default accent-filled button.

- Only `Title` is required (`Text`/`AssetLink` optional, at least one recommended). The reader also accepts `Name`/`URL`/`Note`/`Passage` aliases.
- To add a reading: create a new row in the `BTStudyHub` table (same base as visitor tracking) with the title and the asset URL. No code change needed — the page updates on reload (meta tags force no-cache).
- The worker follows Airtable's offset pagination and returns up to 200 records (`maxRecords=200&pageSize=100`) — plenty for the current ~21; raise the cap if the table grows beyond that.

### Blocked Cloudinary assets

The `dp455m4rk` Cloudinary account requires **signed delivery** and returns `401` for anonymous image/video URLs (see `asset-cloud-issues.MD`). When adding asset links to `BTStudyHub`, use a working account (`dqwm4pdbz` / `dmkhsyfzf`) — i.e. re-upload any blocked assets to one of those and paste the working URL. The reader renders whatever `AssetLink` points to, so valid URLs just work.
