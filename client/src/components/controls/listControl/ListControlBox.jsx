import { useEffect, useState } from "react";
import Switch from 'react-switch';
import { switchTheme } from "../../../definitions/constants";
import { formatScrapeTime } from "../../../utils/helpers";
import sharedStyles from '../ControlBox.module.css';
import ownStyles from './ListControlBox.module.css';

const { controlContainer, controlHeader, controlStatus, statusWrapper, venueShimmer } = sharedStyles;
const { emoji } = ownStyles;

const ListControlBox = ({
    scrapeMetaData,
    runShowlist,
    isScraperLoading,
    isUpdaterRunning,
    totalScraped,
    concertCount,
}) => {
    const lastShowlistScrape = scrapeMetaData?.getScrapeMeta?.lastShowlistScrape ?? null;

    const [controlSwitch, setControlSwitch] = useState(false);

    useEffect(() => {
        if (totalScraped > 0 && !isUpdaterRunning) {
            setControlSwitch(false);
        }
    }, [isUpdaterRunning, totalScraped]);

    const handleControlSwitch = () => {
        if (controlSwitch) {
            setControlSwitch(false);
        } else {
            setControlSwitch(true);
            runShowlist();
        }
    }

    return (
        <div className={`${controlContainer}${isScraperLoading ? ` ${venueShimmer}` : ''}`}>
            <div className={controlHeader}>
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
            <section className={controlStatus}>
                <div>
                    <div className={statusWrapper}>
                        <h3>SCRAPE: {totalScraped > 0 ? totalScraped : '--'}</h3>
                        <h3 className={emoji}>{!controlSwitch ? '🪦' : isScraperLoading ? '⌛...' : '✅'}</h3>
                    </div>
                </div>
                <div>
                    <div className={statusWrapper}>
                        <h3>INSERT: {concertCount > 0 ? concertCount : '--'}</h3>
                        <h3 className={emoji}>{!controlSwitch ? '🪦' : isUpdaterRunning ? '⌛...' : '✅'}</h3>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ListControlBox;