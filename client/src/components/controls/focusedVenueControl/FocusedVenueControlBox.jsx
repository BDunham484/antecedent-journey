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
