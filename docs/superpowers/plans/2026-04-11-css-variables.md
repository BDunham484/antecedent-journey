# CSS Variables Full Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded color, font, and animation values in the client app with CSS custom properties, organized into semantic sections in `index.css`.

**Architecture:** All variables live in a single reorganized `:root` block in `index.css`, split into 5 labeled sections. Hardcoded values across the same file are replaced with `var(--name)` references. `App.css` (unused CRA boilerplate) is deleted and its import removed from `App.js`.

**Tech Stack:** Plain CSS, Create React App (React 18)

**Spec:** `docs/superpowers/specs/2026-04-11-css-variables-design.md`

---

## File Map

| Action | File |
|---|---|
| Modify | `client/src/index.css` |
| Modify | `client/src/App.js` |
| Delete | `client/src/App.css` |

---

## Task 1: Restructure `:root` in `index.css`

**Files:**
- Modify: `client/src/index.css:1-11`

- [ ] **Step 1: Replace the existing `:root` block**

In `client/src/index.css`, replace:

```css
:root {
  --background: #000;
  --dark: #525050;
  --darker: #383737;
  --darkest: #202020;
  --main-text: #EEE3D0;
  --button: #386472;
  --cancel: #a23e25;
  --primary-font: 'Kodchasan', sans-serif;
  --secondary-font: 'Bungee Hairline', cursive;
}
```

With:

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

> **Note:** `--primary-font` and `--secondary-font` are renamed to `--font-primary` and `--font-secondary` for consistency. Check for any existing usages of the old names — grep with `var(--primary-font)` and `var(--secondary-font)` before committing. If found, update those references too.

- [ ] **Step 2: Update existing usages of the renamed variables in `index.css`**

The old names (`--primary-font`, `--secondary-font`) are already used 5 times in `index.css`. Replace all occurrences:

In `client/src/index.css`, find and replace every instance of `var(--primary-font)` with `var(--font-primary)`, and every instance of `var(--secondary-font)` with `var(--font-secondary)`. The affected lines are:

- Line 89: `.form-card p` — `font-family: var(--primary-font)` → `var(--font-primary)`
- Line 100 (commented out): `var(--secondary-font)` → `var(--font-secondary)`
- Line 109: `.form-div` — `font-family: var(--secondary-font)` → `var(--font-secondary)`
- Line 113: `.form-card label` — `font-family: var(--secondary-font)` → `var(--font-secondary)`
- Line 132: `.login-signup-button` — `font-family: var(--secondary-font)` → `var(--font-secondary)`

- [ ] **Step 3: Verify no remaining old variable names exist**

```bash
grep -r "primary-font\|secondary-font" client/src
```

Expected: no matches anywhere in `client/src`.

- [ ] **Step 4: Commit**

```bash
git add client/src/index.css
git commit -m "refactor: reorganize :root CSS variables into labeled sections"
```

---

## Task 2: Replace core color, typography, and accent hardcoded values

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Replace hardcoded values in `body`**

Find:
```css
body {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #525050;
  color: var(--main-text);
}
```

Replace with:
```css
body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--dark);
  color: var(--main-text);
}
```

- [ ] **Step 2: Replace hardcoded font in `header`**

Find:
```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0 1vh 10vw;
  font-family: 'Montserrat', sans-serif;
  z-index: 9999;
  position: fixed;
  width: 100vw;
  height: 12vh;
  opacity: .90;
  background-color: var(--darkest);
}
```

Replace with:
```css
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0 1vh 10vw;
  font-family: var(--font-body);
  z-index: 9999;
  position: fixed;
  width: 100vw;
  height: 12vh;
  opacity: .90;
  background-color: var(--darkest);
}
```

- [ ] **Step 3: Replace hardcoded font in `header h1`**

Find:
```css
header h1 {
  /* font-family: 'Zen Dots', cursive; */
  /* font-family: 'Orbitron', sans-serif; */
  /* font-family: 'Audiowide', cursive; */
  /* font-family: 'Krona One', sans-serif; */
  font-family: 'Kodchasan', sans-serif;
  letter-spacing: 5px;
  font-weight: 100;
}
```

Replace with:
```css
header h1 {
  /* font-family: 'Zen Dots', cursive; */
  /* font-family: 'Orbitron', sans-serif; */
  /* font-family: 'Audiowide', cursive; */
  /* font-family: 'Krona One', sans-serif; */
  font-family: var(--font-primary);
  letter-spacing: 5px;
  font-weight: 100;
}
```

