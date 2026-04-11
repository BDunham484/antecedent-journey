# CSS Variables Full Conversion — Design Spec
_Date: 2026-04-11_

## Overview

Convert the antecedent client app (`client/src`) to use CSS custom properties throughout. The app already has a partial `:root` block in `index.css`; this work completes the conversion and organizes variables into semantic, component-prefixed sections.

---

## Scope

- **`client/src/index.css`** — restructure `:root`, replace all hardcoded values with variables
- **`client/src/App.css`** — delete entirely (pure unused CRA boilerplate)
- **`client/src/App.js`** — remove `App.css` import

No other files are in scope.

---

## Variable Structure

The new `:root` block will be organized into 5 labeled sections:

```css
:root {
  /* === CORE COLORS === */
  --background: #000;
  --dark: #525050;
  --darker: #383737;
  --darkest: #202020;
  --main-text: #EEE3D0;
  --accent: antiquewhite;
  --button: #386472;
  --cancel: #a23e25;

  /* === TYPOGRAPHY === */
  --font-primary: 'Kodchasan', sans-serif;
  --font-secondary: 'Bungee Hairline', cursive;
  --font-body: 'Montserrat', sans-serif;

  /* === INDICATOR LIGHTS === */
  --indicator-success: #2ecc71;
  --indicator-success-glow: rgba(46, 204, 113, 0.65);
  --indicator-warning: #f1c40f;
  --indicator-warning-glow: rgba(241, 196, 15, 0.65);
  --indicator-danger: #c0392b;
  --indicator-danger-glow: rgba(192, 57, 43, 0.65);
  --indicator-idle: #111111;

  /* === STALE / ALERT === */
  --stale-primary: #8b1a1a;
  --stale-secondary: #c0392b;
  --stale-tertiary: #e74c3c;
  --stale-glow: rgba(192, 57, 43, 0.35);
  --stale-glow-hidden: rgba(139, 26, 26, 0);

  /* === SHIMMER === */
  --shimmer-purple: #cc00ff;
  --shimmer-blue: #4d96ff;
  --shimmer-cyan: #00cfff;
  --shimmer-green: #00ff84;
  --shimmer-yellow: #ffd93d;
  --shimmer-red: #ff6b6b;
}
```

---

## Hardcoded → Variable Replacements

| Location | Current Value | Replacement |
|---|---|---|
| `body` background | `#525050` | `var(--dark)` |
| `body` font-family | `'Montserrat', sans-serif` | `var(--font-body)` |
| `header` font-family | `'Montserrat', sans-serif` | `var(--font-body)` |
| `header h1` font-family | `'Kodchasan', sans-serif` | `var(--font-primary)` |
| `.form-card` border | `#386472` | `var(--button)` |
| `.control-container` border | `antiquewhite` | `var(--accent)` |
| `.control-scrapeButton` color | `antiquewhite` | `var(--accent)` |
| `.venue-list-item` color | `antiquewhite` | `var(--accent)` |
| `.light-red` color + glow | `#c0392b` + rgba | `var(--indicator-danger)` + `var(--indicator-danger-glow)` |
| `.light-yellow` color + glow | `#f1c40f` + rgba | `var(--indicator-warning)` + `var(--indicator-warning-glow)` |
| `.light-green` color + glow | `#2ecc71` + rgba | `var(--indicator-success)` + `var(--indicator-success-glow)` |
| `.light-idle` | `#111111` | `var(--indicator-idle)` |
| `.stale-alert` border | `#8b1a1a` | `var(--stale-primary)` |
| `pulse-red-border` 0%/100% | `#8b1a1a` + hidden glow | `var(--stale-primary)` + `var(--stale-glow-hidden)` |
| `pulse-red-border` 50% | `#c0392b` + glow | `var(--stale-secondary)` + `var(--stale-glow)` |
| `.stale-shimmer::before` gradient stops | `#8b1a1a`, `#c0392b`, `#e74c3c` | `var(--stale-primary)`, `var(--stale-secondary)`, `var(--stale-tertiary)` |
| `.venue-shimmer::before` gradient stops | 6 hex colors | `var(--shimmer-purple/blue/cyan/green/yellow/red)` |

---

## Decisions

- **Naming convention:** State-based with component-prefixes (`--indicator-success`, `--stale-primary`, `--shimmer-purple`)
- **`App.css`:** Deleted — confirmed no component references any of its classes
- **Organization:** Single `:root` block with comment-section dividers (Option B)
- **No new files:** All variables stay in `index.css`
