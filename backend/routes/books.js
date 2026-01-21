const express = require('express');
const {
    getBooks,
    getBook,
    addBook,
    updateBook,
    deleteBook,
    getCategories,
    getBookStats
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/categories/list', getCategories);
router.get('/:id', getBook);

// Protected routes (Admin/Librarian)
router.post('/', protect, authorize('admin', 'librarian'), addBook);
router.put('/:id', protect, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);
router.get('/stats/overview', protect, authorize('admin', 'librarian'), getBookStats);

module.exports = router;
