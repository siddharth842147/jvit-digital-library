# 🚀 Complete Setup Guide - Library Management System

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Payment Gateway Configuration](#payment-gateway-configuration)
6. [Email Configuration](#email-configuration)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas account (cloud database)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

### Verify Installation

```bash
node --version
npm --version
mongod --version  # If using local MongoDB
git --version
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
copy .env.example .env
```

### Step 4: Configure Environment Variables

Edit `.env` file with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/library_management

# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_in_production
JWT_EXPIRE=7d

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=Library Management <your_email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Fine Configuration
FINE_PER_DAY=10
BORROW_LIMIT_DAYS=14
MAX_BOOKS_PER_USER=3
```

### Step 5: Seed Database (Optional but Recommended)

This will create sample data including admin, librarian, and student accounts:

```bash
npm run seed
```

**Default Accounts Created:**
- Admin: `admin@library.com` / `admin123`
- Librarian: `librarian@library.com` / `librarian123`
- Student: `alice@student.com` / `student123`

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the `frontend` directory:

```bash
# Copy the example file
copy .env.example .env
```

### Step 4: Configure Environment Variables

Edit `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

---

## Database Setup

### Option 1: Local MongoDB

1. **Start MongoDB Service:**

   **Windows:**
   ```bash
   # Start MongoDB as a service
   net start MongoDB
   ```

   **Mac/Linux:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is Running:**
   ```bash
   mongo --version
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose FREE tier
   - Select your region
   - Create cluster

3. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Update `MONGODB_URI` in backend `.env`

4. **Whitelist IP Address:**
   - Go to Network Access
   - Add IP Address
   - Choose "Allow Access from Anywhere" (for development)

---

## Payment Gateway Configuration

### Razorpay Setup

1. **Create Account:**
   - Go to [Razorpay](https://razorpay.com/)
   - Sign up for account

2. **Get API Keys:**
   - Go to Settings → API Keys
   - Generate Test Keys
   - Copy Key ID and Key Secret
   - Update in both backend and frontend `.env` files

3. **Enable Test Mode:**
   - Ensure you're in Test Mode (toggle in dashboard)

### Stripe Setup

1. **Create Account:**
   - Go to [Stripe](https://stripe.com/)
   - Sign up for account

2. **Get API Keys:**
   - Go to Developers → API Keys
   - Copy Publishable Key and Secret Key
   - Update in both backend and frontend `.env` files

3. **Test Mode:**
   - Stripe starts in test mode by default
   - Use test card: `4242 4242 4242 4242`

---

## Email Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password:**
   - Go to Security → App passwords
   - Select "Mail" and "Other"
   - Generate password
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` in backend `.env`

3. **Update Environment Variables:**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

---

## Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Start Frontend Application

Open a new terminal:

```bash
# From frontend directory
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

### Verify Both Are Running

- Backend API: http://localhost:5000/api/health
- Frontend: http://localhost:3000

---

## Testing

### Test User Login

1. **Go to:** http://localhost:3000/login

2. **Use Demo Credentials:**
   - **Admin:** admin@library.com / admin123
   - **Student:** alice@student.com / student123

### Test Payment Integration

1. **Razorpay Test Card:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

2. **Stripe Test Card:**
   - Card Number: `4242 4242 4242 4242`
   - CVV: Any 3 digits
   - Expiry: Any future date

### API Testing (Optional)

Use Postman or Thunder Client:

1. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Body: {
     "email": "admin@library.com",
     "password": "admin123"
   }
   ```

---

## Deployment

### Frontend Deployment (Netlify)

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://www.netlify.com/)
   - Drag and drop `build` folder
   - OR connect GitHub repository

3. **Configure Environment Variables:**
   - Go to Site Settings → Build & Deploy → Environment
   - Add all `REACT_APP_*` variables

### Backend Deployment (Render)

1. **Create Account:**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

2. **Create Web Service:**
   - New → Web Service
   - Connect repository
   - Configure:
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Add Environment Variables:**
   - Add all variables from `.env`
   - Update `FRONTEND_URL` to your Netlify URL
   - Update `MONGODB_URI` to MongoDB Atlas

### Backend Deployment (Heroku - Alternative)

```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set all other env variables
git push heroku main
```

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError`

**Solutions:**
1. Ensure MongoDB is running: `net start MongoDB` (Windows)
2. Check connection string in `.env`
3. For Atlas: Verify IP whitelist and credentials

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solutions:**
1. Kill process using port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```
2. Change port in backend `.env`

### Email Not Sending

**Solutions:**
1. Verify Gmail App Password (not regular password)
2. Enable 2FA on Google Account
3. Check EMAIL_USER and EMAIL_PASSWORD in `.env`

### Payment Integration Not Working

**Solutions:**
1. Verify API keys are correct (test mode keys)
2. Check browser console for errors
3. Ensure frontend has correct publishable keys
4. Verify backend has correct secret keys

### CORS Errors

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env`
2. Check CORS configuration in `server.js`
3. Ensure both servers are running

### React Build Errors

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear cache:
   ```bash
   npm cache clean --force
   ```

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Razorpay API Docs](https://razorpay.com/docs/)
- [Stripe API Docs](https://stripe.com/docs)

---

## Support

For issues and questions:
1. Check this troubleshooting guide
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**🎉 Congratulations! Your Library Management System is now ready to use!**
