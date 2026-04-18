const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Drinks Backyard';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Drinks Backyard uses Wix Events & Tickets (appDefId: 140603ad-af8d-84a5-2c80-a0f60cb47351).
// Even though Wix Thunderbolt is a JS framework, it server-side renders the full event list
// into a <script id="wix-warmup-data"> JSON blob in the static HTML. axios + cheerio are
// sufficient — no browser needed.
//
// The warmup JSON path is:
//   appsWarmupData["140603ad-af8d-84a5-2c80-a0f60cb47351"][widgetKey].events.events
//
// The widget key (e.g. "widgetTPASection_lxf1dro9") is dynamic — it changes if the Wix site
// is reconfigured — so we take Object.keys(appData)[0] since there is always exactly one
// events widget on the page.
//
// All events are free/no-cover, so price is always null. Wix sets soldOut=true on free events
// as a platform artifact when no RSVP flow is configured — this does NOT indicate a real
// sold-out or cancelled status, so eventStatus is always null here.
//
// Ticket links are constructed from the event slug:
//   https://www.drinksbackyard.com/event-details/{slug}

async function getDrinksBackyardData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Drinks Backyard');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const url = 'https://www.drinksbackyard.com/event-list';
    let html;
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });
        html = response.data;
    } catch (e) {
        console.log('❌❌❌❌ [Drinks Backyard] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const warmupScript = $('#wix-warmup-data').html();
    if (!warmupScript) {
        console.log('❌❌❌❌ [Drinks Backyard] warmup data script not found');
        return [];
    }

    let warmupData;
    try {
        warmupData = JSON.parse(warmupScript);
    } catch (e) {
        console.log('❌❌❌❌ [Drinks Backyard] failed to parse warmup JSON:', e.message);
        return [];
    }

    const appData = warmupData?.appsWarmupData?.['140603ad-af8d-84a5-2c80-a0f60cb47351'];
    if (!appData) {
        console.log('❌❌❌❌ [Drinks Backyard] Wix Events app data not found in warmup');
        return [];
    }

    const widgetKey = Object.keys(appData)[0];
    const rawEvents = appData[widgetKey]?.events?.events ?? [];

    const events = rawEvents.map(event => {
        const artists = event.title || null;
        const dateTime = event.scheduling?.config?.startDate || null;
        const slug = event.slug;
        const ticketLink = slug
            ? `https://www.drinksbackyard.com/event-details/${slug}`
            : null;

        return buildConcertObj(artists, dateTime, null, ticketLink);
    }).filter(Boolean);

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Drinks Backyard: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
}

module.exports = { getDrinksBackyardData };
