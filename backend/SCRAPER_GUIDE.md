# Twitter/X Scraper Guide

## Overview

The scraper module extracts the "following" list of any Twitter/X user using Playwright. It collects up to 100-200 accounts per user and returns structured data ready for analysis.

## Installation

The scraper requires Playwright and its browsers to be installed:

```bash
cd backend
npm install playwright
npx playwright install chromium
```

## Usage

### Method 1: Direct Function Import

```javascript
const { scrapeFollowing } = require('./scraper');

// Scrape up to 100 accounts
const following = await scrapeFollowing('elonmusk', 100);

console.log(following);
// Output:
// [
//   {
//     username: "handle",
//     displayName: "Display Name",
//     followed_by: "elonmusk"
//   },
//   ...
// ]
```

### Method 2: API Endpoint (Scrape Only)

**Endpoint:** `POST /api/scrape-following`

**Request:**
```bash
curl -X POST http://localhost:4000/api/scrape-following \
  -H "Content-Type: application/json" \
  -d '{
    "username": "elonmusk",
    "limit": 100
  }'
```

**Response:**
```json
{
  "success": true,
  "username": "elonmusk",
  "count": 87,
  "accounts": [
    {
      "username": "handle",
      "displayName": "Display Name",
      "followed_by": "elonmusk"
    }
  ]
}
```

### Method 3: API Endpoint (Scrape & Save)

**Endpoint:** `POST /api/scrape-and-save`

This endpoint scrapes the following list and automatically saves all accounts to the database.

**Request:**
```bash
curl -X POST http://localhost:4000/api/scrape-and-save \
  -H "Content-Type: application/json" \
  -d '{
    "username": "elonmusk",
    "big_account_id": 2,
    "signal_score": 75
  }'
```

**Response:**
```json
{
  "success": true,
  "username": "elonmusk",
  "scrapedCount": 87,
  "savedCount": 85,
  "message": "Scraped 87 accounts, saved 85 to database"
}
```

### Method 4: Command Line Test

```bash
node test-scraper.js elonmusk 100
```

This will:
1. Scrape the first 100 accounts followed by @elonmusk
2. Display the results in the terminal
3. Output full JSON for further processing

## Function Signature

```javascript
scrapeFollowing(username, limit = 100)
```

**Parameters:**
- `username` (string, required): Twitter/X username without the @ symbol
- `limit` (number, optional): Maximum accounts to scrape (default: 100, max: 200)

**Returns:**
- Promise that resolves to an array of objects with:
  - `username`: The handle of the followed account
  - `displayName`: The display name (if available)
  - `followed_by`: The username that was scraped

**Throws:**
- Error if the page cannot be loaded or scraped

## How It Works

1. **Launch Browser**: Opens Chromium in headless mode
2. **Navigate**: Goes to `https://x.com/{username}/following`
3. **Wait**: Waits for the page to load (3 seconds)
4. **Scroll & Extract**: 
   - Scrolls down to load more accounts
   - Extracts username and display name from each user card
   - Deduplicates results
   - Continues until limit is reached or no more content loads
5. **Return**: Returns array of scraped accounts
6. **Cleanup**: Closes the browser

## Output Format

Each scraped account is an object:

```javascript
{
  username: "handle",           // Twitter handle (without @)
  displayName: "Full Name",     // Display name (optional)
  followed_by: "big_account"    // The account being scraped
}
```

## Limitations & Notes

### Public Accounts Only
- The scraper can only access publicly visible following lists
- Private accounts' following lists cannot be scraped
- Twitter may require login for some accounts

### Rate Limiting
- Twitter may rate-limit or block requests if scraping too aggressively
- The scraper includes delays between scrolls to avoid detection
- Consider adding delays between multiple scrapes

### DOM Changes
- If Twitter/X changes their HTML structure, selectors may need updating
- The scraper uses `data-testid="UserCell"` which is relatively stable
- Monitor for changes if scraping fails

### Performance
- Scraping 100 accounts typically takes 30-60 seconds
- Scraping 200 accounts takes 60-120 seconds
- Time varies based on internet speed and page load times

