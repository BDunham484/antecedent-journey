# AUSTIN: FOCUSED — Venue Control Box Design

**Date:** 2026-04-12
**Status:** Approved

## Overview

A new control box that allows targeted scrape+insert (scrapesert) runs against a user-selected subset of Austin venues, rather than the full venue list. Sits below `StaleShowControlBox` in `Control.js`. Mirrors the visual structure of `VenueControlBox` but introduces a multi-select pill-tag dropdown for venue selection.

---

## Section 1: Data Layer

**File:** `client/src/data/states/texas/austin.js`

Extend from a plain sorted array of strings to a sorted array of objects:

```js
const austinVenues = [
  { name: '13th Floor',                                   key: 'getThirteenthFloorData' },
  { name: '29th Street Ballroom',                         key: 'get29thStreetBallroomData' },
  { name: '3TEN Austin City Limits Live',                 key: 'get3TENAclLiveData' },
  { name: 'ABGB',                                         key: 'getTheAbgbData' },
  { name: "Antone's",                                     key: 'getAntonesData' },
  { name: 'Austin City Limits Live at The Moody Theater', key: 'getMoodyTheaterData' },
  { name: "C-Boy's Heart & Soul",                         key: 'getCBoysData' },
  { name: 'Chess Club',                                   key: 'getChessClubData' },
  { name: 'Continental Club',                             key: 'getContinentalClubData' },
].sort((a, b) =>
  a.name.replace(/^The\s+/i, '').localeCompare(b.name.replace(/^The\s+/i, ''))
);
```

`VenueControlBox` and `VenueList` currently receive and iterate raw strings. Both must be updated to use `venue.name` wherever they previously used `venue` directly.

---

## Section 2: Server

### ScrapeMeta model
Add field: `lastFocusedScrape: { type: Date }`

### typeDefs.js
- Add `lastFocusedScrape: String` to the `ScrapeMeta` type
- Add query: `getAustinFocusedShowData(venues: [String!]!): [Concert]`

### resolvers.js
```js
getAustinFocusedShowData: async (parent, { venues }) => {
    const results = await Promise.all(
        venues
            .filter(key => austinResolvers[key])
            .map(key => austinResolvers[key]())
    );
    return results.filter(Boolean).flat();
}
```

### Client queries
- `GET_SCRAPE_META` — add `lastFocusedScrape` to the query body
- `UPDATE_SCRAPE_META` mutation — no changes needed; call with `key: 'focused'`

---

## Section 3: Client Hook

**New file:** `client/src/hooks/useFocusedVenueScraper.js`

Same shape as `useAustinTXScraper`. Exposes `run(selectedKeys)` which accepts an array of resolver key strings at call time.

```
State: scrapeLoading, insertLoading, scrapeCount, insertCount, venueStatuses, error
```

Flow:
1. Fire `getAustinFocusedShowData({ venues: selectedKeys })`
2. Reduce results by venue name into `byVenue` map
3. Sequential insert loop — `setVenueStatuses` per venue (`inserting` → `success` | `error`)
4. `updateScrapeMeta({ variables: { key: 'focused', timestamp: new Date().toISOString() } })`

`venueStatuses` will only contain entries for venues in the current run. Venues not in `venueStatuses` return `'light-idle'` from `getVenueLightClass`, producing the darkened/idle appearance for unrun venues.

---

## Section 4: Component

**New files:**
- `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx`
- `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css`

### Layout (top to bottom)

```
┌─────────────────────────────────────────────┐
│ AUSTIN: FOCUSED              [switch]        │
│ Last ran: --                                 │
│                                              │
│ [Chess Club ×] [ABGB ×]  [▾ Add venue...]   │
│                                              │
│ SCRAPE: --          INSERT: --               │
│                                              │
│ ● C-Boy's Heart & Soul   ○ 13th Floor        │
│ ◐ Chess Club                                 │
└─────────────────────────────────────────────┘
```

### Dropdown behavior
- Trigger area displays selected venues as pill tags with `×` to deselect inline
- Clicking the trigger (or a `▾` affordance) opens the dropdown menu below
- Menu lists all 9 Austin venues with a checkbox per item
- Already-selected venues show a filled checkbox; unselected show empty
- Clicking an item toggles it selected/deselected
- Clicking outside closes the menu

### Switch behavior
- Disabled until at least one venue is selected
- On toggle: calls `run(selectedKeys)` from `useFocusedVenueScraper`
- Auto-resets to off when the insert run completes (mirrors `VenueControlBox`)

### VenueList
- Renders only the currently selected venues
- Uses the same `getVenueLightClass` logic: no entry in `venueStatuses` → `light-idle`; `inserting` → `light-yellow`; `success` → `light-green`; `error` → `light-red`
- Unselected venues do not appear in the list

### Shimmer
- Reuses `venueShimmer` from `ControlBox.module.css` while `scrapeLoading` is true

---

## Section 5: Control.js Integration

- Import `useFocusedVenueScraper` and `FocusedVenueControlBox`
- Wire up hook, destructure `run`, `scrapeLoading`, `insertLoading`, `scrapeCount`, `insertCount`, `venueStatuses`
- Render `<FocusedVenueControlBox ... />` in the `control-panels` div, below `<StaleShowControlBox />`

---

## Files Touched

| File | Change |
|------|--------|
| `client/src/data/states/texas/austin.js` | Extend to `{ name, key }` objects |
| `client/src/components/controls/venueControl/VenueControlBox.jsx` | Use `venue.name` |
| `client/src/components/VenueList.js` | Use `venue.name` |
| `client/src/utils/queries.js` | Add `lastFocusedScrape` to `GET_SCRAPE_META` |
| `server/models/ScrapeMeta.js` | Add `lastFocusedScrape` field |
| `server/schemas/typeDefs.js` | Add field + new query |
| `server/schemas/resolvers.js` | Add `getAustinFocusedShowData` resolver |
| `client/src/hooks/useFocusedVenueScraper.js` | New hook |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` | New component |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` | New styles |
| `client/src/pages/Control.js` | Wire up hook + render new box |
