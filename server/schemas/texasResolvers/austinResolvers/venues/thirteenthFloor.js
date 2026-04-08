const playwright = require('playwright');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = '13th Floor';

const buildConcertObj = makeBuildConcertObj(venue);

const getThirteenthFloorData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ 13th Floor');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const launchOptions = {
        headless: true,
        ...(process.env.PROXY && {
            proxy: {
                server: process.env.PROXY,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
            }
        }),
    };
    const browser = await playwright.webkit.launch(launchOptions);

    let diceEvents = [];
    let wpEvents = [];

    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('https://the13thflooraustin.com/');
        await page.waitForSelector('.dice_events');

        // --- DICE widget events ---
        diceEvents = await page.$$eval('article', articles => {
            return articles.map(article => {
                const jsonLd = article.querySelector('script[type="application/ld+json"]');
                if (jsonLd) {
                    try {
                        const data = JSON.parse(jsonLd.innerText)[0];
                        return {
                            artists: data.name || null,
                            dateTime: data.startDate || null,
                            price: data.offers?.[0]?.price?.toString() || null,
                            ticketLink: data.offers?.[0]?.url || null,
                            eventStatus: data.eventStatus || null,
                        };
                    } catch (e) {
                        return null;
                    }
                }
                // fallback to DOM if no JSON-LD
                const title = article.querySelector('a.dice_event-title');
                const time = article.querySelector('time');
                const price = article.querySelector('span.dice_price');
                const link = article.querySelector('a.dice_book-now');
                return {
                    artists: title ? title.innerText : null,
                    dateTime: time ? time.innerText : null,
                    price: price ? price.innerText : null,
                    ticketLink: link ? link.href : null,
                    eventStatus: null,
                };
            }).filter(Boolean);
        });

        // --- WordPress show-wrapper events ---
        wpEvents = await page.$$eval('div.show-wrapper', wrappers => {
            return wrappers.map(wrapper => {
                const divs = wrapper.querySelectorAll(':scope > div');
                const contentDiv = divs[1];
                const ps = contentDiv ? contentDiv.querySelectorAll('p') : [];
                const dateTime = ps[0] ? ps[0].innerText : null;
                const title = contentDiv ? contentDiv.querySelector('h2') : null;
                const price = wrapper.querySelector('.show-price');
                const link = wrapper.querySelector('a.show-button');
                return {
                    artists: title ? title.innerText : null,
                    dateTime: dateTime ? dateTime.trim() : null,
                    price: price ? price.innerText.trim() : null,
                    ticketLink: link ? link.href : null,
                    eventStatus: null,
                };
            }).filter(Boolean);
        });
    } catch (e) {
        console.error('❌❌❌❌ [13th Floor] scrape error:', e.message);
    } finally {
        await browser.close();
    }

    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 13th Floor: ');
    // console.log('✅✅✅✅ diceEvents: ', diceEvents);
    // console.log('✅✅✅✅ wpEvents: ', wpEvents);
    // console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    // console.log(' ');

    const allEvents = [...diceEvents, ...wpEvents];

    return allEvents.map(event => {
        const { artists, dateTime, price, ticketLink, eventStatus } = event;
        const isCancelled = eventStatus === 'EventCancelled';
        const effectiveArtists = isCancelled ? `CANCELLED: ${artists}` : artists;
        return buildConcertObj(effectiveArtists, dateTime, price, ticketLink);
    });
};

module.exports = { getThirteenthFloorData };
