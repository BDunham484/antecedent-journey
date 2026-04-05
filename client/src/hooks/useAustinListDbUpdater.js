import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../utils/mutations';

const useAustinListDbUpdater = () => {
    const [addConcert] = useMutation(ADD_CONCERT);
    const [insertCount, setInsertCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    const reset = () => {
        setInsertCount(0);
        setError(null);
    };

    // Returns true on success, false if an insert error occurred
    const runInserts = async (scraperData) => {
        if (!scraperData || scraperData?.length === 0) return true;

        setIsRunning(true);

        for (let i = 0; i <= scraperData?.length - 1; i++) {
            try {
                const { __typename, customId, ...rest } = scraperData[i];
                const { __typename: _ct, ...cleanCustomId } = customId || {};
                const response = await addConcert({ variables: { ...rest, customId: cleanCustomId } });
                if (response) {
                    setInsertCount(prev => prev + 1);
                }
            } catch (err) {
                console.log('❌❌❌❌ insert error:', err);
                console.log('❌❌❌❌ scraperData[i]:', scraperData[i]);
                setError(err);
                setIsRunning(false);
                return false;
            }
        }

        setIsRunning(false);
        return true;
    };

    return { runInserts, reset, isRunning, insertCount, error };
};

export default useAustinListDbUpdater;
