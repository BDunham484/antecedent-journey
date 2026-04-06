const { getThirteenthFloorData } = require('./venues/thirteenthFloor');
const { get29thStreetBallroomData } = require('./venues/29thStreetBallroom');
const { get3TENAclLiveData } = require('./venues/3TENAclLive');
const { getTheAbgbData } = require('./venues/theAbgb');
const { getAntonesData } = require('./venues/antones');
const { getMoodyTheaterData } = require('./venues/moodyTheater');
const { getCBoysData } = require('./venues/cboys');

const austinResolvers = {
    getThirteenthFloorData,
    get29thStreetBallroomData,
    get3TENAclLiveData,
    getTheAbgbData,
    getAntonesData,
    getMoodyTheaterData,
    getCBoysData,
};

module.exports = austinResolvers;
