# 🚀 Netlify Deployment Guide

## Quick Deploy to Netlify (Frontend)

### Option 1: Deploy via Netlify Dashboard (Easiest)

1. **Go to [Netlify](https://app.netlify.com/)**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your **Healthtech-mobile-app** repository
5. Netlify will auto-detect `netlify.toml` configuration
6. **Add Environment Variable**:
   - Click "Show advanced" → "New variable"
   - Key: `REACT_APP_API_URL`
   - Value: `https://blood-bank-backend-6nml.onrender.com/api`
7. Click **"Deploy site"**

Your site will be live at: `https://your-site-name.netlify.app`

---

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   cd blood-bank-app
   netlify deploy --prod
   ```

4. **Follow prompts**:
   - Create & configure a new site? **Yes**
   - Team: Select your team
   - Site name: Choose a name or leave blank for random
   - Build command: `npm run build`
   - Directory to deploy: `build`

5. **Set Environment Variable**:
   ```bash
   netlify env:set REACT_APP_API_URL https://blood-bank-backend-6nml.onrender.com/api
   ```

---

## After Deployment

### Update Backend CORS

1. Go to your backend on Render
2. Add environment variable:
   - Key: `FRONTEND_URL`
   - Value: `https://your-site-name.netlify.app`
3. Redeploy backend

---

## Custom Domain (Optional)

1. Go to Netlify dashboard → Your site
2. Click "Domain settings"
3. Click "Add custom domain"
4. Follow DNS configuration instructions

---

## Automatic Deployments

Netlify automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update"
git push
```

Changes live in ~2 minutes! 🚀

---

## Your URLs

- **Frontend**: https://your-site-name.netlify.app
- **Backend**: https://blood-bank-backend-6nml.onrender.com
- **API**: https://blood-bank-backend-6nml.onrender.com/api
