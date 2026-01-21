const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 12 } = req.query;

        // Build query
        let query = {};

        // Search by title or author
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Pagination
        const skip = (page - 1) * limit;

        const books = await Book.find(query)
            .populate('addedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            count: books.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('addedBy', 'name email role');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
exports.addBook = async (req, res) => {
    try {
        // Add user to req.body
        req.body.addedBy = req.user.id;

        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: book
        });
    } catch (error) {
        // Handle duplicate ISBN error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A book with this ISBN already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
exports.updateBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if book is currently borrowed
        if (book.availableCopies < book.totalCopies) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book that is currently borrowed'
            });
        }

        await book.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get book categories
// @route   GET /api/books/categories/list
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get book statistics
// @route   GET /api/books/stats/overview
// @access  Private (Admin/Librarian)
exports.getBookStats = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const availableBooks = await Book.countDocuments({ status: 'available' });
        const unavailableBooks = await Book.countDocuments({ status: 'unavailable' });

        const categoryStats = await Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalCopies: { $sum: '$totalCopies' },
                    availableCopies: { $sum: '$availableCopies' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                availableBooks,
                unavailableBooks,
                categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
