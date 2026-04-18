const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = "Emo's";
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Emo's Austin uses a Next.js + Live Nation / Chakra UI stack. Despite the
// heavy client-side framework, the page is server-side rendered — all event
// data is present in the raw HTML response, so axios + cheerio is sufficient.
//
// Each event is represented by a <script type="application/ld+json"> block
// containing a single MusicEvent object with stable Schema.org fields.
// Chakra UI utility class names are intentionally avoided because they are
// hash-based and change on each build; JSON-LD is the only reliable selector.
//
// The page embeds the same events twice (once in the main shows grid, once in
// a featured-shows carousel), so we deduplicate by ticket URL before building
// concert objects.
//
// Price is not present in the HTML — it is loaded client-side from the
// Ticketmaster API after hydration. The price field is set to null.
//
// eventStatus: the JSON-LD uses the full Schema.org URI
// ("https://schema.org/EventCancelled") rather than just "EventCancelled",
// so we strip it down to the bare status string before passing to buildConcertObj.

const url = 'https://www.emosaustin.com/shows';

async function getEmosData() {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Emo's");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get(url);
        html = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [Emo's] fetch failed:", e.message);
        return [];
    }

    const $ = cheerio.load(html);

    const seen = new Set();
    const events = [];

    $('script[type="application/ld+json"]').each((_, el) => {
        let json;
        try {
            json = JSON.parse($(el).html());
        } catch {
            return;
        }

        if (json['@type'] !== 'MusicEvent') return;

        const ticketLink = json.url || null;
        if (ticketLink && seen.has(ticketLink)) return;
        if (ticketLink) seen.add(ticketLink);

        const artists = json.name || null;
        const dateTime = json.startDate || null;
        const price = null;

        const rawStatus = json.eventStatus || null;
        const eventStatus = rawStatus
            ? rawStatus.replace('https://schema.org/', '')
            : null;

        const concert = buildConcertObj(artists, dateTime, price, ticketLink, eventStatus);
        if (concert) events.push(concert);
    });

    // console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Emo's: ");
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
}

module.exports = { getEmosData };
