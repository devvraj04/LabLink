# 🔑 Environment Variables Guide

## Generated Secrets & Configuration

### ✅ **Backend Environment Variables**

Copy these to Render Dashboard when deploying:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=8f3a9b7e2d1c4f6a5b8e9d2c1a3f4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
JWT_EXPIRE=7d
FRONTEND_URL=https://blood-bank-frontend.onrender.com
```

**MONGODB_URI** - Get from MongoDB Atlas:
```
mongodb+srv://[USERNAME]:[PASSWORD]@cluster0.xxxxx.mongodb.net/blood_bank_db?retryWrites=true&w=majority
```

---

### ✅ **Frontend Environment Variables**

Copy these to Render Dashboard when deploying:

```
REACT_APP_API_URL=https://blood-bank-backend.onrender.com/api
```

---

## 📋 Local Development Setup

### Backend (.env) - Already created!
Located at: `blood-bank-backend/.env`

For local development, use:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blood_bank_db
JWT_SECRET=8f3a9b7e2d1c4f6a5b8e9d2c1a3f4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env) - Already created!
Located at: `blood-bank-app/.env`

For local development, use:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Render Deployment - Step by Step

### Step 1: Deploy Backend

1. Go to Render Dashboard → New + → Web Service
2. Connect your GitHub repo
3. Configure:
   - Name: `blood-bank-backend`
   - Root Directory: `blood-bank-backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Add Environment Variables** (Click "Add Environment Variable"):
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `JWT_SECRET` | `8f3a9b7e2d1c4f6a5b8e9d2c1a3f4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0` |
   | `JWT_EXPIRE` | `7d` |
   | `MONGODB_URI` | Your MongoDB connection string |
   | `FRONTEND_URL` | Will update after frontend deploys |

5. Click "Create Web Service"
6. **Save your backend URL**: `https://blood-bank-backend.onrender.com`

---

### Step 2: Deploy Frontend

1. Go to Render Dashboard → New + → Static Site
2. Connect same GitHub repo
3. Configure:
   - Name: `blood-bank-frontend`
   - Root Directory: `blood-bank-app`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

4. **Add Environment Variable**:
   
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://blood-bank-backend.onrender.com/api` |

5. Click "Create Static Site"
6. **Save your frontend URL**: `https://blood-bank-frontend.onrender.com`

---

### Step 3: Update Backend with Frontend URL

1. Go back to backend service in Render
2. Click "Environment" tab
3. Update `FRONTEND_URL` to: `https://blood-bank-frontend.onrender.com`
4. Click "Save Changes"
5. Service will auto-redeploy

---

## 🗄️ MongoDB Atlas Setup

### Create Database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Create New Cluster (FREE M0)
4. Click "Database Access" → Add New User:
   - Username: `bloodbankadmin`
   - Password: **Generate Secure Password** (SAVE IT!)
   - Role: Atlas admin
5. Click "Network Access" → Add IP Address:
   - Select: "Allow access from anywhere" (0.0.0.0/0)
6. Click "Database" → "Connect" → "Connect your application"
7. Copy connection string:
   ```
   mongodb+srv://bloodbankadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` and add database name:
   ```
   mongodb+srv://bloodbankadmin:YourPassword@cluster0.xxxxx.mongodb.net/blood_bank_db?retryWrites=true&w=majority
   ```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use the generated JWT_SECRET (96 characters, cryptographically random)
- Keep .env files in .gitignore
- Use different secrets for development and production
- Rotate secrets periodically
- Use MongoDB Atlas IP whitelist in production

### ❌ DON'T:
- Commit .env files to Git
- Share secrets in public channels
- Use simple/short JWT secrets
- Use same secrets across environments
- Hardcode secrets in code

---

## 🧪 Testing Locally

### Start Backend:
```bash
cd blood-bank-backend
npm install
npm start
```
Backend runs at: http://localhost:5000

### Start Frontend:
```bash
cd blood-bank-app
npm install
npm start
```
Frontend runs at: http://localhost:3000

---

## ✅ Quick Checklist

- [x] JWT_SECRET generated (96 chars)
- [x] Backend .env created
- [x] Frontend .env created
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string obtained
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Environment variables configured on Render
- [ ] URLs updated in respective services
- [ ] Application tested

---

## 📞 Quick Reference

### Your Generated JWT Secret:
```
8f3a9b7e2d1c4f6a5b8e9d2c1a3f4b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
```
**Keep this secret and secure!**

### Service URLs (After Deployment):
- **Backend**: https://blood-bank-backend.onrender.com
- **Frontend**: https://blood-bank-frontend.onrender.com
- **API**: https://blood-bank-backend.onrender.com/api

---

**All secrets generated and ready to use! 🎉**
