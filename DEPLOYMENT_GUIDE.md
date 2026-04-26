# Deployment Guide

Complete step-by-step instructions for deploying Early Follower Radar to production.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│          Frontend (Vercel)                                   │
│  - Next.js App                                              │
│  - React Components                                         │
│  - Tailwind CSS                                             │
│  - Auto-refresh every 30s                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ API Calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│          Backend (Railway/Render)                            │
│  - Express Server                                           │
│  - SQLite Database                                          │
│  - Scraper (Playwright)                                     │
│  - Scheduler (every 6 hours)                                │
│  - Signal Detection                                         │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Platforms

| Component | Platform | Free Tier | Cost |
|-----------|----------|-----------|------|
| Frontend | Vercel | Yes | $0-20/mo |
| Backend | Railway | Yes | $5/mo minimum |
| Backend | Render | Yes | $0 (with limitations) |
| Database | SQLite (local) | Yes | $0 |

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

```bash
# Navigate to project root
cd /home/ubuntu/early-follower-radar

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Early Follower Radar"

# Create GitHub repository
# 1. Go to https://github.com/new
# 2. Create repository: early-follower-radar
# 3. Add remote and push

git remote add origin https://github.com/YOUR_USERNAME/early-follower-radar.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Link to GitHub repo: Yes
# - Set project name: early-follower-radar
# - Framework: Next.js
# - Root directory: frontend
```

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your GitHub repository
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
6. Add Environment Variables:
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://your-backend-url.railway.app` (or Render URL)
7. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_BASE_URL = https://your-backend-railway-url.railway.app
   ```
3. Redeploy for changes to take effect

### Step 4: Verify Frontend

```bash
# Visit your Vercel URL
https://your-project-name.vercel.app

# Should see:
# - Dashboard with stats
# - High Signal section
# - Recent Follows section
# - Search and filter controls
```

---

## Backend Deployment (Railway)

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Deploy Backend

**Option A: Via Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Navigate to backend
cd backend

# Initialize Railway project
railway init

# Follow prompts:
# - Project name: early-follower-radar
# - Environment: production

# Deploy
railway up
```

**Option B: Via Railway Dashboard**

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your repository
5. Configure:
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
7. Click "Deploy"

### Step 3: Get Backend URL

1. In Railway Dashboard, go to your project
2. Click on "Backend" service
3. Go to "Settings" → "Domains"
4. Copy the public URL (e.g., `https://your-backend-railway-url.railway.app`)

### Step 4: Update Frontend

Update Vercel environment variables:

```
NEXT_PUBLIC_API_BASE_URL = https://your-backend-railway-url.railway.app
```

Then redeploy frontend.

### Step 5: Test Backend

```bash
# Test health check
curl https://your-backend-railway-url.railway.app/ping

# Should return:
# {"message":"pong"}

# Test signals endpoint
curl https://your-backend-railway-url.railway.app/api/signals

# Should return JSON with signals
```

---

## Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Deploy Backend

1. Go to https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name:** early-follower-radar-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter)
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
7. Click "Create Web Service"

### Step 3: Get Backend URL

1. In Render Dashboard, go to your service
2. Copy the URL from "Service URL" (e.g., `https://your-backend-render-url.onrender.com`)

### Step 4: Update Frontend

Update Vercel environment variables:

```
NEXT_PUBLIC_API_BASE_URL = https://your-backend-render-url.onrender.com
```

Then redeploy frontend.

### Step 5: Test Backend

```bash
# Test health check
curl https://your-backend-render-url.onrender.com/ping

# Should return:
# {"message":"pong"}

# Test signals endpoint
curl https://your-backend-render-url.onrender.com/api/signals

# Should return JSON with signals
```

---

## Environment Configuration

### Frontend (.env.local)

```env
# Local development
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Production (Railway)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-railway-url.railway.app

# Production (Render)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-render-url.onrender.com
```

### Backend (.env)

```env
# Development
PORT=4000
NODE_ENV=development

# Production
PORT=3000
NODE_ENV=production
```

### Vercel Environment Variables

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend URL | Must include https:// |

### Railway/Render Environment Variables

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | production | Required for production |
| `PORT` | 3000 | Railway/Render default |

---

## Post-Deployment Setup

### 1. Test API Endpoints

```bash
# Replace with your backend URL
BACKEND_URL="https://your-backend-url.railway.app"

# Test health check
curl $BACKEND_URL/ping

# Test signals
curl $BACKEND_URL/api/signals

# Test high signals
curl $BACKEND_URL/api/signals/high

# Test recent signals
curl $BACKEND_URL/api/signals/recent

# Test scheduler status
curl $BACKEND_URL/api/scheduler/status
```

### 2. Run Scraper

