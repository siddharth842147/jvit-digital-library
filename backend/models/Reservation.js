const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'notified', 'expired', 'fulfilled'],
        default: 'waiting'
    },
    notifiedAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);
