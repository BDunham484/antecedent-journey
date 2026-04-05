import { useMemo } from 'react';
import { useLazyQuery } from '@apollo/client';
import { AUSTIN_TX_LIST_SCRAPER } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useAustinListScraper = () => {
    const [executeQuery, { loading: scrapeLoading, error: scrapeError, data }] = useLazyQuery(
        AUSTIN_TX_LIST_SCRAPER,
        { fetchPolicy: 'network-only' }
    );

    const scraperData = useMemo(() => data?.getAustinList ?? [], [data]);
    const { isRunning: insertLoading, insertCount, error: insertError } = useAustinListDbUpdater(scraperData);

    const scrapeCount = scraperData?.length;
    const error = scrapeError || insertError || null;

    return { executeQuery, scrapeLoading, insertLoading, scrapeCount, insertCount, error };
};

export default useAustinListScraper;
