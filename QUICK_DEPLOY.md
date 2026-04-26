# Quick Deployment Checklist

Fast track to getting your app live in 30 minutes.

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Railway or Render account (free)
- [ ] Code pushed to GitHub

## Step 1: Deploy Frontend (5 minutes)

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `frontend`
5. Click "Deploy"
6. Wait for deployment to complete
7. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 2: Deploy Backend (10 minutes)

### Via Railway Dashboard

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
7. Click "Deploy"
8. Wait for deployment
9. Go to "Settings" → "Domains"
10. Copy your Railway URL (e.g., `https://your-backend.railway.app`)

### OR Via Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** `early-follower-radar-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   ```
6. Click "Create Web Service"
7. Wait for deployment
8. Copy your Render URL (e.g., `https://your-backend.onrender.com`)

## Step 3: Connect Frontend to Backend (10 minutes)

### Update Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   ```
   NEXT_PUBLIC_API_BASE_URL = https://your-backend-url.railway.app
   ```
   (Replace with your actual backend URL)
5. Click "Save"
6. Go to "Deployments"
7. Click the latest deployment
8. Click "Redeploy"
9. Wait for redeployment

## Step 4: Test (5 minutes)

### Test Backend

```bash
# Replace with your backend URL
BACKEND_URL="https://your-backend-url.railway.app"

# Health check
curl $BACKEND_URL/ping

# Should return: {"message":"pong"}
```

### Test Frontend

1. Visit your Vercel URL
2. Should see dashboard
3. Check browser console (F12) for errors
4. Should show "Ready" status

### Test Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Should see API calls to your backend
5. No CORS errors

## Step 5: Initialize Data (5 minutes)

### Run Scraper Locally

```bash
cd backend
node runScraper.js
```

This generates initial data:
- `data/currentFollowing.json`
- `data/signals.json`

### Upload to Backend (Optional)

If using Railway/Render with persistent storage:
- Files in `/app/data/` persist
- Scraper runs automatically every 6 hours

## Done! 🎉

Your app is now live!

| Component | URL |
|-----------|-----|
| Frontend | https://your-app.vercel.app |
| Backend | https://your-backend.railway.app |

## Next Steps

1. Monitor logs in Railway/Render dashboard
2. Check scheduler status: `https://your-backend-url/api/scheduler/status`
3. Run scraper periodically or set up automation
4. Share your app!

## Troubleshooting

### Frontend shows "Failed to connect"
- Check backend URL in Vercel env vars
- Redeploy frontend
- Check backend is running

### Backend returns 404
- Check health: `curl https://your-backend-url/ping`
- Check logs in Railway/Render dashboard

### No signals showing
- Run scraper: `node runScraper.js`
- Check: `curl https://your-backend-url/api/signals`

### CORS errors
- Backend CORS is enabled by default
- Check browser console for actual error

## Support

- Vercel: https://vercel.com/support
- Railway: https://railway.app/support
- Render: https://render.com/support

---

**Deployed in 30 minutes! 🚀**
