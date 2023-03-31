import { useEffect } from 'react'
import { useMutation } from '@apollo/client';
import { ADD_CONCERT } from '@/utils/mutations';

const AustinDbUpdater = ({ today, date, austinScraper }) => {
    const [addConcert] = useMutation(ADD_CONCERT)


    useEffect(() => {
        const dbConcertUpdater = async (arr) => {
            console.log('dbConcertUpdater is running');
            await Promise.all(arr.map(async (dailyArr) => {
                await Promise.all(dailyArr.map(async (concert) => {
                    try {
                        await addConcert({
                            variables: { ...concert }
                        })
                    } catch (e) {
                        console.error(e)
                    };
                }));
            }));
        };
        dbConcertUpdater(austinScraper);

    }, [addConcert, austinScraper])

    return (
        <div>

        </div>
    )
}

export default AustinDbUpdater;
