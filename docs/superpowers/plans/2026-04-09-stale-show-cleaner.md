# Stale Show Cleaner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `Concert.date` from String to ISODate and add a Stale Show Cleaner control panel box that detects and bulk-deletes shows older than yesterday.

**Architecture:** The `date` field is migrated to MongoDB `Date` type, unlocking `$lt`/`$gte` queries. A new `hasStaleShows` query and updated `deleteOldConcerts` mutation power a new `useStaleShowCleaner` hook. The hook feeds a new control panel box in `Control.js` with three visual states: neutral, pulsing-red alert, and rotating-red shimmer.

**Tech Stack:** MongoDB/Mongoose (Date type), Apollo Server (GraphQL resolvers, typeDefs), React (hooks, useState/useEffect), Apollo Client (useQuery/useMutation/useLazyQuery), react-switch, CSS keyframe animations.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `server/models/Concert.js` | Modify | `date: String` → `date: Date` |
| `server/utils/concertUtils.js` | Modify | `makeBuildConcertObj` returns `date: d.toISOString()` instead of `d.toDateString()` |
| `server/schemas/resolvers.js` | Modify | addConcert converts date; Concert field resolver; concertsFromDb/getYesterdaysConcerts use ranges; deleteOldConcerts uses $lt; new hasStaleShows |
| `server/schemas/typeDefs.js` | Modify | add `hasStaleShows` query; `deleteOldConcerts` return type `[String]` → `Int` |
| `client/src/utils/helpers.js` | Modify | Remove `getYesterdaysDate`; add `formatConcertDate` |
| `client/src/utils/queries.js` | Modify | Add `GET_HAS_STALE_SHOWS` |
| `client/src/utils/mutations.js` | Modify | `DELETE_OLD_CONCERTS` return scalar `Int` |
| `client/src/components/DB_Cleaners/CleanByDate/CleanByDate.jsx` | Modify | Compute cutoff as ISO string; handle Int return from deleteOldConcerts |
| `client/src/hooks/useStaleShowCleaner.js` | Create | New hook: stale-check query + delete mutation + refetch |
| `client/src/index.css` | Modify | Add `.stale-alert` and `.stale-shimmer` CSS classes |
| `client/src/pages/Control.js` | Modify | Add Stale Show Cleaner panel |

---

## Task 1: Migrate Concert.date to ISODate in Mongoose model

**Files:**
- Modify: `server/models/Concert.js`

- [ ] **Step 1: Update the date field type**

In `server/models/Concert.js`, change line 22 from:
```js
date: {
    type: String
},
```
to:
```js
date: {
    type: Date
},
```

- [ ] **Step 2: Wipe the concerts collection**

The DB has stale string-format dates that are incompatible. Drop the collection so new inserts start clean.

Connect to your MongoDB instance and run:
```
use <your-db-name>
db.concerts.drop()
```

Or via Mongoose shell / Compass: drop the `concerts` collection.

- [ ] **Step 3: Commit**

```bash
git add server/models/Concert.js
git commit -m "feat: migrate Concert.date from String to ISODate"
```

---

## Task 2: Update `makeBuildConcertObj` to produce ISO date strings

**Files:**
- Modify: `server/utils/concertUtils.js`

**Context:** `makeBuildConcertObj` is the shared factory used by all 9 venue scrapers. Changing it here cascades everywhere automatically.

- [ ] **Step 1: Change toDateString() to toISOString() in the dateStr computation**

In `server/utils/concertUtils.js`, replace lines 62–67:
```js
const dateStr = dateTime
    ? (() => {
        const d = new Date(dateTime.replace(/\s+\d{1,2}:\d{2}.*$/, '').trim());
        return isNaN(d.getTime()) ? dateTime : d.toDateString();
    })()
    : null;
```
with:
```js
const dateStr = dateTime
    ? (() => {
        const d = new Date(dateTime.replace(/\s+\d{1,2}:\d{2}.*$/, '').trim());
        return isNaN(d.getTime()) ? dateTime : d.toISOString();
    })()
    : null;
```

