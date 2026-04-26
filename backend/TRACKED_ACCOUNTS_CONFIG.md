# Tracked Accounts Configuration

## Overview

The `trackedAccounts.js` file contains a list of Twitter/X usernames to monitor. These accounts are the "big accounts" whose following lists will be scraped to discover emerging accounts.

## File Location

```
backend/trackedAccounts.js
```

## Current Tracked Accounts

The configuration includes 11 influential accounts across tech, venture capital, and entrepreneurship:

| # | Username | Description |
|---|----------|-------------|
| 1 | paulg | Paul Graham - Y Combinator founder |
| 2 | elonmusk | Elon Musk - Tesla, SpaceX, X |
| 3 | sama | Sam Altman - OpenAI CEO |
| 4 | naval | Naval Ravikant - Entrepreneur, investor |
| 5 | ycombinator | Y Combinator official account |
| 6 | TechCrunch | TechCrunch news |
| 7 | VentureBeat | VentureBeat news |
| 8 | forbes | Forbes magazine |
| 9 | karpathy | Andrej Karpathy - AI researcher |
| 10 | ylecun | Yann LeCun - Meta AI Chief Scientist |
| 11 | jack | Jack Dorsey - Twitter co-founder |

## Usage

### Import the Configuration

```javascript
const { trackedAccounts } = require('./trackedAccounts');

console.log(trackedAccounts);
// Output: ['paulg', 'elonmusk', 'sama', 'naval', ...]
```

### Use Helper Functions

The module exports several utility functions:

#### Get All Tracked Accounts

```javascript
const { getTrackedAccounts } = require('./trackedAccounts');

const accounts = getTrackedAccounts();
console.log(accounts);
```

#### Get Total Count

```javascript
const { getAccountCount } = require('./trackedAccounts');

console.log(`Tracking ${getAccountCount()} accounts`);
// Output: Tracking 11 accounts
```

#### Check if Account is Tracked

```javascript
const { isAccountTracked } = require('./trackedAccounts');

if (isAccountTracked('elonmusk')) {
  console.log('This account is being tracked');
}
```

#### Get Account by Index

```javascript
const { getAccountByIndex } = require('./trackedAccounts');

const firstAccount = getAccountByIndex(0);
console.log(firstAccount); // Output: paulg
```

#### Add New Account

```javascript
const { addAccount } = require('./trackedAccounts');

if (addAccount('satoshi')) {
  console.log('Account added successfully');
} else {
  console.log('Account already exists');
}
```

#### Remove Account

```javascript
const { removeAccount } = require('./trackedAccounts');

if (removeAccount('satoshi')) {
  console.log('Account removed successfully');
} else {
  console.log('Account not found');
}
```

## Integration with Scraper

### Scrape All Tracked Accounts

```javascript
const { scrapeFollowing } = require('./scraper');
const { getTrackedAccounts } = require('./trackedAccounts');

async function scrapeAllTrackedAccounts() {
  const accounts = getTrackedAccounts();
  
  for (const account of accounts) {
    try {
      console.log(`Scraping @${account}...`);
      const following = await scrapeFollowing(account, 100);
      console.log(`✓ Found ${following.length} accounts`);
      
      // Wait between scrapes to avoid rate limiting
      await new Promise(r => setTimeout(r, 5000));
    } catch (error) {
      console.error(`✗ Failed to scrape @${account}:`, error.message);
    }
  }
}

scrapeAllTrackedAccounts();
```

### Scrape and Save to Database

```javascript
const { scrapeFollowing } = require('./scraper');
const { getTrackedAccounts } = require('./trackedAccounts');
const Database = require('better-sqlite3');

async function scrapeAndSaveAll() {
  const db = new Database('./database/radar.db');
  const accounts = getTrackedAccounts();
  
  for (const username of accounts) {
    try {
      // Get the big account ID from database
      const stmt = db.prepare('SELECT id FROM big_accounts WHERE username = ?');
      const account = stmt.get(username);
      
      if (!account) {
        console.log(`Account @${username} not in database, skipping...`);
        continue;
      }
      
      console.log(`Scraping @${username}...`);
      const following = await scrapeFollowing(username, 100);
      
      // Save to database
      const insertStmt = db.prepare(`
        INSERT INTO tracked_follows (big_account_id, small_account_username, followed_at, signal_score)
        VALUES (?, ?, ?, ?)
      `);
      
      let saved = 0;
      for (const acc of following) {
        try {
          insertStmt.run(account.id, acc.username, new Date().toISOString(), 50);
          saved++;
        } catch (err) {
          // Skip duplicates
        }
      }
      
      console.log(`✓ Saved ${saved}/${following.length} accounts`);
      
      // Wait between scrapes
      await new Promise(r => setTimeout(r, 5000));
    } catch (error) {
      console.error(`✗ Error with @${username}:`, error.message);
    }
  }
  
  db.close();
}

scrapeAndSaveAll();
```

