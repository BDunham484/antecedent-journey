const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Austin City Limits Live at The Moody Theater';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// The Moody Theater shares the exact same CMS as 3TEN (acllive.com). See 3TENAclLive.js
// for a full explanation of the scraping approach — everything is identical except:
//   - We filter to data-venue="2" instead of data-venue="3"
//   - The slug time parser handles half-hours (e.g. "at-7-30-pm" → "7:30 PM"), which
//     3TEN doesn't need but The Moody does for some shows
//
// Server-side rendered — axios + cheerio, no browser needed.

// Parses time from event slug, e.g. "2026-04-08-the-format-at-8-pm" → "8:00 PM"
// Also handles half-hours: "2026-04-30-maren-morris-at-7-30-pm" → "7:30 PM"
const parseTimeFromSlug = (slug) => {
    const match = slug.match(/at-(\d+)(?:-(\d+))?-(am|pm)$/i);
    if (!match) return null;
    const minutes = match[2] ? match[2].padEnd(2, '0') : '00';
    return `${match[1]}:${minutes} ${match[3].toUpperCase()}`;
};

const getMoodyTheaterData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Austin City Limits Live at The Moody Theater');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.acllive.com/events/venue/acl-live-at-the-moody-theater');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [Austin City Limits Live at The Moody Theater] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);
    const events = [];

    $('[data-venue="2"].eventItem').each((_, el) => {
        const $el = $(el);

        // Title
        const title = $el.find('h3.title a').first().text().trim();
        if (!title) return;

        // Support acts from tagline
        const tagline = $el.find('h4.tagline').first().text().trim();
        const artists = tagline ? `${title} ${tagline}` : title;

        // Date: first day of potentially multi-day events
        const month = $el.find('.m-date__month').first().text().trim();
        const day = $el.find('.m-date__day').first().text().trim();
        const year = $el.find('.m-date__year').first().text().replace(',', '').trim();
        const dateStr = month && day && year ? `${month} ${day}, ${year}` : null;

        // Time: parse from event link slug
        const linkHref = $el.find('h3.title a').first().attr('href') || '';
        const slug = linkHref.split('/').pop();
        const time = parseTimeFromSlug(slug);

        const dateTime = dateStr && time ? `${dateStr} ${time}` : dateStr;

        // Ticket link
        const relativeLink = $el.find('.buttons a.tickets').first().attr('href');
        const ticketLink = relativeLink ? `https://www.acllive.com${relativeLink}` : null;

        // Status
        const buttonClasses = $el.find('.buttons a.tickets').first().attr('class') || '';
        let statusOverride = null;
        if (/soldout/i.test(buttonClasses) || /sold.?out/i.test(title)) statusOverride = 'sold out';
        if (/cancelled/i.test(buttonClasses) || /cancelled/i.test(title)) statusOverride = 'cancelled';

        const concertObj = buildConcertObj(artists, dateTime, null, ticketLink);
        if (statusOverride) concertObj.status = statusOverride;

        events.push(concertObj);
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Austin City Limits Live at The Moody Theater: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getMoodyTheaterData };
