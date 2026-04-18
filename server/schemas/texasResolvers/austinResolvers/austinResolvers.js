const { getThirteenthFloorData } = require('./venues/thirteenthFloor');
const { get29thStreetBallroomData } = require('./venues/29thStreetBallroom');
const { get3TENAclLiveData } = require('./venues/3TENAclLive');
const { getTheAbgbData } = require('./venues/theAbgb');
const { getAntonesData } = require('./venues/antones');
const { getMoodyTheaterData } = require('./venues/moodyTheater');
const { getCBoysData } = require('./venues/cboys');
const { getChessClubData } = require('./venues/chessClub');
const { getContinentalClubData } = require('./venues/continentalClub');
const { getDrinksBackyardData } = require('./venues/drinksBackyard');

const austinResolvers = {
    getThirteenthFloorData,
    get29thStreetBallroomData,
    get3TENAclLiveData,
    getTheAbgbData,
    getAntonesData,
    getMoodyTheaterData,
    getCBoysData,
    getChessClubData,
    getContinentalClubData,
    getDrinksBackyardData,
};

module.exports = austinResolvers;
