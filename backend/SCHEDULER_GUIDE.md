# Scheduler Guide

## Overview

The backend includes an automated scheduler that runs the scraper and signal detection every 6 hours. It uses `node-cron` for reliable scheduling and logs all activity.

## Features

- ✅ **Automatic Execution**: Runs every 6 hours automatically
- ✅ **Comprehensive Logging**: Logs all runs with timestamps
- ✅ **Signal Tracking**: Records number of signals detected
- ✅ **Status Endpoint**: API to check scheduler status
- ✅ **Error Handling**: Graceful error handling with logging
- ✅ **No External Dependencies**: Uses built-in Node.js modules

## Schedule

### Cron Expression
```
0 */6 * * *
```

**Breakdown:**
- `0` - At minute 0
- `*/6` - Every 6 hours
- `*` - Every day
- `*` - Every month
- `*` - Every day of week

### Run Times
- 12:00 AM (00:00)
- 6:00 AM (06:00)
- 12:00 PM (12:00)
- 6:00 PM (18:00)

## How It Works

### 1. Initialization
When the backend starts:
```
🚀 Scheduler initialized
📅 Scheduled task: Every 6 hours
⏰ Cron expression: 0 */6 * * *
✓ Cron job scheduled
```

### 2. Scheduled Execution
Every 6 hours, the scheduler:
1. Runs `runScraper.js` with `--quiet` flag
2. Logs the start time
3. Waits for completion
4. Counts signals in `signals.json`
5. Counts high-signal accounts (score ≥ 2)
6. Logs results
7. Logs completion

### 3. Logging
All activity is logged to:
```
backend/logs/scheduler.log
```

**Log Format:**
```
[2026-04-26T02:18:36.782Z] 🔄 Starting scheduled scraper job...
[2026-04-26T02:18:36.782Z] 📊 Running scraper...
[2026-04-26T02:18:45.123Z] ✓ Scraper completed
[2026-04-26T02:18:45.456Z] 📈 Detected 42 total signals
[2026-04-26T02:18:45.789Z] ⭐ High-signal accounts: 15
[2026-04-26T02:18:45.890Z] ✅ Scheduled job completed successfully
```

## API Endpoints

### GET /api/scheduler/status

Returns current scheduler status and statistics.

**Request:**
```bash
curl http://localhost:4000/api/scheduler/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "logFile": "/home/ubuntu/early-follower-radar/backend/logs/scheduler.log",
    "logsExist": true,
    "signalsFile": "/home/ubuntu/early-follower-radar/backend/data/signals.json",
    "signalsExist": true,
    "signalCount": 42,
    "lastUpdate": "[2026-04-26T02:18:45.890Z] ✅ Scheduled job completed successfully"
  }
}
```

**Response Fields:**
- `logFile` - Path to scheduler log
- `logsExist` - Whether logs have been created
- `signalsFile` - Path to signals.json
- `signalsExist` - Whether signals.json exists
- `signalCount` - Total number of signals detected
- `lastUpdate` - Last log entry (most recent event)

## Files

### scheduler.js
Main scheduler module with:
- `initializeScheduler()` - Sets up cron job
- `triggerManually()` - Manually trigger scraper
- `getStatus()` - Get scheduler status
- `log()` - Log messages with timestamp

### logs/scheduler.log
Log file containing all scheduler activity:
- Initialization logs
- Scraper run logs
- Signal counts
- Error logs
- Completion logs

## Configuration

### Change Schedule

Edit `scheduler.js` and change the cron expression:

```javascript
// Current: Every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await runScraperJob();
});

// Every 3 hours
cron.schedule('0 */3 * * *', async () => {
  await runScraperJob();
});

// Every 12 hours
cron.schedule('0 */12 * * *', async () => {
  await runScraperJob();
});

// Daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await runScraperJob();
});

// Every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await runScraperJob();
});
```

### Cron Expression Reference

| Expression | Frequency |
|-----------|-----------|
| `0 * * * *` | Every hour |
| `0 */2 * * *` | Every 2 hours |
| `0 */3 * * *` | Every 3 hours |
| `0 */6 * * *` | Every 6 hours |
| `0 */12 * * *` | Every 12 hours |
| `0 0 * * *` | Daily at midnight |
| `0 2 * * *` | Daily at 2 AM |
| `0 9-17 * * 1-5` | Weekdays 9 AM to 5 PM |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 1 * *` | First day of month |

## Monitoring

### Check Status via API
```bash
curl http://localhost:4000/api/scheduler/status | jq '.status'
```

### View Logs
```bash
# View all logs
cat backend/logs/scheduler.log

