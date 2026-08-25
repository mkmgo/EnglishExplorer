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
├── junior/                     <-- Ages 6-9 ecosystem
│   ├── thematic/               <-- Thematic lesson decks
│   │   ├── animals.html
│   │   ├── toys-things.html
│   │   ├── my-family-my-classroom.html
│   │   └── new-numbers.html
│   └── minigames/              <-- Highly gamified mini-games (formerly /Features)
│       ├── abc-world.html
│       ├── mystery-base.html
│       ├── mystery-phrases.html
│       ├── new-words-wizard.html
│       ├── unlock-mystery.html
│       └── unlock-mystery-plus.html
├── breakthrough/               <-- Older pupils (EEBT - Advanced / Breakthrough)
│   ├── protocols/              <-- Daily Protocols (YYYY-MM-DD.html)
│   └── tools/                  <-- Standalone utility collection (formerly EEBTools/)
│       ├── eebt-tools.html
│       └── eebt-translator.html
└── archive/                    <-- Older versions and backups for mobile/Tizen testing
    └── develop.html
```

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
- Existing product display names are unaffected — only file names are constrained (e.g. the tools stay "EEBTools" on screen while the files are `eebt-tools.html` / `eebt-translator.html`).

## Global visitor tracking (Airtable)

- **Approved exception to "self-contained files"**: `config.js` and `tracker.js` live in the repo root and are linked from **every** HTML page (including new ones) via `<script src>` right before `</body>`, with the correct relative prefix:
  - Root pages (`index.html`, `advanced.html`, `dev.html`, `updates.html`): `src="config.js"`
  - One level deep (`archive/`): `src="../config.js"`
  - Two levels deep (`junior/...`, `breakthrough/...`): `src="../../config.js"` (and same for `tracker.js`)
- `config.js` holds the Airtable Base ID, PAT, and table name (`SiteVisitorLogs`). It contains secrets and is **gitignored** — never commit it.
- `tracker.js` exposes `logActivity(pupil, pagePath, section, actionType, details)` and auto-logs a `Page_View` on every page load. Reuse it for custom events instead of writing new fetch calls.

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
