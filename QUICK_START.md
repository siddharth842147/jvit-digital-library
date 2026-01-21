# ⚡ Quick Start Guide - Library Management System

Get your Library Management System up and running in **5 minutes**!

---

## 🎯 Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v16+)
- ✅ MongoDB installed OR MongoDB Atlas account
- ✅ Code editor (VS Code recommended)

---

## 🚀 5-Minute Setup

### Step 1: Install Backend Dependencies (1 min)

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment (1 min)

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=my_super_secret_jwt_key_for_library_management_system_2024
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_demo
RAZORPAY_KEY_SECRET=demo_secret
STRIPE_SECRET_KEY=sk_test_demo
STRIPE_PUBLISHABLE_KEY=pk_test_demo
EMAIL_USER=demo@library.com
EMAIL_PASSWORD=demo_password
FRONTEND_URL=http://localhost:3000
FINE_PER_DAY=10
BORROW_LIMIT_DAYS=14
MAX_BOOKS_PER_USER=3
```

### Step 3: Seed Database (30 seconds)

```bash
npm run seed
```

This creates:
- ✅ Admin account: `admin@library.com` / `admin123`
- ✅ Librarian account: `librarian@library.com` / `librarian123`
- ✅ Student account: `alice@student.com` / `student123`
- ✅ Sample books

### Step 4: Start Backend (30 seconds)

```bash
npm run dev
```

✅ Backend running at: http://localhost:5000

### Step 5: Install Frontend Dependencies (1 min)

Open **new terminal**:

```bash
cd frontend
npm install
```

### Step 6: Configure Frontend Environment (30 seconds)

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_demo
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_demo
```

### Step 7: Start Frontend (30 seconds)

```bash
npm start
```

✅ Frontend running at: http://localhost:3000

---

## 🎉 You're Ready!

### Test the Application

1. **Open Browser:** http://localhost:3000

2. **Login with Demo Account:**
   - Email: `admin@library.com`
   - Password: `admin123`

3. **Explore Features:**
   - ✅ Browse books
   - ✅ Borrow books
   - ✅ View dashboard
   - ✅ Manage books (Admin)
   - ✅ View analytics

---

## 🔧 Common Issues & Quick Fixes

### Issue: MongoDB Connection Error

**Fix:**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Issue: Port 5000 Already in Use

**Fix:** Change port in `backend/.env`:
```env
PORT=5001
```

### Issue: Frontend Can't Connect to Backend

**Fix:** Update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

---

## 📱 What's Next?

### For Development:
1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
3. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for code organization

### For Production:
1. Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Set up MongoDB Atlas
3. Configure payment gateways (Razorpay/Stripe)
4. Deploy to Netlify + Render

---

## 🎯 Quick Commands Reference

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev         # Start development server
npm start           # Start production server
npm run seed        # Seed database
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start           # Start development server
npm run build       # Build for production
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | admin123 |
| Librarian | librarian@library.com | librarian123 |
| Student | alice@student.com | student123 |

---

## 📞 Need Help?

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Review error messages in terminal
3. Verify all environment variables are set
4. Ensure MongoDB is running

---

## ✨ Features to Try

### As Student:
- ✅ Browse and search books
- ✅ Borrow up to 3 books
- ✅ View borrowed books
- ✅ Return books
- ✅ Pay fines (test mode)

### As Admin:
- ✅ View dashboard analytics
- ✅ Add/Edit/Delete books
- ✅ Manage users
- ✅ Track all borrows
- ✅ View payment history

---

**Happy Coding! 🚀**

For full documentation, see [README.md](README.md)
