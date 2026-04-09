import { useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { DELETE_OLD_CONCERTS } from '../utils/mutations';
import { GET_HAS_STALE_SHOWS } from '../utils/queries';

const useStaleShowCleaner = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const cutoff = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }, []);

    const { data, refetch } = useQuery(GET_HAS_STALE_SHOWS, {
        variables: { date: cutoff },
        fetchPolicy: 'network-only',
    });

    const [deleteOldConcerts] = useMutation(DELETE_OLD_CONCERTS);

    const hasStale = data?.hasStaleShows ?? false;

    const execute = async () => {
        setIsDeleting(true);
        try {
            await deleteOldConcerts({ variables: { date: cutoff } });
        } catch (err) {
            console.error('useStaleShowCleaner delete error:', err);
        }
        await refetch();
        setIsDeleting(false);
    };

    return { hasStale, isDeleting, execute };
};

export default useStaleShowCleaner;
