const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Paths
const logsDir = path.join(__dirname, 'logs');
const logFile = path.join(logsDir, 'scheduler.log');
const signalsFile = path.join(__dirname, 'data', 'signals.json');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Append to log file
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Get signal count
function getSignalCount() {
  try {
    if (fs.existsSync(signalsFile)) {
      const data = fs.readFileSync(signalsFile, 'utf8');
      const signals = JSON.parse(data);
      return signals.length;
    }
  } catch (err) {
    console.error('Error reading signals:', err.message);
  }
  return 0;
}

// Run scraper job
async function runScraperJob() {
  log('🔄 Starting scheduled scraper job...');
  
  try {
    // Run runScraper.js
    log('📊 Running scraper...');
    const { stdout, stderr } = await execAsync('node runScraper.js --quiet', {
      cwd: __dirname,
      timeout: 3600000, // 1 hour timeout
    });

    if (stderr) {
      log(`⚠️  Scraper stderr: ${stderr}`);
    }

    log('✓ Scraper completed');

    // Get signal count
    const signalCount = getSignalCount();
    log(`📈 Detected ${signalCount} total signals`);

    // Log high-signal count
    try {
      const signalsData = fs.readFileSync(signalsFile, 'utf8');
      const signals = JSON.parse(signalsData);
      const highSignals = signals.filter(s => s.score >= 2).length;
      log(`⭐ High-signal accounts: ${highSignals}`);
    } catch (err) {
      log(`⚠️  Could not count high signals: ${err.message}`);
    }

    log('✅ Scheduled job completed successfully\n');
  } catch (err) {
    log(`❌ Error during scheduled job: ${err.message}`);
    console.error(err);
  }
}

// Initialize scheduler
function initializeScheduler() {
  log('🚀 Scheduler initialized');
  log('📅 Scheduled task: Every 6 hours');
  log(`⏰ Cron expression: 0 */6 * * *`);
  log('');

  // Schedule job every 6 hours (0 0 6 12 18)
  // Cron format: minute hour day month dayOfWeek
  // 0 */6 * * * = every 6 hours at minute 0
  const job = cron.schedule('0 */6 * * *', async () => {
    await runScraperJob();
  });

  log('✓ Cron job scheduled\n');

  return job;
}

// Manual trigger function (for testing)
async function triggerManually() {
  log('🔔 Manual trigger requested');
  await runScraperJob();
}

// Get scheduler status
function getStatus() {
  try {
    const stats = {
      logFile: logFile,
      logsExist: fs.existsSync(logFile),
      signalsFile: signalsFile,
      signalsExist: fs.existsSync(signalsFile),
      signalCount: getSignalCount(),
      lastUpdate: null,
    };

    // Get last log entry
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l);
      if (logs.length > 0) {
        stats.lastUpdate = logs[logs.length - 1];
      }
    }

    return stats;
  } catch (err) {
    console.error('Error getting status:', err.message);
    return null;
  }
}

module.exports = {
  initializeScheduler,
  triggerManually,
  getStatus,
  log,
};