- [ ] **Step 4: Replace hardcoded border color in `.form-card`**

Find:
```css
.form-card {
  background-color: var(--darkest);
  border-radius: 10px;
  border: 1px solid #386472;
}
```

Replace with:
```css
.form-card {
  background-color: var(--darkest);
  border-radius: 10px;
  border: 1px solid var(--button);
}
```

- [ ] **Step 5: Replace `antiquewhite` in `.control-container`**

Find:
```css
.control-container {
    width: 30vw;
    height: 52vh;
    border: solid 2px antiquewhite;
```

Replace with:
```css
.control-container {
    width: 30vw;
    height: 52vh;
    border: solid 1px var(--accent);
```

- [ ] **Step 6: Replace `antiquewhite` in `.control-scrapeButton`**

Find:
```css
.control-scrapeButton {
  background-color: var(--darker);
  padding: 15px;
  margin-top: 3vh;
  color: antiquewhite;
  border-radius: 8px;
}
```

Replace with:
```css
.control-scrapeButton {
  background-color: var(--darker);
  padding: 15px;
  margin-top: 3vh;
  color: var(--accent);
  border-radius: 8px;
}
```

- [ ] **Step 7: Replace `antiquewhite` in `.venue-list-item`**

Find:
```css
.venue-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: antiquewhite;
}
```

Replace with:
```css
.venue-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: var(--accent);
}
```

- [ ] **Step 8: Verify no remaining hardcoded core color/font values**

```bash
grep -n "antiquewhite\|#525050\|#386472\|Montserrat\|Kodchasan\|Bungee" client/src/index.css
```

