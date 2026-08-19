# English Explorer — Content Architecture Plan

## Overview

`advanced.html` is the main learning file covering **MY WORLD** and **FOUNDATIONS** — for classroom use and repetition. The reward system is secondary here.

Junior thematic files (`junior/thematic/*.html`) are separate exercise files with a reward system + prizes, later linked from advanced.html via "EXERCISES AND REPETITION / Interactive Practices".

Progress tracking will be a separate file: `progress.html`.

---

## Chapter Flow

Each chapter follows this screen order:

**Video clip → Vocabulary overview → Slot machine → Exercises**

---

## New Chapters to Build

| Chapter | Section | Vocabulary | Dialogue Topic | Exercises |
|---|---|---|---|---|
| Hello English | My World | hello, hi, goodbye, bye, see you, please, thank you, sorry, yes, no | Meeting Sam & Onza | Grid seek, Yes/No |
| My Body | My World | head, eyes, ears, nose, mouth, hands, arms, legs, feet, hair | "Touch your..." / "This is my..." | Grid seek, Naming |
| Colours Everywhere | My World | red, blue, green, yellow, orange, purple, pink, black, white, brown | "What colour is it?" | Slot quiz, Matching |
| My Family | My World | mother, father, sister, brother, grandmother, grandfather, baby | "This is my..." / "How many...?" | Naming, Yes/No |
| My Classroom | My World | book, pen, pencil, desk, chair, board, eraser, ruler | "Can I have a...?" | Slot quiz, Grid seek |

Existing chapters (Animals, Toys, Months, Colours) stay as-is and will be migrated to Airtable later.

---

## Media Slide Component

New screen type added to `advanced.html`:
- `<video>` element with Cloudinary source
- Autoplay (muted) on Tizen, tap-to-unmute on mobile
- Auto-advance to next screen when video ends
- Poster/thumbnail support
- Play/pause overlay controls

---

## Airtable Integration

### Base: English Explorer

**Table: Words**
| Field | Type | Purpose |
|---|---|---|
| `word` | Single line text | e.g. "dog", "red", "January" |
| `translation` | Single line text | Local language translation |
| `chapter` | Single select | "Hello English", "My Body", "Animals", etc. |
| `section` | Single select | "My World" or "Foundations" |
| `image` | URL | Cloudinary sprite URL |
| `imageCrop` | URL | Cropped version for cards |
| `audio` | URL | Cloudinary audio (optional, can use TTS) |
| `displayOrder` | Number | Sort within chapter |
| `featured` | Checkbox | Show on chapter intro grid |
| `spriteX` | Number | Sprite crop X offset |
| `spriteY` | Number | Sprite crop Y offset |
| `spriteW` | Number | Sprite crop width |
| `spriteH` | Number | Sprite crop height |

**Table: Media**
| Field | Type | Purpose |
|---|---|---|
| `title` | Single line text | "Animals Intro Video" |
| `type` | Single select | "video", "image", "audio" |
| `chapter` | Single select | Links to chapter |
| `url` | URL | Cloudinary URL |
| `thumbnailUrl` | URL | Video poster image |
| `duration` | Number | Seconds (for video) |
| `displayOrder` | Number | Sequence within chapter |
| `followedBy` | Single select | "dialogue" or "exercise" or "none" |
| `followUpId` | Single line text | ID of dialogue/exercise to show after |

**Table: Dialogues**
| Field | Type | Purpose |
|---|---|---|
| `name` | Single line text | "Greeting and Introduction" |
| `chapter` | Single select | Links to chapter |
| `displayOrder` | Number | Sequence |
| `retired` | Checkbox | Hide from nav |

**Table: DialogueLines**
| Field | Type | Purpose |
|---|---|---|
| `dialogue` | Link to Dialogues | Parent dialogue |
| `speaker` | Single select | "Sam" or "Onza" |
| `text` | Long text | The phrase to speak |
| `image` | URL | Optional image (e.g. dog card) |
| `imageIcon` | Single select | "heart", "broken-heart", "none" |
| `displayOrder` | Number | Sequence within dialogue |

**Table: Exercises**
| Field | Type | Purpose |
|---|---|---|
| `name` | Single line text | "Do You Like?" |
| `type` | Single select | "slot-quiz", "grid-seek", "yes-no", "big-small", "naming", "match" |
| `chapter` | Single select | Links to chapter |
| `displayOrder` | Number | Sequence |
| `retired` | Checkbox | Hide from nav |

**Table: ExerciseRounds**
| Field | Type | Purpose |
|---|---|---|
| `exercise` | Link to Exercises | Parent exercise |
| `word` | Link to Words | The word for this round |
| `prompt` | Single line text | "Do you like dogs?" |
| `answer` | Single select | "yes", "no", "big", "small", etc. |
| `options` | Long text | JSON array of choices (for multiple-choice) |
| `displayOrder` | Number | Round sequence |

### Fetch Flow

1. On app load → fetch Words + Media for the requested chapter
2. Check localStorage cache (24h expiry)
3. If cache miss or stale → fetch from Airtable API
4. Build screens dynamically from cached data
5. Fallback to hardcoded data if offline

---

## Progress Tracking (Separate File)

`progress.html` — scores per chapter, completed exercises, media watched.

---

## Execution Order

1. Add media slide component to `advanced.html`
2. Build "Hello English" chapter (first new chapter, proves the pattern)
3. Build remaining chapters (My Body, Colours Everywhere, My Family, My Classroom)
4. Add Airtable fetch layer with localStorage caching
5. Migrate existing chapters to pull from Airtable
6. Build `progress.html`

---

## Dependencies

- Airtable base ID + read-only API key (from user)
- Cloudinary video URLs for the 5 new chapters (from user)
- Confirmation on vocabulary lists per chapter

---

*Plan saved: 2026-08-19*
