const playwright = require('playwright');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = "C-Boy's Heart & Soul";

const TIMELY_CALENDAR_URL = 'https://events.timely.fun/r5bk3h1a/';

// Direct axios approach failed with 404 — the API requires auth context (cookies/token)
// that the Angular app sets up at startup. We use Playwright and intercept the events
// request mid-flight via page.route(), widening the date range to 1 year before it goes out.

const buildConcertObj = (artists, dateTime, price, ticketLink) => {
    const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
    const status = statusMatch ? statusMatch[0].toLowerCase() : null;
    const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;
    const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
    const customId = headliner && dateTime && venue ? buildCustomId(headliner, dateTime, venue) : null;

    return {
        customId,
        artists: cleanArtists,
        date: dateTime,
        times: dateTime,
        venue,
        ticketPrice: price,
        ticketLink: ticketLink || null,
        status,
    };
};

// "2026-04-01 18:30:00" → "April 1, 2026 6:30 PM"
const formatStartDatetime = (startDatetime) => {
    const [datePart, timePart] = startDatetime.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[month - 1];
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const minStr = minutes === 0 ? '00' : minutes.toString().padStart(2, '0');

    return `${monthName} ${day}, ${year} ${hour12}:${minStr} ${ampm}`;
};

const getCBoysData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ C-Boy's Heart & Soul");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const now = new Date();
    const startUtc = Math.floor(now.getTime() / 1000);
    const endUtc = startUtc + 365 * 24 * 60 * 60; // 1 year out

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
    let items = null;

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Intercept the events API request and widen the date range to 1 year
        await page.route('**/api/calendars/**/events**', async (route) => {
            const url = new URL(route.request().url());
            url.searchParams.set('start_date_utc', String(startUtc));
            url.searchParams.set('end_date_utc', String(endUtc));
            url.searchParams.delete('view');
            await route.continue({ url: url.toString() });
        });

        // Capture the (now widened) response
        const responsePromise = page.waitForResponse(
            res => res.url().includes('/api/calendars/') && res.url().includes('/events'),
            { timeout: 20000 }
        );

        await page.goto(TIMELY_CALENDAR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const response = await responsePromise;
        const json = await response.json();
        items = json?.data?.items ?? null;

    } catch (e) {
        console.error("❌❌❌❌ [C-Boy's] scrape error:", e.message);
    } finally {
        await browser.close();
    }

    if (!items || typeof items !== 'object') {
        console.error("❌❌❌❌ [C-Boy's] no events data captured");
        return [];
    }

    const eventList = Object.values(items).flat();
    const events = [];

    for (const event of eventList) {
        const { title, start_datetime, cost, cost_external_url, url, event_status } = event;

        if (!title || !start_datetime) continue;

        const parts = start_datetime.split(' ');
        if (parts.length < 2) continue;
        const [datePart, timePart] = parts;
        const [yr, mo, dy] = datePart.split('-').map(Number);
        const [hr, min] = timePart.split(':').map(Number);
        if (new Date(yr, mo - 1, dy, hr, min) < now) continue;

        const dateTime = formatStartDatetime(start_datetime);
        const ticketLink = cost_external_url || url || null;
        const titleWithStatus = event_status && event_status !== 'confirmed'
            ? `${event_status} ${title}`
            : title;

        events.push(buildConcertObj(titleWithStatus, dateTime, cost || null, ticketLink));
    }

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ C-Boy's Heart & Soul: ");
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getCBoysData };