- [ ] **Step 2: Verify the comment on line 54 still reflects reality**

The comment reads:
```
* Parses dateTime into separate date (toDateString format, for querying) and
```
Update it to:
```js
/**
 * Factory that returns a buildConcertObj function bound to a specific venue.
 * Parses dateTime into separate date (ISO 8601 string, for DB storage) and
 * time (for display) fields.
 *
 * Usage: const buildConcertObj = makeBuildConcertObj(venue);
 */
```

- [ ] **Step 3: Commit**

```bash
git add server/utils/concertUtils.js
git commit -m "feat: concertUtils date output ISO 8601 instead of toDateString"
```

---

## Task 3: Update showlist scraper in resolvers.js

**Files:**
- Modify: `server/schemas/resolvers.js` (around line 849)

**Context:** The `getAustinList` resolver builds concert objects directly (not via `makeBuildConcertObj`). It has its own `toDateString()` call.

- [ ] **Step 1: Change toDateString to toISOString in getAustinList**

Find this line (around line 849):
```js
const newDate = new Date(year, month, day).toDateString();
```
Change to:
```js
const newDate = new Date(year, month, day).toISOString();
```

- [ ] **Step 2: Commit**

```bash
git add server/schemas/resolvers.js
git commit -m "feat: showlist scraper date output ISO 8601"
```

---

## Task 4: Update `addConcert` resolver to store Date objects; add Concert field resolver

**Files:**
- Modify: `server/schemas/resolvers.js`

**Context:** 
- `addConcert` receives `date` as a String from GraphQL and must convert it to `new Date()` before `$set`.
- When Mongoose returns a Concert with a `Date` field, GraphQL's String scalar serializes it as `"[object Date]"` — wrong. We add a `Concert` field resolver that returns `date.toISOString()` for safe, consistent output.

- [ ] **Step 1: Add Concert type field resolver block**

In `server/schemas/resolvers.js`, after the closing of `Mutation: { ... }` and before `module.exports`, add:

```js
    Concert: {
        date: (parent) => {
            if (!parent.date) return null;
            const d = new Date(parent.date);
            return isNaN(d.getTime()) ? String(parent.date) : d.toISOString();
        }
    },
```

The full resolvers object structure should end like:
```js
const resolvers = {
    Query: { ... },
    Mutation: { ... },
    Concert: {
        date: (parent) => {
            if (!parent.date) return null;
            const d = new Date(parent.date);
            return isNaN(d.getTime()) ? String(parent.date) : d.toISOString();
        }
    },
};
```

- [ ] **Step 2: Update the addConcert mutation resolver to convert date to Date object**

Find the `addConcert` resolver (around line 925):
```js
addConcert: async (parent, { ...data }) => {
    const result = await Concert.findOneAndUpdate(
        {
            'customId.headliner': data.customId.headliner,
            'customId.date': data.customId.date,
            'customId.venue': data.customId.venue
        },
        { $set: { ...data } },
        { upsert: true, new: true }
    );

    return result;
},
```

Change `{ $set: { ...data } }` to convert `date` before storage:
```js
addConcert: async (parent, { ...data }) => {
    const payload = {
        ...data,
        date: data.date ? new Date(data.date) : null,
    };
    const result = await Concert.findOneAndUpdate(
        {
            'customId.headliner': payload.customId.headliner,
            'customId.date': payload.customId.date,
            'customId.venue': payload.customId.venue
        },
        { $set: { ...payload } },
        { upsert: true, new: true }
    );

    return result;
},
```

- [ ] **Step 3: Commit**

```bash
git add server/schemas/resolvers.js
git commit -m "feat: addConcert stores date as ISODate; Concert field resolver serializes date"
```

---

## Task 5: Update `concertsFromDb` and `getYesterdaysConcerts` to use date-range queries

