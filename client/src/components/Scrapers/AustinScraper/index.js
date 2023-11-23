import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { AUSTIN_CONCERT_SCRAPER } from "../../../utils/queries";
import { getTodaysDate } from "../../../utils/helpers";
import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';

const AustinScraper = ({ setControlSwitch }) => {
    //get today's date with imported helper function
    var today = getTodaysDate();
    const [scrapeIndex, setScrapeIndex] = useState(1);
    const [totals, setTotals] = useState([]);
    const [scraperDate, setScraperDate] = useState(today);
    const [austinScraper, setAustinScraper] = useState([[]]);

    const { loading, data: concertData } = useQuery(AUSTIN_CONCERT_SCRAPER, {
        variables: { date: scraperDate }
    })

    // empty array for dates to populate.  Iterated over and passed to scraper one index at a time. Next index doesn't fire until results from the previous are returned
    let dateArr = useMemo(() => [], []);

    useEffect(() => {
        // push todays date into dateArr
        dateArr.push(today);
        //function to get the next day based on the date passed in to it
        const nextDay = (date) => {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            const theNextDay = next.toDateString();
            return theNextDay;
        }
        //save date to another variable for for-loop
        let arrayDate = today;
        //for loop that continuously gets upcoming dates and pushes them to array
        for (let i = 0; i < 89; i++) {
            let nextDate = nextDay(arrayDate);
            dateArr.push(nextDate);
            arrayDate = nextDate;
        }
    }, [today, dateArr])

    useEffect(() => {
        const checkDates = () => {
            if (scrapeIndex === 90)  {
                setControlSwitch(false);
                return;
            }
            console.log('👻👻👻👻👻👻👻👻👻👻👻👻👻👻')
            console.log('🥩🥩🥩🥩 concertData: ', concertData);
            const testResult = concertData?.austinConcertScraper[0][0]?.date || '';

            console.log('🥩🥩🥩🥩 testResult: ', testResult);
            console.log('🥩🥩🥩🥩 scraperDate: ', scraperDate);

            if (testResult === scraperDate) {
                setScrapeIndex(prevIndex => prevIndex + 1);

                console.log('🍖🍖🍖🍖 scrapeIndex: ', scrapeIndex);
                console.log('🍖🍖🍖🍖 dateArr[scrapeIndex]: ', dateArr[scrapeIndex]);

                setScraperDate(prevDate => {
                    return dateArr[scrapeIndex];
                });
                console.log('🍖🍖🍖🍖 scraperDate: ', scraperDate);
            }
        };

        if (concertData) {
            checkDates();
        }

        console.log('✅✅✅✅ scraperDate: ', scraperDate);
    }, [today, setControlSwitch, scraperDate, concertData, loading, dateArr])

    useEffect(() => {
        if (concertData) {
            console.log('RETURNED SCRAPER DATA: ', concertData);
            const concertDataArr = concertData.austinConcertScraper
            setAustinScraper(concertDataArr)
        }
    }, [concertData, austinScraper])

    let totalConcerts;

    if (totals.length > 0) {
        totalConcerts = totals.reduce((total, amount) => total + amount)
    }

    return (
        <div>
            <h3>
                SCRAPER: ✅
            </h3>
            <div className="indent">
                Scrape Index: {scrapeIndex - 1}
            </div>
            <AustinDbUpdater austinScraper={austinScraper} setTotals={setTotals} totalConcerts={totalConcerts} />
        </div>

    )
}

export default AustinScraper;
