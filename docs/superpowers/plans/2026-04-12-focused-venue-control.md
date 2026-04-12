# AUSTIN: FOCUSED Venue Control Box Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `FocusedVenueControlBox` to the Control page that lets a user pick a subset of Austin venues from a pill-tag multi-select dropdown and run a targeted scrapesert on only those venues.

**Architecture:** Extend `austin.js` to a `{ name, key }` registry; add a `getAustinFocusedShowData(venues: [String!]!)` GQL query that runs only the requested scrapers server-side; add a `useFocusedVenueScraper` hook that mirrors `useAustinTXScraper` but accepts selected keys at call time; build `FocusedVenueControlBox` with a pill-tag dropdown, status row, and VenueList with lighting.

**Tech Stack:** React, Apollo Client (useLazyQuery/useMutation), GraphQL, Mongoose, CSS Modules, react-switch

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `client/src/data/states/texas/austin.js` | Modify | Extend string array to `{ name, key }` objects |
| `client/src/components/VenueList.js` | Modify | Use `venue.name` instead of `venue` string |
| `client/src/components/controls/venueControl/VenueControlBox.jsx` | Modify | No logic change — works once VenueList updated |
| `server/models/ScrapeMeta.js` | Modify | Add `lastFocusedScrape` field |
| `server/schemas/typeDefs.js` | Modify | Add field to ScrapeMeta type + new query |
| `server/schemas/resolvers.js` | Modify | Handle `'focused'` key in updateScrapeMeta + add new resolver |
| `client/src/utils/queries.js` | Modify | Add `lastFocusedScrape` to GET_SCRAPE_META + new query |
| `client/src/utils/mutations.js` | Modify | Add `lastFocusedScrape` to UPDATE_SCRAPE_META return |
| `client/src/hooks/useFocusedVenueScraper.js` | Create | New hook |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` | Create | New component |
| `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` | Create | New styles |
| `client/src/pages/Control.js` | Modify | Wire hook + render component |

---

## Task 1: Extend austin.js and update VenueList

**Files:**
- Modify: `client/src/data/states/texas/austin.js`
- Modify: `client/src/components/VenueList.js`

- [ ] **Step 1: Replace austin.js with the venue registry**

Replace the entire file contents:

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

export default austinVenues;
```

- [ ] **Step 2: Update VenueList to use venue.name**

Replace the entire file contents:

```js
const VenueList = ({ venues, getStatusClass }) => {
    const sorted = [...venues].sort((a, b) => a.name.localeCompare(b.name));
    const mid = Math.ceil(sorted.length / 2);
    const colA = sorted.slice(0, mid);
    const colB = sorted.slice(mid);

    const renderItem = (venue) => (
        <div key={venue.name.replace(/\s+/g, '')} className='venue-list-item'>
            <div className={`indicator-light ${getStatusClass(venue.name)}`} />
            <span>{venue.name}</span>
        </div>
    );

    return (
        <>
            <div className='venue-list-col'>{colA.map(renderItem)}</div>
            <div className='venue-list-col'>{colB.map(renderItem)}</div>
        </>
    );
};

export default VenueList;
```

- [ ] **Step 3: Verify VenueControlBox still works**

`VenueControlBox` passes `austinVenues` directly to `VenueList` and its `getVenueLightClass` receives a name string from `VenueList` (since we updated VenueList to call `getStatusClass(venue.name)`). No changes needed to `VenueControlBox.jsx`. Open the app and confirm the `AUSTIN: VENUES` box still renders venue names with correct lighting.

- [ ] **Step 4: Commit**

```bash
git add client/src/data/states/texas/austin.js client/src/components/VenueList.js
git commit -m "refactor: extend austin venue registry to { name, key } objects"
```

---

## Task 2: Server — ScrapeMeta, typeDefs, resolvers

**Files:**
- Modify: `server/models/ScrapeMeta.js`
- Modify: `server/schemas/typeDefs.js`
- Modify: `server/schemas/resolvers.js`

- [ ] **Step 1: Add lastFocusedScrape to ScrapeMeta model**

In `server/models/ScrapeMeta.js`, replace the schema definition:

