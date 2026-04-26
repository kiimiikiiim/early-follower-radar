#!/usr/bin/env node

/**
 * Detect Signals Script
 * 
 * Compares previousFollowing.json and currentFollowing.json to identify
 * new accounts that have been followed by big accounts.
 * 
 * Usage:
 *   node detectSignals.js
 *   node detectSignals.js --previous data/previousFollowing.json --current data/currentFollowing.json
 *   node detectSignals.js --verbose
 * 
 * Output:
 *   data/signals.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const DEFAULT_PREVIOUS = path.join(DATA_DIR, 'previousFollowing.json');
const DEFAULT_CURRENT = path.join(DATA_DIR, 'currentFollowing.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'signals.json');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    previous: DEFAULT_PREVIOUS,
    current: DEFAULT_CURRENT,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--previous' && args[i + 1]) {
      options.previous = args[i + 1];
      i++;
    } else if (arg === '--current' && args[i + 1]) {
      options.current = args[i + 1];
      i++;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Detect Signals - Find new accounts followed by big accounts

Usage:
  node detectSignals.js [options]

Options:
  --previous <path>    Path to previousFollowing.json (default: data/previousFollowing.json)
  --current <path>     Path to currentFollowing.json (default: data/currentFollowing.json)
  --verbose, -v        Show detailed output
  --help, -h           Show this help message

Examples:
  node detectSignals.js
  node detectSignals.js --verbose
  node detectSignals.js --previous old.json --current new.json
  node detectSignals.js --previous data/previousFollowing.json --current data/currentFollowing.json --verbose

Output:
  data/signals.json - New accounts with signal scores
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
 * Load JSON file
 */
function loadJsonFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to load ${filepath}: ${error.message}`);
  }
}

/**
 * Create a set of usernames from following list
 */
function createUsernameSet(followingList) {
  return new Set(followingList.map(acc => acc.username.toLowerCase()));
}

/**
 * Detect new signals
 */
function detectSignals(previousFollowing, currentFollowing) {
  const previousSet = createUsernameSet(previousFollowing);
  const signals = [];

  // Find new accounts in current that aren't in previous
  for (const account of currentFollowing) {
    const username = account.username.toLowerCase();

    if (!previousSet.has(username)) {
      signals.push({
        username: account.username,
        followed_by: account.followed_by,
        score: account.followed_by.length
      });
    }
  }

  // Sort by score (highest first), then by username
  signals.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.username.localeCompare(b.username);
  });

  return signals;
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
 * Print signal summary
 */
function printSummary(signals, verbose = false) {
  console.log('');
  log(`Found ${signals.length} new signals`, 'success');
  console.log('');

  if (signals.length === 0) {
    log('No new accounts detected', 'info');
    return;
  }

  // Score distribution
  const scoreDistribution = {};
  for (const signal of signals) {
    scoreDistribution[signal.score] = (scoreDistribution[signal.score] || 0) + 1;
  }

  log('Score distribution:', 'info');
  Object.keys(scoreDistribution)
    .sort((a, b) => b - a)
    .forEach(score => {
      log(`  Score ${score}: ${scoreDistribution[score]} accounts`, 'info');
    });

  console.log('');

  // Top signals
  const topCount = Math.min(10, signals.length);
  log(`Top ${topCount} signals:`, 'info');
  for (let i = 0; i < topCount; i++) {
    const signal = signals[i];
    log(`  ${i + 1}. @${signal.username} (score: ${signal.score}) - followed by ${signal.followed_by.join(', ')}`, 'info');
  }

  if (verbose && signals.length > topCount) {
    console.log('');
    log('All signals:', 'info');
    for (let i = topCount; i < signals.length; i++) {
      const signal = signals[i];
      log(`  ${i + 1}. @${signal.username} (score: ${signal.score}) - followed by ${signal.followed_by.join(', ')}`, 'info');
    }
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  log('Starting signal detection...', 'info');
  log(`Previous file: ${options.previous}`, 'info');
  log(`Current file: ${options.current}`, 'info');
  console.log('');

  try {
    // Load files
    log('Loading previous following list...', 'info');
    const previousFollowing = loadJsonFile(options.previous);
    log(`  Loaded ${previousFollowing.length} accounts`, 'success');

    log('Loading current following list...', 'info');
    const currentFollowing = loadJsonFile(options.current);
    log(`  Loaded ${currentFollowing.length} accounts`, 'success');

    console.log('');

    // Detect signals
    log('Comparing lists...', 'info');
    const signals = detectSignals(previousFollowing, currentFollowing);

    // Save results
    log(`Saving ${signals.length} signals to ${OUTPUT_FILE}...`, 'info');
    if (saveResults(signals, OUTPUT_FILE)) {
      // Print summary
      printSummary(signals, options.verbose);

      log(`Output saved to: ${OUTPUT_FILE}`, 'success');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
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

// Run the detector
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
