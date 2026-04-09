import { useMutation } from "@apollo/client";
import { useCallback, useMemo } from 'react';
import { DELETE_OLD_CONCERTS } from "../../../utils/mutations";

const CleanByDate = ({ setCleanCount, setIsCleanerLoading }) => {
    const [deleteOldConcerts, { loading }] = useMutation(DELETE_OLD_CONCERTS);

    useMemo(() => loading ?
        setTimeout(() => setIsCleanerLoading(true), 500) :
        setTimeout(() => setIsCleanerLoading(false), 500)
    , [loading, setIsCleanerLoading]);

    const cutoff = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }, []);

    const deleteThemShits = useCallback(async (date) => {
        try {
            const results = await deleteOldConcerts({ variables: { date } });
            if (results) {
                setCleanCount(results.data?.deleteOldConcerts ?? 0);
            }
            return results;
        } catch (err) {
            console.error(err);
        }
    }, [deleteOldConcerts, setCleanCount]);

    useMemo(async () => await deleteThemShits(cutoff), [deleteThemShits, cutoff]);

    return <></>;
};

export default CleanByDate;
