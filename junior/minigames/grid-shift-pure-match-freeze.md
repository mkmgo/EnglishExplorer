# Grid Shift Pure Match — Freezing the Airtable-driven setup

## Why freeze?

`md-grid-shift-pure-match.html` reads **everything from Airtable on every page
load**. The game works, but its content and even its validity depend on the
live state of two tables:

| Live input | What a later Airtable edit does to the next page load |
|---|---|
| `GridShiftVariants` → `Pure Match` row | Editing `Deck`, `GridDimension`, `Hints` or `Placing` changes (or breaks — the page throws on unsupported values) the game silently. Deleting the row = "Expected one Pure Match setup; found 0." |
| `GridShift` → rows checked in the Deck field (`PM-Active`) | Unchecking a card shrinks the deck (and may auto-resize the grid); checking new cards can exceed the grid; editing `Display` changes the match text and imprint mid-set. |
| `GridShift` row deletion / `Active` data cleanup | Cards vanish between sessions with no record of what the game looked like yesterday. |

A session already loaded is safe (data is fetched **once** per load), so the
risk is always *the next* load: a lesson prepared today can silently become a
different game tomorrow because someone tidied the base.

**Goal:** ship a *frozen snapshot* of the fully-resolved game inside the HTML
file, so the released page is stable and reproducible, while Airtable remains
the authoring tool — edits there only change the game when you explicitly
re-freeze.

---

## Current mechanics (what gets frozen)

Load-time pipeline in `md-grid-shift-pure-match.html`:

```
GET /airtable?table=GridShiftVariants   ──┐
GET /airtable?table=GridShift           ──┤
                                          ▼
1. Pick the one row where VarName = "Pure Match"
2. Validate settings:  Hints = "Imprints of Display (Text)"
                       Placing = "Random"
                       Deck    = <checkbox field name>  (e.g. "PM-Active")
                       DeckCount = "Variable"
3. Filter GridShift rows where <Deck> checkbox is checked
4. Per card: read Display (match text) + all render fields → buildCard()
5. parseGridDimension() → cols × rows (must hold every card)
6. shuffle(cards) → deck;  shuffle(cell slots) → random imprint placement
7. render + gamepad bridge (unchanged by this proposal)
```

**Freeze point:** after step 5 (everything validated and resolved), **before**
step 6 (shuffle). Shuffling and imprint placement stay random per load — the
frozen game still plays differently each time, it just always uses the *same
cards, text and grid*.

Notes from the mechanics check:

- The two fetches happen once at startup; a mid-session Airtable edit cannot
  disturb a running game. The freeze only guards *future loads*.
- The worker caps fetches at 200 records — a snapshot inherits that limit only
  if it was captured through the same endpoint (ample for the current deck).
- `Placing` only supports `Random`; anything else throws. Frozen mode keeps
  this constraint (the snapshot stores the validated value, not raw Airtable
  text, so an unsupported value can never sneak in unnoticed).

---

## Design: embedded snapshot (Option A)

### Marker block in the HTML

