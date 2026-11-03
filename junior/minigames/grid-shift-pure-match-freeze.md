# Grid Shift Pure Match — Freezing the Airtable-driven setup

## Why freeze?

`mb-gs-pure-match.html` reads **everything from Airtable on every page
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

Load-time pipeline in `mb-gs-pure-match.html`:

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
    variantFields: { /* raw Pure Match variant settings and task data */ },
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
      { id: 23, recordId: "rec...", match: "lounge", imprint: "Lounge", fields: { /* raw Airtable fields */ } },
      { ... }
    ],
    systemRecords: [ /* raw GridShiftSystem records */ ]
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
| `variantFields` | object | **Raw Airtable fields** of the Pure Match variant row, including all task text, linked result ids, images, and the `FreezeVariant` value. These settings are needed to reproduce the complete multi-task game offline. |
| `cards[].id` | number/string | `GridShiftID` (or `TileName`) — used for Turn/Place tracking. |
| `cards[].recordId` | string | Airtable record id used to resolve task result links and intro-card relationships. |
| `cards[].match` | string | Normalised `Display` value (lowercase/trimmed) — the `data-match` key. |
| `cards[].imprint` | string | Display text as shown on the cell imprint. |
| `cards[].fields` | object | **Raw Airtable `fields`** of the card — fed straight into the existing `buildCard(record, matchText)`, so every render option (Frame, FillTile, Lucide, colours…) keeps working untouched. |
| `systemRecords` | array | Raw `GridShiftSystem` records for the target-box / event-log configuration and game sounds. This keeps frozen mode independent from all game-data tables. |

Capturing the *raw* `fields` (rather than a flattened subset) is deliberate:
`buildCard()` already knows how to render every field combination, so the
frozen path reuses it with zero duplication and never drifts from the live
path.

### Mode selection

| Mode | Trigger | Behaviour |
|---|---|---|
| **Frozen (default)** | normal URL | Build the game from `PURE_MATCH_SNAPSHOT`. No Airtable game-data table requests — it can start even if the worker is down. Cloudinary media and the approved Lucide CDN still require connectivity. |
| **Live (authoring)** | `mb-gs-pure-match.html?live=1` | Fetches `GridShiftVariants`, `GridShift`, and `GridShiftSystem` from Airtable, validates, and renders. Airtable input mechanics remain fully valid and testable. |

Both modes converge on the **same** internal pipeline:
`startGame(resolvedSettings, cardRecords)` → validate → `buildCard()` →
`buildGrid()`. Only the *source* of `resolvedSettings` + `cardRecords`
differs.

The top-bar badge shows `Frozen YYYY-MM-DD` or `LIVE from Airtable`, so a
teacher can never be confused about which content is on screen.

### Failure behaviour

| Situation | Result |
|---|---|
| Snapshot missing / `null` / unknown `schemaVersion` in frozen mode | In-page message: "No frozen snapshot — open with ?live=1 to load from Airtable or re-freeze." No dialogs (Tizen-safe). |
| `?live=1` but worker/Airtable fails | Existing `showLoadError()` behaviour, plus a hint that the frozen default has no such dependency. |
| Snapshot fails internal validation (e.g. cards > cells) | Reject at load with the specific message — a bad paste must never render a half-broken board. |

---

## Refresh workflow (re-freezing)

Airtable stays the authoring surface. The loop is:

1. Edit content/settings in Airtable as usual. Leave `FreezeVariant` unchecked
   while developing; open the game with `?live=1` to see those changes.
2. Open the game with `?live=1` and confirm it plays as wanted.
3. Check `FreezeVariant` on the `Pure Match` row in Airtable.
4. On that same page, paste the **capture snippet** (below) into the browser
   devtools console. It refuses to capture unless `FreezeVariant` is checked,
   re-runs the game validations, and prints the complete snapshot JSON.
5. Paste the output between the `PURE_MATCH_SNAPSHOT:BEGIN/END` markers in
   `mb-gs-pure-match.html` (replacing the old object), commit, deploy.
6. Normal (frozen) loads now serve the new content without fetching game data.
   To return to authoring, uncheck `FreezeVariant` and use `?live=1`; the
   checkbox is a capture/release guard, not a runtime network switch.

