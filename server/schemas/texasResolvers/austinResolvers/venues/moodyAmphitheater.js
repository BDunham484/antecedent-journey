const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Moody Amphitheater';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Moody Amphitheater uses Webflow CMS, which renders event cards fully server-side.
// All 24+ events are present in the raw HTML — no JavaScript execution needed,
// so axios + cheerio is sufficient.
//
// Each event is a div.event-wrapper.normal-listing inside a Webflow collection list.
// Inside it there are two links:
//   1. a.link-block — an internal /events/[slug] page (ignored)
//   2. a.ticket-button.primary-btn inside .event-link — the actual ticket link
//      (Ticketmaster for most shows; external event URLs for some community events)
//
// Date is split across three sibling elements inside .event-date:
//   .date-month ("Apr"), .date-day ("25") — no year available on the listing page.
// Year is inferred: if the month number is less than the current month, we assume
// next year; otherwise current year. This handles the Dec→Jan rollover correctly.
//
// .event-title holds a presenter/subtitle string (e.g. "C3 Presents").
// .event-headliner holds the actual artist name — that's the field we use.
// .event-support holds the support act when present; appended to headliner if non-empty.
//
// Price is not shown on the listing page — passed as null.
// No sold-out or cancelled indicators are present on the listing page.

const MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const getMoodyAmphitheaterData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Moody Amphitheater');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.moodyamphitheater.com/events-tickets');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Moody Amphitheater] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    $('div.event-wrapper.normal-listing').each((_, el) => {
        const $el = $(el);

        const headliner = $el.find('.event-headliner').text().trim();
        if (!headliner) return;

        const support = $el.find('.event-support').text().trim();
        const artists = support ? `${headliner} with ${support}` : headliner;

        const monthStr = $el.find('.date-month').text().trim().toLowerCase().slice(0, 3);
        const day = $el.find('.date-day').text().trim();
        const time = $el.find('.event-time').text().trim();

        const monthIndex = MONTHS[monthStr];
        if (monthIndex === undefined || !day) return;

        const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;
        const monthName = $el.find('.date-month').text().trim();
        const dateStr = `${monthName} ${day}, ${year} ${time}`;

        const ticketLink = $el.find('.event-link a.ticket-button.primary-btn').attr('href') || null;

        events.push(buildConcertObj(artists, dateStr, null, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Moody Amphitheater: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getMoodyAmphitheaterData };
