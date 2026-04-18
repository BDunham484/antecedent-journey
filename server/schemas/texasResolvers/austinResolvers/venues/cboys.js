const axios = require('axios');
const playwright = require('playwright');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = "C-Boy's Heart & Soul";

// HOW THIS SCRAPER WORKS
//
// C-Boy's embeds a Timely calendar widget (events.timely.fun) on their site.
// The event data lives behind a private REST API that requires an x-api-key header.
// That key is not in the page source — it's injected at runtime by the Timely Angular app.
//
// Step 1 — Capture the API key with Playwright:
//   We launch a headless browser, navigate to the Timely calendar URL, and intercept
//   outgoing network requests. The first request to /api/calendars/.../events carries
//   the x-api-key header we need. Once captured, we close the browser immediately.
//
// Step 2 — Fetch all events via axios:
//   The Timely API silently returns empty data for date ranges longer than ~30 days.
//   To get a full year of shows, we split the range into 12 consecutive 30-day chunks
//   and fire all 12 requests in parallel with Promise.all. Each response has a
//   data.items object keyed by date, containing arrays of event objects. We merge all
//   chunks into a single date-keyed object, flatten to a list, filter out past events,
//   and build concert objects from each.
//
// Key fields from the Timely API response:
//   title, start_datetime, cost, cost_external_url, url, event_status

const TIMELY_CALENDAR_URL = 'https://events.timely.fun/r5bk3h1a/month';
const CALENDAR_ID = '54714969';
const SECONDS_PER_DAY = 86400;

// The Timely API rejects date ranges beyond ~30 days (returns empty data).
// The API requires an x-api-key header that the Angular app sets at runtime —
// we use Playwright only to capture that key from the first intercepted request,
// then close the browser and fetch all 12 monthly windows in parallel via axios.

const buildConcertObj = makeBuildConcertObj(venue);

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

const captureApiKey = async (launchOptions) => {
    const browser = await playwright.chromium.launch(launchOptions);
    let apiKey = null;

    try {
        // serviceWorkers: 'block' — Timely's Angular app delegates fetch to a SW,
        // which bypasses page.route(). Blocking forces Angular to call the API directly.
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();

        // Regex required — glob '**/api/calendars/**/events**' does not fire in Chromium.
        await page.route(/\/api\/calendars\/\d+\/events/, async (route) => {
            if (!apiKey) {
                const headers = await route.request().headers();
                apiKey = headers['x-api-key'] || null;
            }
            await route.continue();
        });

        // Regex required — hostname is events.timely.fun so .includes('/events') false-matches.
        const responsePromise = page.waitForResponse(
            res => /\/api\/calendars\/\d+\/events/.test(res.url()),
            { timeout: 20000 }
        );
        await page.goto(TIMELY_CALENDAR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await responsePromise;

    } finally {
        await browser.close();
    }

    return apiKey;
};

const getCBoysData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ C-Boy's Heart & Soul");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const now = new Date();
    const startOfToday = Math.floor(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    );

    const chunks = Array.from({ length: 12 }, (_, i) => ({
        start: startOfToday + i * 30 * SECONDS_PER_DAY,
        end: startOfToday + (i + 1) * 30 * SECONDS_PER_DAY,
    }));

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

    let apiKey;
    try {
        apiKey = await captureApiKey(launchOptions);
    } catch (e) {
        console.error("❌❌❌❌ [C-Boy's] Playwright error:", e.message);
        return [];
    }

    if (!apiKey) {
        console.error("❌❌❌❌ [C-Boy's] failed to capture API key");
        return [];
    }

    const axiosHeaders = {
        'accept': 'application/json, text/plain, */*',
        'referer': 'https://events.timely.fun/r5bk3h1a/month',
        'x-api-key': apiKey,
    };

    const allItemsByDate = {};

    const results = await Promise.all(chunks.map(async ({ start, end }) => {
        try {
            const url = `https://events.timely.fun/api/calendars/${CALENDAR_ID}/events?group_by_date=1&timezone=CST6CDT&view=month&per_page=1000&page=1&start_date_utc=${start}&end_date_utc=${end}`;
            const response = await axios.get(url, { headers: axiosHeaders });
            return response.data;
        } catch (e) {
            console.error("❌❌❌❌ [C-Boy's] chunk fetch failed:", e.message);
            return null;
        }
    }));

    for (const result of results) {
        if (result?.data?.items && typeof result.data.items === 'object') {
            Object.assign(allItemsByDate, result.data.items);
        }
    }

    if (Object.keys(allItemsByDate).length === 0) {
        console.error("❌❌❌❌ [C-Boy's] no events data captured");
        return [];
    }

    const eventList = Object.values(allItemsByDate).flat();
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

    // console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ C-Boy's Heart & Soul: ");
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getCBoysData };
