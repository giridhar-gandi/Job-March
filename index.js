require('dotenv').config();
const { scrapeJobs } = require('./services/apifyService');
const { saveJobsToFile, readJobsFromFile } = require('./services/fileService');
const { readJobsFromSheet, writeJobToSheet } = require('./services/googleSheetsService');
const { filterUniqueJobs } = require('./services/jobUtils');
const { log } = require('./services/loggingService');
const { evaluateJobMatch } = require('./services/jobMatchEvaluator');
const candidateSummary = require('fs').readFileSync('./candidate_summary.txt', 'utf8');

const useDebugMode = false;//process.env.DEBUG_MODE === "true";

async function main() {
    log('INFO', 'Starting Job Scraper Workflow...');
    try {
        let jobs;
        if (useDebugMode) {
            jobs = readJobsFromFile("2025-01-27-jobs.json")
        } else {
            // Step 1: Scrape jobs
            jobs = await scrapeJobs();

            // Step 2: Save jobs to a JSON file
            if (jobs.length > 0) {
                saveJobsToFile(jobs);
            } else {
                
                log("WARN", "No jobs found. Skipping file saving step.");
            }
        }

        // // // Step 3: Filter out duplicates
        const sheetData = await readJobsFromSheet();
        const existingJobs = sheetData.slice(1);
        const uniqueJobs = filterUniqueJobs(existingJobs, jobs);
        console.log('uniqueJobs:', uniqueJobs); // Debugging

        // // // Step 4: Write unique jobs to Google Sheets one by one
        let writtenCount = 0;
        for (const job of uniqueJobs) {
            const jobAiResponses = await evaluateJobMatch(job, candidateSummary);
            await writeJobToSheet(job, jobAiResponses);
            writtenCount++;
        }
        log("INFO", `${writtenCount} unique jobs successfully written to Google Sheets.`);

    } catch (error) {
        log('ERROR', 'Workflow failed.', { error: error.message });
    }
}

main();
