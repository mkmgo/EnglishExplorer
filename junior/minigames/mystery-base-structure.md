# Onza's Mystery Base — Element Structure

## Overview

The game has **1 discovery zone (single palette)**, **8 spot cards (drop zones)**, and **10 box categories** for tidy-up sorting. Items are dragged from the shelves into spots to complete goals and unlock progression.

---

## Discovery Zone (single palette)

One palette card titled "The Discovery Zone" holds both item shelves, the tidy box bar, the lab zones, and the classroom spots.

### Main Shelf (`#inventory`)
Source palette for object bricks, colour bricks, tokens, avatars, and numbers.

| Element | ID | Type | Visual |
|---------|-----|------|--------|
| Bee | `#bee` | `.animal` | 48px circular image + name |
| Rabbit | `#rabbit` | `.animal` | 48px circular image + name |
| Dog | `#dog` | `.animal` | 48px circular image + name |
| Elephant | `#elephant` | `.animal` | 48px circular image + name |
| Car | `#car` | `.animal` | 48px circular image + name |
| Bike | `#bike` | `.animal` | 48px circular image + name |
| Robot | `#robot` | `.animal` | 48px circular image + name |
| Kite | `#kite` | `.animal` | 48px circular image + name |
| Turtle | `#turtle` | `.animal` | 48px circular image + name |
| Dinosaur | `#dinosaur` | `.animal` | 48px circular image + name |
| Dragon | `#dragon` | `.animal` | 48px circular image + name |
| Whale | `#whale` | `.animal` | 48px circular image + name |
| Red | `#brick-red` | `.brick.brick-red` | Coloured circle + label |
| Yellow | `#brick-yellow` | `.brick.brick-yellow` | Coloured circle + label |
| Blue | `#brick-blue` | `.brick.brick-blue` | Coloured circle + label |
| Lab Token x3 | `#lab-token-1/2/3` | `.lab-token` | 44px image, yellow gradient bg |
| Mod Token x3 | `#mod-token-1/2/3` | `.mod-token` | 44px image, green gradient bg |
| Joker Token x3 | `#joker-token-1/2/3` | `.joker-token` | 46x56px, orange gradient, "Joker" label |
| Onza | `#onza-avatar` | `.animal` `data-type="avatar"` | 48px circular image + name |
| Sam | `#sam-avatar` | `.animal` `data-type="avatar"` | 48px circular image + name |
| Five | `#num-five` | `.animal` `data-type="number"` | 48px circular image + name |
| Six | `#num-six` | `.animal` `data-type="number"` | 48px circular image + name |
| Seven | `#num-seven` | `.animal` `data-type="number"` | 48px circular image + name |
| Eight | `#num-eight` | `.animal` `data-type="number"` | 48px circular image + name |
| Nine | `#num-nine` | `.animal` `data-type="number"` | 48px circular image + name |

### Phrase & Activity Shelf (`#phrases-inventory`)
Source palette for phrase bricks (questions + statements), activity images, and word bricks.

#### Questions (`circle-question-mark` icon, blue)

| Element | ID | Phrase |
|---------|-----|--------|
| What is your name? | `#phrase-whats-your-name` | What is your name? |
| How old are you? | `#phrase-how-old` | How old are you? |
| Do you like ... ? | `#phrase-do-you-like` | Do you like ... ? |
| Where is ... ? | `#phrase-where-is` | Where is ... ? |

#### Statements (`circle-alert` icon, orange)

| Element | ID | Phrase |
|---------|-----|--------|
| My name is ... | `#phrase-my-name-is` | My name is ... |
| I am ... years old. | `#phrase-i-am-old` | I am ... years old. |
| Look! | `#phrase-look` | Look! |
| Listen! | `#phrase-listen` | Listen! |
| Stand up. | `#phrase-stand-up` | Stand up. |
| Sit down. | `#phrase-sit-down` | Sit down. |
| Come here. | `#phrase-come-here` | Come here. |
| Show me ... | `#phrase-show-me` | Show me ... |

#### Activity Images (`.activity-item`, `data-word` attr)

