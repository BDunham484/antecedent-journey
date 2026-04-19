const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Kingdom';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Kingdom uses WordPress with the Rockhouse Partners (RHP/ETIX) events plugin.
// All events are fully server-side rendered — no JS widget, no API call needed.
// axios + cheerio is sufficient; no Playwright required.
//
// Each event lives in a .eventMainWrapper div. Within it:
//   - a#eventTitle h2                      → artist/event title
//   - #eventDate                            → date like "Fri, Apr 24" (no year)
//   - .eventDoorStartDate span             → time like "Show:  10pm"
//   - span.rhp-event__cost-text--grid      → price like "$21.15 to $76.15"
//   - span.rhp-event-cta a.btn-primary     → Buy Tickets link (etix.com href)
//   - span.rhp-event-cta class             → status: "on-sale", "sold-out", "Canceled"
//
// Date year inference: "Fri, Apr 24" has no year. We parse the month and compare
// against the current month — if the event month is before the current month, it
// must be next year. The day-of-week prefix is stripped before combining with time.
//
// Status is a CSS class on span.rhp-event-cta (not text). To route it through
// makeBuildConcertObj's status detection, we prepend "Cancelled: " or "Sold Out: "
// to the artists string when those classes are present.
//
// All events render on one page — no pagination.

const MONTH_NAMES = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

const inferYear = (monthStr) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const eventMonth = MONTH_NAMES.indexOf(monthStr.toLowerCase().slice(0, 3));
    if (eventMonth === -1) return now.getFullYear();
    return eventMonth < currentMonth ? now.getFullYear() + 1 : now.getFullYear();
};

// Normalize "10pm" → "10:00 PM", "9:30pm" → "9:30 PM" so concertUtils date
// stripping regexes (which require a colon) can extract and discard the time portion.
const normalizeTime = (raw) => {
    if (!raw) return '';
    return raw.replace(/(\d+)(:\d{2})?(am|pm)/i, (_, h, m, period) =>
        `${h}${m || ':00'} ${period.toUpperCase()}`
    );
};

const parseDateStr = (dateText, timeText) => {
    if (!dateText) return null;
    const withoutDow = dateText.replace(/^[A-Za-z]+,\s*/, '').trim();
    const [month, day] = withoutDow.split(/\s+/);
    if (!month || !day) return null;
    const year = inferYear(month);
    const rawTime = timeText ? timeText.replace(/^Show:\s*/i, '').trim() : '';
    const time = normalizeTime(rawTime);
    return `${month} ${day}, ${year}${time ? ' ' + time : ''}`;
};

const getKingdomData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Kingdom');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://kingdomnightclub.com/events/');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Kingdom] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('.eventMainWrapper').each((_, el) => {
        const $el = $(el);

        const rawTitle = $el.find('a#eventTitle h2').first().text().trim();
        if (!rawTitle) return;

        const dateText = $el.find('#eventDate').first().text().trim();
        const timeText = $el.find('.eventDoorStartDate span').first().text().trim();
        const dateTime = parseDateStr(dateText, timeText);

        const price = $el.find('span.rhp-event__cost-text--grid').first().text().trim() || null;

        const $cta = $el.find('span.rhp-event-cta').first();
        const ticketLink = $cta.find('a.btn-primary').attr('href') || null;

        const ctaClass = $cta.attr('class') || '';
        let artists = rawTitle;
        if (/\bCanceled\b/i.test(ctaClass)) {
            artists = `Cancelled: ${rawTitle}`;
        } else if (/\bsold-out\b/i.test(ctaClass)) {
            artists = `Sold Out: ${rawTitle}`;
        }

        events.push(buildConcertObj(artists, dateTime, price, ticketLink));
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Kingdom: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getKingdomData };
