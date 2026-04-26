# Early Follower Radar - Complete Setup Guide

## 🚀 Quick Start

### Terminal 1 - Backend
```bash
cd /home/ubuntu/early-follower-radar/backend
npm start
```

### Terminal 2 - Frontend
```bash
cd /home/ubuntu/early-follower-radar/frontend
npm run dev
```

### Terminal 3 - Scraper (Optional)
```bash
cd /home/ubuntu/early-follower-radar/backend
node runScraper.js
```

Then open: **http://localhost:3000**

---

## 📋 Project Structure

```
early-follower-radar/
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Dashboard component
│   │   └── layout.tsx          # App layout
│   ├── package.json
│   └── DASHBOARD_GUIDE.md
│
├── backend/                     # Express backend
│   ├── index.js                # Main server
│   ├── scraper.js              # Playwright scraper
│   ├── trackedAccounts.js      # Tracked accounts config
│   ├── runScraper.js           # Scraper runner
│   ├── detectSignals.js        # Signal detection
│   ├── data/
│   │   ├── signals.json        # Current signals
│   │   ├── currentFollowing.json
│   │   ├── previousFollowing.json
│   │   └── backups/            # Historical backups
│   ├── package.json
│   ├── SIGNAL_ENDPOINTS.md
│   ├── AUTOMATED_WORKFLOW.md
│   └── DETECT_SIGNALS_GUIDE.md
│
├── database/
│   └── radar.db                # SQLite database
│
└── COMPLETE_SETUP.md           # This file
```

---

## 🎯 Core Features

### Backend (Express + SQLite)
- ✅ REST API for signals
- ✅ Playwright-based scraper
- ✅ Automated workflow
- ✅ Signal detection
- ✅ CORS enabled

### Frontend (Next.js + Tailwind)
- ✅ Real-time dashboard
- ✅ Dark theme UI
- ✅ Auto-refresh (30s)
- ✅ Responsive design
- ✅ Error handling

### Data Pipeline
- ✅ Scrape Twitter/X following lists
- ✅ Consolidate results
- ✅ Detect new signals
- ✅ Score by followers
- ✅ Serve via API

---

## 📡 API Endpoints

### Signal Endpoints
- `GET /api/signals` - All signals
- `GET /api/signals/high` - Score ≥ 2
- `GET /api/signals/recent` - Latest 20

### Database Endpoints
- `GET /api/big-accounts` - All tracked big accounts
- `POST /api/big-accounts` - Add big account
- `GET /api/tracked-follows` - All tracked follows
- `POST /api/tracked-follows` - Add tracked follow

### Scraper Endpoints
- `POST /api/scrape-following` - Scrape and return
- `POST /api/scrape-and-save` - Scrape and save to DB

### Health Check
- `GET /ping` - Server status

---

## 🔄 Workflow

### 1. Scrape Following Lists
```bash
node runScraper.js
```

**What it does:**
- Loops through 11 tracked accounts
- Scrapes each account's following list (up to 100 accounts)
- Consolidates into `currentFollowing.json`
- Backs up previous state
- Automatically runs signal detection

**Output:**
- `data/currentFollowing.json` - Latest following lists
- `data/previousFollowing.json` - Previous state
- `data/signals.json` - New accounts detected
- `data/backups/` - Historical backups

### 2. Detect Signals
```bash
node detectSignals.js
```

**What it does:**
- Compares previous vs current following lists
- Finds new accounts
- Scores by number of big followers
- Sorts by score (highest first)

**Output:**
- `data/signals.json` - New accounts with scores

### 3. Display on Dashboard
Frontend fetches from API every 30 seconds:
- Shows high-signal accounts (score ≥ 2)
- Shows recent signals (latest 20)
- Displays stats and metrics

---

## 📊 Dashboard Sections

### High Signal
- Accounts followed by 2+ big accounts
- Ranked by score
- Shows big account followers
- Blue theme

### Recent Follows
- Latest 20 signals
- Ranked by position
- Shows big account followers
- Purple theme

### Stats
- Total signals
- High signal count
- Average score

---

## 🛠️ Configuration

### Tracked Accounts
Edit `backend/trackedAccounts.js`:

```javascript
const trackedAccounts = [
  'paulg',
  'elonmusk',
  'sama',
  // Add more...
];
```

### Scraper Options
```bash
# Scrape 50 accounts per user instead of 100
node runScraper.js --limit 50

# Scrape only specific accounts
node runScraper.js --accounts paulg,elonmusk

# Dry run (preview without scraping)
node runScraper.js --dry-run

# Quiet mode (minimal output)
node runScraper.js --quiet
```

### Signal Detection
```bash
# Verbose output
node detectSignals.js --verbose

# Custom files
node detectSignals.js --previous old.json --current new.json
```

---

## 📅 Scheduling

