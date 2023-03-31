import { useState, useEffect } from "react"
import { useLazyQuery, useQuery } from '@apollo/client'
import { AUSTIN_CONCERT_SCRAPER } from "@/utils/queries"
import { getTodaysDate } from '../utils/helpers';
import Header from "@/components/Header"
import Switch from 'react-switch'
import styles from '@/styles/Control.module.css'
import AustinScraper from "@/components/Scrapers/AustinScraper";

const AustinScrapeByDate = () => {
    const [controlSwitch, setControlSwitch] = useState(false);

    const handleControlSwitch = () => {
        console.log('SWITCHED');
        controlSwitch ? setControlSwitch(false) : setControlSwitch(true)
        console.log(controlSwitch);
    }

    //get today's date with imported helper function
    var today = getTodaysDate();
    console.log("TODAY: " + today);
    //set initial state using today's date
    const [date, setDate] = useState(today);

    const [scraperDate, setScraperDate] = useState(today);

    // useEffect(() => {
    //     //  delcare empty array for dates
    //     const dateArr = [];
    //     //push todays date into dateArr
    //     dateArr.push(today);
    //     //function to get the next day based on the date passed in to it
    //     const nextDay = (date) => {
    //         const next = new Date(date);
    //         next.setDate(next.getDate() + 1);
    //         const theNextDay = next.toDateString();
    //         return theNextDay;
    //     }
    //     //save date to another variable for for loop
    //     let arrayDate = today;
    //     //for loop that continously gets upcoming dates and pushes them to array
    //     for (let i = 0; i < 89; i++) {
    //         let nextDate = nextDay(arrayDate);
    //         dateArr.push(nextDate);
    //         arrayDate = nextDate;
    //     }

    //     let index = 0;
    //     const delay = (1000 * 20)

    //     let interval = setInterval(function () {
    //         index += 1;
    //         if (index >= 90) {
    //             return () => clearInterval(interval);
    //         }
    //         console.log('interval has run: ' + index);
    //         console.log('DATE TO BE SCRAPED: ' + dateArr[index])
    //         setScraperDate(dateArr[index]);
    //     }, delay);


    // }, [today])

    // const { data: concertData } = useQuery(AUSTIN_CONCERT_SCRAPER, {
    //     variables: { date: today }
    //     // variables: { date: scraperDate }
    // })

    // const [runScraper, { loading, error, data: concertData }] = useLazyQuery(AUSTIN_CONCERT_SCRAPER)

    // const runScraper = (date) => {
    //     console.log('SCRAAAAAPPPPEEEER')
    //     console.log(date)
    // }
    // controlSwitch && 
    //     runScraper({ variables: { date: today }});

    // if (loading) {
    //     console.log(loading);
    // }

    // if (error) {
    //     console.log(error);
    // }

    // if (concertData) {
    //     console.log(concertData.austinConcertScraper.length / 2 + ' days of concerts have been scraped.');
    //     console.log(concertData);
    // };
    return (
        <div>
            <Header />
            <main id={styles.main}>
                <div className={styles.container}>
                    <div className={styles.date}>{date}</div>
                    <Switch
                        onChange={handleControlSwitch}
                        checked={controlSwitch}
                        offColor={'#525050'}
                        onColor={'#525050'}
                        offHandleColor={'#383737'}
                        onHandleColor={'#383737'}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow={'#eee3d0'}
                        activeBoxShadow={'#eee3d0'}
                    />
                    {controlSwitch &&
                        // <button className={styles.scrapeButton} onClick={() => runScraper({ variables: { date: today } })}>SCRAPE</button>
                        <AustinScraper />
                    }

                </div>
            </main>
        </div>
    )
}

export default AustinScrapeByDate;