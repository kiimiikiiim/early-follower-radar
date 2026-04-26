# Connect Frontend to Backend

Once both are deployed, connect them together!

## You Should Have

✅ **Frontend URL** from Vercel (e.g., `https://early-follower-radar-xxx.vercel.app`)
✅ **Backend URL** from Railway (e.g., `https://your-backend-xxx.railway.app`)

## Step 1: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Click your **"early-follower-radar"** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Fill in:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://your-backend-xxx.railway.app` (your Railway URL)
   - **Environments:** Select all (Production, Preview, Development)
6. Click **"Save"**

## Step 2: Redeploy Frontend

1. Still in Vercel dashboard
2. Go to **Deployments** tab
3. Click the three dots (...) on the latest deployment
4. Select **"Redeploy"**
5. Wait for redeployment (1-2 minutes)

## Step 3: Test the Connection

1. Visit your frontend URL: `https://early-follower-radar-xxx.vercel.app`
2. You should see the dashboard with signals data
3. If it shows data, you're connected! ✅

## Troubleshooting

**Dashboard shows "Failed to connect"?**
- Check backend URL is correct in Vercel env vars
- Test backend directly: `curl https://your-backend-xxx.railway.app/ping`
- Make sure you redeployed frontend after adding env var

**No signals showing?**
- Backend might need to run scraper first
- Check backend logs in Railway dashboard
- Run: `curl https://your-backend-xxx.railway.app/api/signals`

**CORS errors in browser console?**
- Backend has CORS enabled, should work
- Check browser console for actual error
- Verify backend URL is correct

## What's Happening

1. Frontend (Vercel) loads in your browser
2. Frontend JavaScript makes API calls to backend
3. Backend (Railway) processes requests and returns data
4. Frontend displays the data

## Next: Run the Scraper

Once everything is connected:

1. Go to your backend Railway dashboard
2. Click **"Command"** or **"Terminal"**
3. Run: `node runScraper.js`
4. Wait for scraper to complete
5. Refresh your frontend - you should see signals!

## Production Checklist

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Railway
- ✅ Environment variables set
- ✅ Frontend redeployed
- ✅ Connection tested
- ✅ Scraper ready to run

You're almost there! 🚀
