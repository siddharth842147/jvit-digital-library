# Library Management System with Payment Integration

A complete full-stack library management system with role-based access control, book management, borrowing system, and integrated payment gateway.

## 🚀 Features

### User Roles
- **Admin**: Full system control, analytics, user management
- **Librarian**: Book management, issue/return operations
- **Student/User**: Browse books, borrow/return, make payments

### Core Functionality
- ✅ JWT Authentication & Authorization
- ✅ Research Hub: Student-driven resource sharing with Approval Workflow
- ✅ Book Cover Upload: Support for local image uploads (Multer)
- ✅ Digital ID: QR Code generated Student IDs with Librarian Scanner
- ✅ ISBN Optionality: Sparse indexing for manual book entries
- ✅ Enhanced Security: Duplicate email AND phone number validation
- ✅ Admin analytics dashboard & Dynamic Reports

## 📁 Project Structure

```
library-management-system/
├── frontend/                 # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
└── README.md
```

## 🛠️ Tech Stack

**Frontend:**
- React.js 18
- Bootstrap 5
- Axios
- React Router v6
- React Toastify

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt.js

**Payment:**
- Razorpay
- Stripe

**Email:**
- Nodemailer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Razorpay/Stripe account (for payment integration)
- Gmail account (for email notifications)

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd library-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/library_management
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=Library Management System <your_email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Start frontend:

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 👤 Default Admin Account

After first run, you can create an admin account or use:

```
Email: admin@library.com
Password: admin123
```

(You'll need to create this manually in the database or through the register endpoint with role: 'admin')

## 🧪 Testing Payments

### Razorpay Test Cards
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

### Stripe Test Cards
- Card: 4242 4242 4242 4242
- CVV: Any 3 digits
- Expiry: Any future date

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Add book (Admin/Librarian)
- `PUT /api/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/books/:id` - Delete book (Admin)

### Borrow/Return
- `POST /api/borrow` - Borrow a book
- `POST /api/return` - Return a book
- `GET /api/borrow/user/:userId` - Get user's borrowed books
- `GET /api/borrow/history` - Get borrow history

### Payments
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/history/:userId` - Get payment history
- `GET /api/payment/receipt/:paymentId` - Download receipt

### Research Hub
- `GET /api/resources` - Get approved resources
- `POST /api/resources` - Upload resource (All roles)
- `PUT /api/resources/:id/status` - Approve/Reject resource (Admin/Librarian)
- `DELETE /api/resources/:id` - Remove resource

### ISBN & Metadata
- `GET /api/isbn/:isbn` - Fetch book metadata via Google Books API

### Admin & Reports
- `GET /api/admin/dashboard` - Get dashboard analytics
- `GET /api/reports/statistics` - Get library stats
- `GET /api/reports/member-activity` - Get student activity reports
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🌐 Deployment

### Frontend (Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Netlify:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables in Netlify dashboard

### Backend (Render/Heroku)

#### Render:
1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### Heroku:
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set other env variables
git push heroku main
```

### Database (MongoDB Atlas)

1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

## 📱 Features Walkthrough

### For Students:
1. Register/Login (with duplicate check for email/phone)
2. View/Download **Digital Student ID** with unique QR Code
3. Browse available books & search by ISBN (fetching metadata)
4. Borrow books (max 3 at a time)
5. **Research Hub**: Upload notes/lab manuals for peer sharing
6. View borrowed books with due dates & return books
7. Pay fines online if overdue & download receipts

### For Librarians:
1. All student features
2. **Scanner**: Use built-in camera to scan Student ID QR Codes
3. **Research Hub Admin**: Approve or reject student-uploaded resources
4. Add/Edit/Delete books (with local cover image upload)
5. Issue books to students & accept returns
6. View all transactions & generated reports

### For Admins:
1. All librarian features
2. User management & system configuration
3. View **Advanced Analytics Dashboard**
4. Detailed Payment & Activity Monitoring

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Input validation
- XSS protection
- CORS configuration
- Rate limiting
- SQL injection prevention

## 📧 Email Notifications

Users receive emails for:
- Registration confirmation
- Book borrowed
- Due date reminders
- Overdue notifications
- Payment confirmations

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Dark mode toggle
- Loading states
- Error handling
- Toast notifications
- Smooth animations
- Professional color scheme

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access in MongoDB Atlas

### Payment Integration Issues
- Verify API keys are correct
- Check test mode is enabled
- Ensure frontend has correct publishable keys

#### Email Issues
- Check EMAIL_USER and BREVO_API_KEY in .env
- Ensure Less Secure Apps or App Passwords are configured correctly on your email provider

## 📄 License

MIT License

## 👥 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for efficient library management**
