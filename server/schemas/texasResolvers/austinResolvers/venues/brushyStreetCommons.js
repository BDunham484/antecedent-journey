const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Brushy Street Commons';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Brushy Street Commons runs on Squarespace, which renders the event list server-side.
// The full HTML is available in a plain axios GET — no browser needed.
//
// Events are <article class="eventlist-event--upcoming"> elements. Each article contains:
//   - Title in <a class="eventlist-title-link">
//   - Date in <time class="event-date"> (text: "Friday, April 17, 2026")
//   - Start time in <time class="event-time-localized-start"> (text: "10:30 AM")
//   - Ticket link as an <a> inside <div class="eventlist-excerpt">
//
// The <a class="eventlist-button"> is a "View Event →" internal link, NOT the ticket URL.
// The real external ticket link (Eventim, Posh.vip, Eventbrite, etc.) lives inside
// .eventlist-excerpt as an anchor with target="_blank".
//
// Ticket price is not listed on the calendar page — always passed as null.
// .eventlist-datetag-status is empty for active events; it would contain text (e.g.
// "Sold Out") if the event were unavailable, but we pass status handling to buildConcertObj.

const getBrushyStreetCommonsData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Brushy Street Commons');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://brushystreet.com/event-calendar');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Brushy Street Commons fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('article.eventlist-event--upcoming').each((_, article) => {
        const $article = $(article);

        const artists = $article.find('.eventlist-title-link').first().text().trim() || null;

        const dateText = $article.find('time.event-date').first().text().trim();
        const timeText = $article.find('time.event-time-localized-start').first().text().trim();
        const dateTime = dateText && timeText ? `${dateText} ${timeText}` : (dateText || null);

        const ticketLink = $article.find('.eventlist-excerpt a').first().attr('href') || null;

        const statusText = $article.find('.eventlist-datetag-status').first().text().trim();

        const concert = buildConcertObj(artists, dateTime, null, ticketLink, statusText || null);
        if (concert && concert.artists) events.push(concert);
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Brushy Street Commons: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getBrushyStreetCommonsData };
