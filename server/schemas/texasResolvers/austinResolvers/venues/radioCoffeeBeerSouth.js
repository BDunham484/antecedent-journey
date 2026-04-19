const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Radio Coffee and Beer';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Radio Coffee and Beer South uses Prekindle as their ticketing/calendar platform. Their main
// site (radiocoffeeandbeer.com/radio-south) embeds a Prekindle calendar widget via iframe.
// The iframe src points to a Prekindle-hosted page that returns fully server-rendered HTML,
// so axios + Cheerio work without Playwright.
//
// Prekindle hosts events for all three Radio locations (South, East, Rosewood) under a single
// org ID. Two techniques are needed to isolate South events:
//
// 1. JSON-LD (<script type="application/ld+json"> inside #pk-list) contains all events as
//    structured data with full fields: name, startDate (YYYY-MM-DD), price, ticket URL, and
//    eventStatus. We filter by location.name.includes('South') and build a lookup map keyed
//    by event name.
//
// 2. DOM (.pk-eachevent elements tagged with class "tag-radiosouth") carries the show time
//    in .pk-times div, which is absent from the JSON-LD. We iterate these elements to get
//    time, then merge with the JSON-LD map to assemble a full datetime string.
//
// Time parsing: Prekindle renders time as either "7:30pm" or "Doors 6:00pm, Start 7:00pm".
// We extract the start time from the latter pattern and fall back to the first time found.
//
// Price: Prekindle returns "0.00" for free events. We normalize that to null.

const PREKINDLE_URL =
    'https://www.prekindle.com/organizer-grid-widget-main/id/-2852852648538121270/?fp=false&thumbs=false&style=null';

function extractStartTime(timeText) {
    if (!timeText) return null;
    const startMatch = timeText.match(/Start\s+(\d+:\d+(?:am|pm))/i);
    if (startMatch) return startMatch[1];
    const timeMatch = timeText.match(/(\d+:\d+(?:am|pm))/i);
    return timeMatch ? timeMatch[1] : null;
}

async function getRadioCoffeeBeerSouthData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Radio Coffee and Beer');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get(PREKINDLE_URL);
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Radio Coffee and Beer fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    // Parse JSON-LD for price, date (with year), status, and ticket URL
    let allJsonEvents = [];
    try {
        const rawJson = $('script[type="application/ld+json"]').text();
        allJsonEvents = JSON.parse(rawJson);
    } catch (e) {
        console.error('❌❌❌❌ Radio Coffee and Beer JSON-LD parse failed:', e.message);
    }

    const southMeta = {};
    allJsonEvents
        .filter(e => e.location?.name?.includes('South'))
        .forEach(e => {
            const price = e.offers?.price && e.offers.price !== '0.00' ? e.offers.price : null;
            const isCancelled = e.eventStatus?.includes('Cancelled');
            const isSoldOut = e.offers?.availability === 'SoldOut';
            southMeta[e.name] = {
                startDate: e.startDate || null,
                price,
                ticketLink: e.offers?.url || e.url || null,
                status: isCancelled ? 'EventCancelled' : isSoldOut ? 'EventSoldOut' : null,
            };
        });

    const events = [];

    $('.pk-eachevent').each((i, el) => {
        const classes = $(el).attr('class') || '';
        if (!classes.includes('tag-radiosouth')) return;

        const artists = $(el).find('.pk-headline').text().trim();
        if (!artists) return;

        const meta = southMeta[artists] || {};
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

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Radio Coffee and Beer: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
}

module.exports = { getRadioCoffeeBeerSouthData };
