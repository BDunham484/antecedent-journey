const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = '29th Street Ballroom';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// The 29th Street Ballroom site runs on Squarespace. Squarespace renders event lists
// server-side, so the full HTML is available in a normal axios GET — no browser needed.
//
// All event data is stored in a single JSON blob inside a data-current-context attribute
// on the <ul class="user-items-list-simple"> element. We parse that JSON and pull
// each event's title, button link, and description from the resulting userItems array.
//
// The date/time is not a structured field — it's embedded as free text inside the HTML
// description of each item. We load each description string with cheerio and search
// the <p> tags for anything that matches a "Month DD, YYYY" pattern using a regex.
// If a match is found, that becomes our dateTime string. Price is not listed on this
// page, so it's always passed as null.

const get29thStreetBallroomData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ 29th Street Ballroom');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.29thstreetballroom.com/upcoming');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ 29th Street Ballroom fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    const listEl = $('ul.user-items-list-simple[data-current-context]').first();
    const rawContext = listEl.attr('data-current-context');

    console.log('👁️👁️👁️👁️ rawContext found:', !!rawContext);

    let userItems = [];
    if (rawContext) {
        try {
            const parsed = JSON.parse(rawContext);
            userItems = parsed.userItems || [];
        } catch (e) {
            console.error('❌ Failed to parse data-current-context JSON', e.message);
        }
    }

    console.log('👁️👁️👁️👁️ userItems count:', userItems.length);

    // Date pattern: matches strings like "April 4, 2026" or "April 4 2026"
    const datePat = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i;

    const events = userItems.map(item => {
        const artists = item.title || null;
        const ticketLink = item.button?.buttonLink || null;

        // description is HTML — load it with cheerio and search <p> tags for a date
        let dateTime = null;
        if (item.description) {
            const $desc = cheerio.load(item.description);
            $desc('p').each((_, el) => {
                const text = $desc(el).text().trim();
                const match = text.match(datePat);
                if (match && !dateTime) {
                    dateTime = match[0];
                }
            });
        }

        return buildConcertObj(artists, dateTime, null, ticketLink);
    }).filter(e => e.artists);

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 29th Street Ballroom: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { get29thStreetBallroomData };
