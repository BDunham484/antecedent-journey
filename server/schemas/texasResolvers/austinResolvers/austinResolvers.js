const { getThirteenthFloorData } = require('./venues/thirteenthFloor');
const { get29thStreetBallroomData } = require('./venues/29thStreetBallroom');

const austinResolvers = {
    getThirteenthFloorData,
    get29thStreetBallroomData,
};

module.exports = austinResolvers;
