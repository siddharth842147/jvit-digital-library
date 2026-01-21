const Payment = require('../models/Payment');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const generateReceipt = require('../utils/generateReceipt');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order (Razorpay)
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount, paymentType, borrowId, paymentMethod } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        let orderId;
        let clientSecret;

        if (paymentMethod === 'razorpay') {
            // Create Razorpay order
            const options = {
                amount: amount * 100, // amount in paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            };

            const order = await razorpay.orders.create(options);
            orderId = order.id;
        } else if (paymentMethod === 'stripe') {
            // Create Stripe payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // amount in cents
                currency: 'usd',
                metadata: {
                    userId: req.user.id,
                    paymentType
                }
            });

            orderId = paymentIntent.id;
            clientSecret = paymentIntent.client_secret;
        }

        // Create payment record
        const payment = await Payment.create({
            user: req.user.id,
            amount,
            paymentType,
            paymentMethod,
            orderId,
            borrow: borrowId || null,
            description: `Payment for ${paymentType}`,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: {
                orderId,
                clientSecret, // For Stripe
                paymentId: payment._id,
                amount,
                currency: paymentMethod === 'razorpay' ? 'INR' : 'USD'
            }
        });
    } catch (error) {
        console.error('Payment order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Verify payment (Razorpay)
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            paymentMethod,
            paymentIntentId
        } = req.body;

        let payment;

        if (paymentMethod === 'razorpay') {
            // Verify Razorpay signature
            const body = orderId + '|' + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }

            // Update payment record
            payment = await Payment.findOne({ orderId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment record not found'
                });
            }

            payment.status = 'completed';
            payment.transactionId = paymentId;
            payment.paidAt = new Date();
            payment.paymentGatewayResponse = { orderId, paymentId, signature };
            await payment.save();

        } else if (paymentMethod === 'stripe') {
            // Verify Stripe payment
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment not successful'
                });
            }

            payment = await Payment.findOne({ orderId: paymentIntentId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment record not found'
                });
            }

            payment.status = 'completed';
            payment.transactionId = paymentIntent.id;
            payment.paidAt = new Date();
            payment.paymentGatewayResponse = paymentIntent;
            await payment.save();
        }

        // Update user's fines if payment type is fine
        if (payment.paymentType === 'fine') {
            const user = await User.findById(payment.user);
            user.totalFines = Math.max(0, user.totalFines - payment.amount);
            await user.save();

            // Update borrow record if associated
            if (payment.borrow) {
                const borrow = await Borrow.findById(payment.borrow);
                if (borrow) {
                    borrow.finePaid = true;
                    await borrow.save();
                }
            }
        }

        // Update membership if payment type is membership
        if (payment.paymentType === 'membership') {
            const user = await User.findById(payment.user);
            user.membershipStatus = 'active';
            user.membershipExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            await user.save();
        }

        // Generate receipt
        const receiptPath = await generateReceipt(payment);
        payment.receiptUrl = receiptPath;
        await payment.save();

        // Populate payment details
        await payment.populate('user', 'name email');

        // Send email confirmation
        try {
            await sendEmail({
                email: payment.user.email,
                subject: 'Payment Confirmation',
                message: `Hello ${payment.user.name},\n\nYour payment of ₹${payment.amount} for ${payment.paymentType} has been received successfully.\n\nTransaction ID: ${payment.transactionId}\n\nThank you!\n\nBest regards,\nLibrary Team`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: payment
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, paymentType } = req.query;

        let query = {};

        // If not admin, only show own payments
        if (req.user.role === 'student') {
            query.user = req.user.id;
        }

        if (status) {
            query.status = status;
        }

        if (paymentType) {
            query.paymentType = paymentType;
        }

        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .populate('user', 'name email')
            .populate('borrow')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single payment
// @route   GET /api/payment/:id
// @access  Private
exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('borrow');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check authorization
        if (req.user.role === 'student' && payment.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payment'
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Download receipt
// @route   GET /api/payment/receipt/:id
// @access  Private
exports.downloadReceipt = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email phone address');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check authorization
        if (req.user.role === 'student' && payment.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this receipt'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Receipt not available for pending payments'
            });
        }

        // Generate receipt if not exists
        if (!payment.receiptUrl) {
            const receiptPath = await generateReceipt(payment);
            payment.receiptUrl = receiptPath;
            await payment.save();
        }

        res.status(200).json({
            success: true,
            data: {
                receiptUrl: payment.receiptUrl,
                payment
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Send receipt via email
// @route   POST /api/payment/send-email/:id
// @access  Private (Admin/Librarian)
exports.sendReceiptEmail = async (req, res) => {
    try {
        const path = require('path');
        const fs = require('fs');

        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Receipt can only be sent for completed payments'
            });
        }

        // Generate receipt if not exists
        if (!payment.receiptUrl) {
            const receiptPath = await generateReceipt(payment);
            payment.receiptUrl = receiptPath;
            await payment.save();
        }

        const absoluteReceiptPath = path.join(__dirname, '..', payment.receiptUrl);

        if (!fs.existsSync(absoluteReceiptPath)) {
            // Re-generate if file missing on disk
            const newPath = await generateReceipt(payment);
            payment.receiptUrl = newPath;
            await payment.save();
        }

        // Send email with attachment
        await sendEmail({
            from: `"${req.user.name} (Librarian)" <${req.user.email}>`,
            email: payment.user.email,
            subject: `Payment Receipt - ${payment.transactionId}`,
            message: `Hello ${payment.user.name},\n\nPlease find attached the payment receipt for your ${payment.paymentType} payment of ₹${payment.amount}.\n\nTotal Paid: ₹${payment.amount}\nTransaction ID: ${payment.transactionId}\nDate: ${new Date(payment.paidAt).toLocaleDateString()}\n\nThank you,\n${req.user.name}\nLibrary Team`,
            attachments: [
                {
                    filename: `Receipt_${payment.transactionId}.pdf`,
                    path: absoluteReceiptPath
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Receipt sent successfully to ' + payment.user.email
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get payment statistics
// @route   GET /api/payment/stats
// @access  Private (Admin)
exports.getPaymentStats = async (req, res) => {
    try {
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const paymentsByType = await Payment.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$paymentType',
                    count: { $sum: 1 },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const recentPayments = await Payment.find({ status: 'completed' })
            .populate('user', 'name email')
            .sort({ paidAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0]?.total || 0,
                paymentsByType,
                recentPayments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get admin payment details for manual transfer
// @route   GET /api/payment/admin-details
// @access  Private
exports.getAdminPaymentDetails = async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            upiId: process.env.COLLEGE_UPI_ID,
            upiName: process.env.COLLEGE_UPI_NAME,
            bankName: process.env.COLLEGE_BANK_NAME,
            accountHolder: process.env.COLLEGE_ACCOUNT_HOLDER,
            accountNo: process.env.COLLEGE_ACCOUNT_NO,
            ifsc: process.env.COLLEGE_IFSC
        }
    });
};

// @desc    Submit manual payment (UPI/Bank) for verification
// @route   POST /api/payment/submit-manual
// @access  Private
exports.submitManualPayment = async (req, res) => {
    try {
        const { amount, paymentType, paymentMethod, transactionId, borrowId, description } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required for verification'
            });
        }

        // Check if transaction ID already exists
        const existingPayment = await Payment.findOne({ transactionId });
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'This Transaction ID has already been submitted'
            });
        }

        const payment = await Payment.create({
            user: req.user.id,
            amount,
            paymentType,
            paymentMethod,
            transactionId,
            borrow: borrowId || null,
            description: description || `Manual ${paymentMethod} payment for ${paymentType}`,
            status: 'verifying'
        });

        res.status(201).json({
            success: true,
            message: 'Payment submitted successfully. Waiting for Admin verification.',
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve/Verify manual payment
// @route   PUT /api/payment/verify-manual/:id
// @access  Private (Admin/Librarian)
exports.verifyManualPayment = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        let payment = await Payment.findById(req.params.id).populate('user', 'name email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        if (status === 'completed') {
            payment.status = 'completed';
            payment.paidAt = new Date();
            payment.verifiedBy = req.user.id;
            payment.adminNotes = adminNotes;

            // Business Logic Updates
            if (payment.paymentType === 'fine') {
                const user = await User.findById(payment.user._id);
                user.totalFines = Math.max(0, user.totalFines - payment.amount);
                await user.save();

                if (payment.borrow) {
                    const borrow = await Borrow.findById(payment.borrow);
                    if (borrow) {
                        borrow.finePaid = true;
                        await borrow.save();
                    }
                }
            }

            if (payment.paymentType === 'membership') {
                const user = await User.findById(payment.user._id);
                user.membershipStatus = 'active';
                user.membershipExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                await user.save();
            }

            // Generate receipt
            const receiptPath = await generateReceipt(payment);
            payment.receiptUrl = receiptPath;
            await payment.save();

            // Send Email
            try {
                await sendEmail({
                    email: payment.user.email,
                    subject: 'Payment Verified Successfully - JVIT Library',
                    message: `Hello ${payment.user.name},\n\nYour manual payment of ₹${payment.amount} (ID: ${payment.transactionId}) has been verified and confirmed.\n\nYou can now download your receipt from your payment history page.\n\nThank you for your patience!\n\nBest regards,\nJVIT Library Admin`
                });
            } catch (emailErr) {
                console.error('Manual payment confirmation email failed:', emailErr);
            }

        } else if (status === 'failed') {
            payment.status = 'failed';
            payment.adminNotes = adminNotes;
            await payment.save();
        }

        res.status(200).json({
            success: true,
            message: `Payment ${status === 'completed' ? 'verified' : 'rejected'} successfully`,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
