# FocusedVenueControlBox Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the clipped dropdown venue picker in `FocusedVenueControlBox` with an always-visible two-column selectable list that mirrors `VenueControlBox`'s layout.

**Architecture:** Two files change — the CSS module drops all dropdown/pill rules and gains venue-item selection classes; the JSX drops the dropdown, pills, ref, and outside-click effect, and renders the venue list inline using the same sort+split pattern as `VenueList.js`. No other files are touched.

**Tech Stack:** React (hooks), CSS Modules, global indicator-light classes from `index.css`

---

## Files

| Action | Path |
|--------|------|
| Modify | `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` |
| Modify | `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` |

---

### Task 1: Replace CSS module

**Files:**
- Modify: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css`

- [ ] **Step 1: Replace the entire CSS file**

The file currently has `.venueBody` plus all the dropdown/pill classes. Replace the whole file with the following — `venueBody` is kept, all dropdown/pill rules are gone, venue-item classes are added. `.venueItemLocked` must appear after the selection-class hover rules so its `background: none` wins on specificity tie.

```css
.venueBody {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1vw;
}

.venueCol {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.venueItem {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 2px 3px;
    border-radius: 3px;
}

.venueItemUnselected {
    color: var(--dark);
    cursor: pointer;
}

.venueItemUnselected:hover {
    background: rgba(255, 255, 255, 0.04);
}

.venueItemSelected {
    color: var(--main-text);
    cursor: pointer;
}

.venueItemSelected:hover {
    background: rgba(255, 255, 255, 0.04);
}

/* Must come after selection-class hover rules — overrides background on same specificity */
.venueItemLocked {
    cursor: default;
}

.venueItemLocked:hover {
    background: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css
git commit -m "refactor: replace dropdown CSS with venue-item selection classes in FocusedVenueControlBox"
```

---

### Task 2: Replace JSX

**Files:**
- Modify: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx`

- [ ] **Step 1: Replace the entire JSX file**

Removes: `useRef`, `isOpen` state, `dropdownRef`, outside-click `useEffect`, `removeVenue`, all dropdown/pill import destructures, the dropdown and bottom `VenueList` JSX blocks.

Adds: `isLocked` derived value, `getItemClass` helper, inline two-column venue list, `setSelectedVenues([])` in the auto-reset effect.

The `VenueList` import is removed — the list is rendered inline.

```jsx
import { useEffect, useState } from "react";
import Switch from 'react-switch';
import austinVenues from "../../../data/states/texas/austin";
import { switchTheme } from "../../../definitions/constants";
import { formatScrapeTime } from "../../../utils/helpers";
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
    venueCol,
    venueItem,
    venueItemUnselected,
    venueItemSelected,
    venueItemLocked,
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

    // Reset switch and clear selection when scrape+insert run completes
    useEffect(() => {
        if (totalScraped > 0 && !isInsertLoading) {
            setFocusedSwitch(false);
            setSelectedVenues([]);
        }
    }, [isInsertLoading, totalScraped]);

    const isLocked = focusedSwitch || isScrapeLoading || isInsertLoading;

    const toggleVenue = (venue) => {
        if (isLocked) return;
        setSelectedVenues(prev =>
            prev.find(v => v.key === venue.key)
                ? prev.filter(v => v.key !== venue.key)
                : [...prev, venue]
        );
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

    const sorted = [...austinVenues].sort((a, b) => a.name.localeCompare(b.name));
    const mid = Math.ceil(sorted.length / 2);
    const colA = sorted.slice(0, mid);
    const colB = sorted.slice(mid);

    const getItemClass = (venue) => {
        const isSelected = !!selectedVenues.find(v => v.key === venue.key);
        const selectionClass = isSelected ? venueItemSelected : venueItemUnselected;
        return isLocked
            ? `${venueItem} ${selectionClass} ${venueItemLocked}`
            : `${venueItem} ${selectionClass}`;
    };

    const renderVenue = (venue) => (
        <div
            key={venue.key}
            className={getItemClass(venue)}
            onClick={() => toggleVenue(venue)}
        >
            <div className={`indicator-light ${getVenueLightClass(venue.name)}`} />
            <span>{venue.name}</span>
        </div>
    );

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

            <div className={venueBody}>
                <div className={venueCol}>{colA.map(renderVenue)}</div>
                <div className={venueCol}>{colB.map(renderVenue)}</div>
            </div>
        </div>
    );
};

export default FocusedVenueControlBox;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx
git commit -m "refactor: replace dropdown with selectable venue list in FocusedVenueControlBox"
```

---

### Task 3: Visual verification

**Files:** none — browser check only

- [ ] **Step 1: Start the dev server**

```bash
cd client && npm start
```

- [ ] **Step 2: Verify state ① — no selection**

Open the app. The AUSTIN: FOCUSED box should show all venues in two columns, all grey (`var(--dark)`). The switch should be disabled (visually dimmed, not interactive).

- [ ] **Step 3: Verify state ② — selection**

Click several venue names. Each clicked venue name should turn antiquewhite (`var(--main-text)`). Its idle dot stays dark (`#111`, no border, no glow). The switch should become active (not dimmed) once at least one venue is selected. Clicking a selected venue should deselect it (returns to grey).

- [ ] **Step 4: Verify state ③ — locked during scrape**

Flip the switch. Hovering over venue names should show no hover background. Clicking venues should have no effect. The switch itself should be disabled while loading.

- [ ] **Step 5: Verify overflow is fixed**

Confirm the box renders with no clipping — the venue list is fully visible within the shimmer border container. No dropdown extends outside the box.

- [ ] **Step 6: Verify auto-reset**

After a focused scrape completes (insert loading finishes, `totalScraped > 0`), the switch should return to off and all venue names should return to grey.