| Element | ID | data-word |
|---------|-----|-----------|
| Wake up | `#act-wake-up` | `wake-up` |
| Get up | `#act-get-up` | `get-up` |
| Wash | `#act-wash` | `wash` |
| Brush | `#act-brush` | `brush` |
| Eat | `#act-eat` | `eat` |
| Drink | `#act-drink` | `drink` |
| Play | `#act-play` | `play` |
| Go | `#act-go` | `go` |
| Sleep | `#act-sleep` | `sleep` |
| Read | `#act-read` | `read` |

#### Word Bricks (`.text-brick`, amber/yellow, matched to activity images)

| Element | ID | data-word | Label |
|---------|-----|-----------|-------|
| Wake up | `#txt-wake-up` | `wake-up` | Wake up |
| Get up | `#txt-get-up` | `get-up` | Get up |
| Wash | `#txt-wash` | `wash` | Wash |
| Brush | `#txt-brush` | `brush` | Brush |
| Eat | `#txt-eat` | `eat` | Eat |
| Drink | `#txt-drink` | `drink` | Drink |
| Play | `#txt-play` | `play` | Play |
| Go | `#txt-go` | `go` | Go |
| Sleep | `#txt-sleep` | `sleep` | Sleep |
| Read | `#txt-read` | `read` | Read |

An `.inv-separator` divider sits between the activity images and word bricks.

---

## Spots (Drop Zones)

### 1. Colour Lab — "Mixer" (`#spot-1`)
- **Layout:** Full-width, horizontal row (`colour-lab` class)
- **Token slot:** `#token-slot` — accepts lab-tokens
- **Drop zone:** 2 empty slots for colour bricks
- **Mechanic:** Drop 1 lab-token + 2 colour bricks → animated combine creates a new colour brick
- **Unlock:** Open from start
- **Goal:** Complete 3 lab combinations

### 2. Animals (`#spot-2`)
- **Layout:** Single-column, 320px max-width
- **Drop zone:** 4 locked slots
- **Unlock:** After Colour Lab (`spot-1`) is reached
- **Goal:** Place `bee`, `rabbit`, `dog`, `elephant` into the 4 slots

### 3. Toys (`#spot-3`)
- **Layout:** 2-column grid (left side, with Mystery)
- **Drop zone:** 4 locked slots
- **Unlock:** After Animals (`spot-2`) is reached
- **Goal:** Place `car`, `bike`, `robot`, `kite` into the 4 slots

### 4. Mystery (`#spot-4`)
- **Layout:** 2-column grid (right side, with Toys)
- **Drop zone:** 4 locked slots
- **Unlock:** After Toys (`#spot-3`) is reached
- **Goal:** Place combined mystery items: `red-car`, `yellow-bee`, `blue-rabbit`
- **Mechanic:** Drag brick + matching colour brick into Mystery slot → auto-combines

### 5. Animal Mod — "Mod Lab" (`#spot-5`)
- **Layout:** Full-width, horizontal row (`colour-lab` class)
- **Token slot:** `#token-slot-shapes` — accepts mod-tokens
- **Drop zone:** 1 mod-slot (with modifier chips) + 1 empty slot
- **Mod chips:** `- slow` / `+ hits` (stage 1) → `- weak` / `+ fast` (stage 2) → `- fast` / `+ big` (stage 3)
- **Unlock:** Open from start
- **Goal:** Complete 3 animal modifications

### 6. Activity Lab (`#spot-activity`)
- **Layout:** Full-width, horizontal row (`colour-lab` class, `activity-lab` class)
- **Drop zone:** 4 reusable `activity-slot` slots, each split into `.act-img-zone` (top) + `.act-word-zone` (bottom)
- **Unlock:** Open from start
- **Mechanic:** Drop an activity image into `.act-img-zone` and its matching word brick into `.act-word-zone` → if `data-word` matches, auto-combines into an `.activity-result` brick, then parks into the Activities box
- **Goal:** All 10 activity bricks built (`activityCombosDone >= 10`)

### 7. Age (`#spot-age`)
- **Layout:** 2-column grid (left side, with Name dialogue)
- **Drop zone:** 4 slots with imprints, open from start
- **Imprint slots (in order):**
  1. Onza (`data-accept="onza-avatar"`)
  2. Seven (`data-accept="num-seven"`)
  3. Sam (`data-accept="sam-avatar"`)
  4. Eight (`data-accept="num-eight"`)
- **Goal:** Place each item into its matching imprinted slot