**Files:**
- Modify: `server/schemas/resolvers.js`

**Context:** Both resolvers currently do `Concert.find({ date: dateString })` — string equality. With `date` now a `Date` field, this match will always return zero results. They need date-range queries.

- [ ] **Step 1: Update `concertsFromDb` resolver**

Find (around line 66):
```js
concertsFromDb: async (parent, { date }) => {
    const concerts = await Concert.find({
        date: date
    })
        .sort({ venue: 'asc' })
        .populate('yes')
        .populate('no')
        .populate('maybe')
        .exec();

    return concerts
},
```

Replace with:
```js
concertsFromDb: async (parent, { date }) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const concerts = await Concert.find({
        date: { $gte: start, $lte: end }
    })
        .sort({ venue: 'asc' })
        .populate('yes')
        .populate('no')
        .populate('maybe')
        .exec();

    return concerts;
},
```

- [ ] **Step 2: Update `getYesterdaysConcerts` resolver**

Find (around line 813):
```js
getYesterdaysConcerts: async (parent, { date }) => {
    // console.log('GETYESTERDAYSCONCERTS HAS RUN');
    const yesterdaysConcerts = await Concert.find({ date: date })
        .exec();

    return yesterdaysConcerts;
```

Replace with:
```js
getYesterdaysConcerts: async (parent, { date }) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const yesterdaysConcerts = await Concert.find({
        date: { $gte: start, $lte: end }
    }).exec();

    return yesterdaysConcerts;
```

- [ ] **Step 3: Commit**

```bash
git add server/schemas/resolvers.js
git commit -m "feat: concertsFromDb and getYesterdaysConcerts use date-range queries"
```

---

## Task 6: Replace `deleteOldConcerts` loop with `$lt` query; update return type

**Files:**
- Modify: `server/schemas/resolvers.js`
- Modify: `server/schemas/typeDefs.js`

- [ ] **Step 1: Replace the resolver**

Find `deleteOldConcerts` (around line 1042) — the entire resolver including the 180-iteration loop:
```js
deleteOldConcerts: async (parent, { date }) => {
    //declare empty array for dates
    const dateArr = [];
    //function to get the previous date based on the date passed into it
    const dayBefore = (date) => {
        const before = new Date(date);
        before.setDate(before.getDate() - 1);
        const theLastDay = before.toDateString();
        return theLastDay;
    }
    //save date to another variable for the for loop
    let arrayDate = date;
    //for loop that gets previous weeks worth of date and pushes the to array
    for (let i = 0; i < 180; i++) {
        let yesterday = dayBefore(arrayDate);
        dateArr.push(yesterday);
        arrayDate = yesterday;
    }
    const oldConcertsArr = []
    //map through array of last weeks dates and delete any shows with that date
    await Promise.all(dateArr.map(async (date) => {
        const concerts = await Concert.find({ date: date })

        await concerts.map((concert) => {
            oldConcertsArr.push(concert._id);
        })
    }));
    const deletedConcerts = await Concert.deleteMany({
        _id: { $in: oldConcertsArr }
    });
    // returns array of deleted dates
    return dateArr;
    // return deletedConcerts;
},
```

Replace with:
```js
deleteOldConcerts: async (parent, { date }) => {
    const result = await Concert.deleteMany({
        date: { $lt: new Date(date) }
    });
    return result.deletedCount;
},
```

- [ ] **Step 2: Update typeDefs return type**

In `server/schemas/typeDefs.js`, find:
```
deleteOldConcerts(date: String!): [String]
```
Change to:
```
deleteOldConcerts(date: String!): Int
```

- [ ] **Step 3: Commit**

```bash
git add server/schemas/resolvers.js server/schemas/typeDefs.js
git commit -m "feat: deleteOldConcerts uses $lt query and returns Int deletedCount"
```

---

## Task 7: Add `hasStaleShows` query

