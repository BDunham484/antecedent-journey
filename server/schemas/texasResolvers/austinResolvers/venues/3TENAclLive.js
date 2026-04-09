const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = '3TEN Austin City Limits Live';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// 3TEN and The Moody Theater share the same custom CMS at acllive.com. The page is
// server-side rendered, so axios + cheerio works fine — no browser needed.
//
// Both venues' events appear on the same page (acllive.com/events/venue/...), but each
// event element carries a data-venue attribute identifying which room it belongs to.
// We filter to data-venue="3" (3TEN) and ignore everything else.
//
// Within each .eventItem:
//   - h3.title a                  → headline artist
//   - h4.tagline                  → support acts (appended to title if present)
//   - .m-date__month/day/year     → date components, assembled into "Month DD, YYYY"
//   - h3.title a [href]           → event URL slug, from which we parse the start time
//   - .buttons a.tickets [href]   → relative ticket link, prepended with the domain
//   - .buttons a.tickets [class]  → checked for soldout/cancelled keywords
//
// Time is not in the DOM as a readable string — it's encoded in the event URL slug
// (e.g. "2026-04-10-earlybirds-club-at-6-pm"). parseTimeFromSlug() extracts it.

// Parses time from event slug, e.g. "2026-04-10-earlybirds-club-at-6-pm" → "6:00 PM"
const parseTimeFromSlug = (slug) => {
    const match = slug.match(/at-(\d+)-(am|pm)$/i);
    if (!match) return null;
    return `${match[1]}:00 ${match[2].toUpperCase()}`;
};

const get3TENAclLiveData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ 3TEN Austin City Limits Live');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    let html;
    try {
        const response = await axios.get('https://www.acllive.com/events/venue/acl-live-at-3ten');
        html = response.data;
    } catch (e) {
        console.error('❌❌❌❌ [3TEN Austin City Limits Live] fetch failed:', e.message);
        return [];
    }

    const $ = cheerio.load(html);

    const events = [];

    // Scrape all event items for venue 3 (3TEN), including those in the hidden "load more" container
    $('[data-venue="3"].eventItem').each((_, el) => {
        const $el = $(el);

        // Title
        const title = $el.find('h3.title a').first().text().trim();
        if (!title) return;

        // Support acts from tagline (e.g. "with Lostboycrow")
        const tagline = $el.find('h4.tagline').first().text().trim();
        const artists = tagline ? `${title} ${tagline}` : title;

        // Date: combine month + day + year spans
        const month = $el.find('.m-date__month').first().text().trim();
        const day = $el.find('.m-date__day').first().text().trim();
        const year = $el.find('.m-date__year').first().text().replace(',', '').trim();
        const dateStr = month && day && year ? `${month} ${day}, ${year}` : null;

        // Time: parse from the event link slug
        const linkHref = $el.find('h3.title a').first().attr('href') || '';
        const slug = linkHref.split('/').pop();
        const time = parseTimeFromSlug(slug);

        const dateTime = dateStr && time ? `${dateStr} ${time}` : dateStr;

        // Ticket link — relative path, prepend domain
        const relativeLink = $el.find('.buttons a.tickets').first().attr('href');
        const ticketLink = relativeLink ? `https://www.acllive.com${relativeLink}` : null;

        // Status — check button class for soldout/cancelled indicators
        const buttonClasses = $el.find('.buttons a.tickets').first().attr('class') || '';
        let status = null;
        if (/soldout/i.test(buttonClasses) || /sold.?out/i.test(title)) status = 'sold out';
        if (/cancelled/i.test(buttonClasses) || /cancelled/i.test(title)) status = 'cancelled';

        events.push(buildConcertObj(artists, dateTime, null, ticketLink));
    });

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 3TEN Austin City Limits Live: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { get3TENAclLiveData };
