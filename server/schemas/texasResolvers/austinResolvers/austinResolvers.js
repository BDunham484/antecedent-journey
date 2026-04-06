const { getThirteenthFloorData } = require('./venues/thirteenthFloor');
const { get29thStreetBallroomData } = require('./venues/29thStreetBallroom');
const { get3TENAclLiveData } = require('./venues/3TENAclLive');
const { getTheAbgbData } = require('./venues/theAbgb');
const { getAntonesData } = require('./venues/antones');

const austinResolvers = {
    getThirteenthFloorData,
    get29thStreetBallroomData,
    get3TENAclLiveData,
    getTheAbgbData,
    getAntonesData,
};

module.exports = austinResolvers;
