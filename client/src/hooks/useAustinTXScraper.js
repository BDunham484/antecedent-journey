import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { GET_AUSTIN_TX_SHOW_DATA } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useAustinTXScraper = () => {
    const [executeQuery] = useLazyQuery(GET_AUSTIN_TX_SHOW_DATA, { fetchPolicy: 'network-only' });
    const { runInserts, isRunning: insertLoading, insertCount, error: insertError } = useAustinListDbUpdater();
    const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META);

    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(0);
    const [scrapeError, setScrapeError] = useState(null);

    // changelog-start
    console.log('👾👾👾👾👾👾👾👾👾👾👾👾👾👾');
    console.log('👾👾👾👾 scrapeLoading: ', scrapeLoading);
    console.log('👾👾👾👾 scrapeCount: ', scrapeCount);
    console.log('👾👾👾👾 insertLoading: ', insertLoading);
    console.log('👾👾👾👾 insertCount: ', insertCount);
    console.log('👾👾👾👾 insertError: ', insertError);
    console.log('👾👾👾👾👾👾👾👾👾👾👾👾👾👾');
    console.log(' ');
    // changelog-end

    const run = async () => {
        setScrapeLoading(true);
        setScrapeCount(0);
        setScrapeError(null);
        try {
            const result = await executeQuery();
            const scraperData = result?.data?.getAustinTXShowData ?? [];
            setScrapeCount(scraperData?.length);
            setScrapeLoading(false);
            await runInserts(scraperData);
            await updateScrapeMeta({ variables: { key: 'venues', timestamp: new Date().toISOString() } });
        } catch (err) {
            setScrapeError(err);
            setScrapeLoading(false);
        }
    };

    const error = scrapeError || insertError || null;

    return { executeQuery: run, scrapeLoading, insertLoading, scrapeCount, insertCount, error };
};

export default useAustinTXScraper;
