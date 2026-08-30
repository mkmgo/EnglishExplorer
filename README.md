# English Explorer

Offline-friendly English lessons for young learners, built as fully self-contained HTML files (inline CSS/JS, no external libraries, media served from Cloudinary). Works on desktop, mobile, and Tizen smart TVs.

## Layout

```
EnglishExplorer/
├── index.html                  <-- Stable, production-ready release
├── advanced.html               <-- Active sandbox / current development version
├── README.md                   <-- This file
├── AGENTS.md                   <-- Dev conventions for AI coding agents
├── junior/                     <-- Ages 6-9 ecosystem
│   ├── thematic/               <-- Thematic lesson decks
│   │   ├── animals.html        <-- "Animals" themed lesson
│   │   └── toys-things.html    <-- "Toys and Things (Scholar)" themed lesson
│   └── minigames/              <-- Highly gamified mini-games (formerly /Features)
│       └── unlock-mystery.html <-- "Unlock Mystery" 1:1 English game
├── breakthrough/               <-- Older pupils (EEBT - Advanced / Breakthrough)
│   └── tools/                  <-- Standalone utility collection (formerly EEBTools/)
│       ├── spotlight-pro.html  <-- SpotlightPro presenter tool hub
│       └── eebt-translator.html <-- Standalone translator
└── archive/                    <-- Older versions and backups for mobile/Tizen testing
    └── develop.html            <-- Superseded dev version; keep for reference/testing
```

## How to use

1. Open any file directly in a modern desktop browser to test.
2. For a Samsung Tizen TV, host this folder on a web server and open the URL in the TV browser.
3. Lessons are designed for 16:9 full-screen use; navigate with the on-screen NEXT/BACK buttons or a keyboard.
4. No external JavaScript libraries or web fonts are used. Speech uses the Web Speech API; Tizen browser support varies by model/year — if unavailable, the visual lesson still works and the teacher can model pronunciation.
5. Lessons are intentionally teacher-led: the screen supports the tutor rather than replacing the tutor.

## Versioning

- `index.html` is the stable, production-ready release.
- `advanced.html` is the active sandbox where new work happens; promote it to `index.html` once stable.
- `archive/` holds superseded versions for testing; do not use them as the base for new work.
