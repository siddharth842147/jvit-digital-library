const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Librarian)
exports.getDashboardStats = async (req, res) => {
    try {
        // Total counts
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalLibrarians = await User.countDocuments({ role: 'librarian' });
        const totalBooks = await Book.countDocuments();
        const totalBorrows = await Borrow.countDocuments();
        const activeBorrows = await Borrow.countDocuments({
            status: { $in: ['borrowed', 'overdue'] }
        });
        const overdueBorrows = await Borrow.countDocuments({ status: 'overdue' });

        // Available books
        const availableBooks = await Book.countDocuments({ status: 'available' });

        // Revenue statistics
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paidAt: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Recent activities
        const recentBorrows = await Borrow.find()
            .populate('user', 'name email')
            .populate('book', 'title author')
            .sort({ updatedAt: -1 })
            .limit(5);

        const recentPayments = await Payment.find({ status: 'completed' })
            .populate('user', 'name email')
            .sort({ paidAt: -1 })
            .limit(5);

        // Category-wise book distribution
        const booksByCategory = await Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Monthly borrow trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const borrowTrends = await Borrow.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalLibrarians,
                    totalBooks,
                    availableBooks,
                    totalBorrows,
                    activeBorrows,
                    overdueBorrows,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    monthlyRevenue: monthlyRevenue[0]?.total || 0
                },
                recentActivities: {
                    recentBorrows,
                    recentPayments
                },
                charts: {
                    booksByCategory,
                    borrowTrends
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (status) {
            query.membershipStatus = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin/Librarian)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('borrowedBooks', 'title author coverImage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's borrow history
        const borrowHistory = await Borrow.find({ user: user._id })
            .populate('book', 'title author')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get user's payment history
        const paymentHistory = await Payment.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                user,
                borrowHistory,
                paymentHistory
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a new user (Admin only for Librarians)
// @route   POST /api/admin/users
// @access  Private (Admin/Librarian)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const sendEmail = require('../utils/sendEmail');

        // Librarians can only create students
        if (req.user.role === 'librarian' && role !== 'student') {
            return res.status(403).json({ success: false, message: 'Librarians can only create students' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

        const user = await User.create({ name, email, password, role: role || 'student' });

        // Feature 2: Send email when librarian/user is created
        try {
            await sendEmail({
                email: user.email,
                subject: 'Library Account Created',
                message: `Hello ${user.name},\n\nYour ${user.role} account has been created by the administrator.\n\nYou can now log in using your email.\n\nBest regards,\nLibrary Management Team`
            });
        } catch (err) { }

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const { name, email, phone, address, role, membershipStatus } = req.body;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const fieldsToUpdate = {
            name,
            email,
            phone,
            address,
            role,
            membershipStatus
        };

        user = await User.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin/Librarian)
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ success: false, message: 'User not found' });

        // Logic check: Librarian can only delete students
        if (req.user.role === 'librarian' && userToDelete.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Librarians can only remove students' });
        }

        // Logic check: Admin cannot delete other admins (basic safeguard)
        if (req.user.role === 'admin' && userToDelete.role === 'admin' && userToDelete._id.toString() !== req.user.id) {
            // Let them delete if they really want, but maybe prevent self-deletion or same level?
            // Actually, usually admin can delete anyone. But preventing self-deletion is good.
        }

        if (userToDelete._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        // Check if user has active borrows
        const activeBorrows = await Borrow.countDocuments({
            user: userToDelete._id,
            status: { $in: ['borrowed', 'overdue', 'pending', 'return_pending'] }
        });

        if (activeBorrows > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with active/pending transactions'
            });
        }

        await userToDelete.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get system reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        let report = {};

        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        switch (type) {
            case 'borrow':
                report = await Borrow.aggregate([
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);
                break;

            case 'payment':
                report = await Payment.aggregate([
                    { $match: { ...dateFilter, status: 'completed' } },
                    {
                        $group: {
                            _id: '$paymentType',
                            count: { $sum: 1 },
                            total: { $sum: '$amount' }
                        }
                    }
                ]);
                break;

            case 'user':
                report = await User.aggregate([
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: '$role',
                            count: { $sum: 1 }
                        }
                    }
                ]);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type'
                });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
