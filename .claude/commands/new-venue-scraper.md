Create a new venue scraper file for the noisebx/antecedent-journey project.

## What to do

Before writing any code, collect the following information. If any item is missing from the user's message, ask for it explicitly before proceeding:

1. **Venue name** — the display name exactly as it should appear in the `venue` field (e.g. `The 13th Floor`)
2. **City and state** — determines which city aggregator to wire into (e.g. Austin, TX → `austinResolvers/austinResolvers.js`)
3. **Venue URL** — the shows/events page to scrape
4. **Rendering type** — is the page server-side rendered (use Cheerio + Axios) or JS-rendered (use Playwright)?
   - If unsure: JS-rendered pages have ticket widgets (DICE, Eventbrite, Ticketmaster), infinite scroll, or show blank content when you `curl` the URL
5. **Ticket platform** — e.g. DICE, Eventbrite, Ticketmaster, own site. Determines whether JSON-LD structured data is available.
6. **Selectors** — CSS selectors or DOM structure for: event title/artists, date/time, ticket price, ticket link. If the user hasn't inspected the page yet, note that these will need to be verified via DevTools before finalizing.
7. **GraphQL query name** — what the resolver query should be called (e.g. `getThirteenthFloorData`). Follow the pattern `get[VenueName]Data` in camelCase.

---

## File to create

Create the scraper at:
```
server/schemas/[state]Resolvers/[city]Resolvers/venues/[camelCaseVenueName].js
```

Example: 13th Floor Austin TX → `server/schemas/texasResolvers/austinResolvers/venues/thirteenthFloor.js`

### Template — Playwright (JS-rendered)

```js
const playwright = require('playwright');
const { buildCustomId } = require('../../../../utils/scraper');
require('dotenv').config();

const venue = '[VENUE_DISPLAY_NAME]';

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

const [QUERY_NAME] = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ [VENUE_DISPLAY_NAME]');
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
    await page.goto('[VENUE_URL]');
    await page.waitForSelector('[SELECTOR_TO_WAIT_FOR]');

    const events = await page.$$eval('[EVENT_CONTAINER_SELECTOR]', els => {
        return els.map(el => {
            // TODO: fill in selectors after DevTools inspection
            return {
                artists: null,
                dateTime: null,
                price: null,
                ticketLink: null,
                eventStatus: null,
            };
        }).filter(Boolean);
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ [VENUE_DISPLAY_NAME]: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    await context.close();
    await browser.close();

    return events.map(event => {
        const { artists, dateTime, price, ticketLink, eventStatus } = event;
        const isCancelled = eventStatus === 'EventCancelled';
        const effectiveArtists = isCancelled ? `CANCELLED: ${artists}` : artists;
        return buildConcertObj(effectiveArtists, dateTime, price, ticketLink);
    });
};

module.exports = { [QUERY_NAME] };
```

### Template — Cheerio (server-side rendered)

```js
const axios = require('axios');
const cheerio = require('cheerio');
const { buildCustomId } = require('../../../../utils/scraper');

const venue = '[VENUE_DISPLAY_NAME]';

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

const [QUERY_NAME] = async () => {
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log('👁️👁️👁️👁️ [VENUE_DISPLAY_NAME]');
    console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
    console.log(' ');

    const { data } = await axios.get('[VENUE_URL]');
    const $ = cheerio.load(data);
    const events = [];

    $('[EVENT_CONTAINER_SELECTOR]').each((i, el) => {
        // TODO: fill in selectors after DevTools inspection
        const artists = null;
        const dateTime = null;
        const price = null;
        const ticketLink = null;
        events.push(buildConcertObj(artists, dateTime, price, ticketLink));
    });

    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ [VENUE_DISPLAY_NAME]: ');
    console.log('✅✅✅✅ events: ', events);
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log(' ');

    return events;
};

module.exports = { [QUERY_NAME] };
```

---

## Wire into city aggregator

Add the import and export to the city aggregator file (e.g. `austinResolvers/austinResolvers.js`):

```js
const { [QUERY_NAME] } = require('./venues/[camelCaseVenueName]');

const austinResolvers = {
    // existing venues...
    [QUERY_NAME],
};
```

---

## Update typeDefs.js

Add the query to the `Query` type in `server/schemas/typeDefs.js`:

```graphql
[QUERY_NAME]: [Concert]
```

---

## Update resolvers.js

Add the import from the city aggregator (if not already imported) and add the query handler in the `Query` block:

```js
[QUERY_NAME]: async (parent, args) => {
    const venueData = await [QUERY_NAME]();
    return venueData;
},
```

---

## After creating the files

Remind the user:
- If selectors were left as `TODO`, they need to inspect the venue's events page in DevTools before the scraper will return real data
- Run the query in Apollo Studio / GraphQL Playground to verify output shape matches the `Concert` type
- Once verified, commit with: `git add` the new venue file + any modified aggregator/typeDefs/resolvers files
