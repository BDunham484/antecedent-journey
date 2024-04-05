import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../../../utils/mutations';

const AustinDbUpdater = ({ austinScraper, setTotals, totalConcerts }) => {
    const [addConcert] = useMutation(ADD_CONCERT)
    const [concertsAdded, setConcertsAdded] = useState(0);

    useEffect(() => {

        const dbConcertUpdater = async (arr) => {
            // console.log('dbConcertUpdater is running');
            // add conditional to check arr.length index 30 something causes error

            const response = await Promise.all(arr.filter((x) => x).map(async (dailyArr) => {
                try {
                    const outerResult = await Promise.all(dailyArr.map(async (concert) => {
                        try {
                            const innerResult = await addConcert({
                                variables: { ...concert }
                            })
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

        // let testArr = [4,5,null, 6,5, undefined];
        // let filtered = testArr.filter((x) => x)
        // console.log('FILTERED')
        // console.log(filtered)
        let updaterResults;
        if (austinScraper) {
            updaterResults = dbConcertUpdater(austinScraper);
        };


        console.log('🤞🤞🤞🤞 updaterResults: ', updaterResults);

        const printUpdaterResults = async () => {
            const a = await updaterResults;

            if (a.length) {
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

    }, [addConcert, austinScraper, setTotals, setConcertsAdded])



    return (
        <div className='dbUpdater-wrapper'>
            <h3>UPDATER: ✅</h3>
            <div className='indent'>Updated: {concertsAdded}</div>
            <div className='indent'>Total: {totalConcerts}</div>
        </div>
    )
}

export default AustinDbUpdater;