The snapshot lives inside the page between marker comments, keeping the file
fully self-contained (per the repo's no-cross-file-dependency rule):

```html
<script>
  /* === PURE_MATCH_SNAPSHOT:BEGIN === */
  var PURE_MATCH_SNAPSHOT = {
    schemaVersion: 1,
    frozenAt: "2026-10-15T12:00:00Z",
    source: "GridShiftVariants:Pure Match / GridShift:PM-Active",
    settings: {
      deckField: "PM-Active",
      deckCount: "variable",
      gridDimension: "4x5",
      cols: 5,
      rows: 4,
      placing: "random",
      hintField: "Display",
      hintLabel: "Imprints of Display (Text)"
    },
    cards: [
      { id: 23, match: "lounge", imprint: "Lounge", fields: { /* raw Airtable fields */ } },
      { ... }
    ]
  };
  /* === PURE_MATCH_SNAPSHOT:END === */
</script>
```

### Snapshot schema

| Key | Type | Purpose |
|---|---|---|
| `schemaVersion` | number | Bump if the snapshot format ever changes; the loader rejects unknown versions with a clear message. |
| `frozenAt` | ISO string | When the snapshot was captured (shown in dev/live indicator). |
| `source` | string | Human-readable provenance of the two tables. |
| `settings.deckField` | string | Checkbox field name used to select cards (e.g. `PM-Active`). |
| `settings.deckCount` | string | Must be `variable` — validated at capture time. |
| `settings.gridDimension` | string | Original Airtable value (e.g. `4x5`) for provenance. |
| `settings.cols` / `settings.rows` | number | **Pre-resolved** grid size — no re-parsing needed at load. |
| `settings.placing` | string | `random` (validated at capture). |
| `settings.hintField` / `settings.hintLabel` | string | Validated hint config (always `Display` / `Imprints of Display (Text)` for this page). |
| `cards[].id` | number/string | `GridShiftID` (or `TileName`) — used for Turn/Place tracking. |
| `cards[].match` | string | Normalised `Display` value (lowercase/trimmed) — the `data-match` key. |
| `cards[].imprint` | string | Display text as shown on the cell imprint. |
| `cards[].fields` | object | **Raw Airtable `fields`** of the card — fed straight into the existing `buildCard(record, matchText)`, so every render option (Frame, FillTile, Lucide, colours…) keeps working untouched. |

Capturing the *raw* `fields` (rather than a flattened subset) is deliberate:
`buildCard()` already knows how to render every field combination, so the
frozen path reuses it with zero duplication and never drifts from the live
path.

### Mode selection

| Mode | Trigger | Behaviour |
|---|---|---|
| **Frozen (default)** | normal URL | Build the game from `PURE_MATCH_SNAPSHOT`. No network fetch at all — works offline / on Tizen even if the worker is down. |
| **Live (authoring)** | `md-grid-shift-pure-match.html?live=1` | Today's exact Airtable path — fetch, validate, render. Airtable input mechanics remain fully valid and testable. |

Both modes converge on the **same** internal pipeline:
`startGame(resolvedSettings, cardRecords)` → validate → `buildCard()` →
`buildGrid()`. Only the *source* of `resolvedSettings` + `cardRecords`
differs.

A small on-page indicator (e.g. the `#feedback` line at startup, or a corner
badge) should show which mode is active — `Frozen 15/10/2026` vs
`LIVE from Airtable` — so a teacher can never be confused about which content
is on screen.

### Failure behaviour

| Situation | Result |
|---|---|
| Snapshot missing / `null` / unknown `schemaVersion` in frozen mode | In-page message: "No frozen snapshot — open with ?live=1 to load from Airtable or re-freeze." No dialogs (Tizen-safe). |
| `?live=1` but worker/Airtable fails | Existing `showLoadError()` behaviour, plus a hint that the frozen default has no such dependency. |
| Snapshot fails internal validation (e.g. cards > cells) | Reject at load with the specific message — a bad paste must never render a half-broken board. |

---

## Refresh workflow (re-freezing)

Airtable stays the authoring surface. The loop is:

1. Edit content/settings in Airtable as usual.
2. Open the game with `?live=1` and confirm it plays as wanted.
3. On that same page, paste the **capture snippet** (below) into the browser
   devtools console. It re-runs the page's own validations and prints the
   complete snapshot JSON.
4. Paste the output between the `PURE_MATCH_SNAPSHOT:BEGIN/END` markers in
   the HTML (replacing the old object), commit, deploy.
5. Normal (frozen) loads now serve the new content — until the next re-freeze.

> Works equally from the Tizen browser's devtools or desktop Chrome; the
> snippet only uses the same public worker endpoint the page already calls.

### Capture snippet (copy-paste into the devtools console)

```js
(async function freezePureMatch() {
  const W = "https://english-explorer-tracker.mkmueller-mission.workers.dev/airtable?table=";
  const j = async (t) => (await fetch(W + encodeURIComponent(t))).json();

  // -- helpers, identical semantics to the page -------------------------
  const nk = (n) => String(n || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const gf = (f, n) => { const w = nk(n); const k = Object.keys(f || {}).find(x => nk(x) === w); return k ? f[k] : undefined; };
  const gs = (f, a, p) => {
    for (const n of a) { const v = gf(f, n); if (v !== undefined) return v; }
    if (p) { const wp = nk(p); const k = Object.keys(f || {}).find(x => nk(x).indexOf(wp) === 0); if (k) return f[k]; }
    return undefined;
  };
  const checked = (v) => ["true","1","checked","on","yes"].includes(String(v ?? "").trim().toLowerCase());
  const dim = (v, n) => {
    const t = String(v || "").trim().toLowerCase();
    const m = /^(\d+)\s*[x×]\s*(\d+)$/.exec(t);
    if (m) return { rows: +m[1], cols: +m[2] };
    if (t === "variable" || t === "auto") {
      if (n <= 20) return { cols: 5, rows: 4 };
      if (n <= 30) return { cols: 6, rows: 5 };
      if (n <= 40) return { cols: 8, rows: 5 };
      const c = Math.ceil(Math.sqrt(n)); return { cols: c, rows: Math.ceil(n / c) };
    }
    if (/^\d+$/.test(t)) {
      const c = +t;
      if (c === 20) return { cols: 5, rows: 4 };
      if (c === 30) return { cols: 6, rows: 5 };
      if (c === 40) return { cols: 8, rows: 5 };
      const cc = Math.ceil(Math.sqrt(c)); return { cols: cc, rows: Math.ceil(c / cc) };
    }
    throw new Error("GridDimension must be a cell count or rows x columns.");
  };

  // -- same validation chain as the page --------------------------------
  const [vr, cr] = [await j("GridShiftVariants"), await j("GridShift")];
  const variants = (vr.records || []).filter(r => {
    const f = r.fields || {};
    return nk(gs(f, ["VarName", "Name"])) === "purematch" &&
           (gf(f, "Active") === undefined || checked(gf(f, "Active")));
  });
  if (variants.length !== 1) throw new Error("Expected one Pure Match setup; found " + variants.length + ".");

  const s = variants[0].fields || {};
  const hint = /^imprints?\s+of\s+(.+?)\s*\(\s*text\s*\)$/i.exec(String(gs(s, ["Hints", "Hint"]) || "").trim());
  if (!hint || nk(hint[1].trim()) !== "display") throw new Error("Hint must be 'Imprints of Display (Text)'.");
  if (nk(gf(s, "Placing")) !== "random") throw new Error("Only Placing = Random is supported.");
  const deckField = gf(s, "Deck");
  if (typeof deckField !== "string" || !deckField.trim()) throw new Error("Missing Deck field name.");
  if (String(gf(s, "DeckCount") || "").trim().toLowerCase() !== "variable") throw new Error("DeckCount must be Variable.");

  const cards = (cr.records || []).filter(r => checked(gf(r.fields || {}, deckField.trim())));
  if (!cards.length) throw new Error("No cards checked in '" + deckField + "'.");

  const d = dim(gs(s, [], "GridDimension"), cards.length);
  if (d.cols * d.rows < cards.length) throw new Error("Grid holds " + (d.cols * d.rows) + " cells < " + cards.length + " cards.");

  const snap = {
    schemaVersion: 1,
    frozenAt: new Date().toISOString(),
    source: "GridShiftVariants:Pure Match / GridShift:" + deckField.trim(),
    settings: {
      deckField: deckField.trim(),
      deckCount: "variable",
      gridDimension: String(gs(s, [], "GridDimension") || ""),
      cols: d.cols, rows: d.rows,
      placing: "random",
      hintField: "Display",
      hintLabel: "Imprints of Display (Text)"
    },
    cards: cards.map(r => {
      const f = r.fields || {};
      const imprint = gf(f, "Display");
      if (typeof imprint !== "string" || !imprint.trim())
        throw new Error("A card is missing Display text (id " + (f.GridShiftID || "?") + ").");
      return { id: f.GridShiftID || f.TileName || "", match: imprint.trim().toLowerCase(), imprint: imprint.trim(), fields: f };
    })
  };

  console.log(JSON.stringify(snap, null, 2));
  alert("Snapshot OK: " + snap.cards.length + " cards, " + d.cols + "x" + d.rows +
        " grid. JSON printed to console — paste it between the PURE_MATCH_SNAPSHOT markers.");
})();
```

---

## Implementation prompts

Ready-to-paste prompts (one per step, in order) for carrying out this
proposal. Each step is independently verifiable.

### Step 1 — Add the snapshot marker block

> In `junior/minigames/md-grid-shift-pure-match.html`, add a new inline
> `<script>` block immediately before the main game script containing a
> marker-delimited snapshot constant:
>
> ```js
> /* === PURE_MATCH_SNAPSHOT:BEGIN === */
> var PURE_MATCH_SNAPSHOT = null; /* filled by the freeze workflow */
> /* === PURE_MATCH_SNAPSHOT:END === */
> ```
>
> Do not change any other code in this step. The markers must be exact and
> stable so the capture workflow (Step 4's doc) can reference them. Follow
> the file's existing style (ES5 `var`, no comments beyond the markers).

### Step 2 — Split the loader into frozen / live modes on one pipeline

> In `junior/minigames/md-grid-shift-pure-match.html`, refactor the startup
> logic so both data sources feed one shared pipeline:
>
> 1. Extract the current post-fetch work — variant validation, deck
>    filtering, `buildCard()` per record, `parseGridDimension()`,
>    `buildGrid()`, `refreshDecks()` — into a function
>    `startGame(resolved, cardRecords)` with no fetching inside.
> 2. `startFromLive()` keeps today's exact `Promise.all([fetchTable(...),
>    fetchTable(...)])` chain, performs the existing validations, then calls
>    `startGame()`.
> 3. `startFromSnapshot(snap)` validates `snap.schemaVersion === 1`,
>    re-checks the invariant `settings.cols * settings.rows >= cards.length`
>    and non-empty `cards`, maps `snap.cards` to
>    `{ fields: c.fields }` records for `buildCard(c.fields, c.imprint)`,
>    then calls `startGame()` with the pre-resolved cols/rows.
> 4. Mode switch: `?live=1` in `location.search` → `startFromLive()`,
>    otherwise `startFromSnapshot(PURE_MATCH_SNAPSHOT)`. A missing/null/unknown
>    snapshot must show an in-page message (reuse `showLoadError`-style
>    output in `#feedback`/deck area — **no** `window.prompt`/`confirm`,
>    Tizen-safe) telling the user to open with `?live=1` or re-freeze.
> 5. Show a small mode indicator on load: `LIVE from Airtable` or
>    `Frozen <frozenAt date>` — e.g. in `#feedback` at startup or a corner
>    badge. Frozen mode must issue **zero** network requests for game data
>    (tracker.js still logs as usual).
>
> Shuffle, imprint placement, drag & drop, wrong-target feedback, the
> gamepad bridge and the theme toggle must behave identically to before in
> both modes.

