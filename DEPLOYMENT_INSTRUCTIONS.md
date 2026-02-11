# Deployment Guide: Render Backend + Vercel Frontend

## Backend Deployment on Render

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub
1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Click "New Build" → Select "Build and deploy from a Git repository"
4. Connect your GitHub account
5. Select the **LabLink** repository

### Step 3: Configure Backend Service on Render
1. Select the repository
2. Choose "Node" as the runtime
3. **Service Name:** `lablink-backend`
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. **Root Directory:** `blood-bank-backend`
7. Select **Paid Plan** (free tier has limitations) or use free tier to test

### Step 4: Set Environment Variables on Render
In the Render dashboard, add these environment variables:
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = your_mongodb_atlas_connection_string
JWT_SECRET = generate_a_random_secret_here
JWT_EXPIRE = 7d
PASSPORT_SECRET = generate_a_random_secret_here
FRONTEND_URL = https://lablink.vercel.app
CONVAI_API_KEY = your_convai_api_key
```

### Step 5: Deploy
- Click "Create Web Service"
- Render will automatically build and deploy from your GitHub repository

**Your backend URL will be:** `https://lablink-backend.onrender.com`

---

## Frontend Deployment on Vercel

### Step 1: Push to GitHub
Ensure your latest code is pushed (done above)

### Step 2: Create Vercel Account & Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub for easier setup)
3. Click "Add New..." → "Project"
4. Click "Import Git Repository"
5. Import the **LabLink** repository

### Step 3: Configure Build Settings
1. **Framework Preset:** React
2. **Root Directory:** Select `blood-bank-app`
3. **Build Command:** `npm run build` (or `CI=false npm run build`)
4. **Output Directory:** `build`
5. **Install Command:** `npm install`

### Step 4: Set Environment Variables in Vercel
Add this environment variable:
```
REACT_APP_API_URL = https://lablink-backend.onrender.com/api
```

### Step 5: Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your React app

**Your frontend URL will be:** `https://lablink.vercel.app` (or custom domain)

---

## Post-Deployment Configuration

### Update Backend to Accept Vercel Frontend
Make sure your backend CORS settings accept requests from Vercel. In `blood-bank-backend/server.js`:

```javascript
const corsOptions = {
  origin: ['https://lablink.vercel.app', 'http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));
```

Push this change to trigger a redeploy on Render.

### Connect MongoDB Atlas
If you haven't already:
1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Add it to Render environment variables as `MONGODB_URI`

---

## Deployment Checklist

Backend (Render):
- [ ] GitHub account connected
- [ ] Repository configured
- [ ] Environment variables set
- [ ] Build & start commands confirmed
- [ ] MongoDB connection string added
- [ ] CORS configured for Vercel URL
- [ ] Deploy triggered

Frontend (Vercel):
- [ ] GitHub account connected
- [ ] Repository imported
- [ ] Root directory set to `blood-bank-app`
- [ ] `REACT_APP_API_URL` pointing to Render backend
- [ ] Build settings verified
- [ ] Deploy triggered

---

## Custom Domain Setup (Optional)

### For Render:
1. Go to Render dashboard → Your service
2. Click "Custom Domain" tab
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration steps

### For Vercel:
1. Go to Vercel dashboard → Your project
2. Click "Settings" → "Domains"
3. Add domain (e.g., `lablink.yourdomain.com`)
4. Follow DNS configuration steps

---

## Monitoring & Logs

**Render Logs:**
- Dashboard → Your service → "Logs" tab
- Shows real-time build and runtime logs

**Vercel Logs:**
- Dashboard → Your project → "Deployments" tab
- Click on any deployment to see logs

---

## Troubleshooting

**Backend not connecting:**
- Check CORS configuration
- Verify MongoDB connection string
- Check Render logs for errors

**API calls failing:**
- Ensure `REACT_APP_API_URL` matches your Render backend URL
- Check browser console for errors
- Verify JWT tokens are being sent correctly

**Build failures:**
- Check build logs in dashboard
- Ensure all dependencies are listed in package.json
- Verify environment variables are set

