# Grid Shift — Variations & Options

## Current Architecture

Single Airtable table (`GridShift`) drives everything: card content, visual style, deck identity, and grid size.

**Flow:** Fetch all `Active` rows → `buildCard()` per record → `shuffle()` → deal evenly into two decks (Red left / Orange right) → `buildGrid()` sized to card count.

**Grid sizing** (`gridDimensions()`):

| Active cards | Grid | Cells |
|---|---|---|
| ≤ 20 | 5 cols × 4 rows | 20 |
| 21–30 | 6 cols × 5 rows | 30 |
| 31–40 | 8 cols × 5 rows | 40 |

Cells are 104×92px with 10px gap. Deck split: `Math.ceil(count / 2)` per deck.

---

## Fields That Drive Variation

| Field | What it controls | Variation potential |
|---|---|---|
| `Active` | Include/exclude card | Toggle count → grid size changes |
| `Category` | Grouping label | **Unused by UI** — opportunity for category zones |
| `CategoryColour` | Category accent | **Unused by UI** — could color grid cells |
| `RenderMode` | Image / colour / icon | Three visual styles per card |
| `TileBackA` / `TileBackB` | Deck back art | Different backs = team identity |
| `Frame` / `FrameSize` | Card face shape | Round, square, custom radius |
| `FrameBorder` / `FrameColour` | Card face border/fill | Override per card |
| `FillTile` | Full-bleed asset | Edge-to-edge image, no label |
| `ColourOutsideFrame` | Invert colour placement | Card face fills, frame neutral |
| `TextColour` / `TextSize` | Label styling | Per-card text control |
| `SecondColour` | Icon glow | Dual-tone icons |

---

## No-Code Variations (Airtable Only)

### Card count → grid size
Toggle `Active` on rows. Hit 20, 30, or 40 for a clean grid. Any count works but non-standard numbers may leave empty cells.

### Category theming
All animals, all food, all directions, etc. — just populate `Active` rows with one theme.

### Single-deck feel
Set `TileBackA` and `TileBackB` to the same image. Both decks look identical — feels like one split stack.

### Visual mix
Combine `cloudinary-img`, `colour-only`, and `lucide-icon` in one grid. Some cards show pictures, some show colours, some show icons — keeps the reveal surprising.

### Frame variety
Mix `round`, `square`, `r10` frames in the same grid. Add `FrameBorder` (e.g. `3px solid red`) to certain cards for emphasis.

### Full-tile + framed mix
Check `FillTile` on some cards (full-bleed images) and leave others as default (framed + label). The contrast makes the reveals more interesting.

---

## Territory zones (pre-defined cell colours)

Two optional tables alongside `GridShift` — the card table stays unchanged, and each optional table is fetched only if it exists:

| Table | Row = | Purpose |
|---|---|---|
| `GridShiftVariants` | A game mode | `Name`, `Active`, `GridSize` (overrides the auto grid), `CardLimit`, `ColourCells` |
| `GridShiftCells` | A pre-coloured cell | `CellID`, `Group`, `Colour`, `Active` |

`CellID` is a **virtual column address** — letter = column, digit = row (`A1` = col 0 / row 0, `C3` = col 2 / row 2) — so the same row set maps onto any grid size (5×4 / 6×5 / 8×5).

**Two-player territory rules:**
- Open board: any card may land in any empty cell.
- A player only **scores** when their card lands in a cell of their own zone (`Group 1` ↔ Red deck, `Group 2` ↔ Orange deck).
- The cell tints with its zone colour on a scored placement.
- Grid completes when both decks are empty → higher score wins (tie = draw).

No active variant or no cells configured → current behaviour (auto-sized grid, neutral colouring) is preserved.

**Why a second table is necessary (cards stay in one):** the cards are one table, but zone data is **per-cell, not per-card** — a `GridShift` row is a card, and there is no clean place on a card row to say "A1 is red". Avoiding a second table means either cramming cell→colour pairs into a long-text field (`"A1:red,A2:red,..."`) — fragile and un-Airtable — or deriving zones from a formula, which loses the arbitrary "this exact cell is red". A dedicated `GridShiftCells` table (one row per cell) is the natural fit. The variant config (`GridShiftVariants`) is the only piece that could realistically be folded away (it could be a handful of fields on a single "settings" row), but a small third table keeps it clean and extensible — so the floor is **1 card table + 1 cells table**.

---

## Code-Change Variations

### 1. Flexible grid breakpoints
Expand `gridDimensions()` to handle more counts:

```
10 → 5×2   15 → 5×3   20 → 5×4   25 → 5×5
30 → 6×5   35 → 7×5   40 → 8×5   50 → 10×5   60 → 10×6
```

Currently anything > 40 falls into 8×5 — would need a cap or larger grid.

