import { useState, useEffect } from "react"
import { useQuery } from "@apollo/client"
import { AUSTIN_CONCERT_SCRAPER } from "../../../utils/queries"
import { getTodaysDate } from "../../../utils/helpers"
import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater'

const AustinScraper = ({ setControlSwitch }) => {
    //get today's date with imported helper function
    var today = getTodaysDate();
    //set initial state using today's date
    const [date, setDate] = useState(today);
    const [scrapeIndex, setScrapeIndex] = useState(0);
    const [arr, setArr] = useState([])

    const [scraperDate, setScraperDate] = useState(today);

    let totalConcerts

    if (arr.length > 0) {
        totalConcerts = arr.reduce((total, amount) => total + amount)
    }

    useEffect(() => {
        //  delcare empty array for dates
        const dateArr = [];
        //push todays date into dateArr
        dateArr.push(today);
        //function to get the next day based on the date passed in to it
        const nextDay = (date) => {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            const theNextDay = next.toDateString();
            return theNextDay;
        }
        //save date to another variable for for loop
        let arrayDate = today;
        //for loop that continously gets upcoming dates and pushes them to array
        for (let i = 0; i < 89; i++) {
            let nextDate = nextDay(arrayDate);
            dateArr.push(nextDate);
            arrayDate = nextDate;
        }

        let index = 0;
        const delay = (1000 * 20)

        let interval = setInterval(function () {
            index += 1;
            setScrapeIndex(index)
            if (index === 90) {
            // if (index >= 90) {
                setControlSwitch(false)
                clearInterval(interval);
            }

            console.log('INTERVAL RUN: ' + index);
            console.log('DATE TO BE SCRAPED: ' + dateArr[index])
            setScraperDate(dateArr[index]);
        }, delay);
    }, [today, setControlSwitch])

    const { data: concertData } = useQuery(AUSTIN_CONCERT_SCRAPER, {
        // variables: { date: today }
        variables: { date: scraperDate }
    })

    const [austinScraper, setAustinScraper] = useState([[]]);

    useEffect(() => {
        if (concertData) {
            console.log('SCRAPER RUN: ');
            console.log(concertData);
            const concertDataArr = concertData.austinConcertScraper
            setAustinScraper(concertDataArr)
        }
    }, [concertData, austinScraper])

    return (
        <div>
            <h3>
                SCRAPER: ✅
            </h3>
            <div className="indent">
                Scrape Index: {scrapeIndex}
            </div>
            <AustinDbUpdater today={today} date={date} austinScraper={austinScraper} setArr={setArr} totalConcerts={totalConcerts} />
        </div>

    )
}

export default AustinScraper;
