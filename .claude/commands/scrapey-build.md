Write the scraper files for a venue already analyzed by `/scrapey`. The SCRAPER ANALYSIS SUMMARY from that run must be present in the current conversation — if it isn't, tell the user to run `/scrapey` first.

Read `.claude/commands/scraper-patterns.md` now before writing any code.

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

Fill in all selectors from the analysis summary. Do not leave TODO placeholders unless the source was genuinely ambiguous — and if so, call out exactly what needs verification.

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
