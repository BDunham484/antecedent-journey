import { useLazyQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_AUSTIN_TX_SHOW_DATA } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useAustinTXScraper = () => {
    const [executeQuery, { loading: scrapeLoading, error: scrapeError, data }] = useLazyQuery(
        GET_AUSTIN_TX_SHOW_DATA,
        { fetchPolicy: 'network-only' }
    );

    const scraperData = useMemo(() => data?.getAustinTXShowData ?? [], [data]);
    const { isRunning: insertLoading, insertCount, error: insertError } = useAustinListDbUpdater(scraperData);

    const scrapeCount = scraperData?.length;
    const error = scrapeError || insertError || null;

    return { executeQuery, scrapeLoading, insertLoading, scrapeCount, insertCount, error };
};

export default useAustinTXScraper;