```bash
# SSH into backend (if available)
# Or run locally and upload results

# Run scraper locally
cd backend
node runScraper.js

# This generates:
# - data/currentFollowing.json
# - data/previousFollowing.json
# - data/signals.json
```

### 3. Upload Initial Data

If using Railway/Render, you may need to:

1. Run scraper locally
2. Upload data files to backend
3. Or set up persistent storage

**For Railway:**
```bash
# Railway provides persistent storage
# Files in /app/data/ persist between deployments
```

**For Render:**
```bash
# Render provides ephemeral storage
# Consider using PostgreSQL instead of SQLite
```

### 4. Set Up Scheduler

The scheduler runs automatically every 6 hours:

```bash
# Check scheduler status
curl $BACKEND_URL/api/scheduler/status

# Should return:
{
  "success": true,
  "status": {
    "logFile": "...",
    "signalCount": 0,
    "lastUpdate": "..."
  }
}
```

### 5. Verify Frontend Connection

1. Visit your Vercel URL
2. Check browser console (F12)
3. Should see no CORS errors
4. Dashboard should load data from backend

---

## Monitoring & Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
```bash
# Check backend CORS headers
curl -i https://your-backend-url/api/signals

# Should include:
# Access-Control-Allow-Origin: *
```

#### 2. 404 on Backend

**Problem:** API endpoints return 404

**Solution:**
```bash
# Test health check first
curl https://your-backend-url/ping

# If ping works, check endpoint
curl https://your-backend-url/api/signals

# Check backend logs in Railway/Render dashboard
```

#### 3. Slow Response

**Problem:** Dashboard takes long to load

**Solution:**
- Check backend is running
- Check database file exists
- Verify network latency
- Check Railway/Render resource usage

#### 4. No Signals Showing

**Problem:** Dashboard shows 0 signals

**Solution:**
```bash
# Check if signals.json exists
curl https://your-backend-url/api/signals

# If empty, run scraper:
cd backend
node runScraper.js

# Then check again
curl https://your-backend-url/api/signals
```

### Monitoring Commands

```bash
# Check backend health
curl https://your-backend-url/ping

# Check scheduler status
curl https://your-backend-url/api/scheduler/status

# Check signal count
curl https://your-backend-url/api/signals | jq '.count'

# Check high signals
curl https://your-backend-url/api/signals/high | jq '.count'

# Monitor logs (in Railway/Render dashboard)
# - Go to Deployments
# - Click latest deployment
# - View logs
```

### Performance Optimization

**Frontend:**
- Vercel provides CDN globally
- Static pages cached automatically
- API calls optimized

**Backend:**
- Railway/Render auto-scales
- Database queries optimized
- Scheduler runs in background

### Database Backup

For SQLite:
```bash
# Download database from Railway/Render
# Or set up automated backups
```

For PostgreSQL (recommended for production):
```bash
# Use managed database on Railway/Render
# Automatic backups included
```

---

## Deployment Checklist

### Before Deployment

- [ ] All code committed to GitHub
- [ ] Environment variables configured
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] API endpoints tested locally
- [ ] Database initialized

### Frontend Deployment

- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] URL accessible

### Backend Deployment

- [ ] Railway/Render project created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Health check passing

### Post-Deployment

- [ ] Frontend connects to backend
- [ ] API endpoints responding
- [ ] Signals displaying correctly
- [ ] Search/filter working
- [ ] Scheduler running
- [ ] Logs accessible

### Monitoring

- [ ] Set up error tracking
- [ ] Monitor API response times
- [ ] Check database size
- [ ] Review scheduler logs
- [ ] Test failover

---

## Production URLs

After deployment, you'll have:

```
Frontend: https://your-frontend-name.vercel.app
Backend:  https://your-backend-name.railway.app
          (or .onrender.com for Render)
```

Update these in:
- Frontend `.env.local` → `NEXT_PUBLIC_API_BASE_URL`
- Vercel Environment Variables
- Any documentation

---

## Support & Resources

### Vercel
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Railway
- Docs: https://docs.railway.app
- Support: https://railway.app/support

### Render
- Docs: https://render.com/docs
- Support: https://render.com/support

---

## Summary

| Step | Platform | Time | Difficulty |
|------|----------|------|------------|
| 1. GitHub Setup | GitHub | 5 min | Easy |
| 2. Frontend Deploy | Vercel | 5 min | Easy |
| 3. Backend Deploy | Railway/Render | 10 min | Easy |
| 4. Configure Env Vars | Vercel/Railway | 5 min | Easy |
| 5. Test & Verify | Manual | 10 min | Easy |
| **Total** | - | **35 min** | **Easy** |

---

**Your app is now live! 🚀**

For updates and maintenance, see [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)
