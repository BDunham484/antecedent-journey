const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Germania Insurance Amphitheater';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Germania Amp's /events page is a custom CMS (Craft CMS based on the URL patterns)
// that renders fully server-side — axios + cheerio works, no browser needed.
//
// The page has two sections:
//   1. A hero for the current featured show (one event, detailed ticket options)
//   2. An "Upcoming Events" grid (.upcoming-shows) — this is what we scrape
//
// Each event card is a .card.events element wrapping an <a> that links to the
// venue's own event detail page. Ad slots share the same .card.events class but
// also have .add — these are filtered out with :not(.add).
//
// Date is spread across three nodes inside .media-left:
//   <span>01</span>May<br><em>2026</em>
// We read the element's full text, collapse whitespace, and extract
// day/month/year with a regex, then assemble "May 01, 2026" for buildConcertObj.
//
// Price is not present in the listing — passed as null.
// Ticket links go to the venue's own per-event pages (e.g. /events/kid-cudi),
// which redirect to Ticketmaster for purchase.

const getGermaniaAmpData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Germania Insurance Amphitheater');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('http://germaniaamp.com/events');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Germania Insurance Amphitheater] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('.upcoming-shows .card.events:not(.add)').each((_, el) => {
        const $el = $(el);

        const title = $el.find('.media-content h2.title').text().trim();
        if (!title) return;

        const ticketLink = $el.find('> a').attr('href') || null;

        const rawDateText = $el.find('.media-left').text().replace(/\s+/g, ' ').trim();
        const dateMatch = rawDateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
        if (!dateMatch) return;

        const [, day, month, year] = dateMatch;
        const dateStr = `${month} ${day}, ${year}`;

        events.push(buildConcertObj(title, dateStr, null, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Germania Insurance Amphitheater: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getGermaniaAmpData };
