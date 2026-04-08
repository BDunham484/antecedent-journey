const axios = require('axios');
const playwright = require('playwright');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = "C-Boy's Heart & Soul";

const TIMELY_CALENDAR_URL = 'https://events.timely.fun/r5bk3h1a/';
const CALENDAR_ID = '54714969';
const SECONDS_PER_DAY = 86400;

// The Timely API rejects date ranges beyond ~30 days (returns empty data).
// The API requires an x-api-key header that the Angular app sets at runtime —
// we use Playwright only to capture that key from the first intercepted request,
// then close the browser and fetch all 12 monthly windows in parallel via axios.

const buildConcertObj = (artists, dateTime, price, ticketLink) => {
    const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
    const status = statusMatch ? statusMatch[0].toLowerCase() : null;
    const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;
    const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
    const customId = headliner && dateTime && venue ? buildCustomId(headliner, dateTime, venue) : null;
    const dateStr = dateTime
        ? (() => {
            const d = new Date(dateTime.replace(/\s+\d{1,2}:\d{2}.*$/, '').trim());
            return isNaN(d.getTime()) ? dateTime : d.toDateString();
        })()
        : null;
    const timeStr = dateTime ? (dateTime.match(/\d{1,2}:\d{2}\s*(?:am|pm)?/i)?.[0]?.trim() ?? null) : null;

    return {
        customId,
        artists: cleanArtists,
        date: dateStr,
        times: timeStr,
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

const captureApiKey = async (launchOptions) => {
    const browser = await playwright.webkit.launch(launchOptions);
    let apiKey = null;

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.route('**/api/calendars/**/events**', async (route) => {
            if (!apiKey) {
                const headers = await route.request().headers();
                apiKey = headers['x-api-key'] || null;
            }
            await route.continue();
        });

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/api/calendars/') && res.url().includes('/events'),
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

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ C-Boy's Heart & Soul: ");
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getCBoysData };
