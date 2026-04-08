Create a new venue scraper file for the noisebx/antecedent-journey project.

## Step 1 — Collect required inputs

Before writing any code, you need three things from the user. If any are missing, ask for them all at once:

1. **Venue name** — display name exactly as it should appear in the `venue` field (e.g. `The 13th Floor`)
2. **City and state** — determines which city aggregator to wire into (e.g. Austin, TX → `austinResolvers/austinResolvers.js`)
3. **Venue URL** — the shows/events page URL to scrape (used in `page.goto()` / `axios.get()`)
4. **Venue page source** — the full copy/pasted HTML source from the venue's shows/events page (obtained via DevTools → Elements, or right-click → View Page Source)

Do not ask for rendering type, ticket platform, or selectors — derive these from the source in Step 2.

---

## Step 2 — Analyze the source

Once source is provided, analyze it to determine:

### Rendering type
- **Cheerio (server-side):** Static HTML — event data is present in the raw source with no widget placeholders
- **Playwright (JS-rendered):** Source contains ticket widget embed tags, empty container divs that get populated client-side, or script tags loading external ticket platforms (DICE, Eventbrite, Ticketmaster, etc.)
- **Hybrid:** Some events are static WordPress/CMS blocks, others are widget-rendered — use Playwright and scrape both sections separately (see 13th Floor as the reference implementation in `server/schemas/texasResolvers/austinResolvers/venues/thirteenthFloor.js`)
- If the source suggests a pattern not covered above, describe what you observe and recommend an approach before proceeding

### Ticket platform
Identify from script src URLs, embed tags, class names, or JSON-LD `@type` values. Common platforms:
- **DICE** — `dice.fm`, `dice_events`, `EventListWidget`, JSON-LD `MusicEvent` in `<script type="application/ld+json">` inside `<article>` tags
- **Eventbrite** — `eventbrite.com`, `.eventbrite-widget`
- **Ticketmaster** — `ticketmaster.com`, `tm-button`
- **Tixr** — `tixr.com`
- **Own site** — no external platform; events are native HTML

### Selectors
Extract the specific CSS selectors and DOM paths for:
- Event container (the repeating element per show)
- Artists / event title
- Date and time
- Ticket price
- Ticket link (href)
- Event status (cancelled / sold out) — check for JSON-LD `eventStatus`, class names, or text patterns

For DICE specifically: prefer JSON-LD structured data from `article script[type="application/ld+json"]` over DOM scraping. Fall back to DOM only if JSON-LD is absent.

### waitForSelector (Playwright only)
Identify the best selector to wait on — the container that confirms the dynamic content has loaded.

---

## Patterns and gotchas (learned from live testing)

### Playwright — proxy config must be conditional
Never pass `proxy` unconditionally. If `PROXY` env var is undefined, Playwright throws `proxy.server: expected string, got undefined`. Always use:
```js
const launchOptions = {
    headless: false,
    ...(process.env.PROXY && {
        proxy: {
            server: process.env.PROXY,
            username: process.env.PROXY_USERNAME,
            password: process.env.PROXY_PASSWORD,
        }
    }),
};
```

### Cheerio/Axios — always wrap the fetch in try/catch
An uncaught axios error contains circular HTTP request objects (`ClientRequest`, `IncomingMessage`). When it propagates through `Promise.all` to Apollo, it causes `Converting circular structure to JSON` and kills the entire `getAustinTXShowData` response. Always do:
```js
let html;
try {
    const response = await axios.get(url);
    html = response.data;
} catch (e) {
    console.error('❌❌❌❌ [VENUE] fetch failed:', e.message);
    return [];
}
```

---

## Step 3 — Confirm query name

Suggest a query name following the pattern `get[VenueName]Data` in camelCase (e.g. `getThirteenthFloorData`, `getMohawkData`, `getStubsData`). Present the suggestion and wait for the user to confirm or provide an override before writing any code.

---

## Step 4 — Create the scraper file

File path:
```
server/schemas/[state]Resolvers/[city]Resolvers/venues/[camelCaseVenueName].js
```

`buildConcertObj` is a shared factory — do NOT inline it. Import `makeBuildConcertObj` from `concertUtils` and call it once after the `venue` constant:

```js
const { makeBuildConcertObj } = require('../../../../utils/concertUtils');

const venue = '[VENUE_DISPLAY_NAME]';
const buildConcertObj = makeBuildConcertObj(venue);
```

This handles all date/time parsing, `customId` generation, and status extraction automatically. Do not redefine `buildConcertObj` locally.

Use the `require` path depth that matches the actual file location. For files at `austinResolvers/venues/[file].js` the path is `../../../../utils/concertUtils`.

Use the console.log pattern from the reference implementation:
```js
console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
console.log('👁️👁️👁️👁️ [VENUE_DISPLAY_NAME]');
console.log('👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️');
console.log(' ');
```

And on completion:
```js
console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅ [VENUE_DISPLAY_NAME]: ');
console.log('✅✅✅✅ events: ', events);
console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
console.log(' ');
```

Fill in all selectors derived from the source. Do not leave TODO placeholders unless the source was genuinely ambiguous — and if so, call out exactly what needs verification.

---

## Step 5 — Wire into city aggregator

Add to the city aggregator (e.g. `austinResolvers/austinResolvers.js`):

```js
const { [QUERY_NAME] } = require('./venues/[camelCaseVenueName]');

const [city]Resolvers = {
    // existing entries...
    [QUERY_NAME],
};
```

---

## Step 6 — Update typeDefs.js

Add to the `Query` type in `server/schemas/typeDefs.js`:

```graphql
[QUERY_NAME]: [Concert]
```

---

## Step 7 — resolvers.js

No changes needed. `getAustinTXShowData` (and equivalent city-level resolvers) automatically call all scrapers via `Object.values(austinResolvers).map(scraper => scraper())`. Adding a venue to the city aggregator is sufficient.

---

## Step 8 — Summarize and prompt to commit

After all files are written, output a short summary:
- File created
- Rendering type and ticket platform identified
- Selectors used (or flagged as needing verification)
- Any unusual patterns observed

Then ask: "Ready to commit and push?"
