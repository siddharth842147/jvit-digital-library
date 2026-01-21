const express = require('express');
const {
    borrowBook,
    returnBook,
    getMyBorrowedBooks,
    getBorrowHistory,
    getOverdueBooks,
    updateOverdueStatus,
    approveBorrow,
    verifyReturn,
    getActiveBorrows
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/', protect, borrowBook);
router.post('/return/:id', protect, returnBook);
router.get('/my-books', protect, getMyBorrowedBooks);
router.get('/history', protect, getBorrowHistory);

// Admin/Librarian routes
router.get('/active', protect, authorize('admin', 'librarian'), getActiveBorrows);
router.get('/overdue', protect, authorize('admin', 'librarian'), getOverdueBooks);
router.put('/update-overdue', protect, authorize('admin'), updateOverdueStatus);
router.put('/approve/:id', protect, authorize('admin', 'librarian'), approveBorrow);
router.put('/verify-return/:id', protect, authorize('admin', 'librarian'), verifyReturn);

module.exports = router;
