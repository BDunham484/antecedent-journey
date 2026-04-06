// import AustinListDbUpdater from "../components/DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
// import AustinListScraper from "../components/Scrapers/AustinListScraper/AustinListScraper";
// import AustinTXScraper from "../components/Scrapers/AustinTXScraper/AustinTXScraper";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Switch from 'react-switch';
import CleanByDate from "../components/DB_Cleaners/CleanByDate/CleanByDate";
import useAustinListScraper from "../hooks/useAustinListScraper";
import useAustinTXScraper from "../hooks/useAustinTXScraper";
// import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { GET_SCRAPE_META } from "../utils/queries";

const formatScrapeTime = (isoString) => {
    const date = new Date(isoString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${day} ${month} ${dateNum} ${year} ${hours}:${minutes}${ampm}`;
};

const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);
    const [cleanCount, setCleanCount] = useState(0);
    const [isCleanerLoading, setIsCleanerLoading] = useState(false);

    const [venueSwitch, setVenueSwitch] = useState(false);

    const { data: scrapeMetaData } = useQuery(GET_SCRAPE_META);
    // const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META);

    const lastShowlistScrape = scrapeMetaData?.getScrapeMeta?.lastShowlistScrape ?? null;
    const lastVenueScrape = scrapeMetaData?.getScrapeMeta?.lastVenueScrape ?? null;

    // --- hook approach ---
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

    // --- old component approach (kept for reference) ---
    // const [totalScraped, setTotalScraped] = useState(0);
    // const [concertCount, setConcertCount] = useState(0);
    // const [isScraperLoading, setIsScraperLoading] = useState(false);
    // const [isUpdaterRunning, setIsUpdaterRunning] = useState(false);
    // const [austinScraper, setAustinScraper] = useState([]);
    // const [venueTotalScraped, setVenueTotalScraped] = useState(0);
    // const [venueConcertCount, setVenueConcertCount] = useState(0);
    // const [isVenueScraperLoading, setIsVenueScraperLoading] = useState(false);
    // const [isVenueUpdaterRunning, setIsVenueUpdaterRunning] = useState(false);
    // const [austinVenueScraper, setAustinVenueScraper] = useState([]);

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

    // useEffect(() => {
    //     if (venueTotalScraped > 0 && !isVenueScraperLoading) {
    //         updateScrapeMeta({ variables: { key: 'venues', timestamp: new Date().toISOString() } });
    //     }
    // }, [isVenueScraperLoading, venueTotalScraped, updateScrapeMeta]);

    // useEffect(() => {
    //     if (totalScraped > 0 && !isScraperLoading) {
    //         updateScrapeMeta({ variables: { key: 'showlist', timestamp: new Date().toISOString() } });
    //     }
    // }, [isScraperLoading, totalScraped, updateScrapeMeta]);

    const sortKey = (name) => name.replace(/^The\s+/i, '');
    const austinVenues = ['13th Floor', '29th Street Ballroom', '3TEN Austin City Limits Live', 'ABGB', "Antone's"]
        .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

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
            <main id={'control-main'}>
                <div className={'control-panels'}>

                    {/* --- AUSTIN: SHOWLIST --- */}
                    <div className={'control-container'}>
                        <h2>AUSTIN: SHOWLIST</h2>
                        <div className={'control-date'}>{lastShowlistScrape ? `Last scrape: ${formatScrapeTime(lastShowlistScrape)}` : 'Last run: --'}</div>
                        <Switch
                            onChange={handleControlSwitch}
                            checked={controlSwitch}
                            offColor={'#525050'}
                            onColor={'#525050'}
                            offHandleColor={'#383737'}
                            onHandleColor={'#383737'}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow={'#eee3d0'}
                            activeBoxShadow={'#eee3d0'}
                            disabled={isScraperLoading || isUpdaterRunning || isCleanerLoading}
                        />
                        {controlSwitch &&
                            <CleanByDate
                                setCleanCount={setCleanCount}
                                setIsCleanerLoading={setIsCleanerLoading}
                            />
                        }
                        {/* --- old component approach (kept for reference) ---
                        {controlSwitch &&
                            <div>
                                <CleanByDate
                                    setCleanCount={setCleanCount}
                                    setIsCleanerLoading={setIsCleanerLoading}
                                />
                                <AustinListScraper
                                    setControlSwitch={setControlSwitch}
                                    setIsScraperLoading={setIsScraperLoading}
                                    setTotalScraped={setTotalScraped}
                                    setAustinScraper={setAustinScraper}
                                />
                                {austinScraper && austinScraper?.length > 0 && (
                                    <AustinListDbUpdater
                                        austinScraper={austinScraper}
                                        concertCount={concertCount}
                                        setConcertCount={setConcertCount}
                                        setControlSwitch={setControlSwitch}
                                        setIsUpdaterRunning={setIsUpdaterRunning}
                                    />
                                )}
                            </div>
                        } */}
                        <section className={'control-status'}>
                            <div>
                                <div className={'status-wrapper'}>
                                    <h3 className={'control-status-header'}>CLEAN:</h3>
                                    <h3 className={'emoji'}>{!controlSwitch ? '🪦' : isCleanerLoading ? '⌛...' : '✅'}</h3>
                                </div>
                                <div className="indent">Total: {cleanCount > 0 ? cleanCount : '--'}</div>
                            </div>
                            <div>
                                <div className={'status-wrapper'}>
                                    <h3 className={'control-status-header'}>SCRAPE:</h3>
                                    <h3 className={'emoji'}>{!controlSwitch ? '🪦' : isScraperLoading ? '⌛...' : '✅'}</h3>
                                </div>
                                <div className="indent">Total: {totalScraped > 0 ? totalScraped : '--'}</div>
                            </div>
                            <div>
                                <div className={'status-wrapper'}>
                                    <h3 className={'control-status-header'}>INSERT:</h3>
                                    <h3 className={'emoji'}>{!controlSwitch ? '🪦' : isUpdaterRunning ? '⌛...' : '✅'}</h3>
                                </div>
                                <div className="indent">Total: {concertCount > 0 ? concertCount : '--'}</div>
                            </div>
                        </section>
                    </div>

                    {/* --- AUSTIN: VENUES --- */}
                    <div className={'control-container venue-container'}>
                        <h2>AUSTIN: VENUES</h2>
                        <div className={'control-date'}>{lastVenueScrape ? `Last run: ${formatScrapeTime(lastVenueScrape)}` : 'Last run: --'}</div>
                        <Switch
                            onChange={handleVenueSwitch}
                            checked={venueSwitch}
                            offColor={'#525050'}
                            onColor={'#525050'}
                            offHandleColor={'#383737'}
                            onHandleColor={'#383737'}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow={'#eee3d0'}
                            activeBoxShadow={'#eee3d0'}
                            disabled={isVenueScraperLoading || isVenueUpdaterRunning}
                        />
                        {/* --- old component approach (kept for reference) ---
                        {venueSwitch &&
                            <div>
                                <AustinTXScraper
                                    setControlSwitch={setVenueSwitch}
                                    setIsScraperLoading={setIsVenueScraperLoading}
                                    setTotalScraped={setVenueTotalScraped}
                                    setAustinScraper={setAustinVenueScraper}
                                />
                                {austinVenueScraper && austinVenueScraper?.length > 0 && (
                                    <AustinListDbUpdater
                                        austinScraper={austinVenueScraper}
                                        concertCount={venueConcertCount}
                                        setConcertCount={setVenueConcertCount}
                                        setControlSwitch={setVenueSwitch}
                                        setIsUpdaterRunning={setIsVenueUpdaterRunning}
                                    />
                                )}
                            </div>
                        } */}
                        <div className={'venue-body'}>
                            <div className={'venue-status-col'}>
                                <section className={'control-status'}>
                                    <div>
                                        <div className={'status-wrapper'}>
                                            <h3 className={'control-status-header'}>SCRAPE:</h3>
                                        </div>
                                        <div className="indent">Total: {venueTotalScraped > 0 ? venueTotalScraped : '--'}</div>
                                    </div>
                                    <div>
                                        <div className={'status-wrapper'}>
                                            <h3 className={'control-status-header'}>INSERT:</h3>
                                        </div>
                                        <div className="indent">Total: {venueConcertCount > 0 ? venueConcertCount : '--'}</div>
                                    </div>
                                </section>
                            </div>
                            <div className={'venue-list-col'}>
                                {austinVenues?.map((v) => (
                                    <div key={v?.replace(/\s+/g, '')} className={'venue-list-item'}>
                                        <div className={`indicator-light ${getVenueLightClass(v)}`} />
                                        <span>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

export default Control;
