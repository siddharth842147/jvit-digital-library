# 📚 API Documentation - Library Management System

Base URL: `http://localhost:5000/api` (Development)  
Production: `https://your-api.onrender.com/api`

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📖 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Books](#books-endpoints)
3. [Borrow](#borrow-endpoints)
4. [Payment](#payment-endpoints)
5. [Admin](#admin-endpoints)
6. [User](#user-endpoints)

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Get Current User
**GET** `/auth/me`  
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "borrowedBooks": [],
    "totalFines": 0
  }
}
```

### Forgot Password
**POST** `/auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**POST** `/auth/reset-password/:resettoken`

**Body:**
```json
{
  "password": "newpassword123"
}
```

### Update Profile
**PUT** `/auth/update-details`  
**Auth Required:** Yes

**Body:**
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "9876543210",
  "address": "456 New St"
}
```

### Update Password
**PUT** `/auth/update-password`  
**Auth Required:** Yes

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Books Endpoints

### Get All Books
**GET** `/books`

**Query Parameters:**
- `search` - Search by title, author, or ISBN
- `category` - Filter by category
- `status` - Filter by status (available/unavailable)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Example:**
```
GET /books?search=gatsby&category=Fiction&page=1&limit=12
```

**Response:**
```json
{
  "success": true,
  "count": 12,
  "total": 45,
  "totalPages": 4,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "9780743273565",
      "category": "Fiction",
      "coverImage": "https://...",
      "totalCopies": 5,
      "availableCopies": 3,
      "status": "available"
    }
  ]
}
```

### Get Single Book
**GET** `/books/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "category": "Fiction",
    "publisher": "Scribner",
    "publishedYear": 1925,
    "pages": 180,
    "description": "A classic American novel...",
    "coverImage": "https://...",
    "totalCopies": 5,
    "availableCopies": 3,
    "status": "available",
    "addedBy": {
      "_id": "...",
      "name": "Admin User"
    }
  }
}
```

### Add Book
**POST** `/books`  
**Auth Required:** Yes (Admin/Librarian)

**Body:**
```json
{
  "title": "New Book",
  "author": "Author Name",
  "isbn": "1234567890123",
  "category": "Fiction",
  "publisher": "Publisher Name",
  "publishedYear": 2023,
  "language": "English",
  "pages": 300,
  "description": "Book description...",
  "coverImage": "https://...",
  "totalCopies": 5,
  "shelf": "A-101"
}
```

### Update Book
**PUT** `/books/:id`  
**Auth Required:** Yes (Admin/Librarian)

**Body:** Same as Add Book

### Delete Book
**DELETE** `/books/:id`  
**Auth Required:** Yes (Admin)

### Get Categories
**GET** `/books/categories/list`

**Response:**
```json
{
  "success": true,
  "data": ["Fiction", "Non-Fiction", "Science", "Technology", ...]
}
```

### Get Book Statistics
**GET** `/books/stats/overview`  
**Auth Required:** Yes (Admin/Librarian)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 150,
    "availableBooks": 120,
    "unavailableBooks": 30,
    "categoryStats": [
      {
        "_id": "Fiction",
        "count": 45,
        "totalCopies": 200,
        "availableCopies": 150
      }
    ]
  }
}
```

---

## Borrow Endpoints

### Borrow a Book
**POST** `/borrow`  
**Auth Required:** Yes

**Body:**
```json
{
  "bookId": "book_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "_id": "...",
    "user": "...",
    "book": {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald"
    },
    "borrowDate": "2024-01-20T10:00:00.000Z",
    "dueDate": "2024-02-03T10:00:00.000Z",
    "status": "borrowed"
  }
}
```

### Return a Book
**POST** `/borrow/return/:id`  
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "_id": "...",
    "returnDate": "2024-02-01T10:00:00.000Z",
    "status": "returned",
    "fine": 0
  }
}
```

### Get My Borrowed Books
**GET** `/borrow/my-books`  
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "book": {
        "title": "Book Title",
        "author": "Author Name",
        "coverImage": "https://..."
      },
      "borrowDate": "2024-01-20T10:00:00.000Z",
      "dueDate": "2024-02-03T10:00:00.000Z",
      "status": "borrowed"
    }
  ]
}
```

### Get Borrow History
**GET** `/borrow/history`  
**Auth Required:** Yes

**Query Parameters:**
- `userId` - Filter by user (Admin/Librarian only)
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

### Get Active Borrows
**GET** `/borrow/active`  
**Auth Required:** Yes (Admin/Librarian)

### Get Overdue Books
**GET** `/borrow/overdue`  
**Auth Required:** Yes (Admin/Librarian)

---

## Payment Endpoints

### Create Payment Order
**POST** `/payment/create-order`  
**Auth Required:** Yes

**Body:**
```json
{
  "amount": 100,
  "paymentType": "fine",
  "paymentMethod": "razorpay",
  "borrowId": "borrow_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "paymentId": "payment_xxx",
    "amount": 100,
    "currency": "INR"
  }
}
```

### Verify Payment
**POST** `/payment/verify`  
**Auth Required:** Yes

**Body (Razorpay):**
```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "signature_xxx",
  "paymentMethod": "razorpay"
}
```

**Body (Stripe):**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethod": "stripe"
}
```

### Get Payment History
**GET** `/payment/history`  
**Auth Required:** Yes

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status
- `paymentType` - Filter by type

### Get Single Payment
**GET** `/payment/:id`  
**Auth Required:** Yes

### Download Receipt
**GET** `/payment/receipt/:id`  
**Auth Required:** Yes

### Get Payment Statistics
**GET** `/payment/stats`  
**Auth Required:** Yes (Admin)

---

## Admin Endpoints

### Get Dashboard Statistics
**GET** `/admin/dashboard`  
**Auth Required:** Yes (Admin/Librarian)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 500,
      "totalBooks": 1000,
      "availableBooks": 750,
      "activeBorrows": 250,
      "overdueBorrows": 25,
      "totalRevenue": 50000,
      "monthlyRevenue": 5000
    },
    "recentActivities": {
      "recentBorrows": [...],
      "recentPayments": [...]
    },
    "charts": {
      "booksByCategory": [...],
      "borrowTrends": [...]
    }
  }
}
```

### Get All Users
**GET** `/admin/users`  
**Auth Required:** Yes (Admin)

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by membership status
- `search` - Search by name or email
- `page` - Page number
- `limit` - Items per page

### Get Single User
**GET** `/admin/users/:id`  
**Auth Required:** Yes (Admin/Librarian)

### Update User
**PUT** `/admin/users/:id`  
**Auth Required:** Yes (Admin)

**Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "role": "librarian",
  "membershipStatus": "active"
}
```

### Delete User
**DELETE** `/admin/users/:id`  
**Auth Required:** Yes (Admin)

### Get Reports
**GET** `/admin/reports`  
**Auth Required:** Yes (Admin)

**Query Parameters:**
- `type` - Report type (borrow/payment/user)
- `startDate` - Start date
- `endDate` - End date

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Testing with Postman

1. Import the API collection
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token
3. Use `{{base_url}}` and `{{token}}` in requests

---

## Webhooks (Optional)

### Razorpay Webhook
**POST** `/payment/razorpay-webhook`

### Stripe Webhook
**POST** `/payment/stripe-webhook`

---

For more information, refer to the main README.md file.
