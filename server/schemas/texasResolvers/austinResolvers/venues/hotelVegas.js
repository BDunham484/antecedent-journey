const playwright = require('playwright');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Hotel Vegas';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Hotel Vegas uses WordPress with the All-in-One Event Calendar plugin (ai1ec / Timely).
// The site is behind Cloudflare, which blocks datacenter IPs (e.g. Render) with a JS
// challenge. Playwright passes that challenge; axios alone does not.
//
// All pages are loaded via page.goto (not fetch/AJAX) so every navigation gets a proper
// Cloudflare challenge pass. request_format~html is omitted — the server returns the full
// page regardless, and our cheerio selectors work on both.
//
// cat_ids~2351 scopes results to Hotel Vegas events.
//
// Each div.ai1ec-event carries a data-ticket-url attribute for external ticketing.
// When absent (free/no-cover shows) we fall back to a.ai1ec-load-event href.
//
// The div.ai1ec-event-time contains "MMM D @ h:mm a – h:mm a" with no year. We inject
// current or next year by comparing the month index to today's month.
//
// Proxy support: if PROXY / PROXY_USERNAME / PROXY_PASSWORD env vars are set,
// Playwright routes traffic through that proxy (same pattern as other Playwright scrapers).

const BASE_URL = 'https://texashotelvegas.com';
const MONTH_ABBRS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MAX_PAGES = 6;

function buildDateTimeString(timeText) {
    // timeText: "Apr 19 @ 3:00 pm – 10:00 pm"
    const match = timeText.match(/(\w+)\s+(\d+)\s*@\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
    if (!match) return null;
    const [, monthAbbr, day, time] = match;
    const monthIdx = MONTH_ABBRS.indexOf(monthAbbr.toLowerCase());
    if (monthIdx === -1) return null;
    const now = new Date();
    const year = monthIdx < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
    return `${monthAbbr} ${day} ${year} ${time}`;
}

function parseEventsFromHtml(html) {
    const $ = cheerio.load(html);
    const results = [];
    $('div.ai1ec-event').each((_, el) => {
        const $el = $(el);
        const artists = $el.find('span.ai1ec-event-title').text().trim() || null;
        const timeText = $el.find('div.ai1ec-event-time').text().trim();
        const dateTime = buildDateTimeString(timeText);
        const rawTicketUrl = $el.attr('data-ticket-url');
        const ticketLink = rawTicketUrl && rawTicketUrl !== '#'
            ? rawTicketUrl
            : ($el.find('a.ai1ec-load-event').attr('href') || null);
        results.push({ artists, dateTime, ticketLink });
    });
    return results;
}

async function getHotelVegasData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Hotel Vegas');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const launchOptions = {
        headless: true,
        ...(process.env.PROXY && {
            proxy: {
                server: process.env.PROXY,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
            }
        }),
    };

    const browser = await playwright.webkit.launch(launchOptions);
    const rawEvents = [];

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        for (let offset = 0; offset < MAX_PAGES; offset++) {
            const url = offset === 0
                ? `${BASE_URL}/all-events/action~agenda/cat_ids~2351/`
                : `${BASE_URL}/all-events/action~agenda/page_offset~${offset}/cat_ids~2351/`;

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForSelector('div.ai1ec-event', { timeout: 20000 }).catch(() => {});

            const pageEvents = parseEventsFromHtml(await page.content());
            if (pageEvents.length === 0) break;
            rawEvents.push(...pageEvents);
        }

    } catch (e) {
        console.error('❌❌❌❌ [Hotel Vegas] scrape error:', e.message);
    } finally {
        await browser.close();
    }

    const events = rawEvents
        .map(({ artists, dateTime, ticketLink }) => buildConcertObj(artists, dateTime, null, ticketLink))
        .filter(Boolean);

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Hotel Vegas: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
}

module.exports = { getHotelVegasData };
