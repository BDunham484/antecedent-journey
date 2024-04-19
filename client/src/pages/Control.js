import AustinListDbUpdater from "../components/DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
import AustinListScraper from "../components/Scrapers/AustinListScraper/AustinListScraper";
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

    const handleControlSwitch = () => {
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
    }

    var today = getTodaysDate();

    return (
        <div>
            <main id={'control-main'}>
                <div className={'control-container'}>
                    <h2>AUSTIN</h2>
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
                    <div>
                        <h3>CLEAN: {!controlSwitch ? '🪦' : isCleanerLoading ? '⌛...' : '✅'}</h3>
                        <div className="indent">Total: {cleanCount > 0 ? cleanCount : '🪦'}</div>
                    </div>
                    <div>
                        <h3>SCRAPE: {!controlSwitch ? '🪦' : isScraperLoading ? '⌛...' : '✅'}</h3>
                        <div className="indent">Total: {totalScraped > 0 ? totalScraped : '🪦'}</div>
                    </div>
                    <div className="dbUpdater-wrapper">
                        <h3>INSERT: {!controlSwitch ? '🪦' : isUpdaterRunning ? '⌛...' : '✅'}</h3>
                        <div className="indent">Total: {concertCount > 0 ? concertCount : '🪦'}</div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Control;
