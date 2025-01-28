const OpenAI = require("openai");
const { log } = require('./loggingService');

const deepseekClient = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper to generate job summary prompt
function generateJobSummaryPrompt(jobData) {
    return `Job Summary Generation Prompt:

    [ROLE] Job Summary Generator
    [TASK] Create a concise summary with additional insights, EXACTLY FORMAT: "Role|Key Skills|Job Details|Location"
    [RULES]
    - MAX 250 CHARACTERS
    - INCLUDE INSIGHTS ABOUT KEY RESPONSIBILITIES AND QUALIFICATIONS
    - NO redundant words, NO Markdown, NO formatting tags

    RAW DATA: ${JSON.stringify(jobData)}
    RESPONSE:`;
}

// Helper to generate job match prompt
function generateJobMatchPrompt(jobData, candidateSummary) {
    return `Job Match Percentage Calculation Prompt:

    [ROLE] Job Match Evaluator
    [TASK] Assess the compatibility between the job requirements and the candidate's profile. Provide a match percentage based on the following criteria:
    - Skills Alignment: 70%
    - Experience Relevance: 20%
    - Location/Remote Compatibility: 10%

    [RULES]
    - Analyze the following:
      - JOB SUMMARY: ${JSON.stringify(jobData)}
      - CANDIDATE: ${candidateSummary}
    - OUTPUT: ONLY the match percentage as a number between 0 and 100, with NO extra text or symbols.

    MATCH PERCENTAGE:`;
}

async function evaluateJobMatch(jobData, candidateSummary) {
    const results = {
        gptJobSummary: "",
        gptJobMatchPercentage: "",
        deepSeekJobSummary: "",
        deepSeekJobMatchPercentage: "",
    };

    // Check environment variables for GPT and DeepSeek usage
    const useGPT = process.env.USE_GPT === "true";
    const useDeepSeek = process.env.USE_DEEPSEEK === "true";

    if (useGPT) {
        try {
            // Generate job summary with GPT
            const gptSummaryResponse = await openaiClient.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [
                    {
                        role: "user",
                        content: generateJobSummaryPrompt(jobData),
                    },
                ],
            });
            results.gptJobSummary = gptSummaryResponse.choices[0]?.message?.content.trim() || "";

            // Generate job match percentage with GPT
            const gptMatchResponse = await openaiClient.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: generateJobMatchPrompt(jobData, candidateSummary),
                    },
                ],
            });
            results.gptJobMatchPercentage = gptMatchResponse.choices[0]?.message?.content.trim() || "";
            log("INFO", "GPT Processed Job Match + Job Summary", { gptJobSummary: results.gptJobSummary, gptJobMatchPercentage: results.gptJobMatchPercentage });

        } catch (error) {
            log("ERROR", "Error processing GPT job match:", error.message);
        }
    }

    if (useDeepSeek) {
        try {
            // Generate job summary with DeepSeek
            const deepSeekSummaryResponse = await deepseekClient.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: generateJobSummaryPrompt(jobData),
                    },
                ],
            });
            results.deepSeekJobSummary = deepSeekSummaryResponse.choices[0]?.message?.content.trim() || "";

            // Generate job match percentage with DeepSeek
            const deepSeekMatchResponse = await deepseekClient.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: generateJobMatchPrompt(jobData, candidateSummary),
                    },
                ],
            });
            results.deepSeekJobMatchPercentage = deepSeekMatchResponse.choices[0]?.message?.content.trim() || "";
            log("INFO", "DeepSeek Processed Job Match + Job Summary", { deepSeekJobMatchPercentage: results.deepSeekJobMatchPercentage, deepSeekJobSummary: results.deepSeekJobSummary });

        } catch (error) {
            log("ERROR", "Error processing DeepSeek job match:", error.message);
        }
    }

    return results;
}

module.exports = {
    evaluateJobMatch,
};
