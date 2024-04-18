import { useMutation } from "@apollo/client"
import { DELETE_OLD_CONCERTS } from "../../../utils/mutations"
import { getTodaysDate } from "../../../utils/helpers";
import { useMemo, useCallback, useEffect } from 'react';

const CleanByDate = () => {
    const [deleteOldConcerts] = useMutation(DELETE_OLD_CONCERTS);

    const today = useMemo(() => getTodaysDate(), []);

    const deleteThemShits = useCallback(async (today) => {
        try {
            const results = await deleteOldConcerts({
                variables: { date: today }
            })
            
            return results;
        } catch (err) {
            console.error(err);
        }
    }, [deleteOldConcerts]);

    const deletedConcerts = useMemo(() => deleteThemShits(today), [deleteThemShits, today]);
    
    useEffect(() => {
        console.log('👁️👁️👁️👁️ deletedConcerts: ', deletedConcerts);
    }, [deletedConcerts]);
    return (
        <div>

        </div>
    )
}

export default CleanByDate
