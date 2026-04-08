const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = 'Chess Club';

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

// Parses "Tuesday April 7, 2026 @ 8:00 pm" → "April 7, 2026 8:00 pm"
const parseDateTimeText = (rawText) => {
    if (!rawText) return null;
    const stripped = rawText
        .replace(/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+/i, '')
        .trim();
    // "April 7, 2026 @ 8:00 pm"
    const atIndex = stripped.indexOf('@');
    if (atIndex === -1) return stripped;
    const datePart = stripped.slice(0, atIndex).trim();
    const timePart = stripped.slice(atIndex + 1).trim();
    return `${datePart} ${timePart}`;
};

const getChessClubData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Chess Club');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://chessclubaustin.com');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Chess Club] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    const events = [];

    $('li.recspec-events--event').each((_, el) => {
        const $el = $(el);

        const title = $el.find('h2').first().text().trim();
        if (!title) return;

        const rawDateTime = $el.find('time h3').first().text().trim();
        const dateTime = parseDateTimeText(rawDateTime);

        const ticketLink = $el.find('.information a').attr('href') || null;

        let price = null;
        $el.find('.recspec-events--event-content strong, .recspec-events--event-content b').each((_, priceEl) => {
            const text = $(priceEl).text().trim();
            if (/^\$|ALL\s*AGES/i.test(text)) {
                price = text;
                return false;
            }
        });

        events.push(buildConcertObj(title, dateTime, price, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Chess Club: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { getChessClubData };
