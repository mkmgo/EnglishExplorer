# Grid Shift Pure Match (`mb-farmstead-mg`) — Freezing the Airtable-driven setup

> Pair documents: [`mb-farmstead-mg.html`](mb-farmstead-mg.html) (the game) and
> [`mb-farmstead-mg.snapshot.json`](mb-farmstead-mg.snapshot.json) (the frozen
> data it plays). The page reads the JSON file by default; `?live=1` reads the
> same data from Airtable instead.

## Why freeze?

The game reads **everything from Airtable on every live load**. The game works,
but its content and even its validity depend on the live state of three tables:

| Live input | What a later Airtable edit does to the next live load |
|---|---|
| `GridShiftVariants` → the `VarName` row (today `mb-farmstead-mg`) | Editing `Deck`, `GridDimension`, `Hints` or `Placing` changes (or breaks — the page throws on unsupported values) the game silently. Deleting the row = "Expected one mb-farmstead-mg setup; found 0." |
| `GridShift` → rows checked in the Deck field (`PM-Active`) | Unchecking a card shrinks the deck (and may auto-resize the grid); checking new cards can exceed the grid; editing `Display` changes the match text and imprint mid-set. |
| `GridShift` row deletion / cleanup | Cards, task results (`taskNResult` record ids) and `TileRelated` products vanish between sessions with no record of what the game looked like yesterday. |
| `GridShiftSystem` | Editing the TargetBox / Event Log rows or the `SysSound` URLs changes the chrome and the sound effects of a released lesson. |

A session already loaded is safe (data is read **once** per load), so the risk
is always *the next* load: a lesson prepared today can silently become a
different game tomorrow because someone tidied the base.

**Goal:** ship a *frozen snapshot* of the fully-resolved game next to the page,
so the released lesson is stable and reproducible, while Airtable remains the
authoring tool — edits there only change the game when you explicitly re-freeze.

---

## Where further development happens

**All future development happens in Airtable, in the `GridShiftVariants` row for
the puzzle — not in the HTML.** The page is a renderer; the lesson is data.

