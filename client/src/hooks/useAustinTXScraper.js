import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { GET_AUSTIN_TX_SHOW_DATA, GET_SCRAPE_META } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useAustinTXScraper = () => {
    const [executeQuery] = useLazyQuery(GET_AUSTIN_TX_SHOW_DATA, { fetchPolicy: 'network-only' });
    const { runInserts, reset, insertCount, error: insertError } = useAustinListDbUpdater();
    const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META, {
        refetchQueries: [GET_SCRAPE_META]
    });

    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(0);
    const [scrapeError, setScrapeError] = useState(null);
    const [insertLoading, setInsertLoading] = useState(false);
    const [venueStatuses, setVenueStatuses] = useState({});

    // changelog-start
    console.log('👾👾👾👾👾👾👾👾👾👾👾👾👾👾');
    console.log('👾👾👾👾 scrapeLoading: ', scrapeLoading);
    console.log('👾👾👾👾 scrapeCount: ', scrapeCount);
    console.log('👾👾👾👾 insertLoading: ', insertLoading);
    console.log('👾👾👾👾 insertCount: ', insertCount);
    console.log('👾👾👾👾 insertError: ', insertError);
    console.log('👾👾👾👾 venueStatuses: ', venueStatuses);
    console.log('👾👾👾👾👾👾👾👾👾👾👾👾👾👾');
    console.log(' ');
    // changelog-end

    const run = async () => {
        setScrapeLoading(true);
        setScrapeCount(0);
        setScrapeError(null);
        setVenueStatuses({});
        reset();
        try {
            const result = await executeQuery();
            const scraperData = result?.data?.getAustinTXShowData ?? [];
            setScrapeCount(scraperData?.length);
            setScrapeLoading(false);

            const byVenue = scraperData.reduce((acc, concert) => {
                const v = concert.venue;
                if (!acc[v]) acc[v] = [];
                acc[v].push(concert);
                return acc;
            }, {});

            setInsertLoading(true);
            for (const [venue, concerts] of Object.entries(byVenue)) {
                setVenueStatuses(prev => ({ ...prev, [venue]: 'inserting' }));
                const success = await runInserts(concerts);
                setVenueStatuses(prev => ({ ...prev, [venue]: success ? 'success' : 'error' }));
            }
            setInsertLoading(false);
        } catch (err) {
            setScrapeError(err);
            setScrapeLoading(false);
            setInsertLoading(false);
        } finally {
            await updateScrapeMeta({ variables: { key: 'venues', timestamp: new Date().toISOString() } });
        }
    };

    const error = scrapeError || insertError || null;

    return { executeQuery: run, scrapeLoading, insertLoading, scrapeCount, insertCount, venueStatuses, error };
};

export default useAustinTXScraper;
