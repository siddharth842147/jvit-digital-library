const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('borrowedBooks', 'title author coverImage');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get user coins balance and history
// @route   GET /api/user/coins
// @access  Private
router.get('/coins', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const CoinTransaction = require('../models/CoinTransaction');
        const transactions = await CoinTransaction.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                coins: user.coins || 0,
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
