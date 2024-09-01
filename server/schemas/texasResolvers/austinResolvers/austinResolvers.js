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

const ports = ['10001', '10002', '10003', '10004', '10006', '10007', '10008', '10009', '10010'];
// const ports = ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010'];
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
        await page.waitForTimeout(6000);

        // Scroll to bottom of page
        for (let i = 0; i <= 5; i++) {
            page.keyboard.press('End');
            sleep(1000);
        };
        
        // Get all event urls
        const urls = await page.$$eval('.eventItem', concert => {
            const data = [];
            concert.forEach(async eventItem => {
                const artistsEl = eventItem.querySelector('.thumb a');
                const artistsLink = artistsEl ? artistsEl.getAttribute('href') : undefined;                
                data.push(artistsLink);
            });

            return data;
        });

        // Loop through event urls and get show-specific data
        const concerts = [];
        for await (const url of urls) {
            const page = await context.newPage();
            await page.goto(url);
            await page.waitForTimeout(5000);

            const artistsEl = page.locator('.event_heading');
            const artists = artistsEl ? await artistsEl.allInnerTexts() : undefined;

            const isTicketLink = await page.locator('.tickets').last().isVisible({ timeout: 5000 }) ?? false;
            let ticketLinkEl = undefined;
            let ticketLink = undefined;
            if (isTicketLink) {
                ticketLinkEl = page.locator('.tickets').last();
                ticketLink = ticketLinkEl ? await ticketLinkEl.getAttribute('href') : undefined;
            }

            const dateEl = page.locator('.m-date__singleDate').first();
            const date = dateEl ? await dateEl.allInnerTexts() : undefined;

            let priceEl = undefined;
            let price = undefined;
            if (isTicketLink) {
                priceEl = page.locator('.sidebar_ticket_prices').locator('span').last();
                price = priceEl ? await priceEl.innerText() : undefined;
            }

            const concert = {
                artists: artists[0],
                artistsLink: url,
                ticketLink: ticketLink,
                date: new Date(Date.parse(date[0])).toDateString(),
                ticketPrice: price,
                times: date[0].split('\n')[1],
            };

            if (concert) {
                concerts.push(concert);
                if (concerts.length < urls.length) {
                    continue;
                } else if (concerts.length === urls.length) {
                    sleep(5000);
                    break;
                };
            };
        };

        // Close browsers
        if (concerts.length === urls.length) {
            await context.close();
            await browser.close();
        };
        
        return concerts;
    },
}

module.exports = austinResolvers;