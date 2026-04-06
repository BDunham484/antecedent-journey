const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = 'ABGB';

const buildConcertObj = (artists, dateTime, price, ticketLink) => {
    const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
    const status = statusMatch ? statusMatch[0].toLowerCase() : null;
    const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;
    const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
    const customId = headliner && dateTime && venue ? buildCustomId(headliner, dateTime, venue) : null;

    return {
        customId,
        artists: cleanArtists,
        date: dateTime,
        times: dateTime,
        venue,
        ticketPrice: price,
        ticketLink: ticketLink || null,
        status,
    };
};

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

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ The ABGB: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getTheAbgbData };
