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
    { name: "Emo's",                                        key: 'getEmosData' },
    { name: 'Empire Control Room & Garage',                 key: 'getEmpireControlRoomData' },
    { name: 'Flamingo Cantina',                             key: 'getFlamingoCantinaData' },
    { name: 'Germania Insurance Amphitheater',              key: 'getGermaniaAmpData' },
    { name: "Güero's Taco Bar",                             key: 'getGuerosData' },
    { name: 'Hole in the Wall',                             key: 'getHoleInTheWallData' },
    { name: 'Hotel Vegas',                                  key: 'getHotelVegasData' },
    { name: 'Kingdom',                                      key: 'getKingdomData' },
    { name: 'Mohawk',                                       key: 'getMohawkData' },
    { name: 'Moody Amphitheater',                           key: 'getMoodyAmphitheaterData' },
].sort((a, b) =>
    a.name.replace(/^The\s+/i, '').localeCompare(b.name.replace(/^The\s+/i, ''))
);

export default austinVenues;
