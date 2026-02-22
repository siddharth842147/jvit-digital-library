const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Question Paper', 'Notes', 'Lab Manual', 'Other'],
        required: [true, 'Please provide a resource type']
    },
    branch: {
        type: String,
        required: [true, 'Please provide a branch (e.g., CSE, ECE)'],
        trim: true
    },
    semester: {
        type: String,
        required: [true, 'Please provide a semester (1st to 8th)'],
        enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    },
    year: {
        type: Number,
        required: [true, 'Please provide the year']
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, 'Please provide a file URL']
    },
    fileName: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
