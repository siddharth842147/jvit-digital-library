# 🌐 Deployment Guide - Library Management System

## Overview

This guide covers deploying your Library Management System to production using:
- **Frontend:** Netlify (Free tier)
- **Backend:** Render or Heroku (Free/Paid tiers)
- **Database:** MongoDB Atlas (Free tier)

---

## 📊 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database seeded with initial data
- [ ] Payment gateways configured (production keys)
- [ ] Email service configured
- [ ] Code committed to Git repository

---

## 1️⃣ Database Deployment (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Verify email

### Step 2: Create Cluster

1. Click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select **Cloud Provider** and **Region** (closest to your users)
4. Name your cluster (e.g., `library-cluster`)
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `libraryAdmin`
5. Generate secure password (save it!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Addresses

1. Go to **Network Access**
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add specific server IPs
5. Click **"Confirm"**

### Step 5: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `library_management`

Example:
```
mongodb+srv://libraryAdmin:YOUR_PASSWORD@library-cluster.xxxxx.mongodb.net/library_management?retryWrites=true&w=majority
```

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Update package.json:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "engines": {
       "node": ">=16.0.0"
     }
   }
   ```

2. **Create `.gitignore`:**
   ```
   node_modules/
   .env
   receipts/
   *.log
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your repository
5. Configure:
   - **Name:** `library-management-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** and add:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_live_key_id
RAZORPAY_KEY_SECRET=your_razorpay_live_secret
STRIPE_SECRET_KEY=your_stripe_live_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_live_publishable_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=Library Management <your_email@gmail.com>
FRONTEND_URL=https://your-app.netlify.app
FINE_PER_DAY=10
BORROW_LIMIT_DAYS=14
MAX_BOOKS_PER_USER=3
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your API will be available at: `https://your-app.onrender.com`

### Step 5: Test API

Visit: `https://your-app.onrender.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 3️⃣ Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. **Update API URL in `.env`:**
   ```env
   REACT_APP_API_URL=https://your-app.onrender.com/api
   REACT_APP_RAZORPAY_KEY_ID=your_razorpay_live_key_id
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_live_publishable_key
   ```

2. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

### Step 2: Deploy to Netlify (Drag & Drop)

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub
3. Drag and drop the `build` folder to Netlify
4. Your site will be deployed at: `https://random-name.netlify.app`

### Step 3: Configure Custom Domain (Optional)

1. Go to **Site Settings** → **Domain Management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

### Step 4: Add Environment Variables

1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Add:
   ```
   REACT_APP_API_URL=https://your-app.onrender.com/api
   REACT_APP_RAZORPAY_KEY_ID=your_razorpay_live_key_id
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_live_publishable_key
   ```

### Step 5: Deploy from GitHub (Alternative)

1. In Netlify, click **"New site from Git"**
2. Connect GitHub repository
3. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Base directory:** `frontend`
4. Add environment variables
5. Click **"Deploy site"**

---

## 4️⃣ Alternative: Backend on Heroku

### Step 1: Install Heroku CLI

