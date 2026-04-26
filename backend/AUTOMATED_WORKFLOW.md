# Automated Workflow Guide

## Overview

The updated `runScraper.js` now automatically manages file backups and runs signal detection after each scrape. This creates a complete, automated workflow that produces updated signals every time you run the scraper.

## Workflow Steps

### 1. Scrape Following Lists
- Loops through all tracked accounts
- Calls `scrapeFollowing()` for each
- Consolidates results into `currentFollowing.json`

### 2. Backup Previous State
- If `previousFollowing.json` exists:
  - Backs it up to `data/backups/previousFollowing_YYYY-MM-DD_TIMESTAMP.json`
  - Preserves historical state for analysis

### 3. Update Previous State
- Copies `currentFollowing.json` → `previousFollowing.json`
- This becomes the baseline for next comparison

### 4. Run Signal Detection
- Automatically executes `detectSignals.js`
- Compares previous vs current
- Generates `signals.json` with new accounts

### 5. Output Results
- `currentFollowing.json` - Latest following lists
- `previousFollowing.json` - Previous state (for next comparison)
- `signals.json` - New accounts with scores
- `data/backups/` - Historical backups

## Complete Workflow Diagram

```
┌─────────────────────────────────────────┐
│   node runScraper.js                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Scrape all tracked accounts           │
│   - paulg, elonmusk, sama, etc.         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Save to currentFollowing.json          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Backup previousFollowing.json          │
│   (if it exists)                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Copy current → previous                │
│   (for next comparison)                 │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Run detectSignals.js                   │
│   (automatic)                           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   Generate signals.json                  │
│   (new accounts with scores)            │
└─────────────────────────────────────────┘
```

## Usage

### Run Complete Workflow

```bash
node runScraper.js
```

This single command:
1. Scrapes all tracked accounts
2. Saves results to `currentFollowing.json`
3. Backs up previous state
4. Updates previous state
5. Runs signal detection
6. Generates `signals.json`

### With Options

```bash
# Scrape 50 accounts per user instead of 100
node runScraper.js --limit 50

# Scrape only specific accounts
node runScraper.js --accounts paulg,elonmusk,sama

# Quiet mode (minimal output)
node runScraper.js --quiet

# Dry run (preview without scraping)
node runScraper.js --dry-run
```

## Output Files

### Primary Files

| File | Purpose | Updated |
|------|---------|---------|
| `data/currentFollowing.json` | Latest following lists | Every run |
| `data/previousFollowing.json` | Previous state (baseline) | Every run |
| `data/signals.json` | New accounts with scores | Every run |

### Backup Files

```
data/backups/
├── previousFollowing_2026-04-26_1234567890.json
├── previousFollowing_2026-04-27_1234567890.json
├── previousFollowing_2026-04-28_1234567890.json
└── ...
```

Each backup is timestamped with date and milliseconds for uniqueness.

## Example Workflow

### First Run

```bash
$ node runScraper.js
[10:02:25 PM] 📊 Starting scraper...
[10:02:25 PM] 📊 Scraping 11 accounts...
...
[10:15:30 PM] ✨ Scraping completed!
[10:15:30 PM] 📊 Managing backups and detecting signals...
[10:15:30 PM] 📊   Saved current state as previous
[10:15:30 PM] 📊 Running signal detection...
[10:15:30 PM] ✓ Signal detection completed
[10:15:30 PM] ✓ All done! 🎉
```

**Files created:**
- `currentFollowing.json` - 892 accounts
- `previousFollowing.json` - 892 accounts (copy of current)
- `signals.json` - 0 signals (no previous data to compare)

### Second Run (24 hours later)

```bash
$ node runScraper.js
[10:02:25 PM] 📊 Starting scraper...
[10:02:25 PM] 📊 Scraping 11 accounts...
...
[10:15:30 PM] ✨ Scraping completed!
[10:15:30 PM] 📊 Managing backups and detecting signals...
[10:15:30 PM] 📊   Backed up previous state to previousFollowing_2026-04-26_1234567890.json
[10:15:30 PM] 📊   Saved current state as previous
[10:15:30 PM] 📊 Running signal detection...
[10:15:30 PM] 📊 Found 47 new signals
[10:15:30 PM] ✓ Signal detection completed
[10:15:30 PM] ✓ All done! 🎉
```

**Files created/updated:**
- `currentFollowing.json` - 939 accounts (47 new)
- `previousFollowing.json` - 939 accounts (updated)
- `signals.json` - 47 new accounts with scores
- `backups/previousFollowing_2026-04-26_*.json` - Backup of old state

## Scheduled Workflow

### Daily Scraping with Cron

```bash
# Add to crontab
0 2 * * * cd /home/ubuntu/early-follower-radar/backend && node runScraper.js --quiet >> logs/scraper.log 2>&1
```

This runs the complete workflow daily at 2:00 AM and logs results.

### Bash Script for Scheduled Runs

```bash
#!/bin/bash
# daily-scrape.sh

BACKEND_DIR="/home/ubuntu/early-follower-radar/backend"
LOG_DIR="$BACKEND_DIR/logs"
LOG_FILE="$LOG_DIR/scraper_$(date +%Y%m%d).log"

# Create log directory if needed
mkdir -p "$LOG_DIR"

# Run the scraper
cd "$BACKEND_DIR"
echo "=== Scraper run at $(date) ===" >> "$LOG_FILE"
node runScraper.js --quiet >> "$LOG_FILE" 2>&1

# Check if signals were found
SIGNAL_COUNT=$(jq 'length' data/signals.json 2>/dev/null || echo "0")
echo "Signals found: $SIGNAL_COUNT" >> "$LOG_FILE"

# Optional: Send notification
if [ "$SIGNAL_COUNT" -gt 0 ]; then
  echo "✓ Found $SIGNAL_COUNT new signals" >> "$LOG_FILE"
fi
```

