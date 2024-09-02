const { chromium, firefox, webkit } = require('playwright');
require('dotenv').config();
const { sleep } = require('../../../utils/helpers');

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

const keepTryingPageGoTo = async (page, url) => {
    let count = 0;
    const maxTries = 3;
    let carryOn = true;
    while(carryOn) {
        try {
            await page.goto(`${url}`);
            carryOn = false;
            break;
        } catch (e) {
            if (count < maxTries) {
                count++;
                carryOn = true;
            } else if (count === maxTries) {
                console.log('🚫🚫🚫🚫 e: ', e);
                carryOn = false;
                break;
            };
        };
    };
};

const austinResolvers = {
    // 13th Floor
    getThirteenthFloorData: async () => {
        console.log('👁️ 13th Floor');
        console.log('👁️ launchOptions: ', launchOptions.proxy.server);
        const browser = await randoBrowser.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        context.setDefaultTimeout(240000);
        const page = await context.newPage();
        await keepTryingPageGoTo(page, 'https://the13thflooraustin.com/');
        // await page.pause();
        await page.waitForTimeout(5000);

        const concerts = await page.$$eval('article', concert => {
            const data = [];
            concert.forEach(article => {
                const concertDataEl = article.querySelector('script');
                const concertData = concertDataEl ? JSON.parse(concertDataEl.innerText) : undefined;

                data.push({
                    artists: concertData[0].name,
                    description: concertData[0].description,
                    date: new Date(Date.parse(concertData[0].startDate)).toDateString(),
                    times: new Date(Date.parse(concertData[0].doorTime)).toDateString(),
                    venue: concertData[0].location.name,
                    address: concertData[0].location.address?.split(',')[0],
                    address2: concertData[0].location.address?.split(',')[1],
                    ticketLink: concertData[0].offers[0].url,
                    ticketPrice: concertData[0].offers[0].price,
                });
            });

            return data;
        });
        console.log('✅✅✅✅ concerts: ', concerts);

        await context.close();
        await browser.close();

        return concerts;
    },
    // ACL Live
    getThreeTenAustinCityLimitsLiveData: async () => {
        console.log('👁️ 3TEN Austin City Limits Live');
        console.log('👁️ launchOptions: ', launchOptions.proxy.server);
        const browser = await randoBrowser.launch(launchOptions);
        // incognito
        const context = await browser.newContext();
        context.setDefaultTimeout(240000);
        const page = await context.newPage();
        // changelog-start
        await keepTryingPageGoTo(page, 'https://www.acllive.com/events/venue/acl-live-at-3ten');
        // await page.goto('https://www.acllive.com/events/venue/acl-live-at-3ten');
        // changelog-end
        await page.waitForTimeout(6000);

        // Scroll to bottom of page
        for (let i = 0; i <= 5; i++) {
            page.keyboard.press('End');
            sleep(1000);
        };

        // Get all event urls
        // TODO: For some reason this always leaves off a few urls than what's listed on the site
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
            // changelog-start
            try {
                await page.goto(url);
            } catch (e) {
                if (e) {
                    const concert = {
                        artistsLink: url,
                    };
                    console.log('🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫');
                    console.log('🚫🚫🚫🚫 e: ', e);
                    console.log('🚫🚫🚫🚫 url: ', url);
                    console.log('🚫🚫🚫🚫 concert: ', concert);
                    concerts.push(concert);
                    page.close();
                    continue;
                }
            };
            // await page.goto(url);
            // changelog-end
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
                venue: 'ACL Live at 3TEN',
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
        console.log('✅✅✅✅ concerts: ', concerts);

        // Close browsers
        if (concerts.length === urls.length) {
            await context.close();
            await browser.close();
        };

        return concerts;
    },
    // ABGB
    getABGBData: async () => {
        console.log('👁️ ABGB');
        console.log('👁️ launchOptions: ', launchOptions.proxy.server);
        const browser = await randoBrowser.launch(launchOptions);
        // // incognito
        const context = await browser.newContext();
        context.setDefaultTimeout(240000);
        const page = await context.newPage();
        await keepTryingPageGoTo(page, 'https://theabgb.com/calendar/');
        await page.waitForTimeout(6000);

        // Scroll to bottom of page
        for (let i = 0; i <= 5; i++) {
            page.keyboard.press('End');
            sleep(1000);
        };

        // Get all event urls
        const urls = await page.$$eval('.event', concert => {
            const data = [];
            concert.forEach(async eventItem => {
                const artistsEl = eventItem.querySelector('.event-link');
                const artistsLink = artistsEl ? artistsEl.getAttribute('href') : undefined;
                data.push(artistsLink);
            });

            return data;
        });

        // Loop through event urls and get show-specific data
        const concerts = [];
        for await (const url of urls) {
            const page = await context.newPage();
            // changelog-start
            try {
                await page.goto(url);
            } catch (e) {
                if (e) {
                    const concert = {
                        artistsLink: url,
                    };
                    console.log('🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫');
                    console.log('🚫🚫🚫🚫 e: ', e);
                    console.log('🚫🚫🚫🚫 url: ', url);
                    console.log('🚫🚫🚫🚫 concert: ', concert);
                    concerts.push(concert);
                    page.close();
                    continue;
                }
            };
            // await page.goto(url);
            // changelog-end
            await page.waitForTimeout(5000);

            const artistsEl = page.locator('.entry-title');
            const artists = artistsEl ? await artistsEl.allInnerTexts() : undefined;

            const dateEl = page.locator('.details').first().locator('p').first();
            const date = dateEl ? await dateEl.innerText() : undefined;

            const timeEl = page.locator('.details').first().locator('p').last();
            const time = timeEl ? await timeEl.innerText() : undefined;

            let descriptionEl = page.locator('.entry-content').locator('p').nth(2);
            let description = descriptionEl ? await descriptionEl.allInnerTexts() : undefined;

            const concert = {
                artists: artists[0],
                artistsLink: url,
                date: new Date(Date.parse(date + ', 2024')).toDateString(),
                times: time,
                venue: 'The ABGB',
                description: description[0],
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
        console.log('✅✅✅✅ concerts: ', concerts);

        // Close browsers
        if (concerts.length === urls.length) {
            await context.close();
            await browser.close();
        };

        return concerts;
    },
}

module.exports = austinResolvers;