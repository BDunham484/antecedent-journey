const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Hotel Vegas';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Hotel Vegas uses WordPress with the All-in-One Event Calendar plugin (ai1ec / Timely).
// The main calendar page server-side renders only the current date range. Additional pages
// are fetched via AJAX using a slug-based pagination URL:
//   https://texashotelvegas.com/all-events/action~agenda/page_offset~N/cat_ids~2351/request_format~html/
//
// cat_ids~2351 scopes results to Hotel Vegas events. request_format~html tells the server to
// return an HTML fragment using the same templates as the static render, so our selectors
// work identically across all pages.
//
// We use axios + cheerio because the event data is fully server-rendered — no browser needed.
// A User-Agent header is required; without it the server returns 403.
//
// Page 0 omits the page_offset segment; pages 1+ include page_offset~N. We loop until a page
// returns no div.ai1ec-event elements, up to MAX_PAGES as a safety ceiling.
//
// Each div.ai1ec-event carries a data-ticket-url attribute when an external ticketing platform
// is linked. When absent (free/no-cover shows), we fall back to the event detail URL from
// a.ai1ec-load-event.
//
// The div.ai1ec-event-time contains date and start time as "MMM D @ h:mm a – h:mm a" with no
// year. We strip the "@", dash, and end-time, then inject the current or next year by comparing
// the parsed month to today: if the month number is less than the current month, it belongs to
// next year. The resulting "MMM D YYYY h:mm am" string is clean enough for new Date() and for
// concertUtils' normalizeDate to produce a valid customId.

const BASE_URL = 'https://texashotelvegas.com';
const MONTH_ABBRS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MAX_PAGES = 6;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

function buildDateTimeString(timeText) {
    // timeText: "Apr 19 @ 3:00 pm – 10:00 pm"
    const match = timeText.match(/(\w+)\s+(\d+)\s*@\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
    if (!match) return null;
    const [, monthAbbr, day, time] = match;
    const monthIdx = MONTH_ABBRS.indexOf(monthAbbr.toLowerCase());
    if (monthIdx === -1) return null;
    const now = new Date();
    const year = monthIdx < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
    return `${monthAbbr} ${day} ${year} ${time}`;
}

async function fetchPage(offset) {
    const url = offset === 0
        ? `${BASE_URL}/all-events/action~agenda/cat_ids~2351/request_format~html/`
        : `${BASE_URL}/all-events/action~agenda/page_offset~${offset}/cat_ids~2351/request_format~html/`;

    let html;
    try {
        const response = await axios.get(url, { timeout: 15000, headers: HEADERS });
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Hotel Vegas fetch failed (offset ' + offset + '):', e.message);
        return null;
    }
    return html;
}

async function getHotelVegasData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Hotel Vegas');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];

    for (let offset = 0; offset < MAX_PAGES; offset++) {
        const html = await fetchPage(offset);
        if (!html) break;

        const $ = cheerio.load(html);
        const eventEls = $('div.ai1ec-event');
        if (eventEls.length === 0) break;

        eventEls.each((_, el) => {
            const $el = $(el);

            const artists = $el.find('span.ai1ec-event-title').text().trim() || null;
            const timeText = $el.find('div.ai1ec-event-time').text().trim();
            const dateTime = buildDateTimeString(timeText);

            const rawTicketUrl = $el.attr('data-ticket-url');
            const ticketLink = rawTicketUrl && rawTicketUrl !== '#'
                ? rawTicketUrl
                : ($el.find('a.ai1ec-load-event').attr('href') || null);

            const concert = buildConcertObj(artists, dateTime, null, ticketLink);
            if (concert) events.push(concert);
        });
    }

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Hotel Vegas: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
}

module.exports = { getHotelVegasData };
