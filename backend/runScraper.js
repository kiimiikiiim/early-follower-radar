#!/usr/bin/env node

/**
 * Run Scraper Script
 * 
 * Loops through all tracked accounts, scrapes their following lists,
 * and consolidates results into a single JSON file.
 * 
 * Usage:
 *   node runScraper.js
 *   node runScraper.js --limit 50
 *   node runScraper.js --accounts paulg,elonmusk
 * 
 * Output:
 *   data/currentFollowing.json
 */

const fs = require('fs');
const path = require('path');
const { scrapeFollowing } = require('./scraper');
const { getTrackedAccounts } = require('./trackedAccounts');

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'currentFollowing.json');
const PREVIOUS_FILE = path.join(OUTPUT_DIR, 'previousFollowing.json');
const BACKUP_DIR = path.join(OUTPUT_DIR, 'backups');
const DEFAULT_LIMIT = 100;
const DELAY_BETWEEN_SCRAPES = 5000; // 5 seconds

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    accounts: null,
    verbose: true,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--accounts' && args[i + 1]) {
      options.accounts = args[i + 1].split(',').map(a => a.trim().toLowerCase());
      i++;
    } else if (arg === '--quiet') {
      options.verbose = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Run Scraper - Scrape all tracked Twitter/X accounts

Usage:
  node runScraper.js [options]

Options:
  --limit <number>        Maximum accounts to scrape per user (default: 100)
  --accounts <list>       Comma-separated list of accounts to scrape
  --quiet                 Suppress verbose output
  --dry-run               Show what would be scraped without actually scraping
  --help                  Show this help message

Examples:
  node runScraper.js
  node runScraper.js --limit 50
  node runScraper.js --accounts paulg,elonmusk
  node runScraper.js --limit 100 --quiet
  node runScraper.js --dry-run

Output:
  data/currentFollowing.json - Consolidated scraping results
  `);
}

/**
 * Log with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📊',
    success: '✓',
    error: '✗',
    warn: '⚠'
  }[level] || '•';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Merge scraped accounts into consolidated result
 */
function mergeResults(consolidated, scraped, bigAccount) {
  for (const account of scraped) {
    const username = account.username.toLowerCase();

    if (!consolidated[username]) {
      consolidated[username] = {
        username: account.username,
        displayName: account.displayName || null,
        followed_by: []
      };
    }

    // Add big account to followed_by if not already there
    if (!consolidated[username].followed_by.includes(bigAccount)) {
      consolidated[username].followed_by.push(bigAccount);
    }
  }
}

/**
 * Convert consolidated object to array format
 */
function consolidatedToArray(consolidated) {
  return Object.values(consolidated)
    .sort((a, b) => a.username.localeCompare(b.username));
}

/**
 * Save results to JSON file
 */
function saveResults(data, filepath) {
  try {
    fs.writeFileSync(
      filepath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    log(`Failed to save results: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Load existing results from JSON file
 */
function loadExistingResults() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const data = fs.readFileSync(OUTPUT_FILE, 'utf8');
      const results = JSON.parse(data);
      
      // Convert array back to object for merging
      const consolidated = {};
      for (const account of results) {
        consolidated[account.username.toLowerCase()] = account;
      }
      return consolidated;
    }
  } catch (error) {
    log(`Warning: Could not load existing results: ${error.message}`, 'warn');
  }
  return {};
}

/**
 * Manage file backups and rotation
 */
