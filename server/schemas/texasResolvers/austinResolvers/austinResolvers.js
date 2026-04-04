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
        console.log('👁️ 13th Floor');
        const launchOptions = {
            headless: false,
            proxy: {
                server: process.env.PROXY,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
            }
        };
        const browser = await playwright.webkit.launch(launchOptions);
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://the13thflooraustin.com/');
        await page.waitForSelector('article');

        const concerts = await page.$$eval('article', articles => {
            const data = [];
            articles.forEach(article => {
                const dateTimeEl = article.querySelector('time');
                const dateTime = dateTimeEl ? dateTimeEl.innerText : null;
                const artistsEl = dateTimeEl ? dateTimeEl.nextSibling : null;
                const artists = artistsEl ? artistsEl.innerText : null;
                const priceEl = article.querySelector('.dice_price');
                const price = priceEl ? priceEl.innerText : null;

                data.push({
                    dateTime,
                    artists,
                    price,
                });
            });
            return data;
        });

        console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 13th Floor: ');
        console.log('✅✅✅✅ concerts: ', concerts);
        console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
        console.log(' ');

        await context.close();
        await browser.close();

        const venue = 'The 13th Floor';

        return concerts.map(concert => {
            const { dateTime, artists, price } = concert;

            const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
            const status = statusMatch ? statusMatch[0].toLowerCase() : null;
            const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;

            const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
            const customId = headliner && dateTime && venue
                ? headliner.split(/[,.\u2019'\s]+/).join('') + dateTime.split(/[,.\u2019'\s]+/).join('') + venue.split(/[,.\u2019'\s]+/).join('')
                : null;

            return {
                customId,
                artists: cleanArtists,
                date: dateTime,
                times: dateTime,
                venue,
                ticketPrice: price,
                status,
            };
        });
    },
}

module.exports = austinResolvers;
