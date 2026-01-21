const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true,
        default: function () {
            const borrowLimitDays = parseInt(process.env.BORROW_LIMIT_DAYS) || 14;
            return new Date(Date.now() + borrowLimitDays * 24 * 60 * 60 * 1000);
        }
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'borrowed', 'returned', 'overdue', 'rejected', 'return_pending'],
        default: 'pending'
    },
    approvedByLibrarian: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedByAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fine: {
        type: Number,
        default: 0
    },
    finePaid: {
        type: Boolean,
        default: false
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    returnedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Calculate fine on return
borrowSchema.methods.calculateFine = function () {
    if (this.returnDate && this.returnDate > this.dueDate) {
        const daysLate = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
        const finePerDay = parseInt(process.env.FINE_PER_DAY) || 10;
        this.fine = daysLate * finePerDay;
    }
    return this.fine;
};

// Update status based on dates
borrowSchema.pre('save', function (next) {
    if (this.returnDate) {
        this.status = 'returned';
    } else if (new Date() > this.dueDate) {
        this.status = 'overdue';
    }
    next();
});

// Index for efficient queries
borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('Borrow', borrowSchema);