function manageBackups() {
  try {
    // If previousFollowing.json exists, backup it
    if (fs.existsSync(PREVIOUS_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupFile = path.join(BACKUP_DIR, `previousFollowing_${timestamp}_${Date.now()}.json`);
      fs.copyFileSync(PREVIOUS_FILE, backupFile);
      log(`  Backed up previous state to ${path.basename(backupFile)}`, 'info');
    }

    // Copy currentFollowing.json to previousFollowing.json
    if (fs.existsSync(OUTPUT_FILE)) {
      fs.copyFileSync(OUTPUT_FILE, PREVIOUS_FILE);
      log(`  Saved current state as previous`, 'info');
    }
  } catch (error) {
    log(`Warning: Failed to manage backups: ${error.message}`, 'warn');
  }
}

/**
 * Run signal detection
 */
function runSignalDetection() {
  try {
    // Check if previousFollowing.json exists
    if (!fs.existsSync(PREVIOUS_FILE)) {
      log(`Skipping signal detection: previousFollowing.json not found`, 'info');
      return;
    }

    log(`Running signal detection...`, 'info');
    const { execSync } = require('child_process');
    
    // Run detectSignals.js
    const result = execSync(`node detectSignals.js --quiet`, {
      cwd: __dirname,
      encoding: 'utf8'
    });

    log(`Signal detection completed`, 'success');
    return true;
  } catch (error) {
    log(`Warning: Signal detection failed: ${error.message}`, 'warn');
    return false;
  }
}

/**
 * Main scraping function
 */
async function runScraper() {
  const options = parseArgs();

  log('Starting scraper...', 'info');
  log(`Limit per account: ${options.limit}`, 'info');

  // Get accounts to scrape
  let accountsToScrape = options.accounts || getTrackedAccounts();
  
  if (options.dryRun) {
    log(`DRY RUN: Would scrape ${accountsToScrape.length} accounts`, 'info');
    accountsToScrape.forEach((acc, i) => {
      log(`  ${i + 1}. @${acc}`, 'info');
    });
    process.exit(0);
  }

  log(`Scraping ${accountsToScrape.length} accounts...`, 'info');

  // Load existing results to merge with new data
  const consolidated = loadExistingResults();
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;
  let totalAccounts = 0;

  // Loop through each tracked account
  for (let i = 0; i < accountsToScrape.length; i++) {
    const account = accountsToScrape[i];

    try {
      log(`[${i + 1}/${accountsToScrape.length}] Scraping @${account}...`, 'info');

      const scraped = await scrapeFollowing(account, options.limit);
      log(`  Found ${scraped.length} accounts`, 'success');

      mergeResults(consolidated, scraped, account);
      totalAccounts += scraped.length;
      successCount++;

      // Wait before next scrape (rate limiting)
      if (i < accountsToScrape.length - 1) {
        log(`  Waiting ${DELAY_BETWEEN_SCRAPES / 1000}s before next scrape...`, 'info');
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SCRAPES));
      }
    } catch (error) {
      log(`  Error: ${error.message}`, 'error');
      failureCount++;
    }
  }

  // Convert to array format
  const results = consolidatedToArray(consolidated);

  // Save results
  log(`Saving ${results.length} unique accounts to ${OUTPUT_FILE}...`, 'info');
  if (saveResults(results, OUTPUT_FILE)) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    log(``, 'info');
    log(`✨ Scraping completed!`, 'success');
    log(`  Duration: ${duration}s`, 'info');
    log(`  Successful scrapes: ${successCount}/${accountsToScrape.length}`, 'info');
    log(`  Failed scrapes: ${failureCount}/${accountsToScrape.length}`, 'info');
    log(`  Total accounts found: ${totalAccounts}`, 'info');
    log(`  Unique accounts: ${results.length}`, 'info');
    log(`  Output file: ${OUTPUT_FILE}`, 'info');
    log(``, 'info');

    // Print sample of results
    if (results.length > 0) {
      log(`Sample results (first 5):`, 'info');
      results.slice(0, 5).forEach(acc => {
        log(`  @${acc.username} - followed by: ${acc.followed_by.join(', ')}`, 'info');
      });
    }

    console.log('');
    log(`Managing backups and detecting signals...`, 'info');
    manageBackups();
    runSignalDetection();

    console.log('');
    log(`All done! 🎉`, 'success');
    process.exit(0);
  } else {
    log(`Failed to save results`, 'error');
    process.exit(1);
  }
}

/**
 * Error handling
 */
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection: ${reason}`, 'error');
  process.exit(1);
});

process.on('SIGINT', () => {
  log(`Interrupted by user`, 'warn');
  process.exit(0);
});

// Run the scraper
runScraper().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