```js
const scrapeMetaSchema = new Schema({
    lastShowlistScrape: { type: String, default: null },
    lastVenueScrape: { type: String, default: null },
    lastFocusedScrape: { type: String, default: null },
});
```

- [ ] **Step 2: Add lastFocusedScrape to ScrapeMeta type in typeDefs**

In `server/schemas/typeDefs.js`, find the `ScrapeMeta` type and add the new field. Locate:

```
type ScrapeMeta {
    lastShowlistScrape: String
    lastVenueScrape: String
}
```

Replace with:

```
type ScrapeMeta {
    lastShowlistScrape: String
    lastVenueScrape: String
    lastFocusedScrape: String
}
```

- [ ] **Step 3: Add getAustinFocusedShowData to typeDefs Query**

In `server/schemas/typeDefs.js`, find the line:

```
getAustinTXShowData: [Concert]
```

Add directly after it:

```
getAustinFocusedShowData(venues: [String!]!): [Concert]
```

- [ ] **Step 4: Update updateScrapeMeta resolver to handle 'focused' key**

In `server/schemas/resolvers.js`, find the `updateScrapeMeta` resolver (around line 1344):

```js
updateScrapeMeta: async (parent, { key, timestamp }) => {
    const field = key === 'showlist' ? 'lastShowlistScrape' : 'lastVenueScrape';
```

Replace that line with:

```js
updateScrapeMeta: async (parent, { key, timestamp }) => {
    const fieldMap = {
        showlist: 'lastShowlistScrape',
        venues: 'lastVenueScrape',
        focused: 'lastFocusedScrape',
    };
    const field = fieldMap[key] ?? 'lastVenueScrape';
```

- [ ] **Step 5: Add getAustinFocusedShowData resolver**

In `server/schemas/resolvers.js`, find the `getAustinTXShowData` resolver (around line 828) and add the new resolver directly after its closing `},`:

```js
getAustinFocusedShowData: async (parent, { venues }) => {
    console.log('🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯');
    console.log('🎯🎯🎯🎯 getAustinFocusedShowData venues: ', venues);
    console.log('🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯');
    console.log(' ');

    const results = await Promise.all(
        venues
            .filter(key => austinResolvers[key])
            .map(key => austinResolvers[key]())
    );

    return results.filter(Boolean).flat();
},
```

- [ ] **Step 6: Commit**

```bash
git add server/models/ScrapeMeta.js server/schemas/typeDefs.js server/schemas/resolvers.js
git commit -m "feat: add lastFocusedScrape to ScrapeMeta and getAustinFocusedShowData resolver"
```

---

## Task 3: Client — queries and mutations

**Files:**
- Modify: `client/src/utils/queries.js`
- Modify: `client/src/utils/mutations.js`

- [ ] **Step 1: Add lastFocusedScrape to GET_SCRAPE_META**

In `client/src/utils/queries.js`, find `GET_SCRAPE_META`:

```js
export const GET_SCRAPE_META = gql`
    query getScrapeMeta {
        getScrapeMeta {
            lastShowlistScrape
            lastVenueScrape
        }
    }
`;
```

Replace with:

```js
export const GET_SCRAPE_META = gql`
    query getScrapeMeta {
        getScrapeMeta {
            lastShowlistScrape
            lastVenueScrape
            lastFocusedScrape
        }
    }
`;
```

- [ ] **Step 2: Add GET_AUSTIN_FOCUSED_SHOW_DATA query**

In `client/src/utils/queries.js`, add after `GET_AUSTIN_TX_SHOW_DATA`:

```js
export const GET_AUSTIN_FOCUSED_SHOW_DATA = gql`
    query getAustinFocusedShowData($venues: [String!]!) {
        getAustinFocusedShowData(venues: $venues) {
            customId {
                headliner
                date
                venue
            }
            artists
            date
            times
            venue
            address
            website
            ticketLink
            ticketPrice
        }
    }
`;
```

- [ ] **Step 3: Add lastFocusedScrape to UPDATE_SCRAPE_META return**

In `client/src/utils/mutations.js`, find `UPDATE_SCRAPE_META`:

```js
export const UPDATE_SCRAPE_META = gql`
    mutation updateScrapeMeta($key: String!, $timestamp: String!) {
        updateScrapeMeta(key: $key, timestamp: $timestamp) {
            lastShowlistScrape
            lastVenueScrape
        }
    }
`;
```

Replace with:

```js
export const UPDATE_SCRAPE_META = gql`
    mutation updateScrapeMeta($key: String!, $timestamp: String!) {
        updateScrapeMeta(key: $key, timestamp: $timestamp) {
            lastShowlistScrape
            lastVenueScrape
            lastFocusedScrape
        }
    }
`;
```

- [ ] **Step 4: Commit**

```bash
git add client/src/utils/queries.js client/src/utils/mutations.js
git commit -m "feat: add focused scrape GQL query and lastFocusedScrape to scrape meta"
```

---

## Task 4: Hook — useFocusedVenueScraper

**Files:**
- Create: `client/src/hooks/useFocusedVenueScraper.js`

- [ ] **Step 1: Create the hook**

Create `client/src/hooks/useFocusedVenueScraper.js`:

```js
import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { GET_AUSTIN_FOCUSED_SHOW_DATA, GET_SCRAPE_META } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useFocusedVenueScraper = () => {
    const [executeQuery] = useLazyQuery(GET_AUSTIN_FOCUSED_SHOW_DATA, { fetchPolicy: 'network-only' });
    const { runInserts, reset, insertCount, error: insertError } = useAustinListDbUpdater();
    const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META, {
        refetchQueries: [GET_SCRAPE_META]
    });

    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(0);
    const [scrapeError, setScrapeError] = useState(null);
    const [insertLoading, setInsertLoading] = useState(false);
    const [venueStatuses, setVenueStatuses] = useState({});

    const run = async (selectedKeys) => {
        setScrapeLoading(true);
        setScrapeCount(0);
        setScrapeError(null);
        setVenueStatuses({});
        reset();
        try {
            const result = await executeQuery({ variables: { venues: selectedKeys } });
            const scraperData = result?.data?.getAustinFocusedShowData ?? [];
            setScrapeCount(scraperData.length);
            setScrapeLoading(false);

            const byVenue = scraperData.reduce((acc, concert) => {
                const v = concert.venue;
                if (!acc[v]) acc[v] = [];
                acc[v].push(concert);
                return acc;
            }, {});

            setInsertLoading(true);
            for (const [venue, concerts] of Object.entries(byVenue)) {
                setVenueStatuses(prev => ({ ...prev, [venue]: 'inserting' }));
                const success = await runInserts(concerts);
                setVenueStatuses(prev => ({ ...prev, [venue]: success ? 'success' : 'error' }));
            }
            setInsertLoading(false);
        } catch (err) {
            setScrapeError(err);
            setScrapeLoading(false);
            setInsertLoading(false);
        } finally {
            await updateScrapeMeta({ variables: { key: 'focused', timestamp: new Date().toISOString() } });
        }
    };

    const error = scrapeError || insertError || null;

    return { run, scrapeLoading, insertLoading, scrapeCount, insertCount, venueStatuses, error };
};

export default useFocusedVenueScraper;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/hooks/useFocusedVenueScraper.js
git commit -m "feat: add useFocusedVenueScraper hook"
```

---

## Task 5: Component — FocusedVenueControlBox

**Files:**
- Create: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css`
- Create: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx`

- [ ] **Step 1: Create the CSS module**

Create `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css`:

```css
.venueBody {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1vw;
}

/* --- DROPDOWN --- */

.dropdownWrapper {
    position: relative;
    width: 100%;
}

.dropdownTrigger {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    width: 100%;
    min-height: 3.2rem;
    padding: 0.5rem 0.8rem;
    background: var(--darkest);
    border: 1px solid var(--accent);
    border-radius: 0.4rem;
    cursor: pointer;
    box-sizing: border-box;
}

.dropdownTrigger:hover {
    border-color: var(--main-text);
}

.dropdownPlaceholder {
    color: var(--dark);
    font-size: 1.1rem;
    flex: 1;
}

.dropdownArrow {
    margin-left: auto;
    color: var(--dark);
    font-size: 1rem;
    flex-shrink: 0;
}

.pill {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: var(--darker);
    border: 1px solid var(--accent);
    border-radius: 1rem;
    padding: 0.1rem 0.6rem;
    font-size: 1rem;
    color: var(--main-text);
    white-space: nowrap;
}

.pillRemove {
    background: none;
    border: none;
    color: var(--dark);
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    line-height: 1;
}

.pillRemove:hover {
    color: var(--main-text);
}

.dropdownMenu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--darkest);
    border: 1px solid var(--accent);
    border-top: none;
    border-radius: 0 0 0.4rem 0.4rem;
    z-index: 10;
    overflow: hidden;
}

.dropdownItem {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 1rem;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--main-text);
}

.dropdownItem:hover {
    background: var(--darker);
}

.dropdownItem.selected {
    color: var(--main-text);
}

.dropdownItem:not(.selected) {
    color: var(--dark);
}

.checkbox {
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 0.2rem;
    border: 1px solid var(--dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.checkbox.checked {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--main-text);
}
```

- [ ] **Step 2: Create the component**

Create `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import Switch from 'react-switch';
import austinVenues from "../../../data/states/texas/austin";
import { switchTheme } from "../../../definitions/constants";
import { formatScrapeTime } from "../../../utils/helpers";
import VenueList from "../../VenueList";
import sharedStyles from '../ControlBox.module.css';
import ownStyles from './FocusedVenueControlBox.module.css';

const {
    controlContainer,
    controlHeader,
    controlStatus,
    statusWrapper,
    venueShimmer,
} = sharedStyles;

const {
    venueBody,
    dropdownWrapper,
    dropdownTrigger,
    dropdownPlaceholder,
    dropdownArrow,
    pill,
    pillRemove,
    dropdownMenu,
    dropdownItem,
    selected,
    checkbox,
    checked,
} = ownStyles;

const FocusedVenueControlBox = ({
    scrapeMetaData,
    run,
    isScrapeLoading,
    isInsertLoading,
    totalScraped,
    insertCount,
    venueStatuses,
}) => {
    const lastFocusedScrape = scrapeMetaData?.getScrapeMeta?.lastFocusedScrape ?? null;

    const [focusedSwitch, setFocusedSwitch] = useState(false);
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Auto-reset switch when insert run completes
    useEffect(() => {
        if (totalScraped > 0 && !isInsertLoading) {
            setFocusedSwitch(false);
        }
    }, [isInsertLoading, totalScraped]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const toggleVenue = (venue) => {
        setSelectedVenues(prev =>
            prev.find(v => v.key === venue.key)
                ? prev.filter(v => v.key !== venue.key)
                : [...prev, venue]
        );
    };

    const removeVenue = (e, venue) => {
        e.stopPropagation();
        setSelectedVenues(prev => prev.filter(v => v.key !== venue.key));
    };

    const handleSwitch = () => {
        if (focusedSwitch) {
            setFocusedSwitch(false);
        } else {
            setFocusedSwitch(true);
            run(selectedVenues.map(v => v.key));
        }
    };

    const getVenueLightClass = (venueName) => {
        const status = venueStatuses?.[venueName];
        if (!status) return 'light-idle';
        if (status === 'inserting') return 'light-yellow';
        if (status === 'success') return 'light-green';
        if (status === 'error') return 'light-red';
        return 'light-idle';
    };

    const isDisabled = selectedVenues.length === 0 || isScrapeLoading || isInsertLoading;

    return (
        <div className={`${controlContainer}${isScrapeLoading ? ` ${venueShimmer}` : ''}`}>
            <div className={controlHeader}>
                <div>
                    <h2>AUSTIN: FOCUSED</h2>
                    <div>{lastFocusedScrape ? `Last ran: ${formatScrapeTime(lastFocusedScrape)}` : 'Last ran: --'}</div>
                </div>
                <Switch
                    {...switchTheme}
                    onChange={handleSwitch}
                    checked={focusedSwitch}
                    disabled={isDisabled}
                />
            </div>

            {/* Dropdown */}
            <div className={dropdownWrapper} ref={dropdownRef}>
                <div className={dropdownTrigger} onClick={() => setIsOpen(prev => !prev)}>
                    {selectedVenues.length === 0 ? (
                        <span className={dropdownPlaceholder}>Select venues...</span>
                    ) : (
                        selectedVenues.map(venue => (
                            <span key={venue.key} className={pill}>
                                {venue.name}
                                <button className={pillRemove} onClick={(e) => removeVenue(e, venue)}>×</button>
                            </span>
                        ))
                    )}
                    <span className={dropdownArrow}>▾</span>
                </div>
                {isOpen && (
                    <div className={dropdownMenu}>
                        {austinVenues.map(venue => {
                            const isSelected = !!selectedVenues.find(v => v.key === venue.key);
                            return (
                                <div
                                    key={venue.key}
                                    className={`${dropdownItem}${isSelected ? ` ${selected}` : ''}`}
                                    onClick={() => toggleVenue(venue)}
                                >
                                    <div className={`${checkbox}${isSelected ? ` ${checked}` : ''}`}>
                                        {isSelected ? '✓' : ''}
                                    </div>
                                    {venue.name}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Status row */}
            <section className={controlStatus}>
                <div>
                    <div className={statusWrapper}>
                        <h3>SCRAPE: {totalScraped > 0 ? totalScraped : '--'}</h3>
                    </div>
                </div>
                <div>
                    <div className={statusWrapper}>
                        <h3>INSERT: {insertCount > 0 ? insertCount : '--'}</h3>
                    </div>
                </div>
            </section>

            {/* Venue list */}
            {selectedVenues.length > 0 && (
                <div className={venueBody}>
                    <VenueList venues={selectedVenues} getStatusClass={getVenueLightClass} />
                </div>
            )}
        </div>
    );
};

export default FocusedVenueControlBox;
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/controls/focusedVenueControl/
git commit -m "feat: add FocusedVenueControlBox component with pill-tag dropdown"
```