### 8. What is your Name? (`#spot-dialogue`)
- **Layout:** 2-column grid (right side, with Age)
- **Drop zone:** 4 slots with imprints, open from start
- **Imprint slots (in order):**
  1. What is your name? (`data-accept="phrase-whats-your-name"`)
  2. My name is ... (`data-accept="phrase-my-name-is"`)
  3. Onza (`data-accept="onza-avatar"`)
  4. Sam (`data-accept="sam-avatar"`)
- **Goal:** Place each item into its matching imprinted slot

---

## Combining Mechanics

### Mystery Combining (in `#spot-4`)

| Brick | + Colour | = Result |
|-------|----------|----------|
| Car | `brick-red` | `red-car` |
| Bee | `brick-yellow` | `yellow-bee` |
| Rabbit | `brick-blue` | `blue-rabbit` |

Combined items get class `.combined`, keep the animal image + short label, and inherit the colour brick's class.

### Colour Lab Combining (in `#spot-1`)

| Brick A | + Brick B | = Result |
|---------|-----------|----------|
| `brick-blue` | `brick-yellow` | `brick-green` (Green) |
| `brick-blue` | `brick-red` | `brick-purple` (Purple) |
| `brick-red` | `brick-yellow` | `brick-orange` (Orange) |

Requires 1 lab-token in `#token-slot`. Token is consumed. New brick gets `data-lab-combined="true"`.

### Animal Mod Combining (in `#spot-5`)

| Stage | Animal | Mod Token | = Result | Modifier |
|-------|--------|-----------|----------|----------|
| 1 | Turtle | mod-token | `turtle-mod` | − slow, + hits |
| 2 | Rabbit | mod-token | `rabbit-mod` | − weak, + fast |
| 3 | Whale | mod-token | `whale-mod` | − fast, + big |

Requires 1 mod-token in `#token-slot-shapes`. Token is consumed. Animal gets green ring + `data-mod-combined="true"`. Original animal is stashed for reset.

### Activity Combining (in `#spot-activity`)

| Image | + Word Brick | = Result |
|-------|-------------|----------|
| `act-wake-up` | `txt-wake-up` | `act-wake-up-built` |
| `act-get-up` | `txt-get-up` | `act-get-up-built` |
| `act-wash` | `txt-wash` | `act-wash-built` |
| `act-brush` | `txt-brush` | `act-brush-built` |
| `act-eat` | `txt-eat` | `act-eat-built` |
| `act-drink` | `txt-drink` | `act-drink-built` |
| `act-play` | `txt-play` | `act-play-built` |
| `act-go` | `txt-go` | `act-go-built` |
| `act-sleep` | `txt-sleep` | `act-sleep-built` |
| `act-read` | `txt-read` | `act-read-built` |

Image and word brick must share the same `data-word`. The combined result gets `data-activity-combined="true"` and is parked into the Activities box after 700ms. A wrong word snaps back to the palette.

---

## Box Categories (Tidy-Up System)

### Boxes (`#boxBar` / `#boxTrays`)

| Category | Items |
|----------|-------|
| Colours | `brick-red`, `brick-yellow`, `brick-blue`, `brick-green`, `brick-purple`, `brick-orange` |
| Numbers | `num-five`, `num-six`, `num-seven`, `num-eight`, `num-nine` |
| Avatars | `onza-avatar`, `sam-avatar` |
| Toys | `car`, `bike`, `robot`, `kite` |
| Animals | `bee`, `rabbit`, `dog`, `elephant`, `turtle`, `whale` |
| Special | `dragon`, `dinosaur`, `turtle-mod`, `rabbit-mod`, `whale-mod` |
| Questions | `phrase-whats-your-name`, `phrase-how-old`, `phrase-do-you-like`, `phrase-where-is` |
| Phrases | `phrase-my-name-is`, `phrase-i-am-old`, `phrase-look`, `phrase-listen`, `phrase-stand-up`, `phrase-sit-down`, `phrase-come-here`, `phrase-show-me` |
| Activities | the built activity tiles (`data-activity-combined`, `act-<word>-built`) |
| Words | `txt-wake-up`, `txt-get-up`, `txt-wash`, `txt-brush`, `txt-eat`, `txt-drink`, `txt-play`, `txt-go`, `txt-sleep`, `txt-read` |

Box tags: Questions get `circle-question-mark` icon; Phrases get `circle-alert` icon.

