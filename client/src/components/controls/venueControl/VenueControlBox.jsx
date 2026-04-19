import { useEffect, useState } from "react";
import Switch from 'react-switch';
import austinVenues from "../../../data/states/texas/austin";
import { switchTheme } from "../../../definitions/constants";
import { formatScrapeTime } from "../../../utils/helpers";
import VenueList from "../../VenueList";
import sharedStyles from '../ControlBox.module.css';
import ownStyles from './VenueControlBox.module.css';

const { controlContainer, controlHeader, controlStatus, statusWrapper, venueShimmer } = sharedStyles;
const {
    venueBody,
    separator,
    headerClickable,
    headerLocked,
    chevron,
    collapseWrapper,
    collapseWrapperClosed,
    collapseInner,
} = ownStyles;

const VenueControlBox = ({
    scrapeMetaData,
    runVenues,
    isVenueScraperLoading,
    isVenueUpdaterRunning,
    venueTotalScraped,
    venueConcertCount,
    venueStatuses,
}) => {
    const lastVenueScrape = scrapeMetaData?.getScrapeMeta?.lastVenueScrape ?? null;

    const [venueSwitch, setVenueSwitch] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const isLocked = venueSwitch || isVenueScraperLoading || isVenueUpdaterRunning;

    const toggleExpanded = () => {
        if (isLocked) return;
        setIsExpanded(prev => !prev);
    };

    useEffect(() => {
        if (venueTotalScraped > 0 && !isVenueUpdaterRunning) {
            setVenueSwitch(false);
        }
    }, [isVenueUpdaterRunning, venueTotalScraped]);

    const handleVenueSwitch = () => {
        if (venueSwitch) {
            setVenueSwitch(false);
        } else {
            setVenueSwitch(true);
            runVenues();
        }
    }

    const getVenueLightClass = (venue) => {
        const status = venueStatuses?.[venue];
        if (!status) return 'light-idle';
        if (status === 'inserting') return 'light-yellow';
        if (status === 'success') return 'light-green';
        if (status === 'error') return 'light-red';
        return 'light-idle';
    };

    return (
        <div className={`${controlContainer}${isVenueScraperLoading ? ` ${venueShimmer}` : ''}`}>
            <div
                className={`${controlHeader} ${isLocked ? headerLocked : headerClickable}`}
                onClick={toggleExpanded}
            >
                <div>
                    <h2>
                        AUSTIN: VENUES
                        <span className={chevron}>{isExpanded ? '▲' : '▼'}</span>
                    </h2>
                    <div>{lastVenueScrape ? `Last ran: ${formatScrapeTime(lastVenueScrape)}` : 'Last ran: --'}</div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <Switch
                        {...switchTheme}
                        onChange={handleVenueSwitch}
                        checked={venueSwitch}
                        disabled={isVenueScraperLoading || isVenueUpdaterRunning}
                    />
                </div>
            </div>

            <hr className={separator} />

            <div className={`${collapseWrapper}${isExpanded ? '' : ` ${collapseWrapperClosed}`}`}>
                <div className={collapseInner}>
                    <div className={venueBody}>
                        <VenueList venues={austinVenues} getStatusClass={getVenueLightClass} />
                    </div>
                    <hr className={separator} />
                </div>
            </div>

            <section className={controlStatus}>
                <div>
                    <div className={statusWrapper}>
                        <h3>SCRAPE: {venueTotalScraped > 0 ? venueTotalScraped : '--'}</h3>
                    </div>
                </div>
                <div>
                    <div className={statusWrapper}>
                        <h3>INSERT: {venueConcertCount > 0 ? venueConcertCount : '--'}</h3>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VenueControlBox;