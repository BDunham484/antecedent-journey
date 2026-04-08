const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Chess Club';

const buildConcertObj = makeBuildConcertObj(venue);

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
