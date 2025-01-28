const { ApifyClient } = require('apify-client');
const { log } = require('./loggingService');
const { readJSONFromFile } = require('./fileService');

const APIFY_API_KEY = process.env.APIFY_API_KEY;

async function scrapeJobs() {
    log('INFO', 'Initializing Apify client...');
    const client = new ApifyClient({ token: APIFY_API_KEY });
    const actorId = "BHzefUZlZRKWxkTck";

    const input = readJSONFromFile("apify_input.json")

    log('INFO', 'Running Apify actor...');
    try {
        const run = await client.actor(actorId).call(input);
        log('INFO', 'Fetching job results from the dataset...');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        log('INFO', `Successfully fetched ${items.length} jobs.`);
        return items;
    } catch (error) {
        log('ERROR', 'Error during job scraping.', { error: error.message });
        throw error;
    }
}

module.exports = { scrapeJobs };
