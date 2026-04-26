# Detect Signals Guide

## Overview

`detectSignals.js` is a script that compares two following lists (previous and current) to identify new accounts that have been followed by big accounts. These new accounts are "signals" - potentially emerging accounts worth tracking.

## How It Works

### Signal Detection Logic

1. **Load Files**: Reads `previousFollowing.json` and `currentFollowing.json`
2. **Compare**: Finds accounts in current that don't exist in previous
3. **Score**: Calculates score = number of big accounts following the new account
4. **Sort**: Sorts by score (highest first)
5. **Save**: Outputs to `signals.json`

### Example

**Previous Following:**
```json
[
  { "username": "existing_dev", "followed_by": ["paulg"] },
  { "username": "old_researcher", "followed_by": ["elonmusk", "sama"] }
]
```

**Current Following:**
```json
[
  { "username": "existing_dev", "followed_by": ["paulg"] },
  { "username": "old_researcher", "followed_by": ["elonmusk", "sama"] },
  { "username": "new_dev", "followed_by": ["paulg", "elonmusk"] },
  { "username": "emerging_ai", "followed_by": ["sama"] }
]
```

**Detected Signals:**
```json
[
  { "username": "new_dev", "followed_by": ["paulg", "elonmusk"], "score": 2 },
  { "username": "emerging_ai", "followed_by": ["sama"], "score": 1 }
]
```

## Installation

No additional dependencies required. The script uses only Node.js built-in modules.

## Usage

### Basic Usage

Compare default files:

```bash
node detectSignals.js
```

This looks for:
- `data/previousFollowing.json` (previous state)
- `data/currentFollowing.json` (current state)
- Outputs to `data/signals.json`

### With Options

#### Verbose Mode

Show all signals, not just top 10:

```bash
node detectSignals.js --verbose
# or
node detectSignals.js -v
```

#### Custom File Paths

```bash
node detectSignals.js --previous old.json --current new.json
```

#### Combined Options

```bash
node detectSignals.js --previous data/old.json --current data/new.json --verbose
```

### Get Help

```bash
node detectSignals.js --help
# or
node detectSignals.js -h
```

## Output

### Output File

Results are saved to:

```
backend/data/signals.json
```

### Output Format

Array of new accounts with signal scores:

```json
[
  {
    "username": "small_account",
    "followed_by": ["big_account1", "big_account2"],
    "score": 2
  },
  {
    "username": "another_account",
    "followed_by": ["big_account3"],
    "score": 1
  }
]
```

**Fields:**
- `username`: The handle of the new account (lowercase)
- `followed_by`: Array of big accounts that now follow this account
- `score`: Number of big accounts following (= length of `followed_by`)

### Sorting

Results are sorted by:
1. **Score** (highest first) - accounts followed by more big accounts rank higher
2. **Username** (alphabetically) - ties are broken alphabetically

## Examples

### Example 1: Basic Signal Detection

```bash
# First, create previousFollowing.json with old data
# Then update currentFollowing.json with new data
node detectSignals.js
```

Output:
```
[10:04:26 PM] 📊 Starting signal detection...
[10:04:26 PM] ✓ Found 6 new signals
[10:04:26 PM] 📊 Score distribution:
[10:04:26 PM] 📊   Score 3: 1 accounts
[10:04:26 PM] 📊   Score 2: 4 accounts
[10:04:26 PM] 📊   Score 1: 1 accounts
```

### Example 2: Verbose Output

```bash
node detectSignals.js --verbose
```

Shows all signals with detailed information.

### Example 3: Custom Files

```bash
node detectSignals.js --previous backup/old.json --current data/currentFollowing.json
```

### Example 4: Automated Workflow

```bash
#!/bin/bash
# Backup current as previous
cp data/currentFollowing.json data/previousFollowing.json

# Scrape new data
node runScraper.js

# Detect signals
node detectSignals.js --verbose

# Check results
cat data/signals.json
```

## Score Interpretation

The score represents how many big accounts are following a new account:

| Score | Meaning | Example |
|-------|---------|---------|
| 5+ | Very high signal | Followed by 5+ big accounts |
| 3-4 | High signal | Followed by 3-4 big accounts |
| 2 | Medium signal | Followed by 2 big accounts |
| 1 | Low signal | Followed by 1 big account |

## Workflow Integration

### Complete Workflow

```bash
# 1. Save current state as previous
cp data/currentFollowing.json data/previousFollowing.json

# 2. Scrape latest following lists
node runScraper.js

# 3. Detect new signals
node detectSignals.js

# 4. Review signals
cat data/signals.json | jq '.[] | select(.score >= 2)'

# 5. Import high-signal accounts to database
node importSignals.js --min-score 2
```

### Scheduled Workflow