**Files:**
- Modify: `server/schemas/typeDefs.js`
- Modify: `server/schemas/resolvers.js`

- [ ] **Step 1: Add to typeDefs**

In `server/schemas/typeDefs.js`, inside the `type Query` block, add after `getScrapeMeta: ScrapeMeta`:
```
hasStaleShows(date: String!): Boolean
```

- [ ] **Step 2: Add resolver**

In `server/schemas/resolvers.js`, inside `Query: { ... }`, add after `getScrapeMeta`:
```js
hasStaleShows: async (parent, { date }) => {
    const found = await Concert.findOne({ date: { $lt: new Date(date) } });
    return !!found;
},
```

- [ ] **Step 3: Commit**

```bash
git add server/schemas/typeDefs.js server/schemas/resolvers.js
git commit -m "feat: add hasStaleShows query"
```

---

## Task 8: Update `CleanByDate.jsx` for new return type; remove `getYesterdaysDate` from helpers

**Files:**
- Modify: `client/src/components/DB_Cleaners/CleanByDate/CleanByDate.jsx`
- Modify: `client/src/utils/helpers.js`

**Context:** `deleteOldConcerts` now returns `Int` not `[String]`. `CleanByDate.jsx` currently reads `.length` off the result. Also uses `getYesterdaysDate` from helpers — replacing with direct cutoff computation. `getYesterdaysDate` is removed from helpers since the new cutoff logic is localized.

- [ ] **Step 1: Rewrite `CleanByDate.jsx`**

Replace the full contents of `client/src/components/DB_Cleaners/CleanByDate/CleanByDate.jsx` with:

```jsx
import { useMutation } from "@apollo/client";
import { useCallback, useEffect, useMemo } from 'react';
import { DELETE_OLD_CONCERTS } from "../../../utils/mutations";

const CleanByDate = ({ setCleanCount, setIsCleanerLoading }) => {
    const [deleteOldConcerts, { loading }] = useMutation(DELETE_OLD_CONCERTS);

    useMemo(() => loading ?
        setTimeout(() => setIsCleanerLoading(true), 500) :
        setTimeout(() => setIsCleanerLoading(false), 500)
    , [loading, setIsCleanerLoading]);

    const cutoff = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }, []);

    const deleteThemShits = useCallback(async (date) => {
        try {
            const results = await deleteOldConcerts({ variables: { date } });
            if (results) {
                setCleanCount(results.data?.deleteOldConcerts ?? 0);
            }
            return results;
        } catch (err) {
            console.error(err);
        }
    }, [deleteOldConcerts, setCleanCount]);

    useMemo(async () => await deleteThemShits(cutoff), [deleteThemShits, cutoff]);

    return <></>;
};

export default CleanByDate;
```

- [ ] **Step 2: Remove `getYesterdaysDate` from helpers.js**

In `client/src/utils/helpers.js`, delete lines 15–20:
```js
export const getYesterdaysDate = (date) => {
    const before = new Date(date);
    before.setDate(before.getDate() - 2);
    const yesterday = before.toDateString();
    return yesterday;
};
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/DB_Cleaners/CleanByDate/CleanByDate.jsx client/src/utils/helpers.js
git commit -m "feat: CleanByDate uses ISO cutoff and Int return; remove getYesterdaysDate"
```

---

## Task 9: Add `formatConcertDate` helper, `GET_HAS_STALE_SHOWS` query, update `DELETE_OLD_CONCERTS` mutation

**Files:**
- Modify: `client/src/utils/helpers.js`
- Modify: `client/src/utils/queries.js`
- Modify: `client/src/utils/mutations.js`

- [ ] **Step 1: Add `formatConcertDate` to helpers.js**

