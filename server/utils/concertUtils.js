/**
 * Normalizes any date string to YYYYMMDD format for consistent customId generation.
 * Handles ISO 8601 (DICE), plain text with ordinals (WP show-wrapper), and Chronicle date strings.
 */
const normalizeDate = (dateStr) => {
    if (!dateStr) return '';

    // Try direct parse — works for ISO 8601 (e.g. "2026-04-05T01:00:00Z")
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }

    // Clean up text date formats (e.g. "Thu Sep 25th 10:00 pm", "Sat 4 Apr ― 8:00pm")
    const cleaned = dateStr
        .replace(/(\d+)(st|nd|rd|th)/gi, '$1')  // strip ordinal suffixes
        .replace(/[―–—]/g, ' ')                   // replace em/en dashes with space
        .replace(/\s+/g, ' ')
        .trim();

    // If the string has no 4-digit year, append the current year before parsing
    const hasYear = /\d{4}/.test(cleaned);
    const toParse = hasYear ? cleaned : `${cleaned} ${new Date().getFullYear()}`;

    d = new Date(toParse);
    if (!isNaN(d.getTime())) {
        // If the resolved date is in the past by more than a day, try next year instead
        if (!hasYear && d < new Date(Date.now() - 86400000)) {
            const next = new Date(`${cleaned} ${new Date().getFullYear() + 1}`);
            if (!isNaN(next.getTime())) d = next;
        }
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }

    // Final fallback: strip all non-alphanumeric characters
    return dateStr.replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Builds a customId object from headliner, date, and venue.
 * Returns { headliner, date, venue } with normalized values.
 */
const buildCustomId = (headliner, date, venue) => ({
    headliner: headliner ? headliner.split(/[,.\u2019'\s]+/).join('') : '',
    date: normalizeDate(date),
    venue: venue ? venue.split(/[,.\u2019'\s]+/).join('') : ''
});

/**
 * Factory that returns a buildConcertObj function bound to a specific venue.
 * Parses dateTime into separate date (ISO 8601 string, for DB storage) and
 * time (for display) fields.
 *
 * Usage: const buildConcertObj = makeBuildConcertObj(venue);
 */
const makeBuildConcertObj = (venue) => (artists, dateTime, price, ticketLink) => {
    const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
    const status = statusMatch ? statusMatch[0].toLowerCase() : null;
    const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;
    const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
    const customId = headliner && dateTime && venue ? buildCustomId(headliner, dateTime, venue) : null;
    const dateStr = dateTime
        ? (() => {
            const d = new Date(dateTime.replace(/\s+\d{1,2}:\d{2}.*$/, '').trim());
            return isNaN(d.getTime()) ? dateTime : d.toISOString();
        })()
        : null;
    const timeStr = dateTime ? (dateTime.match(/\d{1,2}:\d{2}\s*(?:am|pm)?/i)?.[0]?.trim() ?? null) : null;

    return {
        customId,
        artists: cleanArtists,
        date: dateStr,
        times: timeStr,
        venue,
        ticketPrice: price,
        ticketLink: ticketLink || null,
        status,
    };
};

module.exports = { normalizeDate, buildCustomId, makeBuildConcertObj };
