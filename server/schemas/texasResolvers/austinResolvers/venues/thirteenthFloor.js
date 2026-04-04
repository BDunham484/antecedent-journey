const playwright = require('playwright');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = 'The 13th Floor';

const buildConcertObj = (artists, dateTime, price, ticketLink) => {
    const statusMatch = artists ? artists.match(/cancelled|sold\s?out/i) : null;
    const status = statusMatch ? statusMatch[0].toLowerCase() : null;
    const cleanArtists = artists ? artists.replace(/cancelled[:\s-]*/i, '').replace(/sold\s?out[:\s-]*/i, '').trim() : null;
    const headliner = cleanArtists ? cleanArtists.split(',')[0].split(/\s+with\s+/i)[0].trim().replace(/\//g, ':') : null;
    const customId = headliner && dateTime && venue ? buildCustomId(headliner, dateTime, venue) : null;

    return {
        customId,
        artists: cleanArtists,
        date: dateTime,
        times: dateTime,
        venue,
        ticketPrice: price,
        ticketLink: ticketLink || null,
        status,
    };
};

const getThirteenthFloorData = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ 13th Floor');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

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
    await page.waitForSelector('.dice_events');

    // --- DICE widget events ---
    const diceEvents = await page.$$eval('article', articles => {
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
    const wpEvents = await page.$$eval('div.show-wrapper', wrappers => {
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

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 13th Floor: ');
    console.log('✅✅✅✅ diceEvents: ', diceEvents);
    console.log('✅✅✅✅ wpEvents: ', wpEvents);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    await context.close();
    await browser.close();

    const allEvents = [...diceEvents, ...wpEvents];

    return allEvents.map(event => {
        const { artists, dateTime, price, ticketLink, eventStatus } = event;
        const isCancelled = eventStatus === 'EventCancelled';
        const effectiveArtists = isCancelled ? `CANCELLED: ${artists}` : artists;
        return buildConcertObj(effectiveArtists, dateTime, price, ticketLink);
    });
};

module.exports = { getThirteenthFloorData };
