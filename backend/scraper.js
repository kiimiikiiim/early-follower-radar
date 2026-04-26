const { chromium } = require('playwright');

/**
 * Scrapes the "following" list of a Twitter/X user
 * @param {string} username - The Twitter/X username to scrape
 * @param {number} limit - Maximum number of accounts to scrape (default 100)
 * @returns {Promise<Array>} Array of objects with username and followed_by
 */
async function scrapeFollowing(username, limit = 100) {
  let browser;
  try {
    // Launch browser in headless mode
    browser = await chromium.launch({ headless: true });
    
    // Create a new context with a user agent that looks like a real browser
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    
    const page = await context.newPage();
    
    // Go to the user's following page
    console.log(`Navigating to https://x.com/${username}/following...`);
    await page.goto(`https://x.com/${username}/following`, { waitUntil: 'networkidle' });
    
    // Wait for the page to load
    // Note: Twitter often requires login to view following lists now,
    // but we'll try to extract what we can if it's publicly visible
    await page.waitForTimeout(3000);
    
    // Array to store the scraped accounts
    const following = [];
    const seenUsernames = new Set();
    
    // Scroll and extract loop
    let previousHeight = 0;
    let retries = 0;
    
    console.log(`Starting to scrape up to ${limit} accounts...`);
    
    while (following.length < limit && retries < 5) {
      // Extract user elements from the current view
      // This selector might need updates if Twitter changes their DOM structure
      const userElements = await page.$$('div[data-testid="UserCell"]');
      
      for (const element of userElements) {
        if (following.length >= limit) break;
        
        try {
          // Extract username (handle)
          const usernameElement = await element.$('div[dir="ltr"] > span');
          if (!usernameElement) continue;
          
          let handle = await usernameElement.innerText();
          handle = handle.replace('@', '').trim();
          
          // Skip if we've already seen this user or if it's empty
          if (!handle || seenUsernames.has(handle)) continue;
          
          // Extract display name
          let displayName = '';
          const nameElement = await element.$('div[dir="ltr"] span span');
          if (nameElement) {
            displayName = await nameElement.innerText();
          }
          
          seenUsernames.add(handle);
          following.push({
            username: handle,
            displayName: displayName.trim(),
            followed_by: username
          });
          
        } catch (err) {
          // Ignore errors for individual elements and continue
          console.error('Error extracting user info:', err.message);
        }
      }
      
      // Scroll down to load more
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForTimeout(2000); // Wait for network requests
      
      // Check if we've reached the bottom
      const currentHeight = await page.evaluate('document.body.scrollHeight');
      if (currentHeight === previousHeight) {
        retries++;
        console.log(`No new content loaded. Retry ${retries}/5`);
      } else {
        retries = 0;
        previousHeight = currentHeight;
      }
      
      console.log(`Scraped ${following.length} accounts so far...`);
    }
    
    console.log(`Successfully scraped ${following.length} accounts followed by ${username}`);
    return following;
    
  } catch (error) {
    console.error(`Error scraping following list for ${username}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeFollowing };
