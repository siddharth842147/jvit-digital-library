// @desc    Verify OTP for registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
        }
        const user = await User.findById(userId).select('+otp +otpExpire');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (!user.otp || !user.otpExpire) {
            return res.status(400).json({ success: false, message: 'OTP not set for this user' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }
        // OTP is valid, clear OTP fields and activate user
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        // Send token response (login user)
        sendTokenResponse(user, 200, res, 'OTP verified, registration complete');
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address, role } = req.body;
        const sendSMS = require('../utils/sendSMS');
        // Check if user already exists with email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check if user already exists with phone
        if (phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this phone number'
                });
            }
        }

        // Create user and log them in immediately (skip OTP flow)
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            role: role || 'student'
        });

        // Send welcome email in background
        sendEmail({
            email: user.email,
            subject: 'Welcome to JVIT Digital Library! 📚',
            message: `Hello ${user.name},\n\nWelcome to the JVIT Digital Library Management System!\n\nYour account has been created successfully. You can now browse our collection, request books, and manage your library profile.\n\nLibrary Rules Recap:\n- Max books at a time: 3\n- Default borrow duration: 14 days\n- Fine per day: ₹10 (Sundays, 1st/3rd Saturdays & holidays are exempt)\n\nHappy Reading!\nBest regards,\nLibrary Administration Team`
        }).catch(emailError => {
            console.error('Email sending failed in background:', emailError);
        });

        // Notify Staff about new registration
        try {
            const staffMembers = await User.find({ role: { $in: ['admin', 'librarian'] } });
            const staffEmails = staffMembers.map(s => s.email);

            if (staffEmails.length > 0) {
                await sendEmail({
                    email: staffEmails.join(','),
                    subject: 'New Student Registered 👤',
                    message: `Hello Staff,\n\nA new student has registered on the platform.\n\nDetails:\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nUSN: ${user.usn || 'N/A'}\n\nPlease review the account if necessary.\n\nBest regards,\nSystem Notification`
                });
            }
        } catch (staffEmailError) {
            console.error('Staff notification failed:', staffEmailError);
        }

        // Immediately return token and user (no OTP required)
        sendTokenResponse(user, 201, res, 'Registration successful');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check membership status
        if (user.membershipStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact admin.'
            });
        }

        sendTokenResponse(user, 200, res, 'Login successful');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
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
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease click on the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password reset successful');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            usn: req.body.usn,
            year: req.body.year,
            branch: req.body.branch,
            profilePic: req.body.profilePic
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password updated successfully');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user
    });
};