### Step 3 — Validate the refactor against both modes

> Verify `junior/minigames/md-grid-shift-pure-match.html` end-to-end:
>
> 1. **Frozen mode (default URL):** game renders from a populated snapshot
>    with the worker unreachable (block the worker URL or go offline) — deck,
>    grid, imprints, flip, drag-to-match, wrong-target flash, completion
>    state and PS4 cursor all work; no game-data network requests in devtools.
> 2. **Snapshot absent (`PURE_MATCH_SNAPSHOT = null`):** in-page message
>    appears, no dialogs, no JS errors in console.
> 3. **Live mode (`?live=1`):** identical behaviour to the pre-refactor
>    page against the real worker; mode indicator reads `LIVE`.
> 4. **Bad snapshot** (cards.length > cols*rows or wrong schemaVersion):
>    rejected with a specific in-page message before any rendering.
> 5. Both `cloudinary-img` and `lucide-icon` cards render from snapshot
>    `fields` exactly as from live records (Lucide icons still swapped in
>    via `renderIcons()`).
> 6. No new external libraries; file stays self-contained; `tracker.js`
>    still linked as `../../tracker.js`.

### Step 4 — Document the freeze workflow

> Add the re-freezing workflow to
> `junior/minigames/grid-shift-pure-match-freeze.md` (this file) — capture
> snippet, marker paste location, commit step — and add a short "Frozen by
> default, `?live=1` for authoring" note to the Pure Match section of
> `AGENTS.md` next to the existing Grid Shift Pure Match paragraph, linking
> to this document. Also mention the doc in
> `junior/minigames/grid-shift-variations.md` under the variant-settings
> section.