In `client/src/utils/helpers.js`, add after `getTodaysDate`:
```js
export const formatConcertDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()}`;
};
```

- [ ] **Step 2: Add `GET_HAS_STALE_SHOWS` to queries.js**

In `client/src/utils/queries.js`, add at the bottom:
```js
export const GET_HAS_STALE_SHOWS = gql`
    query hasStaleShows($date: String!) {
        hasStaleShows(date: $date)
    }
`;
```

- [ ] **Step 3: Update `DELETE_OLD_CONCERTS` in mutations.js**

Find:
```js
export const DELETE_OLD_CONCERTS = gql`
    mutation deleteOldConcerts ($date: String!) {
        deleteOldConcerts(date: $date) 
    }
`;
```
Change to:
```js
export const DELETE_OLD_CONCERTS = gql`
    mutation deleteOldConcerts ($date: String!) {
        deleteOldConcerts(date: $date)
    }
`;
```
(No functional change needed — the scalar return type `Int` doesn't require a selection set in GraphQL. This step is a no-op if already formatted this way. Verify the mutation has no selection set `{ ... }` since `Int` is a scalar.)

- [ ] **Step 4: Commit**

```bash
git add client/src/utils/helpers.js client/src/utils/queries.js client/src/utils/mutations.js
git commit -m "feat: add formatConcertDate helper, GET_HAS_STALE_SHOWS query"
```

---

## Task 10: Create `useStaleShowCleaner` hook

**Files:**
- Create: `client/src/hooks/useStaleShowCleaner.js`

- [ ] **Step 1: Create the hook file**

Create `client/src/hooks/useStaleShowCleaner.js`:

```js
import { useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { DELETE_OLD_CONCERTS } from '../utils/mutations';
import { GET_HAS_STALE_SHOWS } from '../utils/queries';

const useStaleShowCleaner = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const cutoff = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }, []);

    const { data, refetch } = useQuery(GET_HAS_STALE_SHOWS, {
        variables: { date: cutoff },
        fetchPolicy: 'network-only',
    });

    const [deleteOldConcerts] = useMutation(DELETE_OLD_CONCERTS);

    const hasStale = data?.hasStaleShows ?? false;

    const execute = async () => {
        setIsDeleting(true);
        try {
            await deleteOldConcerts({ variables: { date: cutoff } });
        } catch (err) {
            console.error('useStaleShowCleaner delete error:', err);
        }
        await refetch();
        setIsDeleting(false);
    };

    return { hasStale, isDeleting, execute };
};

export default useStaleShowCleaner;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useStaleShowCleaner.js
git commit -m "feat: add useStaleShowCleaner hook"
```

---

## Task 11: Add CSS for `stale-alert` and `stale-shimmer`

**Files:**
- Modify: `client/src/index.css`

- [ ] **Step 1: Add stale-alert and stale-shimmer classes**

In `client/src/index.css`, after the `.venue-shimmer > *` block (around line 306), add:

```css
/* STALE SHOW CLEANER STATES */
.stale-alert {
  border: solid 2px #8b1a1a !important;
  animation: pulse-red-border 1.8s ease-in-out infinite;
}

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

.stale-shimmer {
  border: none !important;
}

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

.stale-shimmer::after {
  content: '';
  position: absolute;
  inset: 2px;
  background: var(--darkest);
  border-radius: 6px;
  z-index: 1;
}

