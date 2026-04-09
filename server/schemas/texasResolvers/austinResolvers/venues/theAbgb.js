const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'ABGB';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// The ABGB uses a custom events page that is server-side rendered. Axios + cheerio
// is sufficient — no browser needed.
//
// Each event is a <section> inside div.events-holder. Within each section:
//   - h2                              → event/artist title
//   - p.event-main-text.event-day     → date string (e.g. "Wednesday April 8th")
//   - p.event-main-text.event-time    → time range (e.g. "07:00 PM - 09:00 PM")
//
// Two quirks require helper functions:
//   1. The date string includes a day-of-week prefix and ordinal suffixes (1st, 2nd, etc.)
//      that need to be stripped before parsing. parseDateText() handles this and also
//      infers the year — the site only shows month and day, so we assume the current year
//      and bump to next year if the date has already passed.
//   2. The time is a range ("07:00 PM - 09:00 PM"), but we only want the start time.
//      parseStartTime() splits on " - " and takes the first part.
//
// Price and ticket links are not listed on this page, so both are passed as null.

// Parses "Wednesday April 8th" → "April 8, YYYY"
// Infers year: current year, bumped to next year if date is already past
const parseDateText = (rawDate) => {
    // Strip day-of-week prefix and ordinal suffix (st, nd, rd, th)
    const cleaned = rawDate.replace(/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+/i, '').replace(/(\d+)(st|nd|rd|th)/i, '$1').trim();
    // cleaned is now e.g. "April 8"
    const now = new Date();
    const year = now.getFullYear();
    const candidate = new Date(`${cleaned}, ${year}`);
    if (isNaN(candidate.getTime())) return cleaned;
    // If the date has already passed, use next year
    const useYear = candidate < now ? year + 1 : year;
    return `${cleaned}, ${useYear}`;
};

// Extracts start time from "07:00 PM - 09:00 PM" → "07:00 PM"
const parseStartTime = (rawTime) => {
    if (!rawTime) return null;
    return rawTime.split('-')[0].trim();
};

const getTheAbgbData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ The ABGB');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://theabgb.com/events');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [The ABGB] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    const events = [];

    $('div.events-holder section').each((_, el) => {
        const $el = $(el);

        const title = $el.find('h2').first().text().trim();
        if (!title) return;

        const rawDate = $el.find('p.event-main-text.event-day').first().text().trim();
        const rawTime = $el.find('p.event-main-text.event-time').first().text().trim();

        const dateStr = rawDate ? parseDateText(rawDate) : null;
        const startTime = parseStartTime(rawTime);
        const dateTime = dateStr && startTime ? `${dateStr} ${startTime}` : dateStr;

        events.push(buildConcertObj(title, dateTime, null, null));
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ The ABGB: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getTheAbgbData };