---

## Task 6: Wire up Control.js

**Files:**
- Modify: `client/src/pages/Control.js`

- [ ] **Step 1: Import the hook and component**

In `client/src/pages/Control.js`, add these two imports after the existing ones:

```js
import FocusedVenueControlBox from '../components/controls/focusedVenueControl/FocusedVenueControlBox';
import useFocusedVenueScraper from '../hooks/useFocusedVenueScraper';
```

- [ ] **Step 2: Call the hook**

In `Control.js`, after the `useAustinTXScraper` destructure block, add:

```js
const {
    run: runFocused,
    scrapeLoading: isFocusedScrapeLoading,
    insertLoading: isFocusedInsertLoading,
    scrapeCount: focusedTotalScraped,
    insertCount: focusedInsertCount,
    venueStatuses: focusedVenueStatuses,
} = useFocusedVenueScraper();
```

- [ ] **Step 3: Render the component**

In `Control.js`, in the `control-panels` div, add `<FocusedVenueControlBox>` directly after `<StaleShowControlBox />`:

```jsx
{/* --- AUSTIN: FOCUSED --- */}
<FocusedVenueControlBox
    scrapeMetaData={scrapeMetaData}
    run={runFocused}
    isScrapeLoading={isFocusedScrapeLoading}
    isInsertLoading={isFocusedInsertLoading}
    totalScraped={focusedTotalScraped}
    insertCount={focusedInsertCount}
    venueStatuses={focusedVenueStatuses}
/>
```

- [ ] **Step 4: Manual smoke test**

With both client and server running:
1. Open the Control page — confirm `AUSTIN: FOCUSED` box appears below `StaleShowControlBox`
2. Confirm switch is disabled (no venues selected)
3. Open the dropdown — confirm all 9 Austin venues appear
4. Select 1-2 venues — confirm pill tags appear in trigger, dropdown checkboxes fill, VenueList appears with `light-idle` indicators
5. Deselect a venue via the `×` on a pill — confirm it removes from list
6. Toggle the switch — confirm it fires, venues show `light-yellow` then `light-green` / `light-red`, switch resets when done
7. Confirm "Last ran:" updates after the run completes

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Control.js
git commit -m "feat: integrate FocusedVenueControlBox into Control page"
```
