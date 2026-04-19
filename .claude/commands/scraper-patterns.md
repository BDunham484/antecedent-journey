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
