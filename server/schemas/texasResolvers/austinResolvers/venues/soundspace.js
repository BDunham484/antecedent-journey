const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = "Soundspace at Captain Quack's";
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Soundspace uses WordPress with The Events Calendar (TEC) plugin in list view.
// The page is fully server-side rendered — axios + cheerio handles it, no browser needed.
//
// Events are in <li class="tribe-events-calendar-list__event-row"> elements.
// Within each row, the article holds:
//   - h4.tribe-events-calendar-list__event-title a  → title text + ticket link href
//                                                     (links to the event's own detail page;
//                                                     no external ticket platform detected)
//   - time.tribe-events-calendar-list__event-datetime [datetime attr]  → ISO date "YYYY-MM-DD"
//   - span.tribe-event-date-start text               → "April 22 @ 7:00 pm"
//   - span.tribe-events-c-small-cta__price           → "$20" or "Free"
//
// Year is not present in the displayed date text, so we pull it from the datetime attribute
// and combine it with the month/day/time from tribe-event-date-start to form
// "April 22, 2026 7:00 pm" before passing to buildConcertObj.
//
// TEC paginates in list view — page 1 is /events/, subsequent pages are
// /events/list/page/2/, /events/list/page/3/, etc. We follow a.tribe-events-c-nav__next
// until there are no more pages.

const parseTecDateTime = ($el) => {
    const dateAttr = $el.find('time.tribe-events-calendar-list__event-datetime').attr('datetime');
    const startText = $el.find('span.tribe-event-date-start').text().trim();

    if (!startText) return null;

    const year = dateAttr ? dateAttr.slice(0, 4) : String(new Date().getFullYear());
    const atIdx = startText.indexOf('@');
    const monthDay = atIdx !== -1 ? startText.slice(0, atIdx).trim() : startText;
    const timePart = atIdx !== -1 ? startText.slice(atIdx + 1).trim() : null;

    return timePart ? `${monthDay}, ${year} ${timePart}` : `${monthDay}, ${year}`;
};

const scrapeEventsFromPage = ($, events) => {
    $('li.tribe-events-calendar-list__event-row').each((_, el) => {
        const $el = $(el);

        const $titleLink = $el.find('h4.tribe-events-calendar-list__event-title a').first();
        const title = $titleLink.text().trim();
        if (!title) return;

        const ticketLink = $titleLink.attr('href') || null;
        const dateTime = parseTecDateTime($el);
        const price = $el.find('span.tribe-events-c-small-cta__price').first().text().trim() || null;

        events.push(buildConcertObj(title, dateTime, price, ticketLink));
    });
};

const getSoundspaceData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Soundspace at Captain Quack's");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];
    let nextUrl = 'https://soundspaceatx.com/events/';

    while (nextUrl) {
        let html;
        try {
            const response = await axios.get(nextUrl);
            html = response.data;
        } catch (e) {
            console.error("❌❌❌❌ [Soundspace at Captain Quack's] fetch failed:", e.message);
            break;
        }

        const $ = cheerio.load(html);
        scrapeEventsFromPage($, events);
        nextUrl = $('a.tribe-events-c-nav__next').attr('href') || null;
    }

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Soundspace at Captain Quack's: ");
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getSoundspaceData };
