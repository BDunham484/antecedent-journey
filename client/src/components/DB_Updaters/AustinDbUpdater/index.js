import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../../../utils/mutations';

const AustinDbUpdater = ({ austinScraper, setTotals, totalConcerts, setControlSwitch }) => {
    const [addConcert] = useMutation(ADD_CONCERT)
    const [concertsAdded, setConcertsAdded] = useState(0);

    useEffect(() => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const dbConcertUpdater = async (arr) => {
            const response = await Promise.all(arr.filter((x) => x).map(async (dailyArr) => {
                try {
                    const outerResult = await Promise.all(dailyArr.map(async (concert) => {
                        try {
                            const innerResult = await addConcert({
                                variables: { ...concert }
                            })
                            console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 innerResult: ', innerResult);
                            await delay(5000);
                            return innerResult
                        } catch (e) {
                            console.error(e)
                            return e
                        }
                    }))
                    return outerResult
                } catch (e) {
                    console.error(e)
                    return e
                }
            }));
            return response
        };

        let updaterResults;
        if (austinScraper) {
            updaterResults = dbConcertUpdater(austinScraper);
        };

        const printUpdaterResults = async () => {
            const a = await updaterResults;

            if (a && a.length) {
                let mapResult = a.map((b) => {
                    return b.length
                })
                const sum = mapResult.reduce((total, amount) => total + amount)
                setTotals(current => [...current, sum])
                setConcertsAdded(sum)
                return sum;
            }
        }

        printUpdaterResults();

    }, [addConcert, austinScraper, setTotals, setConcertsAdded, setControlSwitch])

    return (
        <div className='dbUpdater-wrapper'>
            <h3>UPDATER: ✅</h3>
            <div className='indent'>Updated: {concertsAdded}</div>
            <div className='indent'>Total: {totalConcerts}</div>
        </div>
    )
}

export default AustinDbUpdater;
