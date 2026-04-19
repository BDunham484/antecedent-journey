const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Saxon Pub';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Saxon Pub uses WordPress with The Events Calendar plugin (tribe) in list view.
// The page is fully server-side rendered, so axios + cheerio works — no browser needed.
//
// The default /events/ URL shows a month calendar grid — not scrapeable with Cheerio.
// /events/list/ returns the same plugin in list view with full article elements.
//
// Each show is an <article class="tribe-events-calendar-list__event"> element.
// Within each article:
//   - a.tribe-events-calendar-list__event-title-link          → artist title and event URL
//   - time.tribe-events-calendar-list__event-datetime[datetime] → ISO date "2026-04-19" (has year)
//   - span.tribe-event-date-start                             → "April 19 @ 5:30 pm" (has time)
//   - .tribe-events-calendar-list__event-cost                 → ticket price
//
// The datetime[datetime] attribute has the year; the span text has the time.
// parseDateTimeText combines them: "April 19, 2026 5:30 pm" → ready for buildConcertObj.

const parseDateTimeText = (isoDate, startSpanText) => {
    if (!isoDate || !startSpanText) return null;
    const year = isoDate.split('-')[0];
    const atIdx = startSpanText.indexOf('@');
    if (atIdx === -1) return `${startSpanText} ${year}`;
    const datePart = startSpanText.slice(0, atIdx).trim();
    const timePart = startSpanText.slice(atIdx + 1).trim();
    return `${datePart}, ${year} ${timePart}`;
};

const getSaxonPubData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Saxon Pub');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://thesaxonpub.com/events/list/');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Saxon Pub] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('article.tribe-events-calendar-list__event').each((_, el) => {
        const $el = $(el);

        const $titleLink = $el.find('a.tribe-events-calendar-list__event-title-link').first();
        const title = $titleLink.text().trim();
        if (!title) return;

        const ticketLink = $titleLink.attr('href') || null;

        const isoDate = $el.find('time.tribe-events-calendar-list__event-datetime').attr('datetime');
        const startSpanText = $el.find('span.tribe-event-date-start').first().text().trim();
        const dateTime = parseDateTimeText(isoDate, startSpanText);

        const priceText = $el.find('.tribe-events-calendar-list__event-cost').first().text().trim();
        const price = priceText || null;

        events.push(buildConcertObj(title, dateTime, price, ticketLink));
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Saxon Pub: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getSaxonPubData };
