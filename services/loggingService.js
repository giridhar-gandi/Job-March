function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, context ?? null);
}

module.exports = { log };
