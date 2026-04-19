const axios = require('axios');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Mohawk';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Mohawk uses Prekindle as their ticketing platform, which exposes a public JSONP API:
//   https://www.prekindle.com/api/events/organizer/531433527670566235?callback=widgetCallback
//
// The homepage embeds a Prekindle widget that calls this endpoint at runtime, but the data
// itself is available without a browser — axios can fetch it directly. We choose axios over
// Playwright because the API is public and unauthenticated.
//
// The response is JSONP, not plain JSON: it wraps the payload in `widgetCallback({...})`.
// We strip the function call wrapper before parsing.
//
// Each event in the `events` array contains:
//   - title:           headliner name (used as the artist string)
//   - date:            "M/D/YYYY" format
//   - time:            "H:MMam/pm" format — combined with date for dateTime
//   - price:           decimal string ("15.00"); free events show "0.00"
//   - availability:    "AVAILABLE" or "SOLD_OUT"
//   - thirdPartyLink:  Etix ticket URL (preferred when present)
//   - dtfLinks:        array of Prekindle internal ticket URLs (fallback)
//   - isThirdPartySale: boolean indicating which link to use
//
// The API's `venue` field ("Mohawk Indoor" / "Mohawk Outdoor") indicates which stage, but
// we use the constant "Mohawk" for all events since both stages belong to the same venue.

const PREKINDLE_URL = 'https://www.prekindle.com/api/events/organizer/531433527670566235?callback=widgetCallback';

const getMohawkData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Mohawk');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let raw;
    try {
        const response = await axios.get(PREKINDLE_URL);
        raw = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Mohawk fetch failed:', e.message);
        return [];
    }

    let parsed;
    try {
        const jsonStr = raw.replace(/^widgetCallback\(/, '').replace(/\);?\s*$/, '');
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        console.error('❌❌❌❌ Mohawk JSON parse failed:', e.message);
        return [];
    }

    const rawEvents = parsed.events ?? [];
    const events = [];

    for (const event of rawEvents) {
        const artists = event.title || null;
        if (!artists) continue;

        const dateTime = (event.date && event.time) ? `${event.date} ${event.time}` : null;

        const priceNum = parseFloat(event.price);
        const price = !isNaN(priceNum) && priceNum > 0 ? `$${priceNum.toFixed(2)}` : null;

        const ticketLink = event.thirdPartyLink || (event.dtfLinks && event.dtfLinks[0]) || null;

        events.push(buildConcertObj(artists, dateTime, price, ticketLink));
    }

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Mohawk: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getMohawkData };
