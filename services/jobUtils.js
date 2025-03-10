const { log } = require('./loggingService');

function filterUniqueJobs(existingJobs, jobs) {
    log('INFO', 'Filtering unique jobs by Job Link...');
    const existingLinks = new Set(existingJobs.map(row => row[4] || "")); // Column E: Job Link
    const uniqueJobs = jobs.filter(job => !existingLinks.has(job.url));
    log('INFO', `Filtered ${uniqueJobs.length} unique jobs.`);
    return uniqueJobs;
}

module.exports = { filterUniqueJobs };

