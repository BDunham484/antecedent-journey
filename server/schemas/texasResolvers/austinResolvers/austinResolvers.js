// const User = require('../../../models/User');
// const Concert = require('../../../models/Concert');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const { isConstValueNode } = require('graphql');
// const { HttpsProxyAgent } = require('https-proxy-agent');
// const playwright = require('playwright');
const { chromium, firefox, webkit } = require('playwright');
require('dotenv').config();
const { sleep } = require('../../../utils/helpers');
// const helpers = require('../../../utils/helpers');

const proxy = {
    // eslint-disable-next-line no-undef
    server: process.env.PROXY,
    // eslint-disable-next-line no-undef
    username: process.env.PROXY_USERNAME,
    // eslint-disable-next-line no-undef
    password: process.env.PROXY_PASSWORD,
}

const launchOptions = {
    headless: false,
    proxy: proxy,
};

const browsers = [chromium, firefox, webkit];
const randoBrowser = browsers[Math.floor(Math.random() * browsers.length)];

const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        console.log('👁️ 13th Floor');
        const browser = await randoBrowser.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://the13thflooraustin.com/');
        await page.pause();
        await page.waitForTimeout(5000);

        const concerts = await page.$$eval('article', concert => {
            const data = [];
            const months = []; 
            concert.forEach(article => {
                // const dateTimeEl = article.querySelector('time');
                // const dateTime = dateTimeEl ? dateTimeEl.innerText : 'noDice';
                // const artistsEl = dateTimeEl.nextSibling;
                // const artists = artistsEl ? artistsEl.innerText : 'noArtists'
                // const priceEl = article.querySelector('.dice_price');
                // const price = priceEl ? priceEl.innerText : 'noPrice';
                // changelog-start
                const concertDataEl = article.querySelector('script');
                const concertData = concertDataEl ? JSON.parse(concertDataEl.innerText) : 'no_dice';
                // changelog-end

                // Format data
                // const dateTimeData = dateTime.split();
                // const dayOfWeek = dateTimeData[0];
                // const day = dateTimeData[1];
                // const month = dateTimeData[2];
                // months.push(month);
                // const time = dateTimeData[dateTimeData.length - 1];
                
                data.push({
                    artists: concertData[0].name,
                    description: concertData[0].description,
                    date: concertData[0].startDate,
                    times: concertData[0].doorTime,
                    venue: concertData[0].location.name,
                    address: concertData[0].location.address,
                    ticketLink: concertData[0].offers[0].url,
                    price: concertData[0].offers[0].price,
                    // changelog-start
                    test: concertData,
                    // changelog-end
                });
            });

            // const years = helpers.getYears(months);
            const getYears = (months) => {
                const currentYear = new Date().getFullYear();
                const nextYear = new Date().getFullYear() + 1;
                const janIndex = months?.indexOf("Jan");
                const years = months.map((_, monthIndex) => {
                    if (monthIndex < janIndex) {
                        return currentYear;
                    } else if (monthIndex >= janIndex) {
                        return nextYear;
                    } else {
                        return currentYear;
                    }
                });
        
                return years;
            };
            const years = getYears(months);
            console.log('✅✅✅✅ years: ', years);

            return data;
        });
        console.log('✅✅✅✅ concerts: ', concerts);

        await context.close();
        await browser.close();
        // changelog-start
        return concerts;
        // const artists = 'testyMctesterson';
        // return { artists: artists };
        // changelog-end
    },
    // ACL Live
    getThreeTenAustinCityLimitsLiveData: async () => {
        console.log('👁️ 3TEN Austin City Limits Live');
        console.log('👁️ launchOptions: ', launchOptions.proxy.server);
        const browser = await randoBrowser.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://www.acllive.com/events/venue/acl-live-at-3ten');
        // await sleep(5000);
        // await page.pause();
        await page.waitForTimeout(6000);

        // changelog-start
        for (let i = 0; i <= 5; i++) {
            page.keyboard.press('End');
            sleep(1000);
        };
        // changelog-end
        // TODO: will change to loop through all .evenTime and just push artistsLink to array
        // then will loop through link array, open a page for each one, get show data for each link
        // then push/return concerts
        const urls = await page.$$eval('.eventItem', concert => {
            const data = [];
            concert.forEach(async eventItem => {
                // const dateTimeEl = eventItem.querySelector('.m-date__singleDate');
                // const dateTime = dateTimeEl ? dateTimeEl.innerText : 'no_dice';

                const artistsEl = eventItem.querySelector('.title a');
                // const artists = artistsEl ? artistsEl.innerText.trim() : 'no_artist';
                const artistsLink = artistsEl ? artistsEl.getAttribute('href') : 'no_link';
                
                // const formattedDate = new Date(Date.parse(dateTime)).toDateString();

                data.push(artistsLink);
            })

            return data;
        });
        // const concerts = await Promise.all(urls.map(async url => {
        //     // const data = [];
        //     // const fetchText = url.split('/')[url.length - 1];
        //     // console.log('✅✅✅✅ fetchText: ', fetchText);
        //     // const pagePromise = context.waitForEvent('page');
        //     const page = await context.newPage();
        //     await page.goto(url);
        //     // const showPage = await pagePromise;
        //     await page.pause();
        //     await page.waitForTimeout(5000);

        //     const artistsEl = page.locator('.title');
        //     const artists = artistsEl ? artistsEl.innerText : 'no_artists';

        //     const concert = {
        //         artists: artists,
        //     }

        //     return concert;
        // }));

        const concerts = [];
        for await (const url of urls) {
            const page = await context.newPage();
            await page.goto(url);
            await page.waitForTimeout(5000);

            const artistsEl = page.locator('h1 .title');
            const artists = artistsEl ? artistsEl.innerText(5000) : undefined;

            const concert = {
                artists: artists,
            };

            if (Object.values(concert)) {
                concerts.push(concert);
                continue;
            };
        };
        // if (concerts.length === urls.length) {
        console.log('✅✅✅✅ concerts: ', concerts);
        // };

        await context.close();
        await browser.close();

        // return concerts;
        return { artists: 'yourFace_myButt' };
    },
}

module.exports = austinResolvers;