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

const browsers = [chromium, firefox, webkit];
const randoBrowser = browsers[Math.floor(Math.random() * browsers.length)];

const ports = ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010'];
const randoPort = ports[Math.floor(Math.random() * ports.length)];

const proxy = {
    server: `gate.smartproxy.com:${randoPort}`,
    // eslint-disable-next-line no-undef
    username: process.env.PROXY_USERNAME,
    // eslint-disable-next-line no-undef
    password: process.env.PROXY_PASSWORD,
}

const launchOptions = {
    headless: false,
    proxy: proxy,
};



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
        for (let i = 0; i <= 10; i++) {
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
                const artistsEl = eventItem.querySelector('.title a');
                const artistsLink = artistsEl ? artistsEl.getAttribute('href') : 'no_link';                
                // const formattedDate = new Date(Date.parse(dateTime)).toDateString();
                data.push(artistsLink);
            })

            return data;
        });

        const concerts = [];
        for await (const url of urls) {
            const page = await context.newPage();
            await page.goto(url);
            await page.waitForTimeout(5000);

            // const headlinerEl = page.locator('h1');
            // const headliner = headlinerEl ? await headlinerEl.innerText() : undefined;
            // // throws error.  need to conditionally look for element/class
            // const supportEl = page.locator('h2').and(page.locator('.tagline'));
            // const support = supportEl ? await supportEl.innerText() : undefined;

            const testEl = page.locator('.event_heading');
            const test = testEl ? await testEl.allInnerTexts() : undefined;

            // changelog-start
            const isVisibleTest = page.locator('.tickets').isVisible();
            // const isVisibleTest = expect(page.locator('.tickets')).toBeVisible();
            let ticketLinkEl = undefined;
            let ticketLink = undefined;
            if (isVisibleTest) {
                ticketLinkEl = page.locator('.tickets').last();
                ticketLink = ticketLinkEl ? await ticketLinkEl.getAttribute('href') : undefined;
            }
            // changelog-end
            // const ticketLinkEl = page.locator('.tickets').last();
            // const ticketLink = ticketLinkEl ? await ticketLinkEl.getAttribute('href') : undefined;

            const dateEl = page.locator('.m-date__singleDate').first();
            const date = dateEl ? await dateEl.innerText() : undefined;

            const priceEl = page.locator('.sidebar_ticket_prices').locator('span').last();
            const price = priceEl ? await priceEl.innerText() : undefined;

            // const timesEl = page.locator('m-date__hour').first();
            // const times = timesEl ? timesEl.innerText(5000) : undefined;
            // const artists = (headliner ? headliner : '') + (support ? support : '');

            const concert = {
                artists: test[0],
                ticketLink: ticketLink,
                date: date,
                ticketPrice: price,
                times: date.split(' ')[date.length -1],
            };
            console.log('🎃🎃🎃🎃 testEl: ', testEl);
            console.log('🎃🎃🎃🎃 isVisibleTest: ', isVisibleTest);
            // console.log('🎃🎃🎃🎃 support: ', support);
            console.log('🎃🎃🎃🎃 concert: ', concert);
            // changelog-start
            if (concert) {
                // if (Object.values(concert).length === 5) {
                // changelog-end
                concerts.push(concert);
                if (concerts.length < urls.length) {
                    continue;
                } else if (concerts.length === urls.length) {
                    sleep(5000);
                    break;
                };
            };
        };
        console.log('✅✅✅✅ urls: ', urls);
        console.log('✅✅✅✅ concerts: ', concerts);
        console.log('✅✅✅✅ urls.length: ', urls.length);
        console.log('✅✅✅✅ concerts.length: ', concerts.length);
        if (concerts.length === urls.length) {
            await context.close();
            await browser.close();
        };
        

        return concerts;
        // return { artists: 'yourFace_myButt' };
    },
}

module.exports = austinResolvers;