import { useEffect } from 'react'
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '../../../utils/mutations';

const AustinDbUpdater = ({ today, date, austinScraper }) => {
    const [addConcert] = useMutation(ADD_CONCERT)

    let successCount = 0;
    let errorCount = 0;

    useEffect(() => {
        const dbConcertUpdater = async (arr) => {
            console.log('dbConcertUpdater is running');
            await Promise.all(arr.map(async (dailyArr) => {
                try {
                    await Promise.all(dailyArr.map(async (concert) => {
                        try {
                            const result = await addConcert({
                                variables: { ...concert }
                            })
                            result && successCount++
                        } catch (e) {
                            console.error(e)
                        }
                    }))
                } catch (e) {
                    console.error(e)
                    errorCount++
                }   
            }));
        };
        // const dbConcertUpdater = async (arr) => {
        //     console.log('dbConcertUpdater is running');
        //     await Promise.all(arr.map(async (dailyArr) => {
        //         await Promise.all(dailyArr.map(async (concert) => {
        //             try {
        //                 await addConcert({
        //                     variables: { ...concert }
        //                 })
        //             } catch (e) {
        //                 console.error(e)
        //             };
        //         }));
        //     }));
        // };
        dbConcertUpdater(austinScraper);

    }, [addConcert, austinScraper, successCount, errorCount])

    return (
        <div className='dbUpdater-wrapper'>
            DB Updater: ✅
            DB Successes: {successCount}
            DB Errors: {errorCount}
        </div>
    )
}

export default AustinDbUpdater;