.stale-shimmer > * {
  position: relative;
  z-index: 2;
}
```

Note: `.stale-shimmer` reuses the existing `shimmer-border-rotate` keyframe already defined in this file — no need to re-declare it.

- [ ] **Step 2: Commit**

```bash
git add client/src/index.css
git commit -m "feat: add stale-alert and stale-shimmer CSS classes"
```

---

## Task 12: Add Stale Show Cleaner panel to Control.js

**Files:**
- Modify: `client/src/pages/Control.js`

- [ ] **Step 1: Import `useStaleShowCleaner`**

At the top of `client/src/pages/Control.js`, add:
```js
import useStaleShowCleaner from "../hooks/useStaleShowCleaner";
```

- [ ] **Step 2: Add hook call and state inside the `Control` component**

After the existing `const [venueSwitch, setVenueSwitch] = useState(false);` line, add:
```js
const [staleSwitch, setStaleSwitch] = useState(false);
const { hasStale, isDeleting, execute } = useStaleShowCleaner();
```

- [ ] **Step 3: Add handler**

After the existing `handleVenueSwitch` function, add:
```js
const handleStaleSwitch = () => {
    if (!staleSwitch) {
        setStaleSwitch(true);
        execute();
    }
};
```

- [ ] **Step 4: Add useEffect to reset switch when deletion completes**

After the existing two `useEffect` blocks, add:
```js
useEffect(() => {
    if (!isDeleting && staleSwitch) {
        setStaleSwitch(false);
    }
}, [isDeleting, staleSwitch]);
```

- [ ] **Step 5: Add the panel JSX**

Inside the `<div className={'control-panels'}>` block, after the closing `</div>` of the `AUSTIN: VENUES` panel, add:

```jsx
{/* --- STALE SHOWS --- */}
<div className={`control-container${isDeleting ? ' stale-shimmer' : hasStale ? ' stale-alert' : ''}`}>
    <h2>STALE SHOWS</h2>
    <div className={'control-date'}>
        {isDeleting
            ? 'Deleting stale shows...'
            : hasStale
                ? 'Stale shows detected.'
                : 'No stale shows detected.'}
    </div>
    <Switch
        onChange={handleStaleSwitch}
        checked={staleSwitch}
        offColor={'#525050'}
        onColor={'#525050'}
        offHandleColor={'#383737'}
        onHandleColor={'#383737'}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow={'#eee3d0'}
        activeBoxShadow={'#eee3d0'}
        disabled={!hasStale || isDeleting}
    />
</div>
```

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/Control.js
git commit -m "feat: add Stale Show Cleaner panel to Control page"
```

---

## Task 13: End-to-end smoke test

**No code changes — verification only.**

- [ ] **Step 1: Start the server and client**

```bash
# terminal 1
cd server && npm start

# terminal 2
cd client && npm start
```

- [ ] **Step 2: Verify DB is empty (no stale shows)**

Navigate to the Control page. The STALE SHOWS box should show:
- Antiquewhite border (no pulse)
- Text: `No stale shows detected.`
- Switch disabled

- [ ] **Step 3: Run the venue scraper to populate shows**

Flip the AUSTIN: VENUES switch. Wait for it to complete. Venue scrapers should insert shows with ISODate `date` fields.

- [ ] **Step 4: Verify a fresh scrape produces no stale shows**

All shows scraped today are for future/current dates. The STALE SHOWS box should still show neutral state.

- [ ] **Step 5: Manually insert a backdated show to trigger the stale state**

In your MongoDB client (Compass or shell), insert a test document:
```js
db.concerts.insertOne({
    customId: { headliner: "TestArtist", date: "20200101", venue: "TestVenue" },
    artists: "TestArtist",
    date: new Date("2020-01-01T00:00:00.000Z"),
    venue: "TestVenue"
})
```

- [ ] **Step 6: Reload the Control page and verify alert state**

The STALE SHOWS box should now show:
- Pulsing dark red border
- Text: `Stale shows detected.`
- Switch enabled

- [ ] **Step 7: Flip the switch and verify deletion**

Flip the switch. Verify:
- Border becomes rotating red shimmer
- Text changes to `Deleting stale shows...`
- Switch is on

Wait for completion:
- Border returns to antiquewhite (neutral)
- Text: `No stale shows detected.`
- Switch disabled

- [ ] **Step 8: Verify the backdated show is gone**

In MongoDB Compass / shell:
```js
db.concerts.find({ artists: "TestArtist" })
// should return empty
```

- [ ] **Step 9: Verify existing CleanByDate still works**

Flip the AUSTIN: SHOWLIST switch. Verify the CLEAN status in that panel shows ✅ and a count after completion (uses the updated `deleteOldConcerts` returning Int).
