const fs = require('fs');
const { log } = require('./loggingService');

function saveJobsToFile(jobs) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-jobs.json`;
    log('INFO', `Saving jobs to file: ${filename}`);
    try {
        fs.writeFileSync(filename, JSON.stringify(jobs, null, 2));
        log('INFO', `Jobs successfully saved to ${filename}.`);
    } catch (error) {
        log('ERROR', 'Error while saving jobs to file.', { error: error.message });
        throw error;
    }
}

function readJobsFromFile(filename) {
    log('INFO', `Reading jobs from file: ${filename}`);
    try {
        const content = fs.readFileSync(filename, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        log('ERROR', 'Error reading jobs from file.', { error: error.message });
        throw error;
    }
}

function readJSONFromFile(filename) {
    log('INFO', `Reading JSON file: ${filename}`);
    try {
        const content = fs.readFileSync(filename, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        log('ERROR', 'Error reading JSON file.', { error: error.message });
        throw error;
    }
}

module.exports = { saveJobsToFile, readJobsFromFile, readJSONFromFile };