### Box Stack

- The palette's `.box-bar` starts with a `.box-chip.stack-chip` (`data-cat="stack"`, lucide **layers** icon, `.box-count.stack-count`).
- The stack chip is draggable like any box (`storeBoxAt` supports ref-less chips, moving just the chip).
- Dropping a real box onto the stack chip **stacks** it: `stackBox()` sets `ref.stacked`, adds `.stacked` (display: none) to the box chip + tray, and bumps the counter via `refreshStackCounts()`.
- Tapping a stack chip toggles the pile: when the stack is empty (`countStacked() === 0`) it calls `stackAllBoxes()` to fold **every** box away at once; once anything is stacked it calls `unstackBoxes()` to dump everything back (count back to 0). `resetGame()` also un-stacks.
- CSS: `.box-chip.stack-chip` (accent border + gradient), `.box-chip.drag-over`, `.box-chip.stacked` / `.box-tray.stacked` (hidden).

---

## Unlock Chain

```
Start
 ├─ Colour Lab (#spot-1)        ← open
 ├─ Animal Mod (#spot-5)        ← open
 ├─ Activity Lab (#spot-activity) ← open
 ├─ Age (#spot-age)              ← open
 └─ Name dialogue (#spot-dialogue) ← open

spot-1 reached ──→ Animals (#spot-2) unlocks
spot-2 reached ──→ Toys (#spot-3) unlocks
spot-3 reached ──→ Mystery (#spot-4) unlocks
```

---

## Goals (Win Condition)

All of the following must be `true` to show the win overlay:

| Spot | Condition |
|------|-----------|
| `#spot-1` | `labCombosDone >= 3` (3 colour lab combines) |
| `#spot-2` | bee + rabbit + dog + elephant all inside |
| `#spot-3` | car + bike + robot + kite all inside |
| `#spot-4` | red-car + yellow-bee + blue-rabbit all inside |
| `#spot-age` | onza-avatar + num-seven + sam-avatar + num-eight all inside |
| `#spot-dialogue` | phrase-whats-your-name + phrase-my-name-is + onza-avatar + sam-avatar all inside |
| `#spot-5` | Always `true` (open, no strict win gate) |
| `#spot-activity` | Always `true` (open, no strict win gate) |

---

## Visual States

| State | Class | Effect |
|-------|-------|--------|
| Goal reached | `.goal-reached` | Green background + green border |
| Age reached | `.age-reached` | Green background + green border |
| Mystery active | `.mystery-active` | Yellow background + amber border |
| Slot locked | `.lock-icon` with Lucide lock icon | Grey lock, clickable to unlock |
| Imprint placeholder | `.imprint` | 35% opacity, greys content |
| Imprint filled | `.imprint.taken` | 50% opacity, content restored |
| Box open | `.box-chip.open` | Solid blue border |
| Box done | `.box-chip.done` | Solid green border + green bg |
| Dragging original | `.dragging-original` | 35% opacity |
| Ghost (drag proxy) | `.ghost` | Fixed position, follows pointer |
| Gamepad cursor | `#gamepadCursor` | 30px green ring, hidden until gamepad connected |
| Gamepad grabbing | `#gamepadCursor.grabbing` | Amber ring, scaled up |
| Gamepad hovering | `#gamepadCursor.hovering` | Blue ring over interactive targets |

---

## PS4 Gamepad Support

A gamepad polling loop (`padPoll`) runs via `requestAnimationFrame` when `navigator.getGamepads` is available. It bridges the raw Gamepad API to the existing pointer-based drag-and-drop:

- **Left stick / D-pad:** Move the green cursor ring across the screen.
- **Cross (button 0):** Hold to grab (`pointerdown`), release to drop (`pointerup`). A short tap (< 14px movement) fires a synthetic `click` on toggle/button targets so labs and boxes open.
- **Circle (button 1):** Cancel current drag — item snaps back to inventory.
- **Right stick (axes 2/3):** Fine-fine alternate cursor movement (lower speed multiplier).
- **D-pad when not grabbing:** Up/Down scrolls the page (60px per tick, 8-frame repeat ~130ms).
- **Hover ring:** Blue ring appears when the cursor sits over an interactive target (`.lab-toggle`, `.box-chip`, `.draggable-item`, etc.).
