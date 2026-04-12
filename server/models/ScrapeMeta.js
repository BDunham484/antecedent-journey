const { Schema, model } = require('mongoose');

const scrapeMetaSchema = new Schema({
    lastShowlistScrape: { type: String, default: null },
    lastVenueScrape: { type: String, default: null },
    lastFocusedScrape: { type: String, default: null },
});

const ScrapeMeta = model('ScrapeMeta', scrapeMetaSchema);

module.exports = ScrapeMeta;
