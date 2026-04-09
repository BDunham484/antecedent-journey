const axios = require('axios');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Continental Club';

// HOW THIS SCRAPER WORKS
//
// Continental Club uses the Timely calendar platform (events.timely.fun), the same as
// C-Boy's. However, unlike C-Boy's, the Timely embed here is domain-restricted — the
// x-api-key header is only injected by the Timely Angular app when it's loaded inside
// an iframe on an authorized domain (continentalclub.com). Navigating to the Timely URL
// directly via Playwright does not trigger the authenticated API call, so key capture
// via Playwright interception doesn't work for this venue.
//
// Both the calendar ID and API key were confirmed via DevTools interception on 2026-04-08
// while the page was loaded normally in a browser. Since the key is baked into the public
// embed (not session-based), it's safe to hardcode here.
//
// We skip Playwright entirely and go straight to parallel axios fetches — 12 consecutive
// 30-day chunks to work around Timely's silent ~30-day range limit. The venues=678194628
// filter scopes results to Continental Club Austin within the shared Timely account.
//
// Key fields from the Timely API response:
//   title, start_datetime, cost (free-text string), cost_external_url, url, event_status

const CALENDAR_ID = '54714987';
const VENUE_ID = '678194628';
const API_KEY = 'c6e5e0363b5925b28552de8805464c66f25ba0ce';
const TIMELY_REFERER = 'https://events.timely.fun/74avt53i/?venues=678194628&nofilters=1';
const SECONDS_PER_DAY = 86400;

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

    const axiosHeaders = {
        'accept': 'application/json, text/plain, */*',
        'referer': TIMELY_REFERER,
        'x-api-key': API_KEY,
    };

    const allItemsByDate = {};

    const results = await Promise.all(chunks.map(async ({ start, end }) => {
        try {
            const url = `https://events.timely.fun/api/calendars/${CALENDAR_ID}/events?group_by_date=1&venues=${VENUE_ID}&timezone=America/Chicago&view=month&per_page=1000&page=1&start_date_utc=${start}&end_date_utc=${end}`;
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

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Continental Club: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getContinentalClubData };
