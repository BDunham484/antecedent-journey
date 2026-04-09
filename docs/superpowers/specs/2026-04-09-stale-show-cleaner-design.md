# Stale Show Cleaner — Design Spec

**Date:** 2026-04-09  
**Status:** Approved

---

## Overview

A small, focused control panel box that detects and deletes stale concert records from the database. "Stale" means any show with a date before yesterday (today minus 1 day) — yesterday's shows are preserved. No scraping or upserting involved.

---

## Data Model Migration

### `Concert.date`: `String` → `Date` (ISODate)

The `date` field on the Concert model changes from a formatted string (e.g. `"Thu Apr 09 2026"`) to a proper MongoDB `Date` type. This unlocks native `$lt`/`$gte` date comparisons and indexed queries.

- Every scraper/insert path passes `new Date(parsedDateString)` instead of a formatted string.
- `customId.date` remains a `String` — it is an identity key for the compound unique index, not a queryable field.
- Frontend rendering: anywhere `concert.date` is rendered, pass it through a `formatConcertDate(isoDate)` helper (same pattern as the existing `formatScrapeTime` in `Control.js`). `formatConcertDate` is a new export added to `client/src/utils/helpers.js`.
- The existing DB is wiped and repopulated — no migration of old documents required.
- `getYesterdaysDate` in `helpers.js` and the `-2` convention are removed; cutoff logic lives in the hook and resolver.

### Stale Cutoff Definition

```js
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 1);
cutoff.setHours(0, 0, 0, 0); // start of yesterday
```

Shows from yesterday and today are preserved. Shows before yesterday midnight are stale.

---

## Server-Side Changes

### New Query: `hasStaleShows(date: String!): Boolean`

Added to `typeDefs.js` and `resolvers.js`.

```js
hasStaleShows: async (parent, { date }) => {
    const found = await Concert.findOne({ date: { $lt: new Date(date) } });
    return !!found;
}
```

Cheap — stops at the first match. `date` is `cutoff.toISOString()`, passed from the client hook.

### Updated Mutation: `deleteOldConcerts(date: String!): Int`

Return type changes from `[String]` to `Int`. The 180-iteration date-array loop is replaced with:

```js
deleteOldConcerts: async (parent, { date }) => {
    const result = await Concert.deleteMany({ date: { $lt: new Date(date) } });
    return result.deletedCount;
}
```

`typeDefs.js` and `DELETE_OLD_CONCERTS` in `mutations.js` updated to match the new return type.

---

## Client-Side

### New Hook: `useStaleShowCleaner`

**File:** `client/src/hooks/useStaleShowCleaner.js`

Encapsulates all state and GraphQL operations. Three phases:

1. **On mount** — runs `GET_HAS_STALE_SHOWS` query with the cutoff date. Populates `hasStale`.
2. **On `execute()` call** — fires `DELETE_OLD_CONCERTS` mutation. Sets `isDeleting: true`.
3. **On mutation complete** — calls `refetch` on `GET_HAS_STALE_SHOWS`. Sets `isDeleting: false`. `hasStale` reflects the re-query result.

Exposed surface:
```js
const { hasStale, isDeleting, execute } = useStaleShowCleaner();
```

Cutoff date computation lives inside the hook — Control.js has no date math.

### New GQL Entries

- `GET_HAS_STALE_SHOWS` added to `client/src/utils/queries.js`
- `DELETE_OLD_CONCERTS` return type updated in `client/src/utils/mutations.js`

### Control.js Integration

New panel added to the `control-panels` div alongside the existing two boxes.

```jsx
const [staleSwitch, setStaleSwitch] = useState(false);
const { hasStale, isDeleting, execute } = useStaleShowCleaner();

const handleStaleSwitch = () => {
    if (!staleSwitch) {
        setStaleSwitch(true);
        execute();
    }
};

useEffect(() => {
    if (!isDeleting && staleSwitch) {
        setStaleSwitch(false);
    }
}, [isDeleting]);
```

Box className logic:
- Default: `control-container` — antiquewhite border
- `hasStale && !isDeleting`: `control-container stale-alert` — pulsing dark red border
- `isDeleting`: `control-container stale-shimmer` — rotating red shimmer

Switch `disabled` when `!hasStale || isDeleting`.

### New CSS Classes (`index.css`)

**`.stale-alert`**
```css
.stale-alert {
  border: solid 2px #8b1a1a;
  animation: pulse-red-border 1.8s ease-in-out infinite;
}

@keyframes pulse-red-border {
  0%, 100% { border-color: #8b1a1a; box-shadow: 0 0 0px 0px rgba(139,26,26,0); }
  50%       { border-color: #c0392b; box-shadow: 0 0 6px 2px rgba(192,57,43,0.35); }
}
```

**`.stale-shimmer`**

Same `::before`/`::after` technique as `.venue-shimmer`, using the red palette from the mockup. Reuses the existing `shimmer-border-rotate` keyframe.

---

## Box Copy

| State | Body text |
|---|---|
| No stale shows | `No stale shows detected.` |
| Stale detected | `Stale shows detected.` |
| Deleting | `Deleting stale shows...` |
| Done (re-query clean) | `No stale shows detected.` |

---

## What This Does Not Include

- No count of stale shows displayed
- No per-venue breakdown
- No scraping or upserting
- No changes to `customId.date`