Expected: no matches (the commented-out font alternatives in `header h1` are fine to leave — they're comments, not active rules).

- [ ] **Step 9: Commit**

```bash
git add client/src/index.css
git commit -m "refactor: replace hardcoded core colors, fonts, and accent with CSS variables"
```

---

## Task 3: Replace indicator light hardcoded values

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Replace hardcoded values in `.light-red`**

Find:
```css
.light-red {
  background-color: #c0392b;
  box-shadow: 0 0 5px 2px rgba(192, 57, 43, 0.65);
}
```

Replace with:
```css
.light-red {
  background-color: var(--indicator-danger);
  box-shadow: 0 0 5px 2px var(--indicator-danger-glow);
}
```

- [ ] **Step 2: Replace hardcoded values in `.light-yellow`**

Find:
```css
.light-yellow {
  background-color: #f1c40f;
  box-shadow: 0 0 5px 2px rgba(241, 196, 15, 0.65);
  animation: pulse-light 1s ease-in-out infinite;
}
```

Replace with:
```css
.light-yellow {
  background-color: var(--indicator-warning);
  box-shadow: 0 0 5px 2px var(--indicator-warning-glow);
  animation: pulse-light 1s ease-in-out infinite;
}
```

- [ ] **Step 3: Replace hardcoded values in `.light-green`**

Find:
```css
.light-green {
  background-color: #2ecc71;
  box-shadow: 0 0 5px 2px rgba(46, 204, 113, 0.65);
}
```

Replace with:
```css
.light-green {
  background-color: var(--indicator-success);
  box-shadow: 0 0 5px 2px var(--indicator-success-glow);
}
```

- [ ] **Step 4: Replace hardcoded value in `.light-idle`**

Find:
```css
.light-idle {
  background-color: #111111;
}
```

Replace with:
```css
.light-idle {
  background-color: var(--indicator-idle);
}
```

- [ ] **Step 5: Verify no remaining hardcoded indicator values**

```bash
grep -n "#2ecc71\|#f1c40f\|#c0392b\|#111111\|rgba(46\|rgba(241\|rgba(192" client/src/index.css
```

Expected: remaining matches will only be in the stale/alert section (not yet converted) — none in the indicator light classes.

- [ ] **Step 6: Commit**

```bash
git add client/src/index.css
git commit -m "refactor: replace hardcoded indicator light colors with CSS variables"
```

---

## Task 4: Replace stale/alert hardcoded values

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Replace hardcoded border in `.stale-alert`**

Find:
```css
.stale-alert {
  border: solid 2px #8b1a1a !important;
  animation: pulse-red-border 1.8s ease-in-out infinite;
}
```

Replace with:
```css
.stale-alert {
  border: solid 1px var(--stale-primary) !important;
  animation: pulse-red-border 1.8s ease-in-out infinite;
}
```

- [ ] **Step 2: Replace hardcoded values in `@keyframes pulse-red-border`**

Find:
```css
@keyframes pulse-red-border {
  0%, 100% {
    border-color: #8b1a1a;
    box-shadow: 0 0 0px 0px rgba(139, 26, 26, 0);
  }
  50% {
    border-color: #c0392b;
    box-shadow: 0 0 6px 2px rgba(192, 57, 43, 0.35);
  }
}
```

Replace with:
```css
@keyframes pulse-red-border {
  0%, 100% {
    border-color: var(--stale-primary);
    box-shadow: 0 0 0px 0px var(--stale-glow-hidden);
  }
  50% {
    border-color: var(--stale-secondary);
    box-shadow: 0 0 6px 2px var(--stale-glow);
  }
}
```

- [ ] **Step 3: Replace hardcoded values in `.stale-shimmer::before` gradient**

Find:
```css
.stale-shimmer::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    var(--darkest) 0deg,
    var(--darkest) 200deg,
    #8b1a1a 220deg,
    #c0392b 260deg,
    #e74c3c 290deg,
    #c0392b 320deg,
    #8b1a1a 340deg,
    var(--darkest) 360deg
  );
  animation: shimmer-border-rotate 2s linear infinite;
  z-index: 0;
}
```

Replace with:
```css
.stale-shimmer::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    var(--darkest) 0deg,
    var(--darkest) 200deg,
    var(--stale-primary) 220deg,
    var(--stale-secondary) 260deg,
    var(--stale-tertiary) 290deg,
    var(--stale-secondary) 320deg,
    var(--stale-primary) 340deg,
    var(--darkest) 360deg
  );
  animation: shimmer-border-rotate 2s linear infinite;
  z-index: 0;
}
```

- [ ] **Step 4: Verify no remaining hardcoded stale/alert values**

```bash
grep -n "#8b1a1a\|#c0392b\|#e74c3c\|rgba(139\|rgba(192" client/src/index.css
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add client/src/index.css
git commit -m "refactor: replace hardcoded stale/alert colors with CSS variables"
```

---

## Task 5: Replace shimmer gradient hardcoded values

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Replace hardcoded colors in `.venue-shimmer::before` gradient**

Find:
```css
.venue-shimmer::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    #cc00ff,
    #4d96ff,
    #00cfff,
    #00ff84,
    #ffd93d,
    #ff6b6b,
    #cc00ff
  );
  animation: shimmer-border-rotate 4s linear infinite;
  z-index: 0;
}
```

Replace with:
```css
.venue-shimmer::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    var(--shimmer-purple),
    var(--shimmer-blue),
    var(--shimmer-cyan),
    var(--shimmer-green),
    var(--shimmer-yellow),
    var(--shimmer-red),
    var(--shimmer-purple)
  );
  animation: shimmer-border-rotate 4s linear infinite;
  z-index: 0;
}
```

- [ ] **Step 2: Verify no remaining hardcoded shimmer values**

```bash
grep -n "#cc00ff\|#4d96ff\|#00cfff\|#00ff84\|#ffd93d\|#ff6b6b" client/src/index.css
```

Expected: no matches.

- [ ] **Step 3: Verify no hardcoded color or font values remain anywhere in `index.css`**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|rgba(" client/src/index.css
```

Expected: no matches. All color values should now be inside `:root` variable definitions only.

- [ ] **Step 4: Commit**

```bash
git add client/src/index.css
git commit -m "refactor: replace hardcoded shimmer gradient colors with CSS variables"
```

---

## Task 6: Delete App.css and remove its import

**Files:**
- Modify: `client/src/App.js:1`
- Delete: `client/src/App.css`

- [ ] **Step 1: Remove the `App.css` import from `App.js`**

In `client/src/App.js`, remove line 1:

```js
import './App.css';
```

The file should now begin with:

```js
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
```

- [ ] **Step 2: Delete `App.css`**

```bash
rm client/src/App.css
```

- [ ] **Step 3: Verify the app still compiles**

```bash
cd client && npm start
```

Expected: app starts without errors or warnings about missing files. Open `http://localhost:3000` and confirm the UI looks correct — no visual regressions on the header, body background, control panel borders, and shimmer animations.

- [ ] **Step 4: Commit**

```bash
git add client/src/App.js
git rm client/src/App.css
git commit -m "chore: delete unused App.css and remove its import"
```
