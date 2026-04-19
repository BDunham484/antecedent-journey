const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Flamingo Cantina';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Flamingo Cantina runs WordPress with The Events Calendar (TEC) plugin.
// The calendar list page is fully server-side rendered — axios + cheerio works,
// no browser needed.
//
// TEC embeds a single <script type="application/ld+json"> block near the top of
// the events section containing a JSON array of all upcoming events. Each entry
// includes: name, startDate (full ISO 8601 with timezone offset), eventStatus,
// offers.price, and url. This is more reliable than DOM scraping because it
// survives TEC theme/markup changes.
//
// startDate is passed directly to buildConcertObj — makeBuildConcertObj handles
// ISO 8601 strings natively.
//
// Price arrives as a plain string (e.g. "10", "10 – 12", "65 – 80"). Ranges are
// passed through as-is; the en-dash is part of TEC's output format.
//
// Events with eventStatus "https://schema.org/EventCancelled" are skipped.

const getFlamingoCantinaData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Flamingo Cantina');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://flamingocantina.com/calendar/list/');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Flamingo Cantina] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    let rawJson;
    try {
        const jsonLdText = $('script[type="application/ld+json"]').first().html();
        rawJson = JSON.parse(jsonLdText);
    } catch (e) {
        console.error('❌❌❌❌ [Flamingo Cantina] JSON-LD parse failed:', e.message);
        return [];
    }

    if (!Array.isArray(rawJson)) {
        console.error('❌❌❌❌ [Flamingo Cantina] unexpected JSON-LD shape (not an array)');
        return [];
    }

    for (const event of rawJson) {
        if (event?.eventStatus === 'https://schema.org/EventCancelled') continue;

        const artists = event?.name || null;
        const dateTime = event?.startDate || null;
        const ticketLink = event?.url || null;
        const rawPrice = event?.offers?.price;
        const price = rawPrice != null && rawPrice !== '' ? String(rawPrice) : null;

        if (!artists || !dateTime) continue;

        events.push(buildConcertObj(artists, dateTime, price, ticketLink));
    }

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Flamingo Cantina: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getFlamingoCantinaData };
