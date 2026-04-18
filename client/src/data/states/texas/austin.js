const austinVenues = [
    { name: '13th Floor',                                   key: 'getThirteenthFloorData' },
    { name: '29th Street Ballroom',                         key: 'get29thStreetBallroomData' },
    { name: '3TEN Austin City Limits Live',                 key: 'get3TENAclLiveData' },
    { name: 'ABGB',                                         key: 'getTheAbgbData' },
    { name: "Antone's",                                     key: 'getAntonesData' },
    { name: 'Austin City Limits Live at The Moody Theater', key: 'getMoodyTheaterData' },
    { name: "C-Boy's Heart & Soul",                         key: 'getCBoysData' },
    { name: 'Chess Club',                                   key: 'getChessClubData' },
    { name: 'Continental Club',                             key: 'getContinentalClubData' },
    { name: 'Drinks Backyard',                              key: 'getDrinksBackyardData' },
    { name: 'Elephant Room',                                key: 'getElephantRoomData' },
].sort((a, b) =>
    a.name.replace(/^The\s+/i, '').localeCompare(b.name.replace(/^The\s+/i, ''))
);

export default austinVenues;
