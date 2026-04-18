const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Elephant Room';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Elephant Room uses Bandzoogle (zoogletools CMS) — all event data is server-side rendered
// in static HTML, so axios + cheerio is sufficient; no browser needed.
//
// The main calendar page at /calendar renders a list view via `section.upcoming`. Each
// event is an `article.list-style` element containing:
//   - h2.event-title a      → artist/event title (text) and ticket/info link (href)
//   - .date-long .date      → date string e.g. "Wednesday, April 15" (no year)
//   - .date-long .time      → time string e.g. "6:00PM"
//
// Year inference: Bandzoogle omits the year from date strings. We parse the month + day,
// compare against today's date, and assign the current year if the date is still upcoming
// or today, otherwise next year.
//
// Pagination: the main page shows only the first batch of events. Further pages are
// fetched via an AJAX endpoint that returns HTML fragments:
//   https://elephantroom.com/calendar/calendar_features?calendar_feature_id=1147558&calendar_page=N
// Pages 1–7 are fetched (page 1 covers the same span as the main page, so we skip it
// and start at page 2; the main page is fetched first separately).
//
// Price: Elephant Room has flat cover charges by day of week, not per-event — passed as null.

const MONTH_MAP = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

const inferYear = (monthName, day) => {
    const today = new Date();
    const monthIndex = MONTH_MAP[monthName.toLowerCase()];
    if (monthIndex === undefined) return today.getFullYear();
    const thisYear = today.getFullYear();
    const candidate = new Date(thisYear, monthIndex, day);
    candidate.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return candidate >= todayMidnight ? thisYear : thisYear + 1;
};

// Parses "Wednesday, April 15" + "6:00PM" → "April 15, 2026 6:00PM"
const buildDateTime = (rawDate, rawTime) => {
    if (!rawDate) return null;
    // Strip day-of-week prefix: "Wednesday, April 15" → "April 15"
    const withoutDow = rawDate.replace(/^[a-z]+,\s*/i, '').trim();
    // withoutDow is like "April 15"
    const parts = withoutDow.split(/\s+/);
    if (parts.length < 2) return null;
    const monthName = parts[0];
    const day = parseInt(parts[1], 10);
    if (!monthName || isNaN(day)) return null;
    const year = inferYear(monthName, day);
    const timePart = rawTime ? ` ${rawTime.trim()}` : '';
    return `${monthName} ${day}, ${year}${timePart}`;
};

const scrapeEventsFromHtml = (html, events) => {
    const $ = cheerio.load(html);
    $('section.upcoming article.list-style').each((_, el) => {
        const $el = $(el);

        const $titleLink = $el.find('h2.event-title a').first();
        const artists = $titleLink.text().trim();
        if (!artists) return;

        const ticketLink = $titleLink.attr('href') || null;

        const rawDate = $el.find('.date-long .date').first().text().trim();
        const rawTime = $el.find('.date-long .time').first().text().trim();
        const dateTime = buildDateTime(rawDate, rawTime);

        events.push(buildConcertObj(artists, dateTime, null, ticketLink));
    });
};

const getElephantRoomData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Elephant Room');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];

    // Fetch main calendar page (contains the first batch of events)
    let mainHtml;
    try {
        const response = await axios.get('https://elephantroom.com/calendar');
        mainHtml = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Elephant Room] fetch failed (main page):', e.message);
        return [];
    }
    scrapeEventsFromHtml(mainHtml, events);

    // Fetch paginated AJAX fragments (pages 2–7)
    const CALENDAR_FEATURE_ID = 1147558;
    const TOTAL_PAGES = 7;

    for (let page = 2; page <= TOTAL_PAGES; page++) {
        const url = `https://elephantroom.com/calendar/calendar_features?calendar_feature_id=${CALENDAR_FEATURE_ID}&calendar_page=${page}`;
        let html;
        try {
            const response = await axios.get(url);
            html = response.data;
        } catch (e) {
            console.error(`❌❌❌❌ [Elephant Room] fetch failed (page ${page}):`, e.message);
            break;
        }
        scrapeEventsFromHtml(html, events);
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Elephant Room: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getElephantRoomData };
