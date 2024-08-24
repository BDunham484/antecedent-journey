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
        console.log('🎃 launch options: ', launchOptions);
        const browser = await playwright.webkit.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://the13thflooraustin.com/');
        await page.pause();
        await page.waitForTimeout(5000);

        const concerts = await page.$$eval('article', concert => {
            const data = [];
            concert.forEach(article => {
                const dateTimeEl = article.querySelector('time');
                const dateTime = dateTimeEl ? dateTimeEl.innerText : 'noDice';
                const artistsEl = dateTimeEl.nextSibling;
                const artists = artistsEl ? artistsEl.innerText : 'noArtists'
                const priceEl = article.querySelector('.dice_price');
                const price = priceEl ? priceEl.innerText : 'noPrice';
                // const secondDivEl = firstDivEl.querySelector(':scope > div');
                
                data.push({
                    dateTime: dateTime,
                    artists: artists,
                    price: price,
                });
            })

            return data;
        });
        console.log('✅✅✅✅ concerts: ', concerts);

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
        await context.close();
        await browser.close();

        // changelog-start
        const artists = 'testyMctesterson';
        return { artists: artists };
        // changelog-end
    },
}

module.exports = austinResolvers;