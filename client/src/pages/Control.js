import AustinListDbUpdater from "../components/DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
import AustinListScraper from "../components/Scrapers/AustinListScraper/AustinListScraper";
import AustinTXScraper from "../components/Scrapers/AustinTXScraper/AustinTXScraper";
import CleanByDate from "../components/DB_Cleaners/CleanByDate/CleanByDate";
import { getTodaysDate } from '../utils/helpers';
import Switch from 'react-switch'
import { useState } from "react"

const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);
    const [totalScraped, setTotalScraped] = useState(0);
    const [concertCount, setConcertCount] = useState(0);
    const [cleanCount, setCleanCount] = useState(0);
    const [isScraperLoading, setIsScraperLoading] = useState(false);
    const [isUpdaterRunning, setIsUpdaterRunning] = useState(false);
    const [isCleanerLoading, setIsCleanerLoading] = useState(false);
    const [austinScraper, setAustinScraper] = useState([]);

    const [venueSwitch, setVenueSwitch] = useState(false);
    const [venueTotalScraped, setVenueTotalScraped] = useState(0);
    const [venueConcertCount, setVenueConcertCount] = useState(0);
    const [isVenueScraperLoading, setIsVenueScraperLoading] = useState(false);
    const [isVenueUpdaterRunning, setIsVenueUpdaterRunning] = useState(false);
    const [austinVenueScraper, setAustinVenueScraper] = useState([]);

    const handleControlSwitch = () => {
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
    }

    const handleVenueSwitch = () => {
        if (venueSwitch) {
            setVenueSwitch(false);
            setVenueTotalScraped(0);
            setVenueConcertCount(0);
            setIsVenueScraperLoading(false);
            setIsVenueUpdaterRunning(false);
            setAustinVenueScraper([]);
        } else {
            setVenueSwitch(true);
        }
    }

    const austinVenues = ['The 13th Floor', '29th Street Ballroom'];

    const getVenueLightClass = () => {
        if (!venueSwitch) return 'light-red';
        if (isVenueScraperLoading) return 'light-yellow';
        if (venueTotalScraped > 0) return 'light-green';
        return 'light-red';
    };

    var today = getTodaysDate();

    return (
        <div>
            <main id={'control-main'}>
                <div className={'control-panels'}>

                    {/* --- AUSTIN: SHOWLIST --- */}
                    <div className={'control-container'}>
                        <h2>AUSTIN: SHOWLIST</h2>
                        <div className={'control-date'}>{today}</div>
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
                        />
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
                                {austinScraper && austinScraper.length > 0 && (
                                    <AustinListDbUpdater
                                        austinScraper={austinScraper}
                                        concertCount={concertCount}
                                        setConcertCount={setConcertCount}
                                        setControlSwitch={setControlSwitch}
                                        setIsUpdaterRunning={setIsUpdaterRunning}
                                    />
                                )}
                            </div>
                        }
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
                        <div className={'control-date'}>{today}</div>
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
                        />
                        {venueSwitch &&
                            <div>
                                <AustinTXScraper
                                    setControlSwitch={setVenueSwitch}
                                    setIsScraperLoading={setIsVenueScraperLoading}
                                    setTotalScraped={setVenueTotalScraped}
                                    setAustinScraper={setAustinVenueScraper}
                                />
                                {austinVenueScraper && austinVenueScraper.length > 0 && (
                                    <AustinListDbUpdater
                                        austinScraper={austinVenueScraper}
                                        concertCount={venueConcertCount}
                                        setConcertCount={setVenueConcertCount}
                                        setControlSwitch={setVenueSwitch}
                                        setIsUpdaterRunning={setIsVenueUpdaterRunning}
                                    />
                                )}
                            </div>
                        }
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
                                {austinVenues.map((v, i) => (
                                    <div key={i} className={'venue-list-item'}>
                                        <div className={`indicator-light ${getVenueLightClass()}`} />
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
