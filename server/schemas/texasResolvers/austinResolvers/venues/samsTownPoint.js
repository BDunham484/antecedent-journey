const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = "Sam's Town Point";

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Sam's Town Point runs on Bandzoogle (bndzgl.com), a website builder for musicians/venues.
// The calendar page is server-side rendered, so axios + cheerio works — no browser needed.
//
// Events are in a <table class="table-style border-accent"> with one <tr> per show.
// Each row has three <td> cells: event-date, event-name, and event-location (always empty).
//
//   td.event-date span.date-long time.from:
//     span.date  →  "Saturday, April 18"  (no year)
//     span.time  →  "11:00PM"
//   td.event-name a.event_details:
//     span.text (first) →  artist/event title
//     href              →  relative link e.g. /go/events/[ID]?...  (internal lightbox popup)
//
// Year is absent from date text. concertUtils.makeBuildConcertObj handles year inference:
// it appends the current year and bumps to next year if the resolved date is already past.
//
// Pagination: page 1 is at /calendar; pages 2+ use the URL pattern:
//   /calendar/calendar_features?calendar_feature_id=562219&calendar_page=[N]
// On the first page we read the highest calendar_page= value from pagination links to
// find the total, then fetch each remaining page sequentially.
//
// No price is shown on the calendar listing — ticketPrice is always null.
// The ticket link is the internal /go/events/ popup URL with the base URL prepended.

const BASE_URL = 'https://www.samstownpointatx.com';
const PAGE_1_URL = `${BASE_URL}/calendar`;
const PAGE_N_URL = (n) =>
    `${BASE_URL}/calendar/calendar_features?calendar_feature_id=562219&calendar_page=${n}`;

const scrapeEventsFromPage = ($, events) => {
    $('table.table-style tbody tr').each((_, el) => {
        const $el = $(el);

        const title = $el.find('td.event-name a.event_details span.text').first().text().trim();
        if (!title) return;

        const dateText = $el.find('td.event-date a.event_details span.date-long time.from span.date').text().trim();
        const timeText = $el.find('td.event-date a.event_details span.date-long time.from span.time').text().trim();
        const dateTime = dateText ? `${dateText} ${timeText}`.trim() : null;

        const relHref = $el.find('td.event-name a.event_details').attr('href') || null;
        const ticketLink = relHref ? `${BASE_URL}${relHref}` : null;

        events.push(buildConcertObj(title, dateTime, null, ticketLink));
    });
};

const getTotalPages = ($) => {
    let max = 1;
    $('a[href*="calendar_page="]').each((_, el) => {
        const match = ($(el).attr('href') || '').match(/calendar_page=(\d+)/);
        if (match) {
            const n = parseInt(match[1], 10);
            if (n > max) max = n;
        }
    });
    return max;
};

const getSamsTownPointData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Sam's Town Point");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];

    let html;
    try {
        const response = await axios.get(PAGE_1_URL);
        html = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [Sam's Town Point] fetch failed:", e.message);
        return [];
    }

    const $ = cheerio.load(html);
    scrapeEventsFromPage($, events);
    const totalPages = getTotalPages($);

    for (let page = 2; page <= totalPages; page++) {
        let pageHtml;
        try {
            const response = await axios.get(PAGE_N_URL(page));
            pageHtml = response.data;
        } catch (e) {
            console.error(`❌❌❌❌ [Sam's Town Point] page ${page} fetch failed:`, e.message);
            break;
        }
        const $page = cheerio.load(pageHtml);
        scrapeEventsFromPage($page, events);
    }

    // console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Sam's Town Point: ");
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getSamsTownPointData };
