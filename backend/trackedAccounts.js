/**
 * Tracked Accounts Configuration
 * 
 * This file contains a list of Twitter/X usernames to track.
 * These accounts will be monitored for new follows that can be scraped.
 * 
 * Usage:
 *   const { trackedAccounts } = require('./trackedAccounts');
 *   trackedAccounts.forEach(account => console.log(account));
 */

const trackedAccounts = [
  // Tech & Venture Capital
  "paulg",           // Paul Graham - Y Combinator founder
  "elonmusk",        // Elon Musk - Tesla, SpaceX, X
  "sama",            // Sam Altman - OpenAI CEO
  "naval",           // Naval Ravikant - Entrepreneur, investor
  
  // Business & Entrepreneurship
  "ycombinator",     // Y Combinator official account
  "TechCrunch",      // TechCrunch news
  "VentureBeat",     // VentureBeat news
  "forbes",          // Forbes magazine
  
  // Innovation & AI
  "karpathy",        // Andrej Karpathy - AI researcher
  "ylecun",          // Yann LeCun - Meta AI Chief Scientist
  
  // Additional influential accounts
  "jack",            // Jack Dorsey - Twitter co-founder
];

/**
 * Get all tracked accounts
 * @returns {Array<string>} Array of Twitter/X usernames
 */
function getTrackedAccounts() {
  return trackedAccounts;
}

/**
 * Get tracked account by index
 * @param {number} index - Index of the account
 * @returns {string|null} Username or null if not found
 */
function getAccountByIndex(index) {
  return trackedAccounts[index] || null;
}

/**
 * Check if an account is being tracked
 * @param {string} username - Username to check
 * @returns {boolean} True if account is tracked
 */
function isAccountTracked(username) {
  return trackedAccounts.includes(username.toLowerCase());
}

/**
 * Get total number of tracked accounts
 * @returns {number} Count of tracked accounts
 */
function getAccountCount() {
  return trackedAccounts.length;
}

/**
 * Add a new account to track
 * @param {string} username - Username to add
 * @returns {boolean} True if added, false if already exists
 */
function addAccount(username) {
  const normalized = username.toLowerCase();
  if (!trackedAccounts.includes(normalized)) {
    trackedAccounts.push(normalized);
    return true;
  }
  return false;
}

/**
 * Remove an account from tracking
 * @param {string} username - Username to remove
 * @returns {boolean} True if removed, false if not found
 */
function removeAccount(username) {
  const normalized = username.toLowerCase();
  const index = trackedAccounts.indexOf(normalized);
  if (index > -1) {
    trackedAccounts.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = {
  trackedAccounts,
  getTrackedAccounts,
  getAccountByIndex,
  isAccountTracked,
  getAccountCount,
  addAccount,
  removeAccount
};
