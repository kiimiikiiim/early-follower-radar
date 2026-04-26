# Run Scraper Guide

## Overview

`runScraper.js` is a command-line script that automates the process of scraping all tracked Twitter/X accounts and consolidating the results into a single JSON file.

## Features

- **Batch Processing**: Scrapes all tracked accounts in sequence
- **Consolidation**: Merges results so each account shows all big accounts that follow it
- **Rate Limiting**: Automatic delays between scrapes to avoid blocking
- **Error Handling**: Continues scraping even if individual accounts fail
- **Progress Tracking**: Real-time logging of scraping progress
- **Flexible Options**: Command-line arguments for customization
- **Dry Run Mode**: Preview what would be scraped without actually scraping

## Installation

The script requires no additional dependencies beyond what's already installed:

```bash
cd backend
npm install  # Already done
```

## Usage

### Basic Usage

Scrape all tracked accounts with default settings:

```bash
node runScraper.js
```

### With Options

#### Limit Accounts Per User

Scrape only the first 50 accounts from each big account:

```bash
node runScraper.js --limit 50
```

#### Scrape Specific Accounts

Scrape only certain accounts:

```bash
node runScraper.js --accounts paulg,elonmusk,sama
```

#### Quiet Mode

Suppress verbose logging:

```bash
node runScraper.js --quiet
```

#### Dry Run Mode

Preview what would be scraped without actually scraping:

```bash
node runScraper.js --dry-run
```

#### Combined Options

```bash
node runScraper.js --limit 100 --accounts paulg,elonmusk --quiet
```

### Get Help

```bash
node runScraper.js --help
```

## Output

### Output File

Results are saved to:

```
backend/data/currentFollowing.json
```

### Output Format

Each account in the output has:

```json
{
  "username": "small_account",
  "displayName": "Display Name",
  "followed_by": ["big_account1", "big_account2"]
}
```

**Fields:**
- `username`: The handle of the followed account (lowercase)
- `displayName`: The display name from Twitter/X (may be null)
- `followed_by`: Array of big accounts that follow this account

### Example Output

```json
[
  {
    "username": "ai_researcher",
    "displayName": "AI Researcher",
    "followed_by": [
      "elonmusk",
      "sama"
    ]
  },
  {
    "username": "crypto_builder",
    "displayName": "Crypto Developer",
    "followed_by": [
      "paulg",
      "naval"
    ]
  },
  {
    "username": "emerging_dev",
    "displayName": "Emerging Developer",
    "followed_by": [
      "paulg"
    ]
  }
]
```

## How It Works

1. **Initialize**: Loads tracked accounts from `trackedAccounts.js`
2. **Loop**: For each tracked account:
   - Calls `scrapeFollowing()` to get their following list
   - Merges results into consolidated object
   - Waits 5 seconds before next scrape (rate limiting)
3. **Consolidate**: Combines all results so each account shows all followers
4. **Save**: Writes consolidated results to JSON file
5. **Report**: Displays summary statistics

## Consolidation Logic

When the same account appears in multiple big accounts' following lists, it's merged:

**Before:**
```
paulg follows: [ai_researcher, crypto_builder]
elonmusk follows: [ai_researcher, ml_engineer]
```

**After:**
```json
[
  {
    "username": "ai_researcher",
    "followed_by": ["paulg", "elonmusk"]
  },
  {
    "username": "crypto_builder",
    "followed_by": ["paulg"]
  },
  {
    "username": "ml_engineer",
    "followed_by": ["elonmusk"]
  }
]
```

## Performance

### Timing

| Scenario | Time |
|----------|------|
| 11 accounts × 50 each | ~5-10 minutes |
| 11 accounts × 100 each | ~10-20 minutes |
| 5 accounts × 100 each | ~5-10 minutes |

Timing includes:
- Browser startup/shutdown per account
- Page loading and scrolling
- 5-second delays between scrapes

### Output Size

| Accounts Scraped | Unique Results | File Size |
|------------------|----------------|-----------|
| 11 × 50 | ~500-800 | ~50-80 KB |
| 11 × 100 | ~1000-1500 | ~100-150 KB |

## Error Handling

The script handles various error scenarios:

### Network Errors

If a scrape fails due to network issues:
```
[10:02:30 PM] ✗ [2/11] Error: Page did not load
```

The script continues with the next account.

### Rate Limiting

If Twitter blocks requests:
```
[10:02:45 PM] ✗ [3/11] Error: Too many requests
```

Wait a few minutes and retry.

### Invalid Accounts

If an account doesn't exist:
```
[10:03:00 PM] ✗ [4/11] Error: Account not found
```

The script skips it and continues.

## Examples

### Example 1: Quick Test

Scrape just 2 accounts with 30 results each:

```bash
node runScraper.js --accounts paulg,elonmusk --limit 30
```

### Example 2: Full Scrape

Scrape all 11 tracked accounts with 100 results each:

```bash
node runScraper.js --limit 100
```

### Example 3: Preview Only

See what would be scraped without actually scraping:

