import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../utils/mutations';

const useAustinListDbUpdater = (scraperData) => {
    const [addConcert] = useMutation(ADD_CONCERT);
    const [insertCount, setInsertCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!scraperData || scraperData?.length === 0) {
            setInsertCount(0);
            setIsRunning(false);
            setError(null);
            return;
        }

        let cancelled = false;

        const runInserts = async () => {
            setIsRunning(true);
            setInsertCount(0);
            let count = 0;

            for (let i = 0; i <= scraperData?.length - 1; i++) {
                if (cancelled) break;
                try {
                    const { __typename, customId, ...rest } = scraperData[i];
                    const { __typename: _ct, ...cleanCustomId } = customId || {};
                    const response = await addConcert({ variables: { ...rest, customId: cleanCustomId } });
                    if (response) {
                        count++;
                        if (!cancelled) setInsertCount(count);
                    }
                } catch (err) {
                    console.log('❌❌❌❌ insert error:', err);
                    console.log('❌❌❌❌ scraperData[i]:', scraperData[i]);
                    if (!cancelled) setError(err);
                    break;
                }
            }

            if (!cancelled) setIsRunning(false);
        };

        runInserts();

        return () => { cancelled = true; };
    }, [scraperData, addConcert]);

    return { isRunning, insertCount, error };
};

export default useAustinListDbUpdater;
