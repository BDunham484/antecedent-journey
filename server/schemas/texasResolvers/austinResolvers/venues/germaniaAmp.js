const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Germania Insurance Amphitheater';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Germania Amp's /events page renders server-side — axios + cheerio works.
//
// Each event card is a .card.events div containing an <a> child:
//   <div class="card events">
//     <a href="/events/slug">
//       <div class="card-content">
//         <div class="media-left"><span>DD</span>Month<br><em>YYYY</em></div>
//         <div class="media-content"><h2 class="title">Artist</h2></div>
//       </div>
//     </a>
//   </div>
//
// .text() on .media-left collapses to "DDMonthYYYY" (no spaces), so the
// date regex uses \s* (zero-or-more) rather than \s+ (one-or-more).
//
// Price is not present in the listing — passed as null.
// Ticket links go to the venue's own per-event pages (e.g. /events/kid-cudi),
// which redirect to Ticketmaster for purchase.

const getGermaniaAmpData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Germania Insurance Amphitheater');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.germaniaamp.com/events');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Germania Insurance Amphitheater] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('.upcoming-shows .card.events:not(.add)').each((_, el) => {
        const $el = $(el);

        const title = $el.find('.media-content h2.title').text().trim();
        if (!title) return;

        const ticketLink = $el.children('a').first().attr('href') || null;

        const rawDateText = $el.find('.media-left').text().replace(/\s+/g, ' ').trim();
        const dateMatch = rawDateText.match(/(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})/);
        if (!dateMatch) return;

        const [, day, month, year] = dateMatch;
        const dateStr = `${month} ${day}, ${year}`;

        events.push(buildConcertObj(title, dateStr, null, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Germania Insurance Amphitheater: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getGermaniaAmpData };
