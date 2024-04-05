import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';
import { AUSTIN_TX_LIST_SCRAPER } from '../../../utils/queries';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

const AustinListScraper = ({ setControlSwitch }) => {
    const [austinScraper, setAustinScraper] = useState([[]]);
    //get today's date with imported helper function
    var today = getTodaysDate();

    const { loading, error, data, } = useQuery(AUSTIN_TX_LIST_SCRAPER);

    if (error) {
        console.log('❌❌❌❌ error: ', error);
        setControlSwitch(false);
        setTimeout(() => {
            setControlSwitch(true);
        }, 3000);
    };

    useEffect(() => {
        if (data) {
            console.log('🥷🥷🥷🥷 data: ', data);
            const concertData = data.AustinListScraper;
            setAustinScraper(concertData);
        }
    }, [data]);



    return (
        <>
            <div>
                <h3>
                    SCRAPER: ✅
                </h3>
                <AustinDbUpdater austinScraper={austinScraper}/>
            </div>
            {(error) &&
                <div>
                    <h2>{urlErr}</h2>
                    {urlErr &&
                        urlErr.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                </div>
            }
        </>
    );
};

export default AustinListScraper;
