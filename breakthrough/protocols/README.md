# Protocols

Daily lesson protocols for English Explorer classes.

## File naming

Use the date in `YYYY-MM-DD.html` format. Every file is a standalone HTML page — no external JS or CSS.

## Template structure

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <title>Protocol DD/MM/YYYY</title>
    <meta name="description" content="English Explorer — Protocol DD/MM/YYYY" />
    <meta property="og:image" content="https://res.cloudinary.com/dmkhsyfzf/image/upload/q_auto/f_auto/v1781698464/protocol_r392x1.png" />
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dmkhsyfzf/image/upload/q_auto/f_auto/v1781698464/protocol_r392x1.png" />
    <link rel="apple-touch-icon" href="https://res.cloudinary.com/dmkhsyfzf/image/upload/q_auto/f_auto/v1781698464/protocol_r392x1.png" />
    <style>
      /* Copy the :root variables and base styles from the latest protocol file */
      :root {
        --bg: #FAF7F2;
        --ink: #14213d;
        --muted: #60708d;
        --accent: #e43703;
        --accent2: #ffb866;
        --panel: #fcfcfc;
        --shadow: 0 18px 50px rgba(20, 33, 61, 0.14);
      }
      /* Weekday accent colours — applied via data-weekday on .container */
      .container[data-weekday="mon"] { --accent: #2563eb; }
      .container[data-weekday="tue"] { --accent: #e43703; }
      .container[data-weekday="wed"] { --accent: #0d9488; }
      .container[data-weekday="thu"] { --accent: #7c3aed; }
      .container[data-weekday="fri"] { --accent: #dc2626; }
      .container[data-weekday="sat"] { --accent: #d97706; }
      .container[data-weekday="sun"] { --accent: #475569; }
      /* ... rest of styles ... */
    </style>
  </head>
  <body>
    <div class="container" data-weekday="xxx">
      <h1>Protocol DD/MM/YYYY</h1>
      <p class="date-sub">English Explorer | Breakthrough</p>

      <!-- Copy instruction (EN + ZH) -->
      <div class="intro">
        Please copy these sentences into your exercise book below the vocabulary list. All words and expressions must be fully understood and memorised.
        <span class="zh">请将这些句子抄到练习本的词汇表下方。所有单词和表达方式都必须完全理解和记忆。</span>
      </div>

      <!-- Story title + subtitle -->
      <h2>Story Title</h2>
      <p class="story-subtitle">One-line description.</p>

      <!-- Story sections (one per scene) -->
      <div class="story-section">
        <h3>Scene Name</h3>
        <p>One sentence per line.</p>
      </div>

      <!-- Vocabulary table for each day covered -->
      <h2>Vocabulary — DD/MM/YYYY</h2>
      <table class="vocab-table">
        <thead><tr><th>English</th><th>Chinese</th></tr></thead>
        <tbody>
          <tr><td>English phrase</td><td>中文翻译</td></tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
```

## Section order

1. **Header** — title, date subtitle
2. **Intro block** — bilingual copy instruction
3. **Story title + subtitle** — from the lesson plan
4. **Story sections** — one `.story-section` card per scene, each with an `<h3>` heading and `<p>` sentences
5. **Vocabulary tables** — one table per date, English column first, Chinese second

## Rules

- Inline `<style>` only — no external files.
- Use the same `:root` colour variables and `clamp()` font sizing as existing files.
- No JavaScript unless the protocol specifically requires interactivity.
- **When a new protocol is created, add a row to `updates.html`** in the **Nimza** (left) column table. The row format is:
  - **Date**: the protocol date in `DD/MM/YYYY` format
  - **File**: link text `Lesson Protocol DD/MM/YYYY`, href pointing to the protocol file on GitHub Pages (e.g. `https://mkmgo.github.io/EnglishExplorer/breakthrough/protocols/YYYY-MM-DD.html`), with class `nima-col` and `target="_blank"`
  - **Note**: `For tomorrow`
  - Place the new row **at the top** of Nimza's `<tbody>`, above any existing rows.

## Weekday colours

Each protocol file gets a unique accent colour for `h1` and `h3` based on the day of the week. Set `data-weekday` on `.container` to one of:

| Day | `data-weekday` | Colour | Hex |
|---|---|---|---|
| Monday | `mon` | Blue | `#2563eb` |
| Tuesday | `tue` | Orange | `#e43703` |
| Wednesday | `wed` | Teal | `#0d9488` |
| Thursday | `thu` | Purple | `#7c3aed` |
| Friday | `fri` | Crimson | `#dc2626` |
| Saturday | `sat` | Amber | `#d97706` |
| Sunday | `sun` | Slate | `#475569` |

The CSS attribute selectors in each file override `--accent` from `:root`. No JS required.
