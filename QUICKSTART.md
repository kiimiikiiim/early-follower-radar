# Quick Start Guide

Get **Early Follower Radar** running in 2 minutes!

## One-Time Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

That's it! All dependencies are now installed.

## Running the App

### Start Backend (Terminal 1)

```bash
cd backend
npm start
```

You should see:
```
✅ Backend server running on http://localhost:4000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready in 2.5s
```

### Open Browser

Visit: **http://localhost:3000**

## Test the Backend

In a new terminal, verify the backend is working:

```bash
curl http://localhost:4000/ping
```

Expected response:
```json
{"message":"pong","timestamp":"2026-04-26T10:30:45.123Z"}
```

## Add Sample Data

### Add a Big Account

```bash
curl -X POST http://localhost:4000/api/big-accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "paulg", "twitter_id": "16334"}'
```

### Add a Tracked Follow

```bash
curl -X POST http://localhost:4000/api/tracked-follows \
  -H "Content-Type: application/json" \
  -d '{
    "big_account_id": 1,
    "small_account_username": "emerging_dev",
    "followed_at": "2026-04-26T10:00:00Z",
    "signal_score": 85
  }'
```

Refresh your browser to see the data!

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch data" | Check backend is running on port 4000 |
| Port 4000 in use | Change in `backend/.env`: `PORT=5000` |
| Port 3000 in use | Run frontend on different port: `npm run dev -- -p 3001` |
| Module errors | Run `npm install` in both `backend/` and `frontend/` |

## Next Steps

- Read the full [README.md](./README.md) for complete documentation
- Explore the [API endpoints](./README.md#-backend-api-endpoints)
- Check the [database schema](./README.md#-database-schema)
- See [potential enhancements](./README.md#potential-enhancements)

---

**You're all set! Happy tracking! 🚀**
