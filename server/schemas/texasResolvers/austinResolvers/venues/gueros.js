const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = "Güero's Taco Bar";
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Güero's runs WordPress (Divi theme) with The Events Calendar (TEC) plugin.
// Events are embedded on the homepage via a TEC shortcode — the homepage is the
// correct URL to scrape, not a dedicated /events/ path.
//
// TEC embeds a <script type="application/ld+json"> block containing a JSON array
// of upcoming events. Each entry includes: name, startDate (ISO 8601 with -05:00
// offset), eventStatus, and url. No offers.price is present — price is always null.
//
// This is the same pattern as Flamingo Cantina. axios + cheerio works; no browser.
//
// startDate is passed directly to buildConcertObj — makeBuildConcertObj handles
// ISO 8601 strings natively.

const getGuerosData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Güero's Taco Bar");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://gueros.com/');
        html = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [Güero's Taco Bar] fetch failed:", e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    let rawJson;
    try {
        const jsonLdText = $('script[type="application/ld+json"]').first().html();
        rawJson = JSON.parse(jsonLdText);
    } catch (e) {
        console.error("❌❌❌❌ [Güero's Taco Bar] JSON-LD parse failed:", e.message);
        return [];
    }

    if (!Array.isArray(rawJson)) {
        console.error("❌❌❌❌ [Güero's Taco Bar] unexpected JSON-LD shape (not an array)");
        return [];
    }

    for (const event of rawJson) {
        if (event?.eventStatus === 'https://schema.org/EventCancelled') continue;

        const artists = event?.name || null;
        const dateTime = event?.startDate || null;
        const ticketLink = event?.url || null;

        if (!artists || !dateTime) continue;

        events.push(buildConcertObj(artists, dateTime, null, ticketLink));
    }

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Güero's Taco Bar: ");
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getGuerosData };
