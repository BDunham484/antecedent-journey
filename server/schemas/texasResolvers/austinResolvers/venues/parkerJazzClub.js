const axios = require('axios');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Parker Jazz Club';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Parker Jazz Club uses Turntable Tickets, a venue-ticketing SaaS platform. The public-facing
// page is server-side rendered (Vue SSR), but it also exposes a REST API at /api/performance/
// that the frontend uses for infinite-scroll pagination. We call that API directly — no Cheerio
// or Playwright needed, no HTML parsing.
//
// The API accepts start_date / end_date (YYYY-MM-DD) to filter by date window, and page_size
// to return all results in one request. We use a 30-day window, matching what the site itself
// fetches when the user scrolls down the show list.
//
// The API returns datetime in UTC ISO 8601. The venue is in Austin, TX (America/Chicago), so
// toChicagoDateTime() uses Intl.DateTimeFormat to convert each UTC datetime to a local date
// and display time string before passing it to buildConcertObj.
//
// Ticket links use the pattern /shows/[show_id]/?date=[local-date]. The local date comes from
// the same Intl conversion so it matches what the venue site expects.
//
// show.price_per_person is an array of price strings (e.g. ["20.00","35.00"]). We format the
// minimum as a starting price or show a range if multiple tiers exist.
//
// Sold-out status comes from perf.sold (boolean). buildConcertObj only reads status from the
// artists string, so we set concert.status directly after building the object.

const toChicagoDateTime = (isoUtc) => {
    const d = new Date(isoUtc);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).formatToParts(d).reduce((acc, p) => {
        acc[p.type] = p.value;
        return acc;
    }, {});
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    const time = `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
    return { date, dateTimeStr: `${date} ${time}` };
};

const formatPrice = (priceArr) => {
    if (!priceArr || priceArr.length === 0) return null;
    const nums = priceArr.map(Number).filter(n => !isNaN(n));
    if (nums.length === 0) return null;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
};

const getParkerJazzClubData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Parker Jazz Club');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    let results;
    try {
        const response = await axios.get('https://parker-jazz.turntabletickets.com/api/performance/', {
            params: {
                pagination: 'true',
                start_date: startDate,
                end_date: endDate,
                page_size: 100,
            },
        });
        results = response.data.results || [];
    } catch (e) {
        console.error('❌❌❌❌ Parker Jazz Club fetch failed:', e.message);
        return [];
    }

    const events = [];
    for (const perf of results) {
        const title = perf.show?.name;
        if (!title) continue;

        const { date, dateTimeStr } = toChicagoDateTime(perf.datetime);
        const price = formatPrice(perf.show?.price_per_person);
        const ticketLink = `https://parker-jazz.turntabletickets.com/shows/${perf.show_id}/?date=${date}`;

        const concert = buildConcertObj(title, dateTimeStr, price, ticketLink);
        if (perf.sold) concert.status = 'sold out';
        events.push(concert);
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Parker Jazz Club: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getParkerJazzClubData };
