import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../utils/mutations';

const useAustinListDbUpdater = () => {
    const [addConcert] = useMutation(ADD_CONCERT);
    const [insertCount, setInsertCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    const runInserts = async (scraperData) => {
        if (!scraperData || scraperData?.length === 0) return;

        setIsRunning(true);
        setInsertCount(0);
        setError(null);
        let count = 0;

        for (let i = 0; i <= scraperData?.length - 1; i++) {
            try {
                const { __typename, customId, ...rest } = scraperData[i];
                const { __typename: _ct, ...cleanCustomId } = customId || {};
                const response = await addConcert({ variables: { ...rest, customId: cleanCustomId } });
                if (response) {
                    count++;
                    setInsertCount(count);
                }
            } catch (err) {
                console.log('❌❌❌❌ insert error:', err);
                console.log('❌❌❌❌ scraperData[i]:', scraperData[i]);
                setError(err);
                break;
            }
        }

        setIsRunning(false);
    };

    return { runInserts, isRunning, insertCount, error };
};

export default useAustinListDbUpdater;
