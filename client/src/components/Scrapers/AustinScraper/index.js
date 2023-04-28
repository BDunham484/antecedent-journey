import { useState, useEffect } from "react"
import { useQuery } from "@apollo/client"
import { AUSTIN_CONCERT_SCRAPER } from "../../../utils/queries"
import { getTodaysDate } from "../../../utils/helpers"
import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater'

const AustinScraper = () => {
    //get today's date with imported helper function
    var today = getTodaysDate();
    console.log("TODAY: " + today);
    //set initial state using today's date
    const [date, setDate] = useState(today);

    const [scraperDate, setScraperDate] = useState(today);

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
            if (index >= 90) {
                return () => clearInterval(interval);
            }
            console.log('interval has run: ' + index);
            console.log('DATE TO BE SCRAPED: ' + dateArr[index])
            setScraperDate(dateArr[index]);
        }, delay);


    }, [today])

    const { data: concertData } = useQuery(AUSTIN_CONCERT_SCRAPER, {
        // variables: { date: today }
        variables: { date: scraperDate }
    })

    if (concertData) {
        console.log(concertData.austinConcertScraper.length / 2 + ' days of concerts have been scraped.');
        console.log(concertData);
    };

    const [austinScraper, setAustinScraper] = useState([[]]);

    useEffect(() => {
        if (concertData) {
            const concertDataArr = concertData.austinConcertScraper
            setAustinScraper(concertDataArr)
        }

    }, [concertData, austinScraper])


    return (
        <div>
            {scraperDate &
                {scraperDate}
            }
            <div>
                Austin Scraper is running...
            </div>
            <AustinDbUpdater today={today} date={date} austinScraper={austinScraper} />
        </div>

    )
}

export default AustinScraper;
