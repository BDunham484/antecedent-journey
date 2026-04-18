# FocusedVenueControlBox — Dropdown → Selectable List Refactor

**Date:** 2026-04-18

## Problem

The current venue picker uses a custom dropdown inside `FocusedVenueControlBox`. The parent container uses `overflow: hidden` for the shimmer border effect, which clips the dropdown menu. Replacing the dropdown eliminates the clipping issue without touching the shimmer.

## Solution

Replace the dropdown, pills, and conditional bottom `VenueList` with a single always-visible two-column venue list. Venues start greyed out; clicking one toggles it selected (antiquewhite + idle indicator). The switch becomes enabled once at least one venue is selected. Flipping the switch runs the focused scrape on selected venues only.

## Component Structure

- `FocusedVenueControlBox.jsx` — self-contained; renders the two-column list inline (same sort + split logic as `VenueList.js`, ~15 lines). No changes to `VenueList.js`.
- `FocusedVenueControlBox.module.css` — all dropdown/pill classes removed; replaced with venue item classes (see CSS section).

## State

No new state. Existing state:
- `selectedVenues` — array of `{ name, key }` objects
- `focusedSwitch` — bool

Removed state: `isOpen` (dropdown open/close).

Removed refs/effects: `dropdownRef`, outside-click `useEffect`.

## Behavior Rules

| Condition | Switch | Venue clicks |
|---|---|---|
| No venues selected | Disabled | Enabled |
| 1+ venues selected, idle | Enabled | Enabled |
| Switch on / scrape loading / insert loading | Disabled | Disabled (no-op) |

**Auto-reset:** existing `useEffect` on `isInsertLoading` resets the switch; `setSelectedVenues([])` is added there so the list returns to all-grey after a completed run.

**`getVenueLightClass(venue.name)`** — unchanged. Unselected venues are never passed to `run()`, so their dot stays idle (`#111`). Selected venues receive live status classes during the run.

## CSS — `FocusedVenueControlBox.module.css`

All dropdown/pill classes deleted. New classes:

```css
.venueBody        /* flex row, gap: 1vw — same as VenueControlBox */
.venueCol         /* flex column, gap: 5px */
.venueItem        /* base row: flex, align-items center, gap 7px, padding 2px 3px, border-radius 3px */
.venueItemUnselected  /* color: var(--dark), cursor: pointer, hover: rgba(255,255,255,0.04) bg */
.venueItemSelected    /* color: var(--main-text), cursor: pointer, hover: rgba(255,255,255,0.04) bg */
.venueItemLocked      /* cursor: default, no hover — composed with selected or unselected */
```

`venueItemLocked` composes with the selection class, not replaces it. During a run a selected venue has `venueItem venueItemSelected venueItemLocked` (antiquewhite text, live indicator, no click). An unselected venue has `venueItem venueItemUnselected venueItemLocked` (grey text, idle indicator, no click). The `onClick` handler also guards against the locked condition so no toggle fires even if CSS is overridden.

Indicator dots use existing global classes from `index.css`: `.indicator-light`, `.light-idle`, `.light-green`, `.light-yellow`, `.light-red`. No new dot styles in the module.

## Render Structure

```
<div className={controlContainer | venueShimmer}>
  <div className={controlHeader}>          ← unchanged
  <section className={controlStatus}>     ← unchanged
  <div className={venueBody}>
    <div className={venueCol}>            ← first half of sorted venues
      <div className={venueItem + unselected|selected|locked} onClick={handleToggle}>
        <div className="indicator-light light-idle|light-green|..." />
        <span>{venue.name}</span>
      </div>
    </div>
    <div className={venueCol}>            ← second half
      ...
    </div>
  </div>
</div>
```

## Files Changed

| File | Change |
|---|---|
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` | Remove dropdown; add inline selectable list |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` | Remove dropdown/pill classes; add venue item classes |

No other files touched.
