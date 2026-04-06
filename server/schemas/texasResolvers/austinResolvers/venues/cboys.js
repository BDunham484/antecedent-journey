const axios = require('axios');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = "C-Boy's Heart & Soul";

const TIMELY_API_URL = 'https://events.timely.fun/r5bk3h1a/api/2/events?from=0&size=10000';

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

    let responseData;
    try {
        const response = await axios.get(TIMELY_API_URL);
        responseData = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [C-Boy's] fetch failed:", e.message);
        return [];
    }

    const items = responseData?.data?.items;
    if (!items || typeof items !== 'object') {
        console.error("❌❌❌❌ [C-Boy's] unexpected response shape");
        return [];
    }

    const now = new Date();
    const events = [];

    for (const dateKey of Object.keys(items)) {
        const dayEvents = items[dateKey];
        if (!Array.isArray(dayEvents)) continue;

        for (const event of dayEvents) {
            const { title, start_datetime, cost, cost_external_url, url, event_status } = event;

            if (!title || !start_datetime) continue;

            // Skip past events
            const [datePart, timePart] = start_datetime.split(' ');
            const [yr, mo, dy] = datePart.split('-').map(Number);
            const [hr, min] = timePart.split(':').map(Number);
            if (new Date(yr, mo - 1, dy, hr, min) < now) continue;

            const dateTime = formatStartDatetime(start_datetime);

            // Prefer external ticket URL; fall back to Timely event page
            const ticketLink = cost_external_url || url || null;

            // Cancelled events may have event_status !== 'confirmed' or say so in title
            const titleWithStatus = event_status && event_status !== 'confirmed'
                ? `${event_status} ${title}`
                : title;

            events.push(buildConcertObj(titleWithStatus, dateTime, cost || null, ticketLink));
        }
    }

    console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ C-Boy's Heart & Soul: ");
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getCBoysData };
