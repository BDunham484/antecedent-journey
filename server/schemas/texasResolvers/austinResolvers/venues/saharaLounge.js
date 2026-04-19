const axios = require('axios');
const cheerio = require('cheerio');
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = 'Sahara Lounge';
const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// Sahara Lounge publishes its calendar via Brown Bear Software's "Calcium Calendar" — a
// server-side-rendered PHP calendar system at brownbearsw.com. Full event HTML is present
// in the initial response, so axios + cheerio works without a browser.
//
// A browser-like User-Agent header is required; requests without one get a 403.
//
// The calendar is month-at-a-time, so we fetch 3 months (current + next 2) via the
// ?Date=YYYY-MM-01 query param to capture upcoming shows.
//
// Each month's grid includes spill-over days from the previous and next month — those
// <td> cells carry a "MonthTail" class. We skip those to avoid duplicate entries.
//
// Date comes from the PopupWindow() href embedded in each .EventLink anchor. Two formats
// appear:
//   '2026/04/22'               — slash-separated
//   '2026-04-15T00:00:00'      — ISO with timestamp
// Both are normalized to YYYY-MM-DD with a replace + split.
//
// Time comes from div.TimeLabel (when present) formatted as "8:00 PM - 9:00 PM"; we take
// the start time. When no TimeLabel exists, we match the first time-like token in the
// event text (e.g. "8p", "9:30p", "7 PM") and convert it to "H:MM AM/PM" so concertUtils'
// timeStr regex can capture it.
//
// Sahara often lists multiple acts per night separated by <br> tags, e.g.:
//   "7:30 Afro Jazz\n9p Hail Marley\n11p Sahara Allstars"
// We strip the leading time token from each line and join non-empty names with " / " so
// the first act drives the customId headliner and all acts appear in the artists field.
//
// Lines that consist solely of "Doors" and private events are skipped.
// No ticket links or prices appear on this calendar — ticket link points to the base URL.

const MONTHS_TO_FETCH = 3;
const BASE_URL = 'https://www.brownbearsw.com/cal/sahara/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const normalizePopupDate = (raw) => {
    if (!raw) return null;
    // '2026/04/22' → '2026-04-22', '2026-04-15T00:00:00' → '2026-04-15'
    return raw.replace(/\//g, '-').split('T')[0];
};

const normalizeTimeLabelText = (raw) => {
    if (!raw) return null;
    // "8:00 PM - 9:00 PM" → "8:00 PM"
    const fromRange = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]/i);
    if (fromRange) return fromRange[1];
    const plain = raw.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
    return plain ? plain[0] : null;
};

const extractTimeFromText = (text) => {
    // Matches: "8p", "9:30p", "7 PM", "12noon", "8:00 PM", "2:00 PM"
    const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|noon|a\b|p\b)/i);
    if (!m) return null;
    const hours = parseInt(m[1], 10);
    const mins = m[2] || '00';
    const raw = m[3].toLowerCase();
    if (raw === 'noon') return `12:${mins} PM`;
    const period = (raw === 'p' || raw === 'pm') ? 'PM' : 'AM';
    return `${hours}:${mins} ${period}`;
};

const stripTimePrefix = (line) => {
    return line
        .replace(/^\d{1,2}(?::\d{2})?\s*(?:am|pm|noon|a|p)\b\s*[-–]?\s*/i, '')
        .replace(/^\d{1,2}:\d{2}\s+/i, '')
        .trim();
};

const scrapeMonth = ($, events) => {
    $('div.CalEvent').each((_, el) => {
        const $el = $(el);

        if ($el.closest('td').hasClass('MonthTail')) return;

        const $link = $el.find('.EventLink a');
        const href = $link.attr('href') || '';
        const rawText = $link.text();

        if (/private\s+event/i.test(rawText)) return;

        const dateMatch = href.match(/PopupWindow\s*\([^,]+,\s*'([^']+)'/);
        const dateStr = normalizePopupDate(dateMatch ? dateMatch[1] : null);
        if (!dateStr) return;

        const timeLabelText = $el.find('.TimeLabel').text().trim();
        const timeStr = normalizeTimeLabelText(timeLabelText) || extractTimeFromText(rawText);
        const dateTime = timeStr ? `${dateStr} ${timeStr}` : dateStr;

        const html = $link.html() || '';
        const lines = html
            .split(/<br\s*\/?>/i)
            .map(l => cheerio.load(l).text().trim())
            .filter(Boolean);

        const artists = lines
            .map(l => stripTimePrefix(l))
            .filter(l => l && !/^doors?$/i.test(l))
            .join(' / ');

        if (!artists) return;

        events.push(buildConcertObj(artists, dateTime, null, BASE_URL));
    });
};

const getSaharaLoungeData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ Sahara Lounge');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const events = [];
    const now = new Date();

    for (let i = 0; i < MONTHS_TO_FETCH; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const url = `${BASE_URL}?Date=${yyyy}-${mm}-01`;

        let html;
        try {
            const response = await axios.get(url, {
                headers: { 'User-Agent': USER_AGENT },
            });
            html = response.data;
        } catch (e) {
            console.error(`❌❌❌❌ Sahara Lounge fetch failed (${yyyy}-${mm}):`, e.message);
            continue;
        }

        const $ = cheerio.load(html);
        scrapeMonth($, events);
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Sahara Lounge: ');
    // console.log('✅✅✅✅ events: ', events);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    return events;
};

module.exports = { getSaharaLoungeData };
