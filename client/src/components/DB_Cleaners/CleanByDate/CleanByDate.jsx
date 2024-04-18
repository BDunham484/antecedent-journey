import { useMutation } from "@apollo/client"
import { DELETE_OLD_CONCERTS } from "../../../utils/mutations"
import { getTodaysDate } from "../../../utils/helpers";
import { useMemo, useCallback, useEffect } from 'react';

const CleanByDate = () => {
    const [deleteOldConcerts] = useMutation(DELETE_OLD_CONCERTS);

    const today = useMemo(() => getTodaysDate(), []);

    const deleteThemShits = useCallback(async (date) => {
    console.log('👁️👁️👁️👁️ date: ', typeof date);

        try {
            const results = await deleteOldConcerts(date)
            // const results = await deleteOldConcerts({
            //     variables: { date: date }
            // })
            console.log('👁️👁️👁️👁️ results: ', results);

            return results;
        } catch (err) {
            console.error(err);
        }
    }, [deleteOldConcerts]);

    // const deletedConcerts = useMemo(async () => await deleteThemShits(today), [deleteThemShits, today]);

    
    useEffect(() => {
        const deletedConcerts = deleteThemShits(today);

        console.log('👁️👁️👁️👁️ deletedConcerts: ', deletedConcerts);
    }, [deleteThemShits, today]);
    return (
        <div>

        </div>
    )
}

export default CleanByDate
