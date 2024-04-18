import AustinListDbUpdater from "../components/DB_Updaters/AustinListDbUpdater/AustinListDbUpdater";
import AustinListScraper from "../components/Scrapers/AustinListScraper/AustinListScraper";
import CleanByDate from "../components/DB_Cleaners/CleanByDate/CleanByDate";
import AustinDbCleaner from '../components/DB_Cleaners/AustinDbCleaner'
import { getTodaysDate } from '../utils/helpers';
import Switch from 'react-switch'
import { useState } from "react"

const Control = () => {
    const [controlSwitch, setControlSwitch] = useState(false);
    const [concertCount, setConcertCount] = useState(0);
    const [totalScraped, setTotalScraped] = useState(0);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [isUpdaterRunning, setIsUpdaterRunning] = useState(false);
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
                            <AustinListScraper
                                setControlSwitch={setControlSwitch}
                                setIsQueryLoading={setIsQueryLoading}
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
                        <h3>SCRAPER: {!controlSwitch ? '🪦' : isQueryLoading ? '⌛...' : '✅'}</h3>
                        <div className="indent">Total: {totalScraped > 0 ? totalScraped : '🪦'}</div>
                    </div>
                    <div className="dbUpdater-wrapper">
                        <h3>UPDATER: {!controlSwitch ? '🪦' : isUpdaterRunning ? '⌛...' : '✅'}</h3>
                        <div className="indent">Total: {concertCount > 0 ? concertCount : '🪦'}</div>
                    </div>
                    <CleanByDate today={today}/>
                </div>
            </main>
        </div>

    )
}

export default Control;
