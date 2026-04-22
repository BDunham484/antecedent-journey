const axios = require('axios');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = 'Scoot Inn';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Scoot Inn is a Live Nation venue. Their website (scootinnaustin.com) is a Next.js app
// where the /shows list view is server-side rendered and embeds all upcoming event data
// inline in the HTML — a single fetch returns every upcoming show.
//
// The data lives inside a self.__next_f.push() call in a <script> tag — Next.js's
// React Server Components flight protocol. The payload is a JSON-encoded string
// containing a nested object with a "data" array. In the raw HTML, all JSON quotes
// are escaped as \" (literal backslash + double-quote), so standard DOM parsing
// won't help; we extract fields directly via string search on the raw HTML.
//
// Each event object in the "data" array has a "type" field. We filter to "REGULAR"
// to exclude upsell entries ("Club Access", "Premier") that share the same array.
//
// Fields used:
//   name             — event title (may contain \uXXXX Unicode escapes)
//   start_date_local — YYYY-MM-DD in local Austin time
//   start_time_local — HH:MM:SS in local Austin time
//   url              — Ticketmaster ticket link
//   status_code      — "onsale" | "rescheduled" | "offsale" | "cancelled"
//
// No price data is available in the embedded JSON; price is passed as null.

function extractField(html, fromPos, fieldName) {
    const key = '\\"' + fieldName + '\\":\\"';
    const keyIdx = html.indexOf(key, fromPos);
    if (keyIdx === -1 || keyIdx - fromPos > 3000) return null;
    const valStart = keyIdx + key.length;
    const valEnd = html.indexOf('\\"', valStart);
    if (valEnd === -1) return null;
    return html.slice(valStart, valEnd);
}

function decodeUnicode(str) {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

const getScootInnData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Scoot Inn');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.scootinnaustin.com/shows', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ Scoot Inn fetch failed:', e.message);
        return [];
    }

    const dataMarker = '\\"data\\":[{\\"event_data_type\\"';
    const eventMarker = '\\"event_data_type\\":\\"discovery\\"';

    const dataStart = html.indexOf(dataMarker);
    if (dataStart === -1) {
        console.error('❌❌❌❌ Scoot Inn: data array not found in HTML');
        return [];
    }

    const events = [];
    let pos = dataStart;

    while (true) {
        const ePos = html.indexOf(eventMarker, pos);
        if (ePos === -1) break;

        const type = extractField(html, ePos, 'type');
        if (type === 'REGULAR') {
            const rawName = extractField(html, ePos, 'name');
            const startDate = extractField(html, ePos, 'start_date_local');
            const startTime = extractField(html, ePos, 'start_time_local');
            const ticketUrl = extractField(html, ePos, 'url');
            const statusCode = extractField(html, ePos, 'status_code');

            if (rawName && startDate && startTime) {
                const name = decodeUnicode(rawName);
                const artists = statusCode === 'cancelled' ? `CANCELLED: ${name}` : name;
                const dateTime = `${startDate}T${startTime}`;
                events.push(buildConcertObj(artists, dateTime, null, ticketUrl || null));
            }
        }

        pos = ePos + eventMarker.length;
    }

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Scoot Inn: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getScootInnData };
