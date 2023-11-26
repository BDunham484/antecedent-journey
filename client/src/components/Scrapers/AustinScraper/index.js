import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { AUSTIN_CONCERT_SCRAPER, GET_URL_ARRAY, AUSTIN_TX_CONCERT_SCRAPER } from "../../../utils/queries";
import { getTodaysDate } from "../../../utils/helpers";
import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';

const AustinScraper = ({ setControlSwitch }) => {
    //get today's date with imported helper function
    var today = getTodaysDate();
    const [scrapeIndex, setScrapeIndex] = useState(1);
    const [urlScrapeIndex, setUrlScrapeIndex] = useState(1);
    const [totals, setTotals] = useState([]);
    const [scraperDate, setScraperDate] = useState(today);
    // const [getUrlsDate, setGetUrlsDate] = useState(today);
    const [austinScraper, setAustinScraper] = useState([[]]);
    const [isFinished_URL, setIsFinished_URL] = useState(false);
    const [isFinished_Concert, setIsFinished_Concert] = useState(true);
    // changelog-start
    const [testState, setTestState] = useState([]);
    const [singleUrlState, setSingleUrlState] = useState([]);
    // changelog-end

    // const { loading, data: concertData } = useQuery(AUSTIN_CONCERT_SCRAPER, {
    //     variables: { date: scraperDate }
    // })

    const { error: urlErr, data: urlResults } = useQuery(GET_URL_ARRAY, {
        variables: { date: scraperDate },
        skip: !isFinished_Concert
    });

    let urlData = urlResults?.getUrlArray || [];

    const addressData = ['https://www.austinchronicle.com/events/music/2023-11-24/', 'https://www.austinchronicle.com/events/music/2023-11-24/page-2/', 'https://www.austinchronicle.com/events/music/2023-11-24/page-3/']

    const { error: concertErr, data: concertResults } = useQuery(AUSTIN_TX_CONCERT_SCRAPER, {
        // variables: { urlData: addressData, date: 'Fri Nov 24 23'},
        variables: { urlData: testState, date: scraperDate },
        skip: !isFinished_URL
    });

    if (urlErr || concertErr) {
        console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        urlErr ? console.log('❌❌❌❌ urlErr: ', urlErr) : console.log('❌❌❌❌ concertErr: ', concertErr);
        
    }
    // empty array for dates to populate.  Iterated over and passed to scraper one index at a time. Next index doesn't fire until results from the previous are returned
    let dateArr = useMemo(() => [], []);

    console.log('🗓️🗓️🗓️🗓️ dateArr: ', dateArr[37]);

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
        const checkUrlDates = () => {
            if (urlScrapeIndex === 90) {
                setIsFinished_URL(true);
                setScraperDate(today);
                // setControlSwitch(false);
                return;
            }

            console.log('🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃');
            console.log('🎃🎃🎃🎃 urlResults: ', urlResults);
            const returnedUrlDate = urlResults?.getUrlArray[0].split('/')[5];
            const urlDate = new Date(`${returnedUrlDate}T00:00`).toDateString();
            console.log('🎃🎃🎃🎃 returnedUrlDate: ', urlDate);
            console.log('🎃🎃🎃🎃 scraperDate: ', scraperDate);
            setIsFinished_URL(true);
            setIsFinished_Concert(false);
            if (urlDate === scraperDate) {
                setUrlScrapeIndex(prevIndex => prevIndex + 1);
                console.log('🎃🎃🎃🎃 urlScrapeIndex: ', urlScrapeIndex);
                // console.log('🎃🎃🎃🎃 dateArr[urlScrapeIndex]: ', dateArr[urlScrapeIndex]);
                // setScraperDate(prevDate => {
                //     return dateArr[urlScrapeIndex];
                // });
            }
        }

        if (urlResults && isFinished_Concert) {
            setTestState(prevState => {
                return urlData
            });
            console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 testState: ', testState);
            checkUrlDates();
        }
    }, [urlResults, dateArr, scraperDate, urlScrapeIndex, today, isFinished_Concert, urlData, testState]);

    useEffect(() => {
        const checkConcertDates = () => {
            if (scrapeIndex === 90) {
                setControlSwitch(false);
                return;
            }

            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️');
            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ concertResults: ', concertResults);
            const datesMatched = compareDates(concertResults, scraperDate);
            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ datesMatched: ', datesMatched);
            if (concertResults?.austinTxConcertScraper[0].length > 0) {
            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ returnedConcertDate: ', concertResults?.austinTxConcertScraper[0][0].date);
            }
            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ scraperDate: ', scraperDate)
            
            setIsFinished_Concert(true);
            setIsFinished_URL(false)
            if (datesMatched) {
                setScrapeIndex(prevIndex => prevIndex + 1);
                console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ scrapeIndex: ', scrapeIndex);
                console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ dateArr[scrapeIndex]: ', dateArr[scrapeIndex]);
                setScraperDate(prevDate => {
                    return dateArr[scrapeIndex];
                });
            }
        };

        const compareDates = (concertResults, scraperDate) => {
            // const dates = concertResults?.austinTxConcertScraper.map(x => x[0].date ? x[0].date : null);
            const dates = concertResults?.austinTxConcertScraper.map(x => {
                if (!x) {
                    return '';
                }
                return x[0].date;
            });
            return dates.includes(scraperDate) ? true : false;
        }

        if (isFinished_URL && concertResults) {
            checkConcertDates();
        }
    }, [concertResults, isFinished_URL, scrapeIndex, setControlSwitch, dateArr, scraperDate, urlScrapeIndex]);

    // useEffect(() => {
    //     const checkDates = () => {
    //         if (scrapeIndex === 90)  {
    //             setControlSwitch(false);
    //             return;
    //         }
    //         console.log('👻👻👻👻👻👻👻👻👻👻👻👻👻👻')
    //         console.log('🥩🥩🥩🥩 concertData: ', concertData);
    //         const returnedDate = concertData?.austinConcertScraper[0][0]?.date || '';

    //         console.log('🥩🥩🥩🥩 returnedDate: ', returnedDate);
    //         console.log('🥩🥩🥩🥩 scraperDate: ', scraperDate);

    //         if (returnedDate === scraperDate) {
    //             setScrapeIndex(prevIndex => prevIndex + 1);

    //             console.log('🍖🍖🍖🍖 scrapeIndex: ', scrapeIndex);
    //             console.log('🍖🍖🍖🍖 dateArr[scrapeIndex]: ', dateArr[scrapeIndex]);

    //             setScraperDate(prevDate => {
    //                 return dateArr[scrapeIndex];
    //             });
    //             console.log('🍖🍖🍖🍖 scraperDate: ', scraperDate);
    //         }
    //     };

    //     if (concertData) {
    //         checkDates();
    //     }

    //     console.log('✅✅✅✅ scraperDate: ', scraperDate);
    // }, [today, setControlSwitch, scraperDate, concertData, loading, dateArr]);

    // useEffect(() => {
    //     if (concertData) {
    //         console.log('RETURNED SCRAPER DATA: ', concertData);
    //         const concertDataArr = concertData.austinConcertScraper
    //         setAustinScraper(concertDataArr)
    //     }
    // }, [concertData, austinScraper])
    // THIS ONE BELOW IS THE NEWEST
    useEffect(() => {
        if (concertResults) {
            console.log('👻👻👻👻👻👻👻👻👻👻👻👻👻👻');
            console.log('👻👻👻👻 concertResults: ', concertResults);
            const concertDataArr = concertResults.austinTxConcertScraper
            setAustinScraper(concertDataArr);
        }
    }, [concertResults])

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
                <p>URL Index: {urlScrapeIndex - 1}</p>
                <p>Concert Index: {scrapeIndex - 1}</p>
            </div>
            <AustinDbUpdater austinScraper={austinScraper} setTotals={setTotals} totalConcerts={totalConcerts} />
        </div>

    )
}

export default AustinScraper;
