import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';
import { AUSTIN_TX_LIST_SCRAPER } from '../../../utils/queries';
import { getTodaysDate } from "../../../utils/helpers";
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

const AustinListScraper = ({ setControlSwitch }) => {
    const [austinScraper, setAustinScraper] = useState([[]]);
    const [totals, setTotals] = useState([]);
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
        if (!loading && data) {
            console.log('🥷🥷🥷🥷 data: ', data);
            const concertData = data.AustinListScraper;
            setAustinScraper(concertData);
        }
    }, [data]);

    let totalConcerts;

    if (totals.length > 0) {
        totalConcerts = totals.reduce((total, amount) => total + amount)
    }

    return (
        <>
            <div>
                <h3>
                    SCRAPER: ✅
                </h3>
                <AustinDbUpdater austinScraper={austinScraper} setTotals={setTotals} totalConcerts={totalConcerts} />
            </div>
            {(error) &&
                <div>
                    <h2>{error}</h2>
                    {error &&
                        error.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                </div>
            }
        </>
    );
};

export default AustinListScraper;