```bash
node runScraper.js --dry-run
```

### Example 4: Quiet Mode

Run in background with minimal output:

```bash
node runScraper.js --quiet > scraper.log 2>&1 &
```

### Example 5: Specific Accounts

Scrape only VCs:

```bash
node runScraper.js --accounts paulg,naval,sama --limit 100
```

## Monitoring Progress

The script provides real-time progress updates:

```
[10:02:25 PM] 📊 Starting scraper...
[10:02:25 PM] 📊 Limit per account: 100
[10:02:25 PM] 📊 Scraping 11 accounts...
[10:02:26 PM] 📊 [1/11] Scraping @paulg...
[10:02:45 PM] ✓ Found 87 accounts
[10:02:45 PM] 📊 Waiting 5s before next scrape...
[10:02:50 PM] 📊 [2/11] Scraping @elonmusk...
...
[10:15:30 PM] ✨ Scraping completed!
[10:15:30 PM] 📊 Duration: 780.5s
[10:15:30 PM] 📊 Successful scrapes: 11/11
[10:15:30 PM] 📊 Failed scrapes: 0/11
[10:15:30 PM] 📊 Total accounts found: 1247
[10:15:30 PM] 📊 Unique accounts: 892
```

## Merging with Existing Data

The script automatically merges new results with existing data:

1. Loads existing `data/currentFollowing.json` if it exists
2. Scrapes new accounts
3. Merges new results with existing data
4. Saves combined results

This allows you to:
- Run the script multiple times to update results
- Add new big accounts without losing old data
- Track changes over time

## Integration with Backend API

After running the scraper, you can load the results into your database:

```javascript
const fs = require('fs');
const Database = require('better-sqlite3');

const data = JSON.parse(fs.readFileSync('./data/currentFollowing.json', 'utf8'));
const db = new Database('./database/radar.db');

const stmt = db.prepare(`
  INSERT INTO tracked_follows (big_account_id, small_account_username, followed_at, signal_score)
  VALUES (?, ?, ?, ?)
`);

for (const account of data) {
  for (const bigAccount of account.followed_by) {
    // Get big account ID
    const bigAcctStmt = db.prepare('SELECT id FROM big_accounts WHERE username = ?');
    const bigAcct = bigAcctStmt.get(bigAccount);
    
    if (bigAcct) {
      stmt.run(
        bigAcct.id,
        account.username,
        new Date().toISOString(),
        50  // default signal score
      );
    }
  }
}

db.close();
```

## Troubleshooting

### Script Hangs

If the script seems to hang:
1. Check internet connection
2. Twitter may be rate limiting - wait a few minutes
3. Press Ctrl+C to stop and try again later

### No Results Found

If `data/currentFollowing.json` is empty:
1. Try with `--dry-run` to verify accounts are being scraped
2. Check if Twitter is blocking requests
3. Try with a single account: `--accounts paulg --limit 10`

### Memory Issues

If you get out-of-memory errors:
1. Reduce the limit: `--limit 50`
2. Scrape fewer accounts: `--accounts paulg,elonmusk`
3. Run on a machine with more RAM

### Permission Denied

If you get permission errors:
```bash
chmod +x runScraper.js
node runScraper.js
```

## Advanced Usage

### Scheduled Scraping

Run the scraper daily using cron:

```bash
# Add to crontab
0 2 * * * cd /home/ubuntu/early-follower-radar/backend && node runScraper.js --quiet
```

### Scrape and Import

Scrape and immediately import to database:

```bash
#!/bin/bash
cd /home/ubuntu/early-follower-radar/backend
node runScraper.js --quiet
node importScrapedData.js
```

### Backup Results

Keep historical backups:

```bash
#!/bin/bash
BACKUP_DIR="data/backups"
mkdir -p "$BACKUP_DIR"
cp data/currentFollowing.json "$BACKUP_DIR/currentFollowing_$(date +%Y%m%d_%H%M%S).json"
node runScraper.js
```

## Performance Tips

1. **Use Appropriate Limits**: 100 accounts is a good balance
2. **Batch Processing**: Run during off-peak hours
3. **Monitor Resources**: Check CPU/memory usage
4. **Rate Limiting**: Don't reduce the 5-second delay too much
5. **Error Recovery**: Check logs for failed scrapes

## Output Files

### Main Output
- `data/currentFollowing.json` - Consolidated scraping results

### Optional Logs
- `scraper.log` - Captured output if redirected

## Next Steps

After running the scraper:

1. **Review Results**: Check `data/currentFollowing.json`
2. **Import to Database**: Load results into SQLite
3. **Analyze Data**: Look for patterns and high-signal accounts
4. **Update Frontend**: Display results in the dashboard
5. **Schedule Recurring**: Set up periodic scraping

## Support

For issues or questions:
- Check `SCRAPER_GUIDE.md` for scraper details
- Check `API_ENDPOINTS.md` for API reference
- Review `trackedAccounts.js` for account configuration

---

**Happy scraping! 🚀**
