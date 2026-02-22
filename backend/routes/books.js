const express = require('express');
const {
    getBooks,
    getBook,
    addBook,
    updateBook,
    deleteBook,
    getCategories,
    getBookStats,
    bulkUploadBooks
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/books/');
    },
    filename: function (req, file, cb) {
        cb(null, `book_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Public routes
router.route('/')
    .get(getBooks)
    .post(protect, authorize('admin', 'librarian'), upload.single('coverImage'), addBook);

router.post('/bulk-upload', protect, authorize('admin'), upload.single('file'), bulkUploadBooks);
router.get('/categories/list', getCategories);
router.get('/:id', getBook);

// Protected routes (Admin/Librarian)
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('coverImage'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);
router.get('/stats/overview', protect, authorize('admin', 'librarian'), getBookStats);

module.exports = router;