### 2. Single-deck mode
Collapse UI to one stack. Simpler for younger players or quick rounds. One deck badge, one count.

### 2b. Single vs two card sets — where the switch lives
Keep **one** `GridShift` card table; the variant declares the deck count:

| Field | 1-player | 2-player (today) |
|---|---|---|
| `DeckCount` | `1` | `2` |
| `DeckName` / `DeckColour` | `Red` / `#ef4444` | `Red` + `Orange` |
| `GridSize` | `20` | `40` |
| `ColourCells` | off | on |

The page renders 1 or 2 deck panels from the active `GridShiftVariants` row. Deal: `DeckCount = 2` → today's random even split (`Math.ceil(count / 2)`); `DeckCount = 1` → all cards to deck A.

**Deck arrangement options:**
- **A. Random shuffle + even split (today)** — both decks mix every category.
- **B. Fixed assignment** — optional `Deck` field on card rows (`A` / `B` / blank = whichever); pins a card to a deck, useful for crafted match-ups (e.g. the fox's deck visibly different).

Lean: keep random split as the default; treat a filled `Deck` field as an **override**, never a break.

### 3. Category zones
Use `Category` + `CategoryColour` to color grid regions. E.g. first 10 cells green (animals), next 10 blue (food). Players learn to group by category.

### 3b. Encoding "cell A1 is red" — four options
1. **Grid reference in `CellID`** (`A1`, `Group`, `Colour`) — one row per cell, portable across grid sizes, needs authoring per cell.
2. **Named zones + membership** — a `Zone` row with colour; cells belong to a zone. Ambiguous without a rule (contiguous? every other?).
3. **Claim-at-runtime** — neutral grid; cells get colour from whoever places there. No cell data, but not pre-defined zones.
4. **Formula zones** — zone by rule: `Columns A–D → Red`, `Rows 3–5 → Orange`. One row defines a whole territory; weakest for irregular layouts.

Preference: **1** now, **4** later if authoring dozens of cell rows proves tedious.

### 4. Placement rules
Require cards to land in matching-category cells. Wrong placement → card snaps back. Adds puzzle logic on top of the flip mechanic.

### 5. Difficulty tiers
- **Easy:** 20 cards (5×4), no placement rules
- **Medium:** 30 cards (6×5), category zones
- **Hard:** 40 cards (8×5), placement rules enforced

### 6. Multi-round
Load card subsets by `Category` or a new `Round` field. Complete one round → next batch loads. Adventure progression.

### 7. Memory-match variant
Don't show the front on flip — keep it hidden until placed. Player must remember where they saw a card. Two翻 attempts to match pairs.

### 8. Timed mode
Countdown timer. Points for speed. Bonus for completing without wrong placements.

---

## Adventure Game — New Fields to Consider

Fields that don't exist yet but would unlock adventure mechanics:

| New Field | Type | Purpose |
|---|---|---|
| `Difficulty` | Single select | Easy / Medium / Hard — filter which cards load per round |
| `Round` | Number | Which round this card belongs to (multi-round play) |
| `MatchTarget` | Single line text | Cell ID or zone this card must go to (placement rules) |
| `StoryGroup` | Single line text | Group cards into story chapters or quest stages |
| `RewardURL` | URL | Image/audio shown when the card is placed correctly |
| `Points` | Number | Score value per card |
| `FlipReveal` | URL | Alternative asset shown on flip (hint image before full reveal) |

---

## Adventure Theme Ideas

Same `GridShift` table, reskinned UI:

- **Dungeon doors:** Deck backs are locked doors, flipping reveals what's behind. Grid is a dungeon map.
- **Treasure chests:** Decks are chests, grid cells are map spots. Place the right treasure in the right location.
- **Story chapters:** Each category = a chapter. Complete one category to unlock the next (progressive unlock like mystery-base).
- **Quest board:** Grid cells are quest slots. Cards are quest items. Match item to quest for points.

---

## Field Usage Quick Reference

Currently read by `buildCard()` in `mb-grid-shift.html`:
```
GridShiftID, Active, TileName, Display, RenderMode,
TileFront, TileBackA, TileBackB, Lucide, Stroke,
IconSize, PrimaryColour, SecondColour, Frame, FrameSize,
FrameBorder, FrameColour, TextColour, TextSize,
ColourOutsideFrame, FillTile, Fill
```

Documented in AGENTS.md but **not read by UI**:
```
Category, CategoryColour
```

These two are free for new features — no backwards-compat risk.

---

## Open Decisions

Still to be settled before territory zones are implemented:

1. **Deck arrangement** — random split (today) / fixed `Deck` override / both?
2. **1-player win condition** — complete grid / fill all own-zone cells / reach a `TargetScore` from the variant?
3. **Zone layout symmetry** — does the second player get a mirror zone, or an asymmetric layout (e.g. Red spans the middle, Orange cornered)?
