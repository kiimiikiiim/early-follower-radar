# Early Follower Radar

A full-stack web application that tracks small Twitter/X accounts newly followed by selected "big accounts". Identify emerging accounts with high potential based on endorsements from influential figures.

## 🎯 Project Overview

**Early Follower Radar** helps you discover emerging Twitter/X accounts by monitoring when large, influential accounts follow new users. This provides early signals about accounts gaining traction and credibility through endorsements from established players in your industry or interest area.

### Key Features

- **Dashboard**: Clean, real-time interface showing tracked follows
- **High Signal Section**: Top-ranked accounts based on signal score
- **Recent Follows**: Latest accounts followed by monitored big accounts
- **Backend API**: RESTful endpoints for managing accounts and follows
- **SQLite Database**: Simple, file-based persistence

## 📋 Project Structure

```
early-follower-radar/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── page.tsx         # Main dashboard
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                  # Express server
│   ├── index.js             # Main server file
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── node_modules/
├── database/                # SQLite database
│   └── radar.db            # Database file (created on first run)
└── README.md               # This file
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | Modern UI with App Router |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Backend** | Express 5 | RESTful API server |
| **Database** | SQLite 6 | Lightweight file-based database |
| **Runtime** | Node.js 22 | JavaScript runtime |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ (includes npm)
- **Git** (optional)

### Installation & Setup

#### 1. Clone or Download the Project

```bash
cd early-follower-radar
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

#### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Running the Application

#### Terminal 1: Start the Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ Backend server running on http://localhost:4000
📊 Test the /ping endpoint: http://localhost:4000/ping
Connected to SQLite database at: /path/to/database/radar.db
Database tables initialized
```

#### Terminal 2: Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js 16.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

#### 3. Open Your Browser

Navigate to **http://localhost:3000** to see the dashboard.

## 📡 Backend API Endpoints

### Health Check

**GET** `/ping`

Test if the backend is running.

```bash
curl http://localhost:4000/ping
```

Response:
```json
{
  "message": "pong",
  "timestamp": "2026-04-26T10:30:45.123Z"
}
```

### Big Accounts Management

**GET** `/api/big-accounts`

Retrieve all monitored big accounts.

```bash
curl http://localhost:4000/api/big-accounts
```

**POST** `/api/big-accounts`

Add a new big account to monitor.

```bash
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "twitter_id": "44196397"}'
```

### Tracked Follows Management

**GET** `/api/tracked-follows`

Get all tracked follows, sorted by signal score.

```bash
curl http://localhost:4000/api/tracked-follows
```

**POST** `/api/tracked-follows`

Add a new tracked follow.

```bash
curl -X POST http://localhost:4000/api/tracked-follows \
  -H "Content-Type: application/json" \
  -d '{
    "big_account_id": 1,
    "small_account_username": "emerging_dev",
    "small_account_twitter_id": "123456789",
    "followed_at": "2026-04-26T10:00:00Z",
    "signal_score": 85
  }'
```

## 🗄️ Database Schema

### `big_accounts` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `username` | TEXT | Twitter/X username (unique) |
| `twitter_id` | TEXT | Twitter/X user ID |
| `created_at` | DATETIME | Timestamp when added |

### `tracked_follows` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `big_account_id` | INTEGER | Foreign key to big_accounts |
| `small_account_username` | TEXT | Username of followed account |
| `small_account_twitter_id` | TEXT | Twitter/X ID of followed account |
| `followed_at` | DATETIME | When the follow occurred |
| `signal_score` | INTEGER | Ranking score (0-100) |
| `created_at` | DATETIME | When tracked |

## 🎨 Frontend Features

### Dashboard Layout

- **Header**: App title, branding, and last update timestamp
- **Stats Grid**: Overview of total tracked, high signal, and status
- **High Signal Section**: Top 5 accounts by signal score with detailed info
- **Recent Follows Section**: Latest 10 follows with timestamps
- **Auto-Refresh**: Data updates every 30 seconds

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Fully responsive on desktop, tablet, and mobile
- Dark theme optimized for extended viewing

## 🔧 Development

### Adding Features

#### Frontend Changes

Edit files in `/frontend/app/`:

```bash
cd frontend
npm run dev
```

Changes hot-reload automatically.

#### Backend Changes

Edit `/backend/index.js` and restart:

```bash
cd backend
npm start
```

### Environment Variables

**Backend** (`.env`):

```env
PORT=4000
NODE_ENV=development
```

**Frontend**: No env file needed for local development.

## 📊 Example Workflow

### 1. Add a Big Account to Monitor

```bash
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "paulg", "twitter_id": "16334"}'
```

### 2. Add a Tracked Follow

```bash
curl -X POST http://localhost:4000/api/tracked-follows \
  -H "Content-Type: application/json" \
  -d '{
    "big_account_id": 1,
    "small_account_username": "new_startup",
    "followed_at": "2026-04-26T10:00:00Z",
    "signal_score": 75
  }'
```

### 3. View the Dashboard

Open http://localhost:3000 to see the data displayed in real-time.

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch data"

**Issue**: Backend not running or CORS error.

**Solution**:
1. Ensure backend is running on port 4000: `npm start` in `/backend`
2. Check browser console for specific error messages
3. Verify backend is accessible: `curl http://localhost:4000/ping`

### Database file not created

**Issue**: Database directory doesn't exist.

**Solution**:
1. Create the directory: `mkdir -p database`
2. Restart the backend server

### Port already in use

**Issue**: Port 4000 or 3000 is occupied.

**Solution**:
- Change backend port in `/backend/.env`: `PORT=5000`
- Change frontend port: `npm run dev -- -p 3001`

### Module not found errors

**Issue**: Dependencies not installed.

**Solution**:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## 📝 Next Steps

### Potential Enhancements

1. **Twitter/X API Integration**: Automatically fetch follows from real accounts
2. **Authentication**: Add user login and personal watchlists
3. **Notifications**: Alert when new follows are detected
4. **Analytics**: Charts showing follow trends over time
5. **Filtering**: Search and filter by account, date range, signal score
6. **Export**: Download data as CSV or JSON
7. **Deployment**: Deploy to Vercel (frontend) and Heroku/Railway (backend)

## 📄 License

This project is open source and available for personal and commercial use.

## 💡 Support

For issues or questions:

1. Check the **Troubleshooting** section above
2. Review the API documentation
3. Check backend console logs for errors
4. Verify all services are running on correct ports

---

**Happy tracking! 🚀**
