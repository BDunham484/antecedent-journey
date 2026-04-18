const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Empire Control Room & Garage';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Empire's site runs WordPress (Divi theme) with the Modern Events Calendar (MEC) plugin.
// The page is fully server-side rendered, so axios + cheerio works — no browser needed.
//
// The calendar page contains two MEC widgets:
//   1. A monthly grid view (#mec_skin_587) — covers only current + next month
//   2. A list view (#mec_skin_669) — covers several months, used here
//
// The list view renders each event as:
//   <script type="application/ld+json">{ name, startDate, offers: { url, price }, eventStatus }</script>
//   <article class="mec-event-article">
//     <span class="mec-start-date-label">Apr 18 2026</span>
//     <div class="mec-event-time ..."></div>   ← always empty in static HTML
//     <h4 class="mec-event-title"><a href="...">Title</a></h4>
//   </article>
//
// Time is not present in the static list view HTML, so times will be null.
// Price is pulled from the JSON-LD sibling immediately preceding each article.
// Event status is inferred from the event title text by makeBuildConcertObj.

const getEmpireControlRoomData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Empire Control Room & Garage');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://empireatx.com/calendar/');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Empire Control Room & Garage] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('#mec_skin_669 article.mec-event-article').each((_, el) => {
        const $el = $(el);

        const title = $el.find('h4.mec-event-title a').text().trim();
        if (!title) return;

        const dateText = $el.find('.mec-start-date-label').text().trim();
        const ticketLink = $el.find('h4.mec-event-title a').attr('href') || null;

        let price = null;
        const jsonLdScript = $el.prev('script[type="application/ld+json"]');
        if (jsonLdScript.length) {
            try {
                const jsonLd = JSON.parse(jsonLdScript.html());
                const rawPrice = jsonLd?.offers?.price;
                if (rawPrice && rawPrice !== '') {
                    price = rawPrice.replace(/^\$/, '');
                }
            } catch (_err) {
                // ignore malformed JSON-LD
            }
        }

        events.push(buildConcertObj(title, dateText, price, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Empire Control Room & Garage: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getEmpireControlRoomData };