### Step 5 — First freeze (release run)

> Perform the first actual freeze: open
> `md-grid-shift-pure-match.html?live=1`, run the capture snippet from
> `grid-shift-pure-match-freeze.md` in the devtools console, paste the
> printed JSON between the `PURE_MATCH_SNAPSHOT:BEGIN/END` markers (replacing
> `null`), reload the default URL and confirm the game plays identically to
> live mode. Commit the updated HTML together with the doc.

---

## Alternatives considered (not chosen)

| Option | Idea | Why not (now) |
|---|---|---|
| **B — Worker/KV snapshot** | `GET /airtable/snapshot?game=...` served from Cloudflare KV; protected `POST` freezes current Airtable state on demand. Refresh without committing HTML. | Real value, but adds a KV binding, an admin secret and sync endpoints to the worker — more moving parts than needed for a single game. Good **future upgrade**: the snapshot schema defined here is exactly what KV would store, so A→B is additive, not a rewrite. |
| **C — Airtable freeze field** | `Frozen` checkbox + `Snapshot` long-text column on the variant row; page prefers the blob when checked. | Airtable long-text caps at 100k chars (tight for 40 rich cards), JSON editing in the Airtable UI is error-prone, and the raw `GridShift` rows would still be live unless fully duplicated into the blob. |
| **D — "Backend page per game"** (separate config JSON fetched at runtime) | A generated `pure-match.config.json` next to the HTML. | Clean separation, but introduces a cross-file dependency — the repo's self-contained-file rule forbids it unless treated as a deliberate refactor. The embedded marker block achieves the same separation *inside* the file with zero rule changes. |

## Out of scope (for now)

- Applying the freeze pattern to `mb-grid-shift.html`,
  `handwriting-practice-02.html` or `bt-study-hub.html` — the schema here is
  game-specific; a general pattern would need its own design pass.
- Worker/KV snapshot endpoint (Option B).
- Snapshot diffing/versioning beyond `schemaVersion` + `frozenAt`.
