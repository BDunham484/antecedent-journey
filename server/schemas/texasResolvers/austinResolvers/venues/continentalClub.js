const axios = require('axios');
const playwright = require('playwright');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Continental Club';

// HOW THIS SCRAPER WORKS
//
// Continental Club uses the Timely calendar platform (events.timely.fun), the same as C-Boy's.
// The overall pattern is identical — Playwright captures x-api-key, axios fetches 12 monthly
// chunks — but three implementation details differ from C-Boy's:
//
// Step 1 — Capture credentials with Playwright:
//   Navigate directly to TIMELY_URL (the Timely calendar page with the venue filter in the URL).
//   The Angular app makes a GET to /api/calendars/.../events carrying x-api-key. We intercept
//   that request with page.route() to capture both the key and the calendar ID.
//
//   Why Chromium (not WebKit): WebKit's route handler does not fire for these requests.
//
//   Why serviceWorkers: 'block': The Timely Angular app delegates API fetches to a service
//   worker, which bypasses page.route() entirely. Blocking SWs forces Angular to make the
//   call directly so our route handler can see it.
//
//   Why venues= in TIMELY_URL: Without the venue filter in the navigation URL, the Angular
//   app only calls /filters/custom and never makes the /events request at all.
//
//   Why regex for route pattern and waitForResponse: The hostname "events.timely.fun" contains
//   the string "/events" (via "//events"), causing string .includes('/events') to false-match
//   every request to this domain.
//
// Step 2 — Fetch all events via axios:
//   Same chunked strategy as C-Boy's: 12 consecutive 30-day windows fired in parallel
//   to work around Timely's silent ~30-day range limit. The venues=678194628 filter
//   scopes results to Continental Club Austin within the shared Timely account.
//
// Key fields from the Timely API response:
//   title, start_datetime, cost (free-text string), cost_external_url, url, event_status

const VENUE_ID = '678194628';
const SECONDS_PER_DAY = 86400;
// Slug 74avt53i and VENUE_ID captured via network interception on continentalclub.com/austin.
// venues param is required in the URL — without it the Angular app skips the /events call.
const TIMELY_URL = `https://events.timely.fun/74avt53i/month?venues=${VENUE_ID}&nofilters=1`;

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

const captureApiCredentials = async (launchOptions) => {
    const browser = await playwright.chromium.launch(launchOptions);
    let apiKey = null;
    let calendarId = null;

    try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();

        await page.route(/\/api\/calendars\/\d+\/events/, async (route) => {
            if (!apiKey) {
                const headers = await route.request().headers();
                apiKey = headers['x-api-key'] || null;
                const match = route.request().url().match(/\/api\/calendars\/(\d+)\/events/);
                if (match) calendarId = match[1];
            }
            await route.continue();
        });

        const responsePromise = page.waitForResponse(
            res => /\/api\/calendars\/\d+\/events/.test(res.url()),
            { timeout: 60000 }
        );
        await page.goto(TIMELY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await responsePromise;

    } finally {
        await browser.close();
    }

    return { apiKey, calendarId };
};

const getContinentalClubData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Continental Club');
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

    let apiKey, calendarId;
    try {
        ({ apiKey, calendarId } = await captureApiCredentials(launchOptions));
    } catch (e) {
        console.error('❌❌❌❌ [Continental Club] Playwright error:', e.message);
        return [];
    }

    if (!apiKey || !calendarId) {
        console.error('❌❌❌❌ [Continental Club] failed to capture API credentials');
        return [];
    }

    const axiosHeaders = {
        'accept': 'application/json, text/plain, */*',
        'referer': `https://events.timely.fun/`,
        'x-api-key': apiKey,
    };

    const allItemsByDate = {};

    const results = await Promise.all(chunks.map(async ({ start, end }) => {
        try {
            const url = `https://events.timely.fun/api/calendars/${calendarId}/events?group_by_date=1&venues=${VENUE_ID}&timezone=America/Chicago&view=month&per_page=1000&page=1&start_date_utc=${start}&end_date_utc=${end}`;
            const response = await axios.get(url, { headers: axiosHeaders });
            return response.data;
        } catch (e) {
            console.error('❌❌❌❌ [Continental Club] chunk fetch failed:', e.message);
            return null;
        }
    }));

    for (const result of results) {
        if (result?.data?.items && typeof result.data.items === 'object') {
            Object.assign(allItemsByDate, result.data.items);
        }
    }

    if (Object.keys(allItemsByDate).length === 0) {
        console.error('❌❌❌❌ [Continental Club] no events data captured');
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
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Continental Club: Austin: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getContinentalClubData };
