# Railway Backend Deployment Guide

Deploy your Express backend to Railway in 5 minutes!

## Prerequisites

✅ GitHub account (already have)
✅ Repository pushed to GitHub (already done)
✅ Railway account (need to create)

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click **"Start Free"** or **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Railway to access your GitHub account
5. Complete the signup

## Step 2: Create New Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Search for and select: `early-follower-radar`
5. Click **"Deploy Now"**

## Step 3: Configure Backend

1. Railway will ask to select which directory to deploy
2. Select: `backend`
3. Click **"Deploy"**

Railway will automatically:
- Detect Node.js project
- Install dependencies
- Build the app
- Start the server

## Step 4: Wait for Deployment

- Green checkmark = Success ✅
- Deployment takes 2-3 minutes
- You'll see logs in real-time

## Step 5: Get Your Backend URL

Once deployed:

1. Go to your Railway project dashboard
2. Click on the **"backend"** service
3. Look for **"Public URL"** or **"Domain"**
4. Copy the URL (looks like: `https://your-backend-xxx.railway.app`)

## Environment Variables (Already Set)

Railway will automatically use:
- `NODE_ENV=production`
- `PORT=3000`

These are already configured in your `backend/.env.example`

## Test Your Backend

Once deployed, test it:

```bash
# Replace with your Railway URL
curl https://your-backend-xxx.railway.app/ping

# Should return:
# {"status":"ok"}
```

## Get Your Backend URL

You'll need this URL to connect your frontend!

Format: `https://your-backend-xxx.railway.app`

Copy this URL and save it for the next step.

## Next Steps

1. ✅ Frontend deployed to Vercel (you're doing this)
2. ✅ Backend deployed to Railway (this step)
3. 🔄 Connect them together
4. 🎉 Everything working!

## Troubleshooting

**Deployment fails?**
- Check the logs in Railway dashboard
- Ensure `backend/package.json` has all dependencies
- Verify `backend/index.js` exists

**Can't find backend URL?**
- Go to project → backend service → Settings
- Look for "Public URL" or "Domain"

**Backend not responding?**
- Check if service is running (green status)
- Test with: `curl https://your-url/ping`
- Check logs for errors

## Cost

Railway free tier includes:
- 5GB storage
- Enough for testing
- Upgrade to Pro ($5/month) for production

---

**Ready?** Go to https://railway.app and start deploying! 🚀
