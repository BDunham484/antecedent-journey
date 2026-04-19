# FocusedVenueControlBox Expand/Collapse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an expand/collapse toggle to FocusedVenueControlBox — the entire header row is the click target, a chevron indicates state, and the venue list section shows/hides accordingly.

**Architecture:** `isExpanded` boolean state (default `true`) controls conditional rendering of the middle section. The header div becomes a click target with propagation stopped on the switch wrapper. Locked during active scrapes. Two CSS files touched, no other files.

**Tech Stack:** React (hooks), CSS Modules

---

## Files

| Action | Path |
|--------|------|
| Modify | `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` |
| Modify | `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx` |

---

### Task 1: Add CSS classes for header toggle and chevron

**Files:**
- Modify: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css`

- [ ] **Step 1: Append the new classes to the end of the CSS file**

Open `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css` and append these classes after the existing content:

```css
.headerClickable {
    cursor: pointer;
}

.headerClickable:hover {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
}

/* Must come after headerClickable hover — overrides on same specificity */
.headerLocked {
    cursor: default;
}

.headerLocked:hover {
    background: none;
}

.chevron {
    color: var(--dark);
    font-size: 0.85rem;
    margin-left: 6px;
    user-select: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.module.css
git commit -m "feat: add header toggle and chevron CSS classes to FocusedVenueControlBox"
```

---

### Task 2: Wire up expand/collapse in JSX

**Files:**
- Modify: `client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx`

- [ ] **Step 1: Replace the entire file with the updated implementation**

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
    separator,
    venueBody,
    venueCol,
    venueItem,
    venueItemUnselected,
    venueItemSelected,
    venueItemLocked,
    headerClickable,
    headerLocked,
    chevron,
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
    const [showStatuses, setShowStatuses] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Reset switch and clear selection when scrape+insert run completes
    useEffect(() => {
        if (totalScraped > 0 && !isInsertLoading) {
            setFocusedSwitch(false);
            setSelectedVenues([]);
        }
    }, [isInsertLoading, totalScraped]);

    const isLocked = focusedSwitch || isScrapeLoading || isInsertLoading;

    const toggleExpanded = () => {
        if (isLocked) return;
        setIsExpanded(prev => !prev);
    };

    const toggleVenue = (venue) => {
        if (isLocked) return;
        setShowStatuses(false);
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
            setShowStatuses(true);
            run(selectedVenues.map(v => v.key));
        }
    };

    const getVenueLightClass = (venueName) => {
        if (!showStatuses) return 'light-idle';
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
            <div
                className={`${controlHeader} ${isLocked ? headerLocked : headerClickable}`}
                onClick={toggleExpanded}
            >
                <div>
                    <h2>
                        AUSTIN: FOCUSED
                        <span className={chevron}>{isExpanded ? '▲' : '▾'}</span>
                    </h2>
                    <div>{lastFocusedScrape ? `Last ran: ${formatScrapeTime(lastFocusedScrape)}` : 'Last ran: --'}</div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <Switch
                        {...switchTheme}
                        onChange={handleSwitch}
                        checked={focusedSwitch}
                        disabled={isDisabled}
                    />
                </div>
            </div>

            {isExpanded ? (
                <>
                    <hr className={separator} />
                    <div className={venueBody}>
                        <div className={venueCol}>{colA.map(renderVenue)}</div>
                        <div className={venueCol}>{colB.map(renderVenue)}</div>
                    </div>
                    <hr className={separator} />
                </>
            ) : (
                <hr className={separator} />
            )}

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
        </div>
    );
};

export default FocusedVenueControlBox;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/controls/focusedVenueControl/FocusedVenueControlBox.jsx
git commit -m "feat: add expand/collapse toggle to FocusedVenueControlBox"
```

---

### Task 3: Visual verification

**Files:** none — browser check only

- [ ] **Step 1: Confirm dev server is running**

The React dev server should already be running on port 3000. If not: `cd client && npm start`

- [ ] **Step 2: Verify expanded state (default)**

On load the box should be fully expanded — header with ▲ chevron, venue list visible, status footer visible. The chevron should be in muted grey (`var(--dark)`).

- [ ] **Step 3: Verify collapse**

Click anywhere on the header row (title area). The venue list and surrounding separators should disappear. The single separator + status footer should remain. The chevron should change to ▾.

- [ ] **Step 4: Verify expand**

Click the header row again. The venue list should reappear. Chevron returns to ▲.

- [ ] **Step 5: Verify switch independence**

In expanded state, click the switch (not the title). The box should NOT collapse — only the switch should activate. The `stopPropagation` wrapper is working correctly if the expand state doesn't change.

- [ ] **Step 6: Verify locked state**

Select some venues and flip the switch to start a scrape. While `isLocked` is true, clicking the header/chevron should have no effect — the box should stay expanded and not toggle.

- [ ] **Step 7: Verify selection preserved across collapse**

Select two venues. Collapse the box. Re-expand. The same two venues should still be highlighted.
