Create a new venue scraper file for the noisebx/antecedent-journey project.

## Step 1 — Collect required inputs

Before writing any code, you need three things from the user. If any are missing, ask for them all at once:

1. **Venue name** — display name exactly as it should appear in the `venue` field (e.g. `The 13th Floor`)
2. **City and state** — determines which city aggregator to wire into (e.g. Austin, TX → `austinResolvers/austinResolvers.js`)
3. **Venue URL** — the shows/events page URL to scrape (used in `page.goto()` / `axios.get()`)

Do not ask for rendering type, ticket platform, selectors, or page source — fetch and derive these in Step 2.

---

## Step 2 — Fetch and analyze the source

Use WebFetch on the venue URL to retrieve the page source. Then analyze it to determine:

### Rendering type
- **Cheerio (server-side):** Static HTML — event data is present in the raw source with no widget placeholders
- **Playwright (JS-rendered):** Source contains ticket widget embed tags, empty container divs that get populated client-side, or script tags loading external ticket platforms (DICE, Eventbrite, Ticketmaster, etc.)
- **Hybrid:** Some events are static WordPress/CMS blocks, others are widget-rendered — use Playwright and scrape both sections separately (see 13th Floor as the reference implementation in `server/schemas/texasResolvers/austinResolvers/venues/thirteenthFloor.js`)
- If WebFetch returns only a shell (empty containers, widget embeds, no event data) — that itself confirms JS-rendered. Identify the platform from script src URLs and class names in the shell, then apply the known pattern. Only ask the user for a source excerpt if the platform cannot be identified from the shell alone.
- If the source suggests a pattern not covered above, describe what you observe and recommend an approach before proceeding

### Ticket platform
Identify from script src URLs, embed tags, class names, or JSON-LD `@type` values. Common platforms:
- **DICE** — `dice.fm`, `dice_events`, `EventListWidget`. The widget renders via styled-components — no `<article>` elements or JSON-LD. Data comes from the `partners-endpoint.dice.fm` API intercepted inside Playwright; see the DICE gotcha in Patterns and gotchas below.
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

For DICE specifically: do not attempt DOM scraping — the widget renders via styled-components with no stable selectors or JSON-LD. Use the API interception pattern documented in the DICE gotcha below.

### waitForSelector (Playwright only)
Identify the best selector to wait on — the container that confirms the dynamic content has loaded.

---

## Patterns and gotchas

See `.claude/commands/scraper-patterns.md` for full code: conditional proxy config (Playwright), try/catch fetch (Cheerio/Axios), DICE API interception pattern, and DICE v2 field mapping. Read that file before writing any scraper code.

---

## Step 3 — Confirm query name and hand off

Suggest a query name following the pattern `get[VenueName]Data` in camelCase (e.g. `getThirteenthFloorData`, `getMohawkData`, `getStubsData`). Present the suggestion and wait for the user to confirm or provide an override before proceeding.

Once confirmed, output this exact summary block so the implementation step has everything it needs:

```
SCRAPER ANALYSIS SUMMARY
Venue name:      [display name]
City / state:    [city, state]
URL:             [events page URL]
Query name:      [confirmedQueryName]
Rendering type:  [Cheerio | Playwright | Hybrid]
Ticket platform: [DICE | Eventbrite | Ticketmaster | Tixr | Own site]
Selectors:
  container:     [selector]
  title:         [selector]
  date/time:     [selector]
  price:         [selector]
  ticket link:   [selector]
  status:        [selector or "none found"]
waitForSelector: [selector or "n/a"]
Notes:           [any quirks, ambiguities, or fallbacks]
```

Then tell the user: **"Run `/scrapey-build` to write the files."**

Do not write any code or modify any files — that happens in `/scrapey-build`.

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

After the `buildConcertObj` line and before the main function, add a `HOW THIS SCRAPER WORKS` comment block explaining the scraping process in plain English. Cover:
- What CMS or platform the venue uses
- Why you chose axios+cheerio vs Playwright (and what triggers the choice)
- What selectors are targeted and why any tricky ones work the way they do
- Any quirks specific to this venue (year inference, slug parsing, pagination, API chunking, etc.)

```js
// HOW THIS SCRAPER WORKS
//
// [Plain-English explanation here. See existing venue files for examples.]
```

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

## Step 7 — Add to venue box in Control.js

Add the venue's display name (exactly matching the `venue` constant in the scraper file) to the `austinVenues` array in `client/src/pages/Control.js`. The array is alphabetically sorted at runtime (ignoring "The" prefixes), so order doesn't matter — just append it:

```js
const austinVenues = [
    // existing entries...
    'Venue Display Name',
]
```

This makes the venue appear in the UI status list and wires it into the per-venue insert status indicators.

---

## Step 8 — resolvers.js

If the new venue uses **Playwright**, add its query name to `PLAYWRIGHT_SCRAPER_KEYS` in `server/schemas/resolvers.js`:

```js
const PLAYWRIGHT_SCRAPER_KEYS = new Set([
    // existing entries...
    '[QUERY_NAME]',
]);
```

This ensures the scraper runs under the Playwright concurrency limit (currently 1) rather than the Cheerio limit, preventing multiple browser subprocesses from running simultaneously.

If the venue uses **Cheerio/axios only**, no changes to `resolvers.js` are needed — it will automatically be picked up at the correct concurrency limit.

---

## Step 9 — Summarize and prompt to commit

After all files are written, output a short summary:
- File created
- Rendering type and ticket platform identified
- Selectors used (or flagged as needing verification)
- Any unusual patterns observed

Then ask: "Ready to commit and push?"
