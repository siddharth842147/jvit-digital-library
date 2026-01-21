const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private
exports.borrowBook = async (req, res) => {
    try {
        const { bookId, dueDate } = req.body;
        const userId = req.user.id;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if book is available
        if (book.availableCopies <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Book is not available for borrowing'
            });
        }

        // Check user's borrowed books count
        const activeBorrows = await Borrow.countDocuments({
            user: userId,
            status: { $in: ['borrowed', 'overdue'] }
        });

        const maxBooksPerUser = parseInt(process.env.MAX_BOOKS_PER_USER) || 3;
        if (activeBorrows >= maxBooksPerUser) {
            return res.status(400).json({
                success: false,
                message: `You cannot borrow more than ${maxBooksPerUser} books at a time`
            });
        }

        // Check if user already has this book borrowed
        const existingBorrow = await Borrow.findOne({
            user: userId,
            book: bookId,
            status: { $in: ['borrowed', 'overdue'] }
        });

        if (existingBorrow) {
            return res.status(400).json({
                success: false,
                message: 'You have already borrowed this book'
            });
        }

        // Check if user has unpaid fines
        const user = await User.findById(userId);
        if (user.totalFines > 0) {
            return res.status(400).json({
                success: false,
                message: 'Please clear your pending fines before borrowing more books'
            });
        }

        // Create borrow record - STAYS PENDING
        const borrow = await Borrow.create({
            user: userId,
            book: bookId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status: 'pending'
        });

        // We don't update counts yet, wait for approval

        // Populate borrow details
        await borrow.populate('book', 'title author coverImage');
        await borrow.populate('user', 'name email');

        // Notify admins/librarians (in a real app, this would be a notification)

        res.status(201).json({
            success: true,
            message: 'Borrow request submitted. Waiting for Admin & Librarian approval.',
            data: borrow
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve a borrow request (Dual Staff Approval)
// @route   PUT /api/borrow/approve/:id
// @access  Private (Admin/Librarian)
exports.approveBorrow = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) return res.status(404).json({ success: false, message: 'Request not found' });
        if (borrow.status !== 'pending') return res.status(400).json({ success: false, message: 'Request is not pending' });

        if (req.user.role === 'admin') {
            borrow.approvedByAdmin = req.user.id;
        } else if (req.user.role === 'librarian') {
            borrow.approvedByLibrarian = req.user.id;
        }

        // Check if both have approved
        if (borrow.approvedByAdmin && borrow.approvedByLibrarian) {
            borrow.status = 'borrowed';
            borrow.borrowDate = new Date();
            borrow.issuedBy = req.user.id;

            // Update book counts now
            const book = await Book.findById(borrow.book);
            book.availableCopies -= 1;
            await book.save();

            // Update user list
            const user = await User.findById(borrow.user);
            user.borrowedBooks.push(borrow.book);
            await user.save();

            // Send success email
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Borrow Request Approved!',
                    message: `Hello ${user.name},\n\nYour request for "${book.title}" has been approved by both Admin and Librarian. You can now collect the book.`
                });
            } catch (e) { }
        }

        await borrow.save();
        res.status(200).json({
            success: true,
            message: borrow.status === 'borrowed' ? 'Fully Approved!' : 'Approval recorded. Waiting for other staff.',
            data: borrow
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Return a book
// @route   POST /api/borrow/return/:id
// @access  Private
// @desc    Initiate book return (Student)
// @route   POST /api/borrow/return/:id
// @access  Private
exports.returnBook = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) return res.status(404).json({ success: false, message: 'Record not found' });

        if (borrow.status === 'returned' || borrow.status === 'return_pending') {
            return res.status(400).json({ success: false, message: 'Return already in progress or completed' });
        }

        borrow.status = 'return_pending';
        borrow.returnDate = new Date();
        await borrow.save();

        res.status(200).json({
            success: true,
            message: 'Return request submitted. Please hand over the book to the librarian/admin for final verification.',
            data: borrow
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify book return (Staff Verification - Backup Plan)
// @route   PUT /api/borrow/verify-return/:id
// @access  Private (Admin/Librarian)
exports.verifyReturn = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate('book').populate('user');
        if (!borrow || borrow.status !== 'return_pending') {
            return res.status(400).json({ success: false, message: 'Invalid return verification request' });
        }

        // Calculate fine
        const fine = borrow.calculateFine();
        if (fine > 0) {
            const user = await User.findById(borrow.user._id);
            user.totalFines += fine;
            await user.save();
        }

        // Finalize status
        borrow.status = 'returned';
        borrow.returnedTo = req.user.id;
        await borrow.save();

        // Update book counts
        const book = await Book.findById(borrow.book._id);
        book.availableCopies += 1;
        await book.save();

        // Update user list
        const user = await User.findById(borrow.user._id);
        user.borrowedBooks = user.borrowedBooks.filter(id => id.toString() !== book._id.toString());
        await user.save();

        res.status(200).json({
            success: true,
            message: `Return verified. ${fine > 0 ? 'Fine updated: ₹' + fine : 'Returned on time.'}`,
            data: borrow
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's borrowed books
// @route   GET /api/borrow/my-books
// @access  Private
exports.getMyBorrowedBooks = async (req, res) => {
    try {
        const borrows = await Borrow.find({
            user: req.user.id,
            status: { $in: ['borrowed', 'overdue', 'pending', 'return_pending'] }
        })
            .populate('book', 'title author coverImage category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get borrow history
// @route   GET /api/borrow/history
// @access  Private
exports.getBorrowHistory = async (req, res) => {
    try {
        const { userId, status, page = 1, limit = 10 } = req.query;

        let query = {};

        // If not admin/librarian, only show own history
        if (req.user.role === 'student') {
            query.user = req.user.id;
        } else if (userId) {
            query.user = userId;
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const borrows = await Borrow.find(query)
            .populate('book', 'title author coverImage isbn')
            .populate('user', 'name email')
            .populate('issuedBy', 'name')
            .populate('returnedTo', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Borrow.countDocuments(query);

        res.status(200).json({
            success: true,
            count: borrows.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all active borrows (Admin/Librarian)
// @route   GET /api/borrow/active
// @access  Private (Admin/Librarian)
exports.getActiveBorrows = async (req, res) => {
    try {
        const borrows = await Borrow.find({
            status: { $in: ['borrowed', 'overdue'] }
        })
            .populate('book', 'title author isbn')
            .populate('user', 'name email phone')
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get overdue books
// @route   GET /api/borrow/overdue
// @access  Private (Admin/Librarian)
exports.getOverdueBooks = async (req, res) => {
    try {
        const borrows = await Borrow.find({
            status: 'overdue',
            returnDate: null
        })
            .populate('book', 'title author isbn')
            .populate('user', 'name email phone')
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update overdue status (Cron job helper)
// @route   PUT /api/borrow/update-overdue
// @access  Private (Admin)
exports.updateOverdueStatus = async (req, res) => {
    try {
        const result = await Borrow.updateMany(
            {
                dueDate: { $lt: new Date() },
                status: 'borrowed',
                returnDate: null
            },
            {
                $set: { status: 'overdue' }
            }
        );

        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} records to overdue status`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
