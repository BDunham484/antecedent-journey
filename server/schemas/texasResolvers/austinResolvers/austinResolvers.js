const User = require('../../../models/User');
const Concert = require('../../../models/Concert');
const axios = require('axios');
const cheerio = require('cheerio');
const { isConstValueNode } = require('graphql');

const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        console.log('👁️ 13th Floor');
        // const testResult = await axios.get(`https://the13thflooraustin.com/`);
        try {
            const { data } = axios.get(`https://the13thflooraustin.com/`)
            console.log('👁️👁️👁️👁️ data: ', data);
        } catch (error) {
            console.log('👁️👁️👁️👁️ error: ', error);
        }
            
        // console.log('👁️👁️👁️👁️ testResult: ', testResult);
        // const $ = cheerio.load(data);
        // const showData = [];

        // $('article', data).each((index, value) => {
        //     console.log('🩻🩻🩻🩻🩻🩻🩻🩻🩻🩻🩻🩻🩻🩻');
        //     console.log('🩻🩻🩻🩻 index: ', index);
        //     console.log('🩻🩻🩻🩻 value: ', value);
        // })

        // changelog-start
        const artists = 'testyMctesterson';
        return { artists: artists };
        // changelog-end
    },
}

module.exports = austinResolvers;