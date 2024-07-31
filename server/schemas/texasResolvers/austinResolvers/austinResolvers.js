const User = require('../../../models/User');
const Concert = require('../../../models/Concert');
const axios = require('axios');
const cheerio = require('cheerio');

const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        console.log('👁️ 13th Floor');
        // const { data } = await axios.get('https://the13thflooraustin.com/');
        // const $ = cheerio.load(data);
        // const showData = [];
    },
}

module.exports = austinResolvers;