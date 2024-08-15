const User = require('../../../models/User');
const Concert = require('../../../models/Concert');
const axios = require('axios');
const cheerio = require('cheerio');
const { isConstValueNode } = require('graphql');
const { HttpsProxyAgent } = require('https-proxy-agent');
const playwright = require('playwright');
require('dotenv').config();

const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        // const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);
        console.log('👁️ 13th Floor');
        // console.log('👁️ proxyAgent: ', proxyAgent);
        const launchOptions = {
            headless: false,
            proxy: {
                server: process.env.PROXY,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
            }
        };
        const browser = await playwright.chromium.launch(launchOptions);
        const page = await browser.newPage();
        await page.goto('https://the13thflooraustin.com/');
        await page.waitForTimeout(10000);

        const test = await page.$$eval('.dice_events > article', test => {
            const data = [];
            test.forEach(article => {
                const firstDivEl = article.querySelector(':scope > div');
                const secondDivEl = firstDivEl.querySelector(':scope > div');
                const thirdDivEl = secondDivEl.querySelector(':scope > div');
                const fourthDivEl = thirdDivEl.querySelector(':scope > time');
                const dateTime = fourthDivEl ? fourthDivEl.innerText : 'nada';
                
                // data.push(dateTime);
                data.push(fourthDivEl);
            })

            return data;
        });
        console.log('✅✅✅✅ test: ', test);

        // const concerts = await page.$$eval('#dice-event-list-widget > .dice-widget > dice_event-listing-container > .dice_events > article', all_concerts => {
        //     const data = [];
        //     all_concerts.forEach(concert => {
        //         console.log('✅✅✅✅ concert: ', concert);
        //         data.push(concert);
        //         // const titleEl = product.querySelector('.a-size-base-plus');
        //         // const title = titleEl ? titleEl.innerText : null;
        //         // const priceEl = product.querySelector('.a-price');
        //         // const price = priceEl ? priceEl.innerText : null;
        //         // const ratingEl = product.querySelector('.a-icon-alt');
        //         // const rating = ratingEl ? ratingEl.innerText : null;
        //         // data.push({ title, price, rating});
        //     });
        //     return data;
        // });
        // console.log('✅✅✅✅: ', concerts);
        await browser.close();

        // changelog-start
        const artists = 'testyMctesterson';
        return { artists: artists };
        // changelog-end
    },
}

module.exports = austinResolvers;