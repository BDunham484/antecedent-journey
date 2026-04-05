import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { AUSTIN_TX_LIST_SCRAPER, GET_SCRAPE_META } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useAustinListScraper = () => {
    const [executeQuery] = useLazyQuery(AUSTIN_TX_LIST_SCRAPER, { fetchPolicy: 'network-only' });
    const { runInserts, isRunning: insertLoading, insertCount, error: insertError } = useAustinListDbUpdater();
    const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META, {
        refetchQueries: [GET_SCRAPE_META]
    });

    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(0);
    const [scrapeError, setScrapeError] = useState(null);

    const run = async () => {
        setScrapeLoading(true);
        setScrapeCount(0);
        setScrapeError(null);
        try {
            const result = await executeQuery();
            const scraperData = result?.data?.getAustinList ?? [];
            setScrapeCount(scraperData?.length);
            setScrapeLoading(false);
            await runInserts(scraperData);
        } catch (err) {
            setScrapeError(err);
            setScrapeLoading(false);
        } finally {
            await updateScrapeMeta({ variables: { key: 'showlist', timestamp: new Date().toISOString() } });
        }
    };

    const error = scrapeError || insertError || null;

    return { executeQuery: run, scrapeLoading, insertLoading, scrapeCount, insertCount, error };
};

export default useAustinListScraper;