> Works equally from the Tizen browser's devtools or desktop Chrome; the
> snippet only uses the same public worker endpoint the page already calls.

### Capture snippet (copy-paste into the devtools console)

```js
(async function freezePureMatch() {
  const W = "https://english-explorer-tracker.mkmueller-mission.workers.dev/airtable?table=";
  const j = async (t) => {
    const response = await fetch(W + encodeURIComponent(t));
    if (!response.ok) throw new Error(t + " request failed (HTTP " + response.status + ").");
    return response.json();
  };

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
  const [vr, cr, sr] = await Promise.all([
    j("GridShiftVariants"), j("GridShift"), j("GridShiftSystem")
  ]);
  const variants = (vr.records || []).filter(r => {
    const f = r.fields || {};
    return nk(gs(f, ["VarName", "Name"])) === "purematch" &&
           (gf(f, "Active") === undefined || checked(gf(f, "Active")));
  });
  if (variants.length !== 1) throw new Error("Expected one Pure Match setup; found " + variants.length + ".");

  const s = variants[0].fields || {};
  if (!checked(gf(s, "FreezeVariant")))
    throw new Error("Check FreezeVariant before capturing a release snapshot.");
  const hint = /^imprints?\s+of\s+(.+?)\s*\(\s*text\s*\)$/i.exec(String(gs(s, ["Hints", "Hint"]) || "").trim());
  if (!hint || nk(hint[1].trim()) !== "display") throw new Error("Hint must be 'Imprints of Display (Text)'.");
  if (nk(gf(s, "Placing")) !== "random") throw new Error("Only Placing = Random is supported.");
  const deckField = gf(s, "Deck");
  if (typeof deckField !== "string" || !deckField.trim()) throw new Error("Missing Deck field name.");
  if (String(gf(s, "DeckCount") || "").trim().toLowerCase() !== "variable") throw new Error("DeckCount must be Variable.");
  const participants = Number(gf(s, "NoParticipants"));
  if (Number.isFinite(participants) && participants > 1) throw new Error("Only NoParticipants = 1 is supported.");

  const cards = (cr.records || []).filter(r => checked(gf(r.fields || {}, deckField.trim())));
  if (!cards.length) throw new Error("No cards checked in '" + deckField + "'.");

  const relatedCount = cards.filter(r => String(gf(r.fields || {}, "TileRelated") || "").trim()).length;
  const d = dim(gs(s, [], "GridDimension"), cards.length + relatedCount);
  d.rows = Math.max(d.rows, Math.ceil((cards.length + relatedCount) / d.cols));
  if (d.cols * d.rows < cards.length + relatedCount)
    throw new Error("Grid holds " + (d.cols * d.rows) + " cells < " + (cards.length + relatedCount) + " cards and related assets.");

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
    variantFields: s,
    cards: cards.map(r => {
      const f = r.fields || {};
      const imprint = gf(f, "Display");
      if (typeof imprint !== "string" || !imprint.trim())
        throw new Error("A card is missing Display text (id " + (f.GridShiftID || "?") + ").");
      return { id: f.GridShiftID || f.TileName || "", recordId: r.id, match: imprint.trim().toLowerCase(), imprint: imprint.trim(), fields: f };
    }),
    systemRecords: sr.records || []
  };

  console.log(JSON.stringify(snap, null, 2));
  console.info("Snapshot OK: " + snap.cards.length + " cards, " + d.cols + "x" + d.rows +
        " grid. Paste the JSON between the PURE_MATCH_SNAPSHOT markers, then deploy.");
})();
```

---

## Implementation and verification

The embedded snapshot is in
[`mb-gs-pure-match.html`](mb-gs-pure-match.html). Both frozen and live sources
use `startGame()`; frozen startup validates the schema, all card fields, and
capacity for the cards plus related assets before rendering. The first snapshot
was captured with `FreezeVariant` checked.

Verification: frozen mode rendered the 14-card stack and 20-cell grid without
any `/airtable` requests; `?live=1` loaded the same counts with the three
expected table requests. A missing snapshot produced the documented in-page
error without a dialog. The finale image and configured `task4DoneText` were
also verified in the browser.

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
