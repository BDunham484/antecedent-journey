import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../../../utils/mutations';

const AustinDbUpdater = ({ today, date, austinScraper, setArr, totalConcerts }) => {
    const [addConcert] = useMutation(ADD_CONCERT)
    const [concertsAdded, setConcertsAdded] = useState(0);

    useEffect(() => {

        const dbConcertUpdater = async (arr) => {
            console.log('dbConcertUpdater is running');
            const response = await Promise.all(arr.map(async (dailyArr) => {
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
        
        let updaterResults = dbConcertUpdater(austinScraper);
        

        const printUpdaterResults = async () => {
            const a = await updaterResults;
            
            if (a.length) {
                let mapResult = a.map((b) => {
                    return b.length
                })
                const sum = mapResult.reduce((total, amount) => total + amount)
                setArr(current => [...current, sum])
                setConcertsAdded(sum)
                return sum;
            }
        }

        printUpdaterResults();

    }, [addConcert, austinScraper, setArr, setConcertsAdded])

    

    return (
        <div className='dbUpdater-wrapper'>
            <h3>DB Updater: ✅</h3>
            <div>Updated: {concertsAdded}</div>
            <div>Total: {totalConcerts}</div>
        </div>
    )
}

export default AustinDbUpdater;
