const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Sagebrush';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Sagebrush uses SpotApps, a restaurant/bar CMS. The events page is fully
// server-side rendered — all event cards are present in the static HTML, so
// axios + cheerio is sufficient (no Playwright needed).
//
// Each event is a div.event-calendar-card. The date comes from the
// data-event-start-date attribute (ISO 8601, e.g. "2026-05-08T00:00:00+00:00")
// and the start time from data-event-start-time (24h, e.g. "20:00"). We split
// the ISO date at "T" to get "YYYY-MM-DD", then combine with the 24h time into
// "YYYY-MM-DD HH:MM" for buildConcertObj.
//
// Ticket links are not <a href> elements — they appear as plain-text URLs inside
// description paragraphs (.event-info-text). We regex the full text for the first
// http(s) URL and use it as the ticket link (fallback: null).
//
// Price similarly lives as "$N" text in the description. We regex for it and
// extract the numeric portion (fallback: null).
//
// There is no explicit cancelled/sold-out indicator in the static markup.
// buildConcertObj's built-in status detection will catch any "cancelled" or
// "sold out" strings that appear in the title or description if they're ever added.

const URL = 'https://sagebrushaustin.com/events';

async function getSagebrushData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Sagebrush');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get(URL);
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Sagebrush fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('div.event-calendar-card').each((i, el) => {
        const artists = $(el).find('.event-text-holder h2').text().trim();
        if (!artists) return;

        const isoDate = $(el).attr('data-event-start-date') || '';
        const startTime = $(el).attr('data-event-start-time') || '';
        const dateOnly = isoDate.split('T')[0];
        const dateTime = dateOnly && startTime ? `${dateOnly} ${startTime}` : dateOnly || null;

        const descText = $(el).find('.event-info-text').text();

        const urlMatch = descText.match(/https?:\/\/\S+/);
        const ticketLink = urlMatch ? urlMatch[0].replace(/[.,)]+$/, '') : null;

        const priceMatch = descText.match(/\$(\d+(?:\.\d{2})?)/);
        const price = priceMatch ? priceMatch[1] : null;

        const concert = buildConcertObj(artists, dateTime, price, ticketLink);
        if (concert) events.push(concert);
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Sagebrush: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
}

module.exports = { getSagebrushData };
