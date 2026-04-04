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

    d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }

    // Final fallback: strip all non-alphanumeric characters
    return dateStr.replace(/[^a-zA-Z0-9]/g, '');
};

module.exports = { normalizeDate };
