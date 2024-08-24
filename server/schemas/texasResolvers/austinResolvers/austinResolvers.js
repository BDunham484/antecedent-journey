// const User = require('../../../models/User');
// const Concert = require('../../../models/Concert');
// const axios = require('axios');
// const cheerio = require('cheerio');
// const { isConstValueNode } = require('graphql');
// const { HttpsProxyAgent } = require('https-proxy-agent');
const playwright = require('playwright');
require('dotenv').config();
// const helpers = require('../../../utils/helpers');



const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        console.log('👁️ 13th Floor');
        const launchOptions = {
            headless: false,
            proxy: {
                // eslint-disable-next-line no-undef
                server: process.env.PROXY,
                // eslint-disable-next-line no-undef
                username: process.env.PROXY_USERNAME,
                // eslint-disable-next-line no-undef
                password: process.env.PROXY_PASSWORD,
            }
        };
        const browser = await playwright.firefox.launch(launchOptions);
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
        const launchOptions = {
            headless: false,
            proxy: {
                // eslint-disable-next-line no-undef
                server: process.env.PROXY,
                // eslint-disable-next-line no-undef
                username: process.env.PROXY_USERNAME,
                // eslint-disable-next-line no-undef
                password: process.env.PROXY_PASSWORD,
            }
        };
        const browser = await playwright.firefox.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://www.acllive.com/events/venue/acl-live-at-3ten');
        await page.pause();
        await page.waitForTimeout(5000);
        const concerts = await page.$$eval('.eventItem', concert => {
            const data = [];
            concert.forEach(async eventItem => {
                // const dateTimeEl = eventItem.querySelector('.m-date__singleDate');
                // const dateTime = dateTimeEl ? dateTimeEl.innerText : 'no_dice';

                const monthEl = eventItem.querySelector('.m-date__month');
                const month = monthEl ? monthEl.innerText.trim() : 'no_month';

                const dayEl = eventItem.querySelector('.m-date__day');
                const day = dayEl ? dayEl.innerText.trim() : 'no_day';

                const yearEl = eventItem.querySelector('.m-date__year');
                const year = yearEl ? yearEl.innerText.trim().split(' ')[1] : 'no_year';

                const artistsEl = eventItem.querySelector('.title a');
                const artists = artistsEl ? artistsEl.innerText.trim() : 'no_artist';
                const artistsLink = artistsEl ? artistsEl.getAttribute('href') : 'no_link';

                // await page.goto(artistsLink);
                // await page.pause();
                // await page.waitForTimeout(5000);

                const formattedDate = new Date(Date.parse(year +'-'+ month +'-'+ day)).toDateString();

                data.push({
                    artists: artists,
                    artistsLink: artistsLink,
                    date: formattedDate,
                });
            })

            return data;
        });
        console.log('✅✅✅✅ concerts: ', concerts);

        await context.close();
        await browser.close();

        return concerts;
        // return { artists: 'yourFace_myButt' };
    },
}

module.exports = austinResolvers;