Authoring loop (full detail in [Refresh workflow](#refresh-workflow-re-freezing)):

1. Uncheck `FreezeVariant` on the variant row (authoring state).
2. Edit the row in Airtable — instructions (`taskNText`), status messages,
   done messages, spoken words, pictures, colours, `H1Text`, the task results —
   and the `GridShift` / `GridShiftSystem` records it points at.
3. Preview with **`mb-farmstead-mg.html?live=1`** (badge `LIVE from Airtable`).
   Reload after every Airtable edit; nothing is cached.
4. When the lesson is right, check `FreezeVariant` and capture the snapshot.
5. Commit the page **and** the snapshot together, then deploy.

Nothing in steps 1–5 requires editing `mb-farmstead-mg.html`. The only edits that
touch the page are changes to the *engine* (rendering, gamepad, task logic), and
those must be tested in both modes before a re-freeze.

### Naming contract

The three shipped names mirror **`GridShiftVariants.VarName`** (kebab-case):

| Airtable `VarName` | Page | Snapshot | This doc |
|---|---|---|---|
| `mb-farmstead-mg` | `mb-farmstead-mg.html` | `mb-farmstead-mg.snapshot.json` | `mb-farmstead-mg-freeze.md` |

The page reads its own file name and selects the variant row whose `VarName`
matches it (`VARIANT_NAME`), so **renaming `VarName` and the file together is the
whole rename procedure for `?live=1`** — no code edit.

`H1Text` supplies the **top-bar title and the browser tab** (falling back to
`VarName` when empty). It is baked into the snapshot at capture time, which is
why a released page shows the Airtable title without any live read — and why
changing it is an Airtable edit **plus a re-freeze**.

Two guards keep the pair honest:

- Frozen mode **rejects** a snapshot whose `VarName` does not match the page file
  name ("Frozen snapshot was captured for VarName … but this page is …").
- `?live=1` reports `Expected one <file name> setup in GridShiftVariants; found
  N.` when no row carries that `VarName` — the usual cause of a mid-rename break.

A different `VarName` (a new variant row) gets its **own** page, snapshot and
doc. Never share a snapshot between variants.

---

## Current mechanics (what gets frozen)

Load-time pipeline in `mb-farmstead-mg.html`:

```
GET /airtable?table=GridShiftVariants   ──┐
GET /airtable?table=GridShift           ──┤
GET /airtable?table=GridShiftSystem     ──┘
                                          ▼
1. Pick the one row whose VarName matches the page file name
2. Validate settings:  Hints = "Imprints of Display (Text)"
                       Placing = "Random"
                       Deck    = <checkbox field name>  (e.g. "PM-Active")
                       DeckCount = "Variable"
                       NoParticipants = 1
3. Filter GridShift rows where <Deck> checkbox is checked
4. Per card: read Display (match text) + all render fields → buildCard()
5. parseGridDimension() → cols × rows (must hold every card + TileRelated product)
6. shuffle(cards) → deck;  shuffle(cell slots) → random imprint placement
7. render + gamepad bridge (unchanged by this proposal)
```

**Freeze point:** after step 5 (everything validated and resolved), **before**
step 6 (shuffle). Shuffling and imprint placement stay random per load — the
frozen game still plays differently each time, it just always uses the *same
cards, text, task chain and grid*.

Notes from the mechanics check:

- The fetches happen once at startup; a mid-session Airtable edit cannot
  disturb a running game. The freeze only guards *future loads*.
- The worker caps fetches at 200 records — a snapshot inherits that limit only
  if it was captured through the same endpoint (ample for the current deck).
- `Placing` only supports `Random`; anything else throws. Frozen mode keeps
  this constraint (the snapshot stores the validated value, not raw Airtable
  text, so an unsupported value can never sneak in unnoticed).

---

## Design: the external snapshot file

### The two shipped files

| File | Role |
|---|---|
| `junior/minigames/mb-farmstead-mg.html` | The game — code only, no data. |
| `junior/minigames/mb-farmstead-mg.snapshot.json` | The frozen data: resolved settings, the raw Pure Match variant row, the 14 `PM-Active` cards, the 13 `GridShiftSystem` rows. |

The page fetches the file with a **relative URL** (`mb-farmstead-mg.snapshot.json`),
so the pair can live in the same folder anywhere the repo is served from.

### Naming

`mb-farmstead-mg.snapshot.json`:

- `<page>.snapshot.json` — the file name mirrors the page it feeds, so the pair
  is obvious in a folder listing and in `git log`.
- **`.snapshot`** is the marker that this is a *capture* (a dated, frozen copy),
  not live data and not configuration the page writes back.
- kebab-case, lowercase — the repo's naming rule; the `.json` extension keeps
  editors, `git diff` and schema tooling in the right mode.
- It sits **beside** the page rather than in a `data/` folder: one file does not
  justify a new folder, and the relative URL stays a bare file name.

If the game is ever cloned into another variant, each page gets its **own**
snapshot file with the same naming pattern — never a shared one (a broken shared
file would break every lesson at once).

### Why a file and not an inline `<script>` block

The first frozen release embedded the snapshot object in the HTML between
`PURE_MATCH_SNAPSHOT:BEGIN/END` markers. That worked, but it mixed generated
data into hand-edited code:

- ~550 lines of JSON sat in the middle of the page's script block and had to be
  replaced by hand on every re-freeze.
- The PowerShell-generated JSON was unreadable in review (double spaces, one
  array item per line) and, on one capture, silently mangled the `✔` characters
  (`"âœ Well done…"`).
- A malformed paste broke the whole page (JS parse error) instead of failing one
  well-scoped load.
- The data could not be validated, diffed or inspected by any tool other than
  the browser.

Separating it gives a reviewable diff (data changed / code did not), a file a
JSON schema or a one-line `node -e` check can validate, and a failure that is
reported in the page's normal error area.

It is a **deliberate, documented exception** to the repo's self-contained-page
rule (see `AGENTS.md` → "Self-contained files" → frozen snapshot data file). The
cost is explicit:

| Cost | Mitigation |
|---|---|
| The page is no longer one file: it must ship **with** the JSON. | Both files live in the same folder and are committed together; the failure message names the missing file. |
| `file://` cannot fetch it (Chromium blocks same-directory fetches from `file://`). | The page detects `file://` and says so in-page, pointing at `?live=1`; deploy over GitHub Pages / any HTTP server. |
| A stale cached copy could serve old data. | The fetch uses `cache: "no-cache"` (revalidates every load) and the top bar shows the capture date (`Frozen YYYY-MM-DD`). |

### Snapshot schema

```json
{
  "schemaVersion": 1,
  "frozenAt": "2026-11-03T15:30:49Z",
  "source": "GridShiftVariants:mb-farmstead-mg / GridShift:PM-Active",
  "settings": { "...": "resolved, validated" },
  "variantFields": { "...": "raw variant row (VarName: mb-farmstead-mg)" },
  "cards": [ { "id": 67, "recordId": "rec...", "match": "calf", "imprint": "Calf", "fields": { "...": "raw Airtable fields" } } ],
  "systemRecords": [ { "...": "raw GridShiftSystem rows" } ]
}
```

| Key | Type | Purpose |
|---|---|---|
| `schemaVersion` | number | Bump if the snapshot format ever changes; the loader rejects unknown versions with a clear message. |
| `frozenAt` | ISO string | When the snapshot was captured (shown in the top-bar badge). |
| `source` | string | Human-readable provenance of the frozen tables. |
| `settings.deckField` | string | Checkbox field name used to select cards (e.g. `PM-Active`). |
| `settings.deckCount` | string | Must be `variable` — validated at capture time. |
| `settings.gridDimension` | string | Original Airtable value (e.g. `4x5`) for provenance. |
| `settings.cols` / `settings.rows` | number | **Pre-resolved** grid size — no re-parsing needed at load. |
| `settings.placing` | string | `random` (validated at capture). |
| `settings.hintField` / `settings.hintLabel` | string | Validated hint config (always `Display` / `Imprints of Display (Text)` for this page). |
| `variantFields` | object | **Raw Airtable fields** of the variant row (currently `mb-farmstead-mg`): every `taskNText` / `taskNStatusText` / `taskNDoneText` / `taskNResult` / `taskNSpoken`, the `WPIMG1` / `WPIMG2` pictures, `PartColour`, `H1Text`, `PartLabel` and the `FreezeVariant` value at capture time. |
| `cards[].id` | number/string | `GridShiftID` — used for Turn/Place tracking. |
| `cards[].recordId` | string | Airtable record id used to resolve task result links and `TileRelated` relationships. |
| `cards[].match` | string | Normalised `Display` value (lowercase/trimmed) — the `data-match` key. |
| `cards[].imprint` | string | Display text shown on the cell imprint. |
| `cards[].fields` | object | **Raw Airtable `fields`** of the card — fed straight into the existing `buildCard(record, matchText)`, so every render option (Frame, FillTile, Lucide, colours, `SoundAsset`…) keeps working untouched. |
| `systemRecords` | array | Raw `GridShiftSystem` rows for the TargetBox / Event Log configuration and the system sounds. |

Capturing the *raw* `fields` (rather than a flattened subset) is deliberate:
`buildCard()` already knows how to render every field combination, so the frozen
path reuses it with zero duplication and never drifts from the live path.

### Mode selection

| Mode | Trigger | Behaviour |
|---|---|---|
| **Frozen (default)** | normal URL | `fetch("mb-farmstead-mg.snapshot.json")` → validate → render. No Airtable game-data requests — the page still starts if the worker is down. Cloudinary media and the approved Lucide CDN still need connectivity. Badge: `Frozen YYYY-MM-DD`. |
| **Live (authoring / unfreeze)** | `mb-farmstead-mg.html?live=1` | Fetches `GridShiftVariants`, `GridShift` and `GridShiftSystem` from Airtable, validates, and renders. Every Airtable input remains fully testable. Badge: `LIVE from Airtable`. |

The unfreeze path is **untouched by the storage format**: both modes converge on
the same pipeline — `startGame(resolvedSettings, cardRecords)` → validate →
`buildCard()` → `buildGrid()`. Only the *source* of `resolvedSettings` +
`cardRecords` differs:

| Entry point | Source |
|---|---|
| `startFromFrozenFile()` | `fetchSnapshot(SNAPSHOT_URL)` → `startFromSnapshot(json)` |
| `startFromLive()` | `fetchTable(...)` → `startGame(variantFields, cardRecords)` |

`FreezeVariant` is a **capture guard, not a runtime switch**: it only decides
whether the console snippet is allowed to produce a snapshot. The page never
reads it to choose a data source.

### Failure behaviour

| Situation | Result |
|---|---|
| Snapshot file missing / 404 | In-page: `Frozen snapshot request failed (HTTP 404) for mb-farmstead-mg.snapshot.json.` + the `?live=1` hint. No dialogs (Tizen-safe). |
| Snapshot file is not valid JSON | In-page: `Frozen snapshot … is not valid JSON.` |
| Page opened from `file://` | In-page: the snapshot cannot be read from a local file — serve the folder over HTTP(S) or use `?live=1`. |
| Unknown `schemaVersion`, missing `cards` / `systemRecords` / `variantFields`, bad `frozenAt`, snapshot `VarName` ≠ page file name, `deckField` ≠ variant `Deck`, unsupported deck/placing/hint values, non-integer grid, cells < cards + `TileRelated` products, card with empty `Display` / mismatched `match`, card without `recordId` | Rejected at load with the specific message — a bad snapshot must never render a half-broken board. |
| `?live=1` but no row carries the page's `VarName` | In-page: `Expected one mb-farmstead-mg setup in GridShiftVariants; found N.` — fix the `VarName`, or rename the page file to match it. |
| `?live=1` but worker/Airtable fails | `showLoadError()` plus a hint that the frozen default needs no such dependency. |

---

## Refresh workflow (re-freezing)

Airtable stays the authoring surface. The loop is:

1. Edit content/settings in Airtable as usual. Leave `FreezeVariant` unchecked
   while developing; open the game with `?live=1` to see those changes.
2. Open `mb-farmstead-mg.html?live=1` and confirm the lesson plays as wanted
   (tasks 1–4, spoken words, bridge messages, the finale picture).
3. Check `FreezeVariant` on the `mb-farmstead-mg` row in Airtable.
4. On that same `?live=1` page, paste the **capture snippet** (below) into the
   browser devtools console. It refuses to capture unless `FreezeVariant` is
   checked, re-runs the game's validations, and **downloads**
   `mb-farmstead-mg.snapshot.json`.
5. Drop that file into `junior/minigames/`, replacing the old snapshot.
6. Commit the page and the snapshot **together**, then deploy.
7. Verify: open the page at its normal URL — the badge must read
   `Frozen <date>`, the stack count / grid must match the lesson, and the
   network panel must show **no** `/airtable` requests (only the one snapshot
   fetch).
8. To keep authoring afterwards, uncheck `FreezeVariant` again and use
   `?live=1`. Note that the *released* page keeps using the snapshot until it is
   re-frozen — that is the whole point of the freeze.

> Works equally from the Tizen browser's devtools or desktop Chrome; the
> snippet only uses the same public worker endpoint the page already calls.

### Capture snippet (copy-paste into the devtools console)

```js
(async function freezeVariant() {
  const W = "https://english-explorer-tracker.mkmueller-mission.workers.dev/airtable?table=";
  const j = async (t) => {
    const response = await fetch(W + encodeURIComponent(t));
    if (!response.ok) throw new Error(t + " request failed (HTTP " + response.status + ").");
    return response.json();
  };

  // The variant is selected by this page's own file name — the same rule the
  // page uses, so a renamed VarName + file needs no edit here either.
  const EXPECTED = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "");
  if (!EXPECTED) throw new Error("Open the game page first (its file name is the expected VarName).");

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
    return nk(gs(f, ["VarName", "Name"])) === nk(EXPECTED) &&
           (gf(f, "Active") === undefined || checked(gf(f, "Active")));
  });
  if (variants.length !== 1) throw new Error("Expected one " + EXPECTED + " setup; found " + variants.length + ".");

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
    source: "GridShiftVariants:" + EXPECTED + " / GridShift:" + deckField.trim(),
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

  // -- write the file (UTF-8, so ✔ and friends survive) ------------------
  const json = JSON.stringify(snap, null, 2) + "\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = EXPECTED + ".snapshot.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);

  console.log(json);
  console.info("Snapshot OK: " + snap.cards.length + " cards, " + d.cols + "x" + d.rows +
    " grid. Replace junior/minigames/mb-farmstead-mg.snapshot.json with the downloaded file, commit it together with the page, then deploy.");
})();
```

---

## Implementation and verification

The page no longer carries the data. `mb-farmstead-mg.html` contains only code:
`fetchSnapshot()` (fetch + `cache: "no-cache"` + JSON parse error message),
`startFromFrozenFile()` (the `file://` guard and the load chain) and
`startFromSnapshot()` (schema/consistency validation), with `startFromLive()`
beside them for `?live=1`.

Frozen startup validates the schema, every card (`recordId`, `Display`,
`match`/`imprint` agreement), the resolved `deckField` against the variant row,
the deck/placing/hint settings, and capacity for the cards plus their
`TileRelated` products before rendering.

Verification (2026-11-03):

- The snapshot was extracted from the embedded block byte-for-byte
  (14 cards, 13 system rows, 5 columns × 4 rows = 20 cells, 5 product cards) and
  reformatted with 2-space indentation.
- The three `✔` done texts that the earlier PowerShell capture had mangled
  (`task1DoneText`, `task2DoneText`, `task3DoneText`) were repaired in the JSON.
  The values in Airtable were always correct — the corruption came from the
  capture tool decoding the UTF-8 response as CP-1252, so **capture through the
  browser snippet or `fetch()`, never through PowerShell's `Invoke-WebRequest`.**
- Re-frozen after Airtable's `VarName`/`H1Text` rename (`Pure Match`/`Farm Things`
  → `mb-farmstead-mg`/`Farmstead`): a field-by-field diff against the previous
  capture showed **only** `frozenAt`, `source`, `VarName` and `H1Text` changed —
  cards, tasks and system rows were identical.
- Frozen load: one same-origin request for the snapshot (page → snapshot → `tracker.js`), **zero** `/airtable` requests; the badge reads `Frozen 2026-11-03` and the top bar plus tab title read `Farmstead`.
- Frozen load with all external hostnames unresolved (only localhost reachable): the same 14-card stack and 20-cell board render from the JSON — the data has no Airtable or worker dependency (Cloudinary pictures fail offline, as expected).
- `?live=1` load: the three expected `/airtable` requests and the same card and grid counts, badge `LIVE from Airtable`.
- Missing file (404), a snapshot whose `VarName` disagrees with the file name, and `file://` all produce the documented in-page message, never a dialog and never a half-rendered board.

Quick pair check without a server (run from the repo root):

```bash
node -e "const s=require('./junior/minigames/mb-farmstead-mg.snapshot.json');const r=s.cards.filter(c=>String(c.fields.TileRelated||'').trim()).length;console.log(s.schemaVersion, s.frozenAt, s.cards.length+' cards +'+r+' related, '+s.settings.cols+'x'+s.settings.rows+' grid, '+(s.settings.cols*s.settings.rows>=s.cards.length+r?'capacity ok':'CAPACITY FAIL'))"
```

---

## Alternatives considered

| Option | Idea | Verdict |
|---|---|---|
| **A — Embedded snapshot block in the HTML** | The previous release: `PURE_MATCH_SNAPSHOT` between marker comments inside the page. | Retired 2026-11-03. Keep only if the lesson must survive being emailed / copied to a USB stick as a single file — everything else (review, validation, error scoping, UTF-8 safety) is worse. |
| **B — Worker/KV snapshot** | `GET /airtable/snapshot?game=...` served from Cloudflare KV; protected `POST` freezes the current Airtable state on demand. | Real value for refreshing without a commit, but adds a KV binding, an admin secret and sync endpoints to the worker. The file schema defined here is exactly what KV would store, so file → KV is additive, not a rewrite. |
| **C — Airtable freeze field** | `Frozen` checkbox + `Snapshot` long-text column on the variant row; the page prefers the blob when checked. | Airtable long text caps at 100k chars (tight for 40 rich cards), JSON editing in the Airtable UI is error-prone, and the raw `GridShift` rows would still be live unless fully duplicated into the blob. |
| **D — External snapshot JSON** *(chosen)* | `mb-farmstead-mg.snapshot.json` next to the page, read at runtime. | Chosen: generated data out of hand-edited code, reviewable/validatable diff, no build step, no worker changes. Costs the single-file portability of the page (documented in `AGENTS.md`); `?live=1` keeps Airtable as the live authoring path. |

## Out of scope (for now)

- Applying the freeze pattern to `mb-grid-shift.html`,
  `handwriting-practice-02.html` or `bt-study-hub.html` — the schema here is
  game-specific; a general pattern would need its own design pass.
- Worker/KV snapshot endpoint (Option B).
- Snapshot diffing/versioning beyond `schemaVersion` + `frozenAt`.
