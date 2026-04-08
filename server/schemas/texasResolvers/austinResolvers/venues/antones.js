const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = "Antone's";

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

const getAntonesData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log("👁️👁️👁️👁️ Antone's");
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://antonesnightclub.com/calendar/');
        html = response.data;
    } catch (e) {
        console.error("❌❌❌❌ [Antone's] fetch failed:", e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('div[id^="tw-event-dialog-"]').each((_, el) => {
        const $el = $(el);

        const title = $el.find('.tw-name a').first().text().trim();
        if (!title) return;

        const dateStr = $el.find('.tw-event-date').first().text().trim();
        const timeStr = $el.find('.tw-event-time-complete').first().text().trim();
        const dateTime = dateStr && timeStr ? `${dateStr} ${timeStr}` : dateStr || null;

        const ticketLink = $el.find('.tw-buy-tix-btn').first().attr('href') || null;

        events.push(buildConcertObj(title, dateTime, null, ticketLink));
    });

    // console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Antone's: ");
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getAntonesData };
