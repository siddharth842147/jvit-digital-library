const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['government', 'festival', 'other'],
        default: 'government'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