# View last 10 entries
tail -10 backend/logs/scheduler.log

# Watch logs in real-time
tail -f backend/logs/scheduler.log

# Count total runs
grep "Starting scheduled scraper" backend/logs/scheduler.log | wc -l

# Find errors
grep "❌" backend/logs/scheduler.log
```

### Check Signal Count
```bash
# Get current signal count
curl http://localhost:4000/api/scheduler/status | jq '.status.signalCount'

# Get all signals
curl http://localhost:4000/api/signals | jq '.count'
```

## Troubleshooting

### Scheduler Not Running

**Problem:** Cron job doesn't execute

**Causes:**
- Backend not running
- Port 4000 in use
- Node.js error

**Solution:**
```bash
# Check if backend is running
ps aux | grep "node index"

# Check port 4000
lsof -i :4000

# Check logs
tail -50 /tmp/backend.log
```

### No Logs Created

**Problem:** `logs/scheduler.log` doesn't exist

**Cause:** Scheduler hasn't run yet or logs directory not created

**Solution:**
```bash
# Create logs directory manually
mkdir -p backend/logs

# Restart backend
npm start
```

### Scraper Fails During Scheduled Run

**Problem:** Scheduled job fails but manual runs work

**Causes:**
- Timeout (scraper takes too long)
- Network issue during scheduled time
- Browser/Playwright issue

**Solution:**
```bash
# Increase timeout in scheduler.js
timeout: 7200000, // 2 hours

# Check scraper logs
tail -50 backend/logs/scheduler.log

# Test scraper manually
cd backend
node runScraper.js
```

### High Memory Usage

**Problem:** Backend uses lots of memory during scheduled runs

**Cause:** Playwright browser not closing properly

**Solution:**
```bash
# Check running processes
ps aux | grep playwright

# Kill any zombie processes
pkill -f playwright

# Restart backend
npm start
```

## Performance

### Typical Execution Time
- Scraper: 10-20 minutes (depends on network)
- Signal detection: < 1 second
- Total: 10-20 minutes

### Resource Usage
- CPU: Moderate during scraping, minimal otherwise
- Memory: ~100-200 MB during scraping
- Disk: ~1-5 MB for logs per month

### Log File Size
- ~1-2 KB per run
- ~10-15 KB per month
- ~120-180 KB per year

## Best Practices

1. **Monitor Regularly**: Check status endpoint weekly
2. **Review Logs**: Check logs for errors monthly
3. **Backup Data**: Backup signals.json periodically
4. **Test Schedule**: Verify schedule works before deploying
5. **Set Alerts**: Monitor for failed runs
6. **Rotate Logs**: Archive old logs to save space

## Advanced Usage

### Manual Trigger
To manually trigger a scraper run:

```javascript
// In scheduler.js
const { triggerManually } = require('./scheduler');
triggerManually();
```

Or via API (if you add an endpoint):
```javascript
app.post('/api/scheduler/trigger', async (req, res) => {
  try {
    await triggerManually();
    res.json({ success: true, message: 'Scraper triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Custom Logging
Add custom logging to scheduler:

```javascript
const { log } = require('./scheduler');
log('Custom message');
```

### Multiple Schedules
Add multiple cron jobs:

```javascript
// Every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await runScraperJob();
});

// Daily at 2 AM (backup)
cron.schedule('0 2 * * *', async () => {
  await backupData();
});
```

## Integration with System Cron

For production, you can also use system cron instead of node-cron:

```bash
# Add to crontab
0 */6 * * * cd /home/ubuntu/early-follower-radar/backend && node runScraper.js --quiet

# Edit crontab
crontab -e

# List crontab
crontab -l

# Remove crontab
crontab -r
```

## Summary

| Feature | Details |
|---------|---------|
| **Schedule** | Every 6 hours |
| **Run Times** | 12 AM, 6 AM, 12 PM, 6 PM |
| **Logging** | `backend/logs/scheduler.log` |
| **Status API** | `GET /api/scheduler/status` |
| **Timeout** | 1 hour per run |
| **Error Handling** | Graceful with logging |
| **Dependencies** | node-cron |

---

**Happy automated monitoring! 🤖**
