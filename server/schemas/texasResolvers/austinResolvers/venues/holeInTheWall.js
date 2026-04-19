const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Hole in the Wall';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Hole in the Wall's /shows page (Squarespace) embeds a Prekindle calendar widget
// inside an iframe. The iframe URL is fully server-side rendered by Prekindle and
// contains a <script type="application/ld+json"> block with all event data — the
// same JSON-LD array pattern used by Flamingo Cantina and Güero's.
//
// The iframe URL to scrape:
//   https://www.prekindle.com/organizer-grid-widget-main/id/531433528849134007/
//
// Prekindle quirks vs. TEC (WordPress) JSON-LD:
//   - eventStatus uses http:// (not https://) — e.g. "http://schema.org/EventCancelled"
//   - startDate is date-only ("2026-04-18"), no time component
//   - offers.price is a decimal string ("10.00")
//   - url points to prekindle.com/event/... (the ticket purchase page)

const PREKINDLE_URL = 'https://www.prekindle.com/organizer-grid-widget-main/id/531433528849134007/';

const getHoleInTheWallData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Hole in the Wall');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get(PREKINDLE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Hole in the Wall] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    let rawJson;
    try {
        const jsonLdText = $('script[type="application/ld+json"]').first().html();
        rawJson = JSON.parse(jsonLdText);
    } catch (e) {
        console.error('❌❌❌❌ [Hole in the Wall] JSON-LD parse failed:', e.message);
        return [];
    }

    if (!Array.isArray(rawJson)) {
        console.error('❌❌❌❌ [Hole in the Wall] unexpected JSON-LD shape (not an array)');
        return [];
    }

    for (const event of rawJson) {
        // Prekindle uses http:// (not https://) in eventStatus URIs
        if (event?.eventStatus === 'http://schema.org/EventCancelled') continue;

        const artists = event?.name || null;
        const dateTime = event?.startDate || null;
        const ticketLink = event?.url || null;
        const rawPrice = event?.offers?.price;
        const price = rawPrice != null && rawPrice !== '' ? String(rawPrice) : null;

        if (!artists || !dateTime) continue;

        events.push(buildConcertObj(artists, dateTime, price, ticketLink));
    }

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Hole in the Wall: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getHoleInTheWallData };
