import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_URL_ARRAY, AUSTIN_TX_CONCERT_SCRAPER } from "../../../utils/queries";
import { getTodaysDate } from "../../../utils/helpers";
import AustinDbUpdater from '../../DB_Updaters/AustinDbUpdater';
// import IpProxyRotator from '../../IpProxyRotator';
// import { createProxyObject } from "../../../utils/helpers";

const AustinScraper = ({ setControlSwitch, proxies: proxiesArr }) => {
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
    const [proxies, setProxies] = useState(proxiesArr);
    const [proxyObject, setProxyObject] = useState();
    const [isProxyObject, setIsProxyObject] = useState(false);
    // const [urlData, setUrlData] = useState();
    // const [singleUrlState, setSingleUrlState] = useState([]);
    // changelog-end

    useEffect(() => {
        let randomNumber = Math.floor((Math.random() * proxies.length) - 1);

        setProxyObject(proxies[randomNumber]);
        console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀');

        if (proxyObject && Object.keys(proxyObject).length > 0) {
            setIsProxyObject(true);
        }
    }, [isFinished_Concert, isFinished_URL]);

    console.log('🥷🥷🥷🥷 proxyObject: ', proxyObject);
    console.log('🥷🥷🥷🥷 isProxyObject: ', isProxyObject);
    const { error: urlErr, data: urlResults } = useQuery(GET_URL_ARRAY, {
        variables: { date: scraperDate, proxy: proxyObject },
        skip: !isFinished_Concert || !(proxyObject && Object.keys(proxyObject).length > 0)
    });


    // useEffect(() => {
    //     const results = urlResults?.getUrlArray || [];

    //     setUrlData(results);
    // }, [urlResults]);
    let urlData = urlResults?.getUrlArray || [];


    // changelog-start
    // useEffect(() => {
    //     let urlData = urlResults?.getUrlArray || [];

    //     const checkUrlDates = () => {
    //         if (urlScrapeIndex === 90) {
    //             setIsFinished_URL(true);
    //             setScraperDate(today);
    //             // setControlSwitch(false);
    //             return;
    //         }
    //     }

    //     if (urlResults && isFinished_Concert) {
    //         setTestState(prevState => {
    //             return urlData
    //         });
    //         console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 testState: ', testState);
    //         checkUrlDates();
    //     }

    // }, []);
    // changelog-emd

    // const addressData = ['https://www.austinchronicle.com/events/music/2023-11-24/', 'https://www.austinchronicle.com/events/music/2023-11-24/page-2/', 'https://www.austinchronicle.com/events/music/2023-11-24/page-3/']

    const { error: concertErr, data: concertResults } = useQuery(AUSTIN_TX_CONCERT_SCRAPER, {
        // variables: { urlData: addressData, date: 'Fri Nov 24 23', proxy: proxyObject},
        variables: { urlData: testState, date: scraperDate, proxy: proxyObject },
        skip: !isFinished_URL || !(proxyObject && Object.keys(proxyObject).length > 0)
    });

    if (urlErr || concertErr) {
        console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
        urlErr ? console.log('❌❌❌❌ urlErr: ', urlErr) : console.log('❌❌❌❌ concertErr: ', concertErr);
        setControlSwitch(false);
        setTimeout(() => {
            setControlSwitch(true);
        }, 3000);
    }
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
        // changelog-start
        const checkUrlDates = () => {
            if (urlScrapeIndex === 90) {
                setIsFinished_URL(true);
                setScraperDate(today);
                // setControlSwitch(false);
                return;
            }
            // changelog-end

            console.log('🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃');
            console.log('🎃🎃🎃🎃 urlResults: ', urlResults);
            // changelog-start
            // const returnedUrlDate = urlResults?.getUrlArray[0].split('/')[5];
            const returnedUrlDate = urlResults?.getUrlArray[0].split('/')[8];
            // changelog-end
            const urlDate = new Date(`${returnedUrlDate}T00:00`).toDateString();
            console.log('🎃🎃🎃🎃 returnedUrlDate: ', returnedUrlDate);
            console.log('🎃🎃🎃🎃 urlDate: ', urlDate);
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

        // changelog-start
        // let urlData = urlResults?.getUrlArray || [];
        // changelog-end

        // changelog-start
        if (urlResults && isFinished_Concert) {
            setTestState(prevState => {
                return urlData
            });
            console.log('🧑‍🚀🧑‍🚀🧑‍🚀🧑‍🚀 testState: ', testState);
            checkUrlDates();
        }
        // changelog-end
    }, [urlResults, dateArr, scraperDate, urlScrapeIndex, today, isFinished_Concert, testState, urlData]);

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
            if (concertResults?.austinTxConcertScraper[0]?.length > 0) {
                console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ returnedConcertDate: ', concertResults?.austinTxConcertScraper[0][0].date);
            }
            console.log('🧛‍♂️🧛‍♂️🧛‍♂️🧛‍♂️ scraperDate: ', scraperDate)

            setIsFinished_Concert(true);
            setIsFinished_URL(false)
            if (!datesMatched) {
                console.log('❌❌❌❌❌❌❌❌❌❌❌❌❌❌');
                console.log('❌❌❌❌ !DATESMATCHED');
                setIsFinished_Concert(false);
                setIsFinished_URL(true);
                setControlSwitch(false);
                // setTimeout(() => {
                //     setControlSwitch(true);
                // }, 3000);
            }

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
            console.log('🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️🗓️');
            console.log('🗓️🗓️🗓️🗓️ concertResults?.austinTxConcertScraper: ', concertResults?.austinTxConcertScraper);
            // const dates = concertResults?.austinTxConcertScraper.map(x => x[0].date ? x[0].date : null);
            const dates = concertResults?.austinTxConcertScraper.map(x => {
                console.log('🗓️🗓️🗓️🗓️ x: ', x);
                if (!x) {
                    return '';
                }
                return x[0].date;
            });
            console.log('🗓️🗓️🗓️🗓️ dates: ', dates);
            console.log('🗓️🗓️🗓️🗓️ scraperDate: ', scraperDate);
            return dates.includes(scraperDate) ? true : false;
        }

        if (isFinished_URL && concertResults) {
            checkConcertDates();
        }
    }, [concertResults, isFinished_URL, scrapeIndex, setControlSwitch, dateArr, scraperDate]);

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
        <>
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
            {(urlErr) &&
                <div>
                    <h2>{urlErr}</h2>
                    {urlErr &&
                        urlErr.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                </div>
            }
            {(concertErr) &&
                <div>
                    <h2>{concertErr}</h2>
                    {concertErr &&
                        concertErr.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                </div>
            }

        </>


    )
}

export default AustinScraper;
