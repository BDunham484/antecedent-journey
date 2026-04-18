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