Download from [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
cd backend
heroku create library-management-api
```

### Step 4: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set RAZORPAY_KEY_ID="your_key"
heroku config:set RAZORPAY_KEY_SECRET="your_secret"
heroku config:set STRIPE_SECRET_KEY="your_key"
heroku config:set EMAIL_USER="your_email"
heroku config:set EMAIL_PASSWORD="your_password"
heroku config:set FRONTEND_URL="https://your-app.netlify.app"
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Open App

```bash
heroku open
```

---

## 5️⃣ Payment Gateway Production Setup

### Razorpay Production

1. **Activate Account:**
   - Complete KYC verification
   - Submit business details
   - Wait for approval (1-2 days)

2. **Get Live Keys:**
   - Go to Settings → API Keys
   - Switch to **Live Mode**
   - Generate Live Keys
   - Update environment variables

3. **Webhook Setup (Optional):**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-api.com/api/payment/webhook`
   - Select events to track

### Stripe Production

1. **Activate Account:**
   - Complete business verification
   - Add bank account details
   - Submit tax information

2. **Get Live Keys:**
   - Go to Developers → API Keys
   - Toggle to **Live Mode**
   - Copy Live keys
   - Update environment variables

3. **Webhook Setup (Optional):**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-api.com/api/payment/stripe-webhook`
   - Select events

---

## 6️⃣ Post-Deployment Tasks

### 1. Seed Production Database

```bash
# Connect to your deployed backend
# Run seed script or manually create admin user
```

### 2. Test All Features

- [ ] User registration
- [ ] User login
- [ ] Browse books
- [ ] Borrow books
- [ ] Return books
- [ ] Payment processing
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Book management

### 3. Monitor Application

**Render:**
- Check logs in Render dashboard
- Set up health checks

**Heroku:**
```bash
heroku logs --tail
```

**MongoDB Atlas:**
- Monitor database metrics
- Set up alerts

### 4. Set Up Custom Domain

**Netlify:**
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Add to Netlify
3. Update DNS records

**Render:**
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

---

## 7️⃣ Security Checklist

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Use production payment keys
- [ ] Whitelist specific IPs in MongoDB Atlas
- [ ] Enable rate limiting
- [ ] Set secure CORS policies
- [ ] Use environment variables (never commit secrets)
- [ ] Enable 2FA on all services
- [ ] Regular security updates
- [ ] Monitor error logs

---

## 8️⃣ Performance Optimization

### Frontend

1. **Enable Caching:**
   - Netlify automatically caches static assets

2. **Optimize Images:**
   - Use WebP format
   - Compress images

3. **Code Splitting:**
   - Already enabled with React

### Backend

1. **Database Indexing:**
   - Already configured in models

2. **Enable Compression:**
   - Add compression middleware

3. **Caching:**
   - Implement Redis for frequently accessed data

---

## 9️⃣ Monitoring & Analytics

### Application Monitoring

1. **Render:**
   - Built-in metrics
   - Set up alerts

2. **Heroku:**
   - Use Heroku Metrics
   - Add New Relic addon

### Error Tracking

1. **Sentry:**
   ```bash
   npm install @sentry/node @sentry/react
   ```

2. **Configure in both frontend and backend**

### Analytics

1. **Google Analytics:**
   - Add tracking code to frontend

2. **MongoDB Charts:**
   - Visualize database metrics

---

## 🔟 Backup Strategy

### Database Backups

1. **MongoDB Atlas:**
   - Automatic backups enabled on paid tiers
   - Manual export: Database → Export Data

2. **Manual Backup Script:**
   ```bash
   mongodump --uri="your_mongodb_uri" --out=./backup
   ```

### Code Backups

- Use Git (already done)
- GitHub provides automatic backups

---

## 📞 Support & Maintenance

### Regular Tasks

- [ ] Monitor error logs weekly
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Backup database monthly
- [ ] Test payment integration quarterly
- [ ] Review user feedback

### Scaling

**When to scale:**
- Response time > 2 seconds
- Database size > 500MB (free tier limit)
- > 1000 concurrent users

**How to scale:**
1. Upgrade Render/Heroku plan
2. Upgrade MongoDB Atlas tier
3. Implement caching (Redis)
4. Use CDN for static assets

---

## 🎉 Deployment Complete!

Your Library Management System is now live and ready for users!

**URLs to share:**
- Frontend: `https://your-app.netlify.app`
- API: `https://your-api.onrender.com`

**Next Steps:**
1. Share with users
2. Collect feedback
3. Monitor performance
4. Plan new features

---

## Troubleshooting Deployment Issues

### Build Failures

1. Check build logs
2. Verify Node.js version
3. Clear cache and rebuild

### Database Connection Issues

1. Verify connection string
2. Check IP whitelist
3. Confirm database user credentials

### CORS Errors

1. Update FRONTEND_URL in backend
2. Check CORS configuration
3. Verify both apps are HTTPS

### Payment Issues

1. Verify live API keys
2. Check webhook configuration
3. Test with live cards (small amounts)

---

**Need Help?** Check logs, review this guide, or contact support for your hosting platforms.
