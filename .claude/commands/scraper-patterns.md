# Scraper Patterns & Gotchas

## Playwright — conditional proxy config

Never pass `proxy` unconditionally. If `PROXY` env var is undefined, Playwright throws `proxy.server: expected string, got undefined`.

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

---

## Cheerio/Axios — always wrap fetch in try/catch

An uncaught axios error contains circular HTTP request objects (`ClientRequest`, `IncomingMessage`). When it propagates through `Promise.all` to Apollo, it causes `Converting circular structure to JSON` and kills the entire `getAustinTXShowData` response.

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

## DICE — API interception via waitForResponse

The DICE widget renders via styled-components — no `<article>` elements, no JSON-LD, no stable DOM selectors. The widget calls `partners-endpoint.dice.fm/api/v2/events` at runtime.

**Do not attempt direct axios.** The endpoint returns 401 without browser context. Playwright is required.

**Do not rely on `waitForSelector('.dice_events')` alone.** The `.dice_events` container mounts *before* the API call fires. Awaiting only the selector will close the browser before the response arrives.

**Required pattern** — create `waitForResponse` before `page.goto`, then await it after `waitForSelector`:

```js
const diceResponsePromise = page.waitForResponse(
    res => res.url().includes('partners-endpoint.dice.fm'),
    { timeout: 20000 }
).catch(e => {
    console.error('❌❌❌❌ [VENUE] DICE API timeout:', e.message);
    return null;
});

await page.goto(url);
await page.waitForSelector('.dice_events');

const diceResponse = await diceResponsePromise;
if (diceResponse) {
    const json = await diceResponse.json();
    const diceRaw = json.data ?? [];
}
```

**DICE v2 API field mapping:**

```js
const totalCents = event.ticket_types?.[0]?.price?.total;
return {
    artists:     event.name || null,
    dateTime:    event.date || null,   // already ISO 8601
    price:       totalCents != null ? (totalCents / 100).toFixed(2) : null,
    ticketLink:  event.perm_name
                     ? `https://dice.fm/event/${event.perm_name}`
                     : (event.url || null),
    eventStatus: event.status === 'cancelled' ? 'EventCancelled' : null,
};
```

Reference implementation: `server/schemas/texasResolvers/austinResolvers/venues/thirteenthFloor.js`

---

## Live Nation venues — Next.js RSC flight data

Live Nation-operated venue sites (e.g. `scootinnaustin.com`) are Next.js apps that use React Server Components. The `/shows` list page **is SSR when fetched with axios** even though it may show "Loading..." in a browser — the browser executes client-side hydration on top of the SSR shell, but axios gets the full pre-rendered HTML.

**Do not trust WebFetch to determine SSR vs CSR.** WebFetch has its own rendering behavior that can give misleading signals. Always confirm with a direct axios probe.

**Do not scrape the calendar pages** (`/shows/calendar/YYYY-MM`). Those are month-specific — each page only contains that month's events and uses `\"events\"` as the array key. The `/shows` list page uses `\"data\"` as the key and contains all upcoming events in one request.

### How to identify this pattern

- Assets load from `assets.livenationcdn.com`
- Contact email ends in `@livenation.com`
- All ticket links go to `ticketmaster.com`
- Page source contains `self.__next_f.push(` script tags

### Data structure

Event data is embedded in a `self.__next_f.push([1, "..."])` script tag. The string argument is Next.js flight data — a JSON-encoded string where **all double-quotes are escaped as `\"`** (literal backslash + double-quote in the raw HTML). Standard JSON.parse or cheerio selectors won't work; extract fields via string search.

The events live in a `\"data\"` array. Each object has a `\"type\"` field — filter to `\"REGULAR\"` to exclude upsell entries (`\"Club Access\"`, `\"Premier\"`).

### Required helpers

```js
// Finds \"fieldName\":\"value\" and returns value up to the closing \"
function extractField(html, fromPos, fieldName) {
    const key = '\\"' + fieldName + '\\":\\"';
    const keyIdx = html.indexOf(key, fromPos);
    if (keyIdx === -1 || keyIdx - fromPos > 3000) return null;
    const valStart = keyIdx + key.length;
    const valEnd = html.indexOf('\\"', valStart);
    if (valEnd === -1) return null;
    return html.slice(valStart, valEnd);
}

// Event names may contain \uXXXX sequences that JS would decode but axios won't
function decodeUnicode(str) {
    return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
```

### Extraction loop

```js
const dataMarker = '\\"data\\":[{\\"event_data_type\\"';
const eventMarker = '\\"event_data_type\\":\\"discovery\\"';

const dataStart = html.indexOf(dataMarker);
if (dataStart === -1) { /* handle missing */ }

let pos = dataStart;
while (true) {
    const ePos = html.indexOf(eventMarker, pos);
    if (ePos === -1) break;

    const type = extractField(html, ePos, 'type');
    if (type === 'REGULAR') {
        const rawName    = extractField(html, ePos, 'name');
        const startDate  = extractField(html, ePos, 'start_date_local');  // "YYYY-MM-DD"
        const startTime  = extractField(html, ePos, 'start_time_local');  // "HH:MM:SS"
        const ticketUrl  = extractField(html, ePos, 'url');               // ticketmaster.com
        const statusCode = extractField(html, ePos, 'status_code');       // "onsale"|"cancelled"|...

        if (rawName && startDate && startTime) {
            const name    = decodeUnicode(rawName);
            const artists = statusCode === 'cancelled' ? `CANCELLED: ${name}` : name;
            const dateTime = `${startDate}T${startTime}`;
            events.push(buildConcertObj(artists, dateTime, null, ticketUrl || null));
        }
    }
    pos = ePos + eventMarker.length;
}
```

**No price data** is available in the flight payload — pass `null`.

Reference implementation: `server/schemas/texasResolvers/austinResolvers/venues/scootInn.js`
