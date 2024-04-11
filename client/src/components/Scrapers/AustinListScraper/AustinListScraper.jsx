import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';
import { AUSTIN_TX_LIST_SCRAPER } from '../../../utils/queries';
import { getTodaysDate } from "../../../utils/helpers";
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';

const AustinListScraper = ({ setControlSwitch }) => {
    const [austinScraper, setAustinScraper] = useState([]);
    const [totals, setTotals] = useState([]);
    //get today's date with imported helper function
    var today = getTodaysDate();

    const { loading, error, data, } = useQuery(AUSTIN_TX_LIST_SCRAPER);

    if (error) {
        console.log('❌❌❌❌ error: ', error);
        setControlSwitch(false);
        // setTimeout(() => {
        //     setControlSwitch(true);
        // }, 3000);
    };

    useEffect(() => {
        if (!loading && data) {
            console.log('🥷🥷🥷🥷 data: ', data);
            const concertData = data.getAustinList;

            // const mutableData = [ ...concertData ];

            // if (mutableData) {
            //     for (let i = 0; i <= 5; i++) {
            //         console.log('🍩🍩🍩🍩 mutableData[i].date: ', mutableData[i].date);
            //         // const year = (mutableData[i].date).slice(0, 4);
            //         // const month = (mutableData[i].date).slice(4, 6);
            //         // const day = (mutableData[i].date).slice(6);
            //         // const newDate = new Date(year, month, day).toDateString();
            //         // // const newDate = Date.parse(year, month, day);
            //         // console.log('🍩🍩🍩🍩 year: ', year);
            //         // console.log('🍩🍩🍩🍩 month: ', month);
            //         // console.log('🍩🍩🍩🍩 day: ', day);
            //         // console.log('🍩🍩🍩🍩 newDate: ', newDate);
            //         // const testDate = mutableData[i].date;
            //         // console.log('🍩🍩🍩🍩 testDate.toISOString(): ', testDate.toString());
            //     }
            // };

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
                {austinScraper && austinScraper.length > 0 &&
                    <AustinDbUpdater
                    austinScraper={austinScraper}
                    setTotals={setTotals}
                    totalConcerts={totalConcerts}
                    setControlSwitch={setControlSwitch}
                    />
                }
            </div>
            {/* {(error) &&
                <div>
                    <h2>{error}</h2>
                    {error &&
                        error.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                </div>
            } */}
        </>
    );
};

export default AustinListScraper;
