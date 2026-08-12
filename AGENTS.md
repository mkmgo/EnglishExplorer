# English Explorer — Dev Conventions

## Platforms

- Must work on **Tizen** smart TVs and **mobile devices** (iOS/Android phones and tablets).
- When a feature behaves differently per platform (e.g., clipboard, dialogs, video autoplay), test and handle both: Tizen first, then mobile. Avoid `window.prompt`/`window.confirm` on Tizen — use in-page modals (e.g., `#inputModal`) so users can type or paste.
- Keep layouts responsive: desktop, tablet, and portrait/landscape phones must all fit without overflow.

## Dialogue layout (slide 3 "Greeting and Introduction" and similar)

- Dialogue bubbles alternate sides: Sam speaks on the **left** (`icardst` / accent background), Onza speaks on the **right** (`icardstb` / accent2 background).
- When adding a new phrase to an existing dialogue, place it **underneath the last phrase**, continuing the left/right alternation (left if Sam speaks, right if Onza speaks).
- `icardstb` cards always speak with the other voice automatically (via the delegated click handler) — no `onclick` needed.

## Retired slides

- Slides marked `data-retired` are excluded from progress count, navigation, and rewards. Reactivate by removing the attribute.
