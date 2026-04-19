const axios = require('axios');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Paramount Theatre';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// The Paramount Theatre uses Tessitura TNEW (tessituranetwork.com) as its ticketing platform,
// hosted at tickets.austintheatre.org. The public events page is fully JS-rendered by the TNEW
// Angular app, but the underlying data comes from a documented REST API that works without
// authentication or browser context.
//
// We POST to /api/products/productionseasons with a date range. The response is a JSON array of
// "production seasons" — each represents a show title that may have one or more individual
// performances on different dates (e.g. David Sedaris appearing two nights). We flatten these
// into one concert entry per performance, since each performance has its own ticket URL and date.
//
// Price is not included in the productionseasons API response. We pass an empty string.
//
// The displayDate + displayTime fields ("Monday, April 20, 2026" + "8:00PM") are concatenated
// with " at " to produce a string that buildConcertObj's date parser handles cleanly.

const API_URL = 'https://tickets.austintheatre.org/api/products/productionseasons';

const getParamountTheatreData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Paramount Theatre');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const startDate = new Date().toISOString().replace(/\.\d{3}Z$/, '');
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    const endDate = end.toISOString().replace(/\.\d{3}Z$/, '');

    let productions;
    try {
        const response = await axios.post(
            API_URL,
            { startDate, endDate, keywords: '' },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': 'https://tickets.austintheatre.org/events',
                    'Origin': 'https://tickets.austintheatre.org',
                },
            }
        );
        productions = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Paramount Theatre fetch failed:', e.message);
        return [];
    }

    const events = [];

    for (const production of productions) {
        if (!production.isVisible) continue;

        for (const perf of production.performances) {
            if (!perf.isPerformanceVisible) continue;

            const artists = production.productionTitle;
            const dateTime = perf.displayTime
                ? `${perf.displayDate} at ${perf.displayTime}`
                : perf.displayDate;
            const price = '';
            const ticketLink = perf.actionUrl;

            const concert = buildConcertObj(artists, dateTime, price, ticketLink);
            events.push(concert);
        }
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Paramount Theatre: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getParamountTheatreData };
