const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Chess Club';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Chess Club's site runs WordPress with the "recspec-events" plugin for event listings.
// The page is server-side rendered, so axios + cheerio works — no browser needed.
//
// Events are listed as <li class="recspec-events--event"> elements. Within each:
//   - h2                                         → event/artist title
//   - time h3                                    → date + time as a single string
//                                                  (e.g. "Tuesday April 7, 2026 @ 8:00 pm")
//   - .information a [href]                      → ticket or info link
//   - .recspec-events--event-content strong/b    → price, identified by starting with "$"
//                                                  or matching "ALL AGES"
//
// The date string includes a day-of-week prefix and uses "@" to separate date from time.
// parseDateTimeText() strips the day-of-week and reformats it to "Month DD, YYYY HH:MM am/pm".
//
// The site paginates — older shows appear on subsequent pages linked via .nav-next a.
// We loop through all pages until there's no next-page link, collecting events from each.

// Parses "Tuesday April 7, 2026 @ 8:00 pm" → "April 7, 2026 8:00 pm"
const parseDateTimeText = (rawText) => {
    if (!rawText) return null;
    const stripped = rawText
        .replace(/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+/i, '')
        .trim();
    // "April 7, 2026 @ 8:00 pm"
    const atIndex = stripped.indexOf('@');
    if (atIndex === -1) return stripped;
    const datePart = stripped.slice(0, atIndex).trim();
    const timePart = stripped.slice(atIndex + 1).trim();
    return `${datePart} ${timePart}`;
};

const scrapeEventsFromPage = ($, events) => {
    $('li.recspec-events--event').each((_, el) => {
        const $el = $(el);

        const title = $el.find('h2').first().text().trim();
        if (!title) return;

        const rawDateTime = $el.find('time h3').first().text().trim();
        const dateTime = parseDateTimeText(rawDateTime);

        const ticketLink = $el.find('.information a').attr('href') || null;

        let price = null;
        $el.find('.recspec-events--event-content strong, .recspec-events--event-content b').each((_, priceEl) => {
            const text = $(priceEl).text().trim();
            if (/^\$|ALL\s*AGES/i.test(text)) {
                price = text;
                return false;
            }
        });

        events.push(buildConcertObj(title, dateTime, price, ticketLink));
    });
};

const getChessClubData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Chess Club');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];
    let nextUrl = 'https://chessclubaustin.com';

    while (nextUrl) {
        let html;
        try {
            const response = await axios.get(nextUrl);
            html = response.data;
        } catch (e) {
            console.error('❌❌❌❌ [Chess Club] fetch failed:', e.message);
            break;
        }

        const $ = cheerio.load(html);
        scrapeEventsFromPage($, events);
        nextUrl = $('.nav-next a').attr('href') || null;
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Chess Club: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getChessClubData };