```bash
#!/bin/bash
# Run daily to detect new signals

BACKEND_DIR="/home/ubuntu/early-follower-radar/backend"
cd "$BACKEND_DIR"

# Backup previous state
cp data/currentFollowing.json data/previousFollowing.json

# Scrape new data
node runScraper.js --quiet

# Detect signals
node detectSignals.js --quiet

# Log results
echo "$(date): Detected $(jq 'length' data/signals.json) new signals" >> logs/signals.log
```

## Data Flow

```
previousFollowing.json (old state)
         ↓
    detectSignals.js
         ↓
currentFollowing.json (new state)
         ↓
    signals.json (new accounts)
```

## Error Handling

### Missing Files

If `previousFollowing.json` doesn't exist:
```
[10:04:26 PM] ✗ Error: Failed to load /path/to/previousFollowing.json: File not found
```

**Solution**: Create the file or use `--previous` to specify a different path.

### Invalid JSON

If files contain invalid JSON:
```
[10:04:26 PM] ✗ Error: Failed to load file: Unexpected token
```

**Solution**: Verify JSON syntax in the files.

### Empty Results

If no new signals are detected:
```
[10:04:26 PM] ✓ Found 0 new signals
[10:04:26 PM] 📊 No new accounts detected
```

This means all current accounts were already in the previous list.

## Performance

### Timing

| Operation | Time |
|-----------|------|
| Load files | < 100ms |
| Compare lists | < 50ms |
| Sort results | < 50ms |
| Save output | < 100ms |
| **Total** | **< 300ms** |

### Memory Usage

- Minimal memory footprint
- Scales linearly with number of accounts
- 1000 accounts: ~1 MB

## Advanced Usage

### Filter by Score

```bash
# Get only high-signal accounts (score >= 2)
node detectSignals.js && jq '.[] | select(.score >= 2)' data/signals.json
```

### Export to CSV

```bash
node detectSignals.js && jq -r '.[] | [.username, .score, (.followed_by | join(";"))] | @csv' data/signals.json > signals.csv
```

### Compare Multiple Snapshots

```bash
# Compare week-old data with current
node detectSignals.js --previous data/previousFollowing_week_ago.json --current data/currentFollowing.json

# Compare month-old data with current
node detectSignals.js --previous data/previousFollowing_month_ago.json --current data/currentFollowing.json
```

### Merge Multiple Signal Runs

```javascript
const fs = require('fs');

// Load multiple signal files
const signals1 = JSON.parse(fs.readFileSync('signals_run1.json'));
const signals2 = JSON.parse(fs.readFileSync('signals_run2.json'));

// Merge and deduplicate
const merged = {};
[...signals1, ...signals2].forEach(sig => {
  const key = sig.username.toLowerCase();
  if (!merged[key]) {
    merged[key] = sig;
  } else {
    // Combine followed_by arrays
    merged[key].followed_by = [...new Set([...merged[key].followed_by, ...sig.followed_by])];
    merged[key].score = merged[key].followed_by.length;
  }
});

// Save merged results
fs.writeFileSync('signals_merged.json', JSON.stringify(Object.values(merged), null, 2));
```

## Integration with Database

### Import Signals to Database

```javascript
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
        signal.score * 20  // Convert score to signal_score (0-100)
      );
    }
  }
}

db.close();
console.log(`Imported ${signals.length} signals to database`);
```

## Troubleshooting

### No Signals Detected

**Problem**: Script runs but finds 0 new signals.

**Causes**:
- All current accounts were already in previous
- Files are identical
- Files are empty

**Solution**:
- Verify files have different content
- Check file paths are correct
- Use `--verbose` to see what's being compared

### Wrong File Paths

**Problem**: "File not found" error.

**Solution**:
```bash
# Use absolute paths
node detectSignals.js --previous /full/path/to/previous.json --current /full/path/to/current.json
```

### Unexpected Results

**Problem**: Signals include accounts you expected to be in previous.

**Cause**: Case sensitivity or whitespace differences.

**Solution**: Verify the previous file is truly from before the current state.

## Best Practices

1. **Backup Previous State**: Always save current before scraping new data
2. **Regular Runs**: Run signal detection after each scrape
3. **Review Signals**: Check high-score signals manually
4. **Track History**: Keep historical signal files for analysis
5. **Monitor Trends**: Look for patterns in signal scores over time

## Next Steps

After detecting signals:

1. **Review**: Check `signals.json` for interesting accounts
2. **Analyze**: Look at high-score accounts (score >= 2)
3. **Import**: Add signals to database
4. **Monitor**: Track these accounts for future activity
5. **Repeat**: Run workflow periodically to find new signals

## Support

For issues or questions:
- Check `RUN_SCRAPER_GUIDE.md` for scraping details
- Check `TRACKED_ACCOUNTS_CONFIG.md` for account configuration
- Review `API_ENDPOINTS.md` for backend API reference

---

**Happy signal hunting! 🚀**