### Daily Scraping (Cron)
```bash
# Add to crontab
0 2 * * * cd /home/ubuntu/early-follower-radar/backend && node runScraper.js --quiet

# This runs daily at 2:00 AM
```

### Bash Script
```bash
#!/bin/bash
BACKEND_DIR="/home/ubuntu/early-follower-radar/backend"
cd "$BACKEND_DIR"

# Backup previous state
cp data/currentFollowing.json data/previousFollowing.json

# Scrape new data
node runScraper.js --quiet

# Log results
echo "$(date): Scrape completed" >> logs/scraper.log
```

---

## 🧪 Testing

### Test Backend
```bash
# Check if running
curl http://localhost:4000/ping

# Get all signals
curl http://localhost:4000/api/signals | jq '.'

# Get high signals
curl http://localhost:4000/api/signals/high | jq '.count'

# Get recent signals
curl http://localhost:4000/api/signals/recent | jq '.count'
```

### Test Frontend
```bash
# Check if running
curl http://localhost:3000 | grep "Early Follower Radar"

# Open in browser
open http://localhost:3000
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill existing process
kill -9 <PID>

# Try again
npm start
```

### Frontend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Try again
npm run dev
```

### No Signals Showing
```bash
# 1. Check backend is running
curl http://localhost:4000/ping

# 2. Run scraper
cd backend
node runScraper.js

# 3. Check signals.json
cat data/signals.json

# 4. Refresh frontend
# Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### CORS Errors
```bash
# Verify CORS is enabled in backend/index.js
grep "app.use(cors())" index.js

# Should output: app.use(cors());
```

### Stale Data
```bash
# Run scraper to update
node runScraper.js

# Hard refresh browser
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

---

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    runScraper.js                        │
│  Scrapes all tracked accounts' following lists          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   currentFollowing.json      │
        │  (Latest following lists)    │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Backup previous      │      │  detectSignals.js    │
│ to backups/          │      │  Compare & score     │
└──────────────────────┘      └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   signals.json       │
                              │  (New accounts)      │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   Backend API        │
                              │  /api/signals/*      │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Frontend Dashboard  │
                              │  (Next.js)           │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   Browser Display    │
                              │  http://localhost:3000
                              └──────────────────────┘
```

---

## 📚 Documentation Files

- **README.md** - Project overview
- **QUICKSTART.md** - 2-minute setup
- **SETUP_GUIDE.md** - Detailed setup
- **AUTOMATED_WORKFLOW.md** - Scraper workflow
- **DETECT_SIGNALS_GUIDE.md** - Signal detection
- **RUN_SCRAPER_GUIDE.md** - Scraper usage
- **SIGNAL_ENDPOINTS.md** - API reference
- **DASHBOARD_GUIDE.md** - Frontend guide
- **COMPLETE_SETUP.md** - This file

---

## 🎓 Learning Path

1. **Start Here**: Read QUICKSTART.md
2. **Understand Data**: Read AUTOMATED_WORKFLOW.md
3. **Use Scraper**: Read RUN_SCRAPER_GUIDE.md
4. **Understand Signals**: Read DETECT_SIGNALS_GUIDE.md
5. **Use API**: Read SIGNAL_ENDPOINTS.md
6. **Use Dashboard**: Read DASHBOARD_GUIDE.md

---

## 🚀 Next Steps

### Short Term
- [ ] Run scraper to generate initial data
- [ ] View dashboard at http://localhost:3000
- [ ] Verify signals are displaying
- [ ] Test auto-refresh (30 seconds)

### Medium Term
- [ ] Schedule daily scraper runs (cron)
- [ ] Monitor signal trends
- [ ] Adjust tracked accounts as needed
- [ ] Export signals for analysis

### Long Term
- [ ] Add database integration
- [ ] Build analytics dashboard
- [ ] Add notifications/alerts
- [ ] Integrate with other tools

---

## 💡 Tips & Tricks

### Monitor in Real-Time
```bash
# Watch scraper progress
watch -n 1 'cat backend/data/signals.json | jq "length"'

# Watch file changes
ls -lh backend/data/
```

### Export Signals
```bash
# To CSV
jq -r '.[] | [.username, .score, (.followed_by | join(";"))] | @csv' backend/data/signals.json > signals.csv

# To JSON (pretty)
jq '.' backend/data/signals.json > signals_pretty.json
```

### Analyze Signals
```bash
# Get high-signal accounts
jq '.[] | select(.score >= 3)' backend/data/signals.json

# Get accounts followed by specific person
jq '.[] | select(.followed_by[] == "paulg")' backend/data/signals.json

# Count by score
jq 'group_by(.score) | map({score: .[0].score, count: length})' backend/data/signals.json
```

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review relevant documentation file
3. Check browser console for errors
4. Verify backend is running
5. Check API endpoints with curl

---

## 📝 License

This project is open source and available for personal use.

---

**Happy signal hunting! 🎯**
