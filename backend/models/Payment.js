const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide amount'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD']
    },
    paymentType: {
        type: String,
        required: true,
        enum: ['fine', 'membership', 'deposit']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['razorpay', 'stripe', 'cash', 'upi', 'bank_transfer']
    },
    status: {
        type: String,
        enum: ['pending', 'verifying', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    orderId: {
        type: String
    },
    paymentGatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    borrow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrow'
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    receiptUrl: {
        type: String
    },
    paidAt: {
        type: Date
    },
    paymentScreenshot: {
        type: String
    },
    adminNotes: {
        type: String
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate receipt number
paymentSchema.pre('save', function (next) {
    if (this.isNew && !this.transactionId) {
        this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
