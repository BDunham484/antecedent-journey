import { useQuery } from '@apollo/client';
import ListControlBox from '../components/controls/listControl/ListControlBox';
import StaleShowControlBox from '../components/controls/staleShowsControl/StaleShowsControlBox';
import VenueControlBox from '../components/controls/venueControl/VenueControlBox';
import useAustinListScraper from '../hooks/useAustinListScraper';
import useAustinTXScraper from '../hooks/useAustinTXScraper';
import { GET_SCRAPE_META } from '../utils/queries';

const Control = () => {
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
    // console.log('⚰️⚰️⚰️⚰️ controlSwitch: ', controlSwitch);
    // console.log('⚰️⚰️⚰️⚰️ venueSwitch: ', venueSwitch);
    console.log('⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️⚰️');
    console.log(' ');
    // changelog-end

    return (
        <div>
            <main id='control-main'>
                <div className='control-panels'>
                    {/* --- STALE SHOWS --- */}
                    <StaleShowControlBox />
                    {/* --- AUSTIN: SHOWLIST --- */}
                    <ListControlBox
                        scrapeMetaData={scrapeMetaData}
                        runShowlist={runShowlist}
                        isScraperLoading={isScraperLoading}
                        isUpdaterRunning={isUpdaterRunning}
                        totalScraped={totalScraped}
                        concertCount={concertCount}
                    />
                    {/* --- AUSTIN: VENUES --- */}
                    <VenueControlBox
                        scrapeMetaData={scrapeMetaData}
                        runVenues={runVenues}
                        isVenueScraperLoading={isVenueScraperLoading}
                        isVenueUpdaterRunning={isVenueUpdaterRunning}
                        venueTotalScraped={venueTotalScraped}
                        venueConcertCount={venueConcertCount}
                        venueStatuses={venueStatuses}
                    />
                </div>
            </main>
        </div>
    )
}

export default Control;
