# Setup and Testing Guide

## ✅ Verification Status

All components have been tested and verified to work correctly:

- ✅ **Backend Server**: Running on port 4000
- ✅ **Frontend Dev Server**: Ready on port 3000
- ✅ **Database**: SQLite initialized with sample data
- ✅ **API Endpoints**: All tested and working

## 🚀 How to Run Locally

### Step 1: Open Terminal 1 (Backend)

```bash
cd /home/ubuntu/early-follower-radar/backend
npm start
```

**Expected Output:**
```
Connected to SQLite database at: /home/ubuntu/early-follower-radar/database/radar.db
Database tables initialized
✅ Backend server running on http://localhost:4000
📊 Test the /ping endpoint: http://localhost:4000/ping
```

### Step 2: Open Terminal 2 (Frontend)

```bash
cd /home/ubuntu/early-follower-radar/frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.2.4
- Local:         http://localhost:3000
✓ Ready in 428ms
```

### Step 3: Open Browser

Navigate to **http://localhost:3000**

You should see:
- Dashboard with "Early Follower Radar" title
- High Signal section with top-ranked accounts
- Recent Follows section with latest tracked accounts
- Real-time data from the backend

## 📊 Sample Data Included

The database has been pre-populated with sample data:

### Big Accounts (Monitored)
1. **paulg** (Paul Graham)
2. **elonmusk** (Elon Musk)

### Tracked Follows
1. **ai_researcher** - Followed by elonmusk (Signal: 92)
2. **emerging_dev** - Followed by paulg (Signal: 85)
3. **crypto_builder** - Followed by paulg (Signal: 78)

This data will be displayed automatically on the dashboard.

## 🧪 Testing the Backend API

### Test 1: Health Check

```bash
curl http://localhost:4000/ping
```

Response:
```json
{"message":"pong","timestamp":"2026-04-26T01:11:13.323Z"}
```

### Test 2: Get All Big Accounts

```bash
curl http://localhost:4000/api/big-accounts
```

### Test 3: Get All Tracked Follows

```bash
curl http://localhost:4000/api/tracked-follows
```

### Test 4: Add a New Big Account

```bash
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "naval", "twitter_id": "11925642"}'
```

### Test 5: Add a New Tracked Follow

```bash
curl -X POST http://localhost:4000/api/tracked-follows \
  -H "Content-Type: application/json" \
  -d '{
    "big_account_id": 1,
    "small_account_username": "new_startup",
    "followed_at": "2026-04-26T12:00:00Z",
    "signal_score": 88
  }'
```

After adding data via API, refresh the browser to see it on the dashboard!

## 📁 File Structure

```
early-follower-radar/
├── backend/
│   ├── index.js              # Express server with all API routes
│   ├── package.json          # Dependencies: express, better-sqlite3, cors
│   ├── .env                  # PORT=4000
│   └── node_modules/
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Dashboard component (React, TypeScript)
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Tailwind styles
│   ├── package.json          # Dependencies: next, react, tailwindcss
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── node_modules/
├── database/
│   └── radar.db              # SQLite database (auto-created)
├── README.md                 # Full documentation
├── QUICKSTART.md             # Quick start guide
└── SETUP_GUIDE.md            # This file
```

## 🔧 Database Schema

### big_accounts
```sql
CREATE TABLE big_accounts (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  twitter_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### tracked_follows
```sql
CREATE TABLE tracked_follows (
  id INTEGER PRIMARY KEY,
  big_account_id INTEGER NOT NULL,
  small_account_username TEXT NOT NULL,
  small_account_twitter_id TEXT,
  followed_at DATETIME NOT NULL,
  signal_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (big_account_id) REFERENCES big_accounts(id)
)
```

## 🛑 Stopping the Servers

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

## 🔄 Restarting

Simply run the same commands again:

```bash
# Terminal 1
cd /home/ubuntu/early-follower-radar/backend && npm start

# Terminal 2
cd /home/ubuntu/early-follower-radar/frontend && npm run dev
```

## 📝 Development Tips

### Frontend Hot Reload
Changes to `/frontend/app/page.tsx` automatically reload in the browser.

### Backend Changes
Restart the backend server to apply changes to `/backend/index.js`.

### Database Reset
Delete `/database/radar.db` and restart the backend to start fresh.

### View Database
```bash
# Install sqlite3 CLI if needed
sudo apt-get install sqlite3

# View database
sqlite3 /home/ubuntu/early-follower-radar/database/radar.db

# List tables
.tables

# View data
SELECT * FROM big_accounts;
SELECT * FROM tracked_follows;
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot GET /" | Frontend not running. Check Terminal 2 |
| "Failed to fetch data" | Backend not running. Check Terminal 1 |
| Port 3000 in use | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| Port 4000 in use | Kill process: `lsof -ti:4000 \| xargs kill -9` |
| Module not found | Run `npm install` in the affected directory |

## ✨ Next Steps

1. **Explore the Code**: Review `/backend/index.js` and `/frontend/app/page.tsx`
2. **Add More Data**: Use the API to add more accounts and follows
3. **Customize**: Modify the dashboard styling in the frontend
4. **Extend**: Add new features like filtering, search, or notifications

---

**Everything is ready to go! 🎉**