## Monitoring

### Check Latest Signals

```bash
# View latest signals
cat data/signals.json | jq '.[] | {username, score, followed_by}'

# Get high-signal accounts (score >= 2)
cat data/signals.json | jq '.[] | select(.score >= 2)'

# Count signals by score
cat data/signals.json | jq 'group_by(.score) | map({score: .[0].score, count: length})'
```

### View Backup History

```bash
# List all backups
ls -lh data/backups/

# Count backups
ls data/backups/ | wc -l

# View oldest backup
ls -lt data/backups/ | tail -1
```

## Data Retention

### Backup Strategy

The workflow keeps historical backups for analysis:

- **Daily runs**: Creates 1 backup per day
- **Weekly**: ~7 backups
- **Monthly**: ~30 backups
- **Yearly**: ~365 backups

### Cleanup Old Backups

```bash
# Remove backups older than 30 days
find data/backups/ -type f -mtime +30 -delete

# Remove backups older than 90 days
find data/backups/ -type f -mtime +90 -delete

# Keep only last 50 backups
ls -t data/backups/ | tail -n +51 | xargs rm
```

## Signal Analysis

### Track Signal Trends

```bash
# Compare signals from different runs
jq 'length' data/signals.json  # Current signals
jq 'length' data/backups/previousFollowing_*.json  # Historical

# Find accounts that were signals multiple times
# (appeared in multiple signal.json files)
```

### Export Signals to CSV

```bash
# Export current signals to CSV
jq -r '.[] | [.username, .score, (.followed_by | join(";"))] | @csv' data/signals.json > signals.csv
```

### Analyze High-Signal Accounts

```bash
# Get accounts followed by 3+ big accounts
cat data/signals.json | jq '.[] | select(.score >= 3)'

# Get all accounts followed by specific big account
cat data/signals.json | jq '.[] | select(.followed_by[] == "paulg")'

# Sort by score and display top 10
cat data/signals.json | jq 'sort_by(.score) | reverse | .[0:10]'
```

## Troubleshooting

### Signals Not Detected

**Problem**: Signal detection runs but finds 0 signals.

**Causes**:
- First run (no previous data to compare)
- No new accounts followed
- Files not being updated

**Solution**:
```bash
# Check if previousFollowing.json exists
ls -l data/previousFollowing.json

# Check if currentFollowing.json was updated
stat data/currentFollowing.json

# Manually run signal detection
node detectSignals.js --verbose
```

### Backups Not Created

**Problem**: Backup directory is empty.

**Causes**:
- First run (no previous state to backup)
- Backup directory not writable

**Solution**:
```bash
# Check backup directory permissions
ls -ld data/backups/

# Manually create backup
cp data/previousFollowing.json data/backups/manual_backup_$(date +%s).json
```

### Signal Detection Fails

**Problem**: Error running detectSignals.js.

**Causes**:
- detectSignals.js not found
- File permissions issue
- JSON parsing error

**Solution**:
```bash
# Verify detectSignals.js exists
ls -l detectSignals.js

# Make it executable
chmod +x detectSignals.js

# Test manually
node detectSignals.js --verbose
```

## Performance

### Timing

| Step | Time |
|------|------|
| Scrape 11 accounts × 100 each | 10-20 minutes |
| Save results | < 1 second |
| Backup files | < 1 second |
| Signal detection | < 1 second |
| **Total** | **10-20 minutes** |

### Storage

| File | Size |
|------|------|
| currentFollowing.json | ~100-150 KB |
| previousFollowing.json | ~100-150 KB |
| signals.json | ~10-50 KB |
| Each backup | ~100-150 KB |

**Storage for 30 days of daily runs:**
- 30 backups × 150 KB = ~4.5 MB

## Best Practices

1. **Regular Runs**: Schedule daily or weekly scrapes
2. **Monitor Signals**: Review high-score accounts regularly
3. **Backup Management**: Clean up old backups periodically
4. **Log Monitoring**: Check logs for errors
5. **Database Integration**: Import signals to database for analysis

## Next Steps

After each workflow run:

1. **Review Signals**: Check `signals.json` for interesting accounts
2. **Analyze**: Look at high-score accounts (score >= 2)
3. **Import**: Add signals to database
4. **Monitor**: Track these accounts for future activity
5. **Repeat**: Run workflow again in 24 hours

## Integration with Database

```javascript
// Import latest signals to database
const fs = require('fs');
const Database = require('better-sqlite3');

const signals = JSON.parse(fs.readFileSync('./data/signals.json'));
const db = new Database('./database/radar.db');

const stmt = db.prepare(`
  INSERT INTO tracked_follows (big_account_id, small_account_username, followed_at, signal_score)
  VALUES (?, ?, ?, ?)
`);

for (const signal of signals) {
  for (const bigAccount of signal.followed_by) {
    const bigAcctStmt = db.prepare('SELECT id FROM big_accounts WHERE username = ?');
    const bigAcct = bigAcctStmt.get(bigAccount);
    
    if (bigAcct) {
      stmt.run(
        bigAcct.id,
        signal.username,
        new Date().toISOString(),
        signal.score * 20  // Convert to 0-100 scale
      );
    }
  }
}

db.close();
console.log(`Imported ${signals.length} signals to database`);
```

---

**Happy signal hunting! 🚀**
