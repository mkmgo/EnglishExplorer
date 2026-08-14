# English Explorer — Dev Conventions

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