## Error Handling

The scraper includes error handling for:
- Network failures
- Page load timeouts
- Missing DOM elements
- Duplicate accounts

Errors are logged to console and thrown to the caller.

## Examples

### Example 1: Scrape and Display

```javascript
const { scrapeFollowing } = require('./scraper');

async function example1() {
  try {
    const accounts = await scrapeFollowing('paulg', 50);
    console.log(`Found ${accounts.length} accounts`);
    accounts.forEach(acc => {
      console.log(`@${acc.username} - ${acc.displayName}`);
    });
  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}

example1();
```

### Example 2: Scrape Multiple Users

```javascript
const { scrapeFollowing } = require('./scraper');

async function example2() {
  const users = ['paulg', 'elonmusk', 'naval'];
  const results = {};
  
  for (const user of users) {
    try {
      console.log(`Scraping @${user}...`);
      results[user] = await scrapeFollowing(user, 100);
      console.log(`✓ Got ${results[user].length} accounts`);
    } catch (error) {
      console.error(`✗ Failed to scrape @${user}:`, error.message);
    }
  }
  
  console.log('\nResults:', results);
}

example2();
```

### Example 3: Save to Database

```javascript
const { scrapeFollowing } = require('./scraper');
const Database = require('better-sqlite3');

async function example3() {
  const db = new Database('./database/radar.db');
  
  try {
    // Scrape accounts
    const accounts = await scrapeFollowing('elonmusk', 100);
    
    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO tracked_follows (big_account_id, small_account_username, followed_at, signal_score)
      VALUES (?, ?, ?, ?)
    `);
    
    let saved = 0;
    for (const account of accounts) {
      try {
        stmt.run(2, account.username, new Date().toISOString(), 75);
        saved++;
      } catch (err) {
        console.error(`Failed to save ${account.username}`);
      }
    }
    
    console.log(`Saved ${saved}/${accounts.length} accounts to database`);
  } finally {
    db.close();
  }
}

example3();
```

## Troubleshooting

### "Playwright browsers not installed"
```bash
npx playwright install chromium
```

### "Cannot find module 'playwright'"
```bash
npm install playwright
```

### "Page did not load" or "Timeout"
- Check internet connection
- Twitter/X may be blocking requests
- Try with a different username
- Wait a few minutes and retry

### "No accounts found"
- The following list may be private
- The user may not exist
- Try with a public figure like @elonmusk or @paulg

### "Scraper hangs or is very slow"
- This is normal for large lists (200+ accounts)
- Increase the timeout in scraper.js if needed
- Check your internet speed

## Performance Tips

1. **Batch Scraping**: Scrape multiple users sequentially, not in parallel
2. **Reasonable Limits**: Use 100-150 accounts per scrape for best results
3. **Error Recovery**: Implement retry logic for failed scrapes
4. **Caching**: Store results to avoid re-scraping the same user
5. **Rate Limiting**: Add delays between scrapes (5-10 seconds)

## API Integration

The scraper is integrated into the backend API:

**Available Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/scrape-following` | Scrape and return data |
| POST | `/api/scrape-and-save` | Scrape and save to database |

**Start Backend:**
```bash
npm start
```

**Test Endpoint:**
```bash
curl -X POST http://localhost:4000/api/scrape-following \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "limit": 50}'
```

## Legal & Ethical Considerations

- Always respect Twitter/X's Terms of Service
- Use scraped data responsibly
- Don't overload servers with aggressive scraping
- Consider the privacy of the accounts being scraped
- This tool is for educational and research purposes

## Future Improvements

Potential enhancements to the scraper:

1. **Proxy Support**: Route requests through proxies to avoid blocking
2. **Authentication**: Support authenticated scraping for private lists
3. **Caching**: Cache results to avoid re-scraping
4. **Filtering**: Filter results by follower count, verification status, etc.
5. **Enrichment**: Add additional data like bio, follower count, etc.
6. **Scheduling**: Automatic periodic scraping of multiple accounts
7. **Export**: Export results to CSV, JSON, or other formats

---

**Happy scraping! 🚀**
