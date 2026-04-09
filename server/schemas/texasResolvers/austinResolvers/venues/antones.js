const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = "Antone's";

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Antone's runs WordPress with a TixManager ticketing plugin. The events page is
// server-side rendered, so axios + cheerio is sufficient — no browser needed.
//
// Each event lives inside a <div id="tw-event-dialog-{id}"> element. Within that div:
//   - .tw-name a         → artist/event title
//   - .tw-event-date     → date string (e.g. "Friday, April 10, 2026")
//   - .tw-event-time-complete → time string (e.g. "8:00 PM")
//   - .tw-buy-tix-btn    → ticket purchase link
//
// Date and time are scraped separately and concatenated into a single dateTime string.
// Price is not available on the listing page, so it's passed as null.
// Sold-out status note: TixManager sometimes uses an en-dash (–) in the sold-out
// button text rather than a regular hyphen, which can trip up naive text matching.

const getAntonesData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Antone's");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://antonesnightclub.com/calendar/');
        html = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [Antone's] fetch failed:", e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('div[id^="tw-event-dialog-"]').each((_, el) => {
        const $el = $(el);

        const title = $el.find('.tw-name a').first().text().trim();
        if (!title) return;

        const dateStr = $el.find('.tw-event-date').first().text().trim();
        const timeStr = $el.find('.tw-event-time-complete').first().text().trim();
        const dateTime = dateStr && timeStr ? `${dateStr} ${timeStr}` : dateStr || null;

        const ticketLink = $el.find('.tw-buy-tix-btn').first().attr('href') || null;

        events.push(buildConcertObj(title, dateTime, null, ticketLink));
    });

    // console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Antone's: ");
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getAntonesData };
