import { getTodaysDate, getYesterdaysDate } from "../../../utils/helpers";
import { DELETE_OLD_CONCERTS } from "../../../utils/mutations"
import { useMemo, useCallback, useEffect, useState } from 'react';
import { useMutation } from "@apollo/client"

const CleanByDate = ({ setCleanCount, setIsCleanerLoading }) => {
    const [deletions, setDeletions] = useState([]);
    const [deleteOldConcerts, { loading }] = useMutation(DELETE_OLD_CONCERTS);
    useMemo(() => loading ?
    setTimeout(() => setIsCleanerLoading(true), 500) :
    setTimeout(() => setIsCleanerLoading(false), 500)
    , [loading, setIsCleanerLoading]);
    const today = useMemo(() => getTodaysDate(), []);
    const yesterday = useMemo(() => getYesterdaysDate(today), [today]);

    const deleteThemShits = useCallback(async (date) => {
        try {
            const results = await deleteOldConcerts({
                variables: { date: date }
            });
            setDeletions(results);

            return results;
        } catch (err) {
            console.error(err);
        }
    }, [deleteOldConcerts]);

    const deletedConcerts = useMemo(async () => await deleteThemShits(yesterday), [deleteThemShits, yesterday]);

    console.log('🍕🍕🍕🍕 deletedConcerts: ', deletedConcerts);
    console.log('🍕🍕🍕🍕 deletions: ', deletions);

    useEffect(() => setCleanCount(deletions.length), [deletions.length, setCleanCount]);

    return (
        <></>
    )
}

export default CleanByDate
