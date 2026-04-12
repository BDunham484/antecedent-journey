import { useLazyQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { UPDATE_SCRAPE_META } from "../utils/mutations";
import { GET_AUSTIN_FOCUSED_SHOW_DATA, GET_SCRAPE_META } from '../utils/queries';
import useAustinListDbUpdater from './useAustinListDbUpdater';

const useFocusedVenueScraper = () => {
    const [executeQuery] = useLazyQuery(GET_AUSTIN_FOCUSED_SHOW_DATA, { fetchPolicy: 'network-only' });
    const { runInserts, reset, insertCount, error: insertError } = useAustinListDbUpdater();
    const [updateScrapeMeta] = useMutation(UPDATE_SCRAPE_META, {
        refetchQueries: [GET_SCRAPE_META]
    });

    const [scrapeLoading, setScrapeLoading] = useState(false);
    const [scrapeCount, setScrapeCount] = useState(0);
    const [scrapeError, setScrapeError] = useState(null);
    const [insertLoading, setInsertLoading] = useState(false);
    const [venueStatuses, setVenueStatuses] = useState({});

    const run = async (selectedKeys) => {
        setScrapeLoading(true);
        setScrapeCount(0);
        setScrapeError(null);
        setVenueStatuses({});
        reset();
        try {
            const result = await executeQuery({ variables: { venues: selectedKeys } });
            const scraperData = result?.data?.getAustinFocusedShowData ?? [];
            setScrapeCount(scraperData.length);
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
            await updateScrapeMeta({ variables: { key: 'focused', timestamp: new Date().toISOString() } });
        }
    };

    const error = scrapeError || insertError || null;

    return { run, scrapeLoading, insertLoading, scrapeCount, insertCount, venueStatuses, error };
};

export default useFocusedVenueScraper;