## Customization

### Add More Accounts

Edit `trackedAccounts.js` and add usernames to the array:

```javascript
const trackedAccounts = [
  "paulg",
  "elonmusk",
  "sama",
  // Add more here
  "your_username",
];
```

### Remove Accounts

Edit the array or use the `removeAccount()` function:

```javascript
const { removeAccount } = require('./trackedAccounts');

removeAccount('username_to_remove');
```

### Load from External Source

You can modify the file to load accounts from a JSON file or API:

```javascript
// Load from JSON file
const fs = require('fs');
let trackedAccounts = [];

try {
  const data = fs.readFileSync('./accounts.json', 'utf8');
  trackedAccounts = JSON.parse(data);
} catch (err) {
  console.error('Failed to load accounts:', err);
}
```

## API Integration

### Get Tracked Accounts via API

You can add an endpoint to your Express server to retrieve tracked accounts:

```javascript
app.get('/api/tracked-accounts', (req, res) => {
  const { getTrackedAccounts, getAccountCount } = require('./trackedAccounts');
  
  res.json({
    count: getAccountCount(),
    accounts: getTrackedAccounts()
  });
});
```

### Bulk Scrape Endpoint

Add an endpoint to scrape all tracked accounts:

```javascript
app.post('/api/scrape-all-tracked', async (req, res) => {
  const { getTrackedAccounts } = require('./trackedAccounts');
  const { scrapeFollowing } = require('./scraper');
  
  const accounts = getTrackedAccounts();
  const results = {};
  
  for (const account of accounts) {
    try {
      console.log(`Scraping @${account}...`);
      results[account] = await scrapeFollowing(account, 100);
      await new Promise(r => setTimeout(r, 5000)); // Rate limiting
    } catch (error) {
      results[account] = { error: error.message };
    }
  }
  
  res.json(results);
});
```

## Best Practices

1. **Keep List Updated**: Regularly update the list with relevant accounts
2. **Avoid Duplicates**: Check before adding new accounts
3. **Rate Limiting**: Always add delays between scrapes
4. **Error Handling**: Wrap scraping in try-catch blocks
5. **Logging**: Log all scraping activity for debugging
6. **Backup**: Keep a backup of your tracked accounts list

## Performance Considerations

- **11 accounts**: ~5-10 minutes to scrape all (with delays)
- **100 accounts**: ~1-2 hours to scrape all
- **Memory**: Minimal impact, each account uses ~100 bytes

## Troubleshooting

### Account Not Found

If an account doesn't exist on Twitter/X:
```javascript
const { isAccountTracked } = require('./trackedAccounts');

if (!isAccountTracked('username')) {
  console.log('Account not in tracked list');
}
```

### Duplicate Accounts

The `addAccount()` function prevents duplicates:
```javascript
const { addAccount } = require('./trackedAccounts');

addAccount('elonmusk'); // Returns false (already exists)
```

### Clear All Accounts

To reset the list:
```javascript
// Edit trackedAccounts.js and set:
const trackedAccounts = [];
```

## Future Enhancements

Potential improvements:

1. **Database Storage**: Store tracked accounts in the database instead of hardcoding
2. **Categories**: Group accounts by category (VCs, founders, researchers, etc.)
3. **Metadata**: Add metadata like follower count, verification status
4. **Priority**: Add priority levels for scraping order
5. **Schedule**: Automatic periodic scraping based on schedule
6. **Notifications**: Alert when new accounts are discovered

---

**For more information, see SCRAPER_GUIDE.md and API_ENDPOINTS.md**
