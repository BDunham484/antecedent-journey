const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Radio East';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Radio East uses the same Prekindle org as Radio South and Radio Rosewood. All three
// locations share a single Prekindle iframe (org ID -2852852648538121270). We fetch
// the server-rendered iframe HTML directly with axios — no Playwright needed.
//
// Two-source parsing strategy (same as radioCoffeeBeerSouth.js):
//
// 1. JSON-LD (<script type="application/ld+json"> inside #pk-list) provides all events
//    across all Radio locations. We filter to East by location.name.includes('East')
//    and build a lookup map keyed by event name, carrying date (YYYY-MM-DD), price,
//    ticket URL, and eventStatus.
//
// 2. DOM (.pk-eachevent elements tagged with class "tag-radioeast") carries show time
//    in .pk-times div, which JSON-LD omits. We iterate these elements and merge with
//    the JSON-LD map by event name to assemble a full datetime string.
//
// Prekindle renders location.name as "Radio/East" — the slash is a platform quirk.
// We use 'Radio East' as the venue constant to avoid slash characters in customId.

const PREKINDLE_URL =
    'https://www.prekindle.com/organizer-grid-widget-main/id/-2852852648538121270/?fp=false&thumbs=false&style=null';

function extractStartTime(timeText) {
    if (!timeText) return null;
    const startMatch = timeText.match(/Start\s+(\d+:\d+(?:am|pm))/i);
    if (startMatch) return startMatch[1];
    const timeMatch = timeText.match(/(\d+:\d+(?:am|pm))/i);
    return timeMatch ? timeMatch[1] : null;
}

async function getRadioEastData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Radio East');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get(PREKINDLE_URL);
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Radio East fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    let allJsonEvents = [];
    try {
        const rawJson = $('script[type="application/ld+json"]').text();
        allJsonEvents = JSON.parse(rawJson);
    } catch (e) {
        console.error('❌❌❌❌ Radio East JSON-LD parse failed:', e.message);
    }

    const eastMeta = {};
    allJsonEvents
        .filter(e => e.location?.name?.includes('East'))
        .forEach(e => {
            const price = e.offers?.price && e.offers.price !== '0.00' ? e.offers.price : null;
            const isCancelled = e.eventStatus?.includes('Cancelled');
            const isSoldOut = e.offers?.availability === 'SoldOut';
            eastMeta[e.name] = {
                startDate: e.startDate || null,
                price,
                ticketLink: e.offers?.url || e.url || null,
                status: isCancelled ? 'EventCancelled' : isSoldOut ? 'EventSoldOut' : null,
            };
        });

    const events = [];

    $('.pk-eachevent').each((i, el) => {
        const classes = $(el).attr('class') || '';
        if (!classes.includes('tag-radioeast')) return;

        const artists = $(el).find('.pk-headline').text().trim();
        if (!artists) return;

        const meta = eastMeta[artists] || {};
        const timeText = $(el).find('.pk-times div').text().trim();
        const startTime = extractStartTime(timeText);
        const dateTime =
            meta.startDate && startTime
                ? `${meta.startDate} ${startTime}`
                : meta.startDate || null;

        const ticketLink =
            $(el).find('a.pk-title-link').attr('href') || meta.ticketLink || null;

        const concert = buildConcertObj(artists, dateTime, meta.price, ticketLink);
        if (concert) events.push(concert);
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Radio East: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
}

module.exports = { getRadioEastData };
