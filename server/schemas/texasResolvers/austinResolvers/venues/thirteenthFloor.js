const playwright = require('playwright');
const { buildCustomId, makeBuildConcertObj } = require('../../../../utils/concertUtils');
require('dotenv').config();

const venue = '13th Floor';

const buildConcertObj = makeBuildConcertObj(venue);

// HOW THIS SCRAPER WORKS
//
// The 13th Floor website is WordPress-based and hosts two different kinds of event listings
// on the same page, so we scrape both sources separately and merge the results.
//
// 1. DICE API events — The venue uses a DICE.fm ticket widget backed by a REST API at
//    partners-endpoint.dice.fm. The API requires browser context to authenticate (returns 401
//    when called directly from Node). We intercept the response from within Playwright by
//    attaching a response listener BEFORE page.goto, then parse the JSON body directly.
//
// 2. WordPress show-wrapper events — Some shows are listed as native WordPress blocks using
//    a custom "show-wrapper" div structure (not DICE). We scrape these with Playwright since
//    the page is JS-rendered. We wait for .dice_events to confirm the page is fully loaded,
//    then extract title, date/time, price, and ticket link from each show-wrapper.
//
// Both sources are collected in a single Playwright browser session to avoid launching
// two browsers. Results are merged and mapped through buildConcertObj.

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

    let diceRaw = [];
    let wpEvents = [];

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        // --- DICE: intercept API response ---
        // The DICE widget calls partners-endpoint.dice.fm after the React container
        // mounts — AFTER .dice_events appears. waitForSelector alone isn't enough;
        // we'd close the browser before the API call fires.
        //
        // Pattern from C-Boy's: create the waitForResponse promise BEFORE page.goto
        // so it's already listening when the request is made, then await it explicitly.
        // Direct axios to this endpoint returns 401 without browser context.
        const diceResponsePromise = page.waitForResponse(
            res => res.url().includes('partners-endpoint.dice.fm'),
            { timeout: 20000 }
        ).catch(e => {
            console.error('❌❌❌❌ [13th Floor] DICE API response timeout:', e.message);
            return null;
        });

        await page.goto('https://the13thflooraustin.com/');
        await page.waitForSelector('.dice_events');

        const diceResponse = await diceResponsePromise;
        if (diceResponse) {
            try {
                const json = await diceResponse.json();
                diceRaw = json.data ?? [];
            } catch (e) {
                console.error('❌❌❌❌ [13th Floor] DICE response parse error:', e.message);
            }
        }

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

    const diceEvents = diceRaw.map(event => {
        const totalCents = event.ticket_types?.[0]?.price?.total;
        const price = totalCents != null ? (totalCents / 100).toFixed(2) : null;
        const ticketLink = event.perm_name
            ? `https://dice.fm/event/${event.perm_name}`
            : (event.url || null);
        const eventStatus = event.status === 'cancelled' ? 'EventCancelled' : null;
        return {
            artists: event.name || null,
            dateTime: event.date || null,
            price,
            ticketLink,
            eventStatus,
        };
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 13th Floor: ');
    console.log('✅✅✅✅ diceEvents: ', diceEvents);
    console.log('✅✅✅✅ wpEvents: ', wpEvents);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    const allEvents = [...diceEvents, ...wpEvents];

    return allEvents.map(event => {
        const { artists, dateTime, price, ticketLink, eventStatus } = event;
        const isCancelled = eventStatus === 'EventCancelled';
        const effectiveArtists = isCancelled ? `CANCELLED: ${artists}` : artists;
        return buildConcertObj(effectiveArtists, dateTime, price, ticketLink);
    });
};

module.exports = { getThirteenthFloorData };
