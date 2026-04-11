const austinVenues = [
    '13th Floor',
    '29th Street Ballroom',
    '3TEN Austin City Limits Live',
    'ABGB',
    "Antone's",
    'Austin City Limits Live at The Moody Theater',
    "C-Boy's Heart & Soul",
    'Chess Club',
    'Continental Club',
].sort((a, b) =>
    a.replace(/^The\s+/i, '').localeCompare(b.replace(/^The\s+/i, ''))
);

export default austinVenues;
