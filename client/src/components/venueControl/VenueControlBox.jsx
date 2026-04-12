import { useEffect, useState } from "react";
import Switch from 'react-switch';
import austinVenues from "../../data/states/texas/austin";
import { switchTheme } from "../../definitions/constants";
import { formatScrapeTime } from "../../utils/helpers";
import VenueList from "../VenueList";

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
        <div className={`control-container ${isVenueScraperLoading ? ' venue-shimmer' : ''}`}>
            <div className='control-header'>
                <div>
                    <h2>AUSTIN: VENUES</h2>
                    <div>{lastVenueScrape ? `Last ran: ${formatScrapeTime(lastVenueScrape)}` : 'Last ran: --'}</div>
                </div>
                <Switch
                    {...switchTheme}
                    onChange={handleVenueSwitch}
                    checked={venueSwitch}
                    disabled={isVenueScraperLoading || isVenueUpdaterRunning}
                />
            </div>
            <section className='control-status'>
                <div>
                    <div className='status-wrapper'>
                        <h3>SCRAPE: {venueTotalScraped > 0 ? venueTotalScraped : '--'}</h3>
                    </div>
                </div>
                <div>
                    <div className='status-wrapper'>
                        <h3>INSERT: {venueConcertCount > 0 ? venueConcertCount : '--'}</h3>
                    </div>
                </div>
            </section>
            <div className='venue-body'>
                <VenueList venues={austinVenues} getStatusClass={getVenueLightClass} />
            </div>
        </div>
    );
};

export default VenueControlBox;