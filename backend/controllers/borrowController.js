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

        // Check for pending borrow requests for this book
        const pendingApprovals = await Borrow.countDocuments({
            book: bookId,
            status: 'pending'
        });

        // Warn if pending requests already exceed or equal available copies
        if (book.availableCopies <= 0 || pendingApprovals >= book.availableCopies) {
            const message = book.availableCopies <= 0
                ? 'Book is not available for borrowing.'
                : `All ${book.availableCopies} available copies are already requested by other students and waiting for approval. Your request may be rejected if they are approved first.`;

            if (book.availableCopies <= 0) {
                return res.status(400).json({ success: false, message });
            }
            // Allow submission but warn (or we could block here too, but warning is better for "race for approval")
        }

        // Check for active reservations (Waitlist hold)
        const Reservation = require('../models/Reservation');
        const activeReservations = await Reservation.find({
            book: bookId,
            status: 'notified',
            expiresAt: { $gt: new Date() }
        });

        if (activeReservations.length > 0) {
            const isReservedForMe = activeReservations.some(r => r.user.toString() === userId);
            if (!isReservedForMe && book.availableCopies <= activeReservations.length) {
                return res.status(400).json({
                    success: false,
                    message: 'All available copies are currently held for waitlisted students. Please join the waitlist.'
                });
            }
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
        // Notify staff (admns/librarians) about the new request
        try {
            const staffMembers = await User.find({ role: { $in: ['admin', 'librarian'] } });
            const staffEmails = staffMembers.map(s => s.email);
            if (staffEmails.length > 0) {
                await sendEmail({
                    email: staffEmails.join(','),
                    subject: 'New Book Borrow Request 📖',
                    message: `Hello Staff,\n\nA new book request has been submitted.\n\nStudent: ${borrow.user.name}\nBook: ${borrow.book.title}\nDue Date Requested: ${borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : 'System Default'}\n\nPlease visit the dashboard to approve or reject this request.\n\nBest regards,\nLibrary System`
                });
            }
        } catch (e) {
            console.error('Staff borrow request notification failed:', e);
        }

        // Notify Student
        try {
            const student = await User.findById(userId);
            if (student && student.email) {
                sendEmail({
                    email: student.email,
                    subject: 'Borrow Request Submitted 📚',
                    message: `Hello ${student.name},\n\nYour request to borrow "${borrow.book.title}" has been submitted successfully!\n\nPlease wait for the admin or librarian to approve your request in the system.\n\nBest regards,\nLibrary System`
                }).catch(err => console.error('Student borrow email error:', err.message));
            }
        } catch (e) {
            console.error('Student borrow notification failed:', e);
        }

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

        // Check if AT LEAST ONE staff member has approved
        if (borrow.approvedByAdmin || borrow.approvedByLibrarian) {
            borrow.status = 'borrowed';
            borrow.borrowDate = new Date();
            borrow.issuedBy = req.user.id;

            // Update book counts now
            const book = await Book.findById(borrow.book);

            // Critical check: ensure copy is still available at moment of approval
            if (book.availableCopies <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No copies available to fulfill this request. It should be rejected or wait until a book is returned.'
                });
            }

            book.availableCopies -= 1;
            await book.save();

            // Update user list
            const user = await User.findById(borrow.user);
            user.borrowedBooks.push(borrow.book);
            await user.save();

            // Fulfill reservation if exists
            try {
                const Reservation = require('../models/Reservation');
                const reservation = await Reservation.findOne({
                    book: borrow.book,
                    user: borrow.user,
                    status: 'notified'
                });
                if (reservation) {
                    reservation.status = 'fulfilled';
                    await reservation.save();
                }
            } catch (err) {
                console.error('Failed to fulfill reservation:', err);
            }

            // Send success email
            try {
                const sendEmail = require('../utils/sendEmail');
                await sendEmail({
                    email: user.email,
                    subject: 'Borrow Request Approved! ✅',
                    message: `Hello ${user.name},\n\nYour request for "${book.title}" has been approved by the library administration. You can now collect the physical book from the library.`
                });
            } catch (e) { }
        }

        await borrow.save();
        res.status(200).json({
            success: true,
            message: 'Book request approved successfully!',
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
        const borrow = await Borrow.findById(req.params.id).populate('book').populate('user');
        if (!borrow) return res.status(404).json({ success: false, message: 'Record not found' });

        if (borrow.status === 'returned' || borrow.status === 'return_pending') {
            return res.status(400).json({ success: false, message: 'Return already in progress or completed' });
        }

        const Holiday = require('../models/Holiday');
        const { getFineableDays } = require('../utils/dateUtils');
        const holidays = await Holiday.find() || [];
        const finePerDay = parseInt(process.env.FINE_PER_DAY) || 10;
        const now = new Date();
        
        let accruedFine = 0;
        if (now > borrow.dueDate) {
            const fineableDays = getFineableDays(borrow.dueDate, now, holidays);
            accruedFine = fineableDays * finePerDay;
        }

        const user = await User.findById(borrow.user._id);
        const currentOwed = (user.totalFines || 0) + accruedFine;

        if (currentOwed > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `You must clear your outstanding fine of ₹${currentOwed} before returning a book. Please visit the Payment portal.` 
            });
        }

        borrow.status = 'return_pending';
        borrow.returnDate = new Date();
        await borrow.save();

        // Notify Student
        try {
            if (borrow.user && borrow.user.email) {
                sendEmail({
                    email: borrow.user.email,
                    subject: 'Return Request Initiated 🔄',
                    message: `Hello ${borrow.user.name},\n\nYou have initiated the return for "${borrow.book.title}".\n\nPlease hand over the physical book to the library staff for final verification.\n\nBest regards,\nLibrary System`
                }).catch(err => console.error('Student return email error:', err.message));
            }
        } catch (e) {
            console.error('Student return notification failed:', e);
        }

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
        const fine = await borrow.calculateFine();
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

        // Send return success email
        try {
            const staffMembers = await User.find({ role: { $in: ['admin', 'librarian'] } });
            const staffEmails = staffMembers.map(s => s.email);

            // Notify Student
            await sendEmail({
                email: user.email,
                subject: 'Book Returned Successfully ✅',
                message: `Hello ${user.name},\n\nThis is to confirm that you have successfully returned the book: "${book.title}".\n\n${fine > 0 ? `A fine of ₹${fine} was recorded for this return.` : 'The book was returned on time.'}\n\nThank you for using the library services!\nLibrary Team`
            });

            // Notify Staff
            if (staffEmails.length > 0) {
                await sendEmail({
                    email: staffEmails.join(','),
                    subject: 'Book Return Verified 📚',
                    message: `Hello Staff,\n\nA book return has been verified.\n\nStudent: ${user.name}\nBook: ${book.title}\nFine Collected: ₹${fine || 0}\nVerified By: ${req.user.name}\n\nBest regards,\nLibrary System`
                });
            }
        } catch (e) {
            console.error('Failed to send return emails', e);
        }

        // Check for reservations (Waitlist)
        try {
            const Reservation = require('../models/Reservation');
            const nextInLine = await Reservation.findOne({
                book: book._id,
                status: 'waiting'
            }).populate('user');

            if (nextInLine) {
                const sendEmail = require('../utils/sendEmail');
                await sendEmail({
                    email: nextInLine.user.email,
                    subject: 'Book Now Available at JVIT Library! 📚',
                    message: `Hello ${nextInLine.user.name},\n\nThe book "${book.title}" you reserved is now available in the library.\n\nPlease visit the library within 48 hours to borrow it before your reservation expires.\n\nBest regards,\nJVIT Library Team`
                });

                nextInLine.status = 'notified';
                nextInLine.notifiedAt = Date.now();
                nextInLine.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
                await nextInLine.save();
            }
        } catch (reserveErr) {
            console.error('Reservation notification failed:', reserveErr);
        }

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

        const Holiday = require('../models/Holiday');
        const { getFineableDays } = require('../utils/dateUtils');
        const holidays = await Holiday.find();
        const finePerDay = parseInt(process.env.FINE_PER_DAY) || 10;
        const now = new Date();

        const enhancedBorrows = borrows.map(borrow => {
            const b = borrow.toObject();
            if (b.status === 'borrowed' && new Date(b.dueDate) < now) {
                b.status = 'overdue';
            }
            if (b.status === 'overdue' && !b.returnDate) {
                const fineableDays = getFineableDays(b.dueDate, now, holidays);
                b.accruedFine = fineableDays * finePerDay;
            } else {
                b.accruedFine = borrow.fine || 0;
            }
            return b;
        });

        res.status(200).json({
            success: true,
            count: enhancedBorrows.length,
            data: enhancedBorrows
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
// @desc    Renew a borrowed book
// @route   PUT /api/borrow/renew/:id
// @access  Private (Student)
exports.renewBook = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate('book');

        if (!borrow) {
            return res.status(404).json({ success: false, message: 'Borrow record not found' });
        }

        // Check ownership
        if (borrow.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check status
        if (borrow.status !== 'borrowed') {
            return res.status(400).json({ success: false, message: `Cannot renew book with status: ${borrow.status}` });
        }

        // Check renewal limit (Max 2 renewals)
        if (borrow.renewalCount >= 2) {
            return res.status(400).json({ success: false, message: 'Maximum renewal limit reached' });
        }

        // Check for reservations (Waitlist)
        const Reservation = require('../models/Reservation');
        const reservationExists = await Reservation.findOne({
            book: borrow.book._id,
            status: 'waiting'
        });

        if (reservationExists) {
            return res.status(400).json({
                success: false,
                message: 'This book has a waitlist. Renewal is not allowed.'
            });
        }

        // Renew: Add 7 days to current due date
        const newDueDate = new Date(borrow.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);

        borrow.dueDate = newDueDate;
        borrow.renewalCount += 1;
        await borrow.save();

        res.status(200).json({
            success: true,
            message: 'Book renewed successfully for 7 more days',
            data: borrow
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reserve a book (Waitlist)
// @route   POST /api/borrow/reserve/:bookId
// @access  Private (Student)
exports.reserveBook = async (req, res) => {
    try {
        const Book = require('../models/Book');
        const Reservation = require('../models/Reservation');
        const book = await Book.findById(req.params.bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Check if student already has a reservation for this book
        const existingReservation = await Reservation.findOne({
            book: book._id,
            user: req.user.id,
            status: 'waiting'
        });

        if (existingReservation) {
            return res.status(400).json({ success: false, message: 'You already have an active reservation for this book' });
        }

        // Check quantity - Should only reserve if zero copies available
        if (book.availableCopies > 0) {
            return res.status(400).json({ success: false, message: 'Copies are available. Please borrow normally.' });
        }

        const reservation = await Reservation.create({
            book: book._id,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'You have been added to the waitlist for this book.',
            data: reservation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
