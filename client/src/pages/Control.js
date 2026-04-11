import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import Switch from 'react-switch';
import austinVenues from '../data/states/texas/austin';
import useAustinListScraper from '../hooks/useAustinListScraper';
import useAustinTXScraper from '../hooks/useAustinTXScraper';
import useStaleShowCleaner from '../hooks/useStaleShowCleaner';
import { formatScrapeTime } from '../utils/helpers';
import { GET_SCRAPE_META } from '../utils/queries';
import VenueList from '../components/VenueList';

const switchTheme = {
    offColor: '#525050',        // --dark
    onColor: '#525050',         // --dark
    offHandleColor: '#383737',  // --darker
    onHandleColor: '#383737',   // --darker
    boxShadow: '#eee3d0',       // --main-text
    activeBoxShadow: '#eee3d0', // --main-text
    uncheckedIcon: false,
    checkedIcon: false,
};

const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);
    const [venueSwitch, setVenueSwitch] = useState(false);
    const [staleSwitch, setStaleSwitch] = useState(false);

    const { hasStale, isDeleting, execute } = useStaleShowCleaner();
    const { data: scrapeMetaData } = useQuery(GET_SCRAPE_META);

    const lastShowlistScrape = scrapeMetaData?.getScrapeMeta?.lastShowlistScrape ?? null;
    const lastVenueScrape = scrapeMetaData?.getScrapeMeta?.lastVenueScrape ?? null;

    const {
        executeQuery: runShowlist,
        scrapeLoading: isScraperLoading,
        insertLoading: isUpdaterRunning,
        scrapeCount: totalScraped,
        insertCount: concertCount,
    } = useAustinListScraper();

    const {
        executeQuery: runVenues,
        scrapeLoading: isVenueScraperLoading,
        insertLoading: isVenueUpdaterRunning,
        scrapeCount: venueTotalScraped,
        insertCount: venueConcertCount,
        venueStatuses,
    } = useAustinTXScraper();

    // changelog-start
    console.log('⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️');
    console.log('⚰️⚰️⚰️⚰️ lastShowlistScrape: ', lastShowlistScrape);
    console.log('⚰️⚰️⚰️⚰️ lastVenueScrape: ', lastVenueScrape);
    console.log('⚰️⚰️⚰️⚰️ scrapeMetaData: ', scrapeMetaData);
    console.log('⚰️⚰️⚰️⚰️ totalScraped: ', totalScraped);
    console.log('⚰️⚰️⚰️⚰️ isScraperLoading: ', isScraperLoading);
    console.log('⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️');
    console.log('⚰️⚰️⚰️⚰️ controlSwitch: ', controlSwitch);
    console.log('⚰️⚰️⚰️⚰️ venueSwitch: ', venueSwitch);
    console.log('⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️');
    console.log(' ');
    // changelog-end

    const handleControlSwitch = () => {
        if (controlSwitch) {
            setControlSwitch(false);
        } else {
            setControlSwitch(true);
            runShowlist();
        }
    }

    const handleVenueSwitch = () => {
        if (venueSwitch) {
            setVenueSwitch(false);
        } else {
            setVenueSwitch(true);
            runVenues();
        }
    }

    const handleStaleSwitch = () => {
        if (!staleSwitch) {
            setStaleSwitch(true);
            execute();
        }
    };

    useEffect(() => {
        if (venueTotalScraped > 0 && !isVenueUpdaterRunning) {
            setVenueSwitch(false);
        }
    }, [isVenueUpdaterRunning, venueTotalScraped]);

    useEffect(() => {
        if (totalScraped > 0 && !isUpdaterRunning) {
            setControlSwitch(false);
        }
    }, [isUpdaterRunning, totalScraped]);

    useEffect(() => {
        if (!isDeleting && staleSwitch) {
            setStaleSwitch(false);
        }
    }, [isDeleting, staleSwitch]);

    const getVenueLightClass = (venue) => {
        const status = venueStatuses?.[venue];
        if (!status) return 'light-idle';
        if (status === 'inserting') return 'light-yellow';
        if (status === 'success') return 'light-green';
        if (status === 'error') return 'light-red';
        return 'light-idle';
    };

    return (
        <div>
            <main id='control-main'>
                <div className='control-panels'>
                    {/* --- STALE SHOWS --- */}
                    <div className={`control-container${isDeleting ? ' stale-shimmer' : hasStale ? ' stale-alert' : ''}`}>
                        <div className='control-header'>
                            <div>
                                <h2>STALE SHOWS</h2>
                                <div>
                                    {isDeleting
                                        ? 'Deleting stale shows...'
                                        : hasStale
                                            ? 'Stale shows detected.'
                                            : 'No stale shows detected.'}
                                </div>
                            </div>
                            <Switch
                                {...switchTheme}
                                onChange={handleStaleSwitch}
                                checked={staleSwitch}
                                disabled={!hasStale || isDeleting}
                            />
                        </div>
                    </div>
                    {/* --- AUSTIN: SHOWLIST --- */}
                    <div className={`control-container${isScraperLoading ? ' venue-shimmer' : ''}`}>
                        <div className='control-header'>
                            <div>
                                <h2>AUSTIN: SHOWLIST</h2>
                                <div>{lastShowlistScrape ? `Last ran: ${formatScrapeTime(lastShowlistScrape)}` : 'Last ran: --'}</div>
                            </div>
                            <Switch
                                {...switchTheme}
                                onChange={handleControlSwitch}
                                checked={controlSwitch}
                                disabled={isScraperLoading || isUpdaterRunning}
                            />
                        </div>
                        <section className='control-status'>
                            <div>
                                <div className='status-wrapper'>
                                    <h3>SCRAPE: {totalScraped > 0 ? totalScraped : '--'}</h3>
                                    <h3 className='emoji'>{!controlSwitch ? '🪦' : isScraperLoading ? '⌛...' : '✅'}</h3>
                                </div>
                            </div>
                            <div>
                                <div className='status-wrapper'>
                                    <h3>INSERT: {concertCount > 0 ? concertCount : '--'}</h3>
                                    <h3 className='emoji'>{!controlSwitch ? '🪦' : isUpdaterRunning ? '⌛...' : '✅'}</h3>
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* --- AUSTIN: VENUES --- */}
                    <div className={`control-container venue-container${isVenueScraperLoading ? ' venue-shimmer' : ''}`}>
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
                            {/* <div className='venue-status-col'>
                                <section className='control-status'>
                                    <div>
                                        <div className='status-wrapper'>
                                            <h3>SCRAPE:</h3>
                                        </div>
                                        <div className='indent'>Total: {venueTotalScraped > 0 ? venueTotalScraped : '--'}</div>
                                    </div>
                                    <div>
                                        <div className='status-wrapper'>
                                            <h3>INSERT:</h3>
                                        </div>
                                        <div className='indent'>Total: {venueConcertCount > 0 ? venueConcertCount : '--'}</div>
                                    </div>
                                </section>
                            </div> */}
                            <VenueList venues={austinVenues} getStatusClass={getVenueLightClass} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Control;
