const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide book title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    author: {
        type: String,
        required: [true, 'Please provide author name'],
        trim: true,
        maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    isbn: {
        type: String,
        unique: true,
        required: [true, 'Please provide ISBN'],
        match: [/^(?:\d{10}|\d{13})$/, 'Please provide a valid ISBN (10 or 13 digits)']
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: [
            'Fiction',
            'Non-Fiction',
            'Science',
            'Technology',
            'History',
            'Biography',
            'Self-Help',
            'Business',
            'Children',
            'Education',
            'Arts',
            'Religion',
            'Philosophy',
            'Other'
        ]
    },
    publisher: {
        type: String,
        trim: true,
        maxlength: [100, 'Publisher name cannot be more than 100 characters']
    },
    publishedYear: {
        type: Number,
        min: [1000, 'Invalid year'],
        max: [new Date().getFullYear(), 'Year cannot be in the future']
    },
    language: {
        type: String,
        default: 'English'
    },
    pages: {
        type: Number,
        min: [1, 'Pages must be at least 1']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    coverImage: {
        type: String,
        default: 'https://placehold.co/300x400/6366f1/ffffff?text=No+Cover'
    },
    totalCopies: {
        type: Number,
        required: [true, 'Please provide total copies'],
        min: [1, 'Total copies must be at least 1'],
        default: 1
    },
    availableCopies: {
        type: Number,
        required: true,
        min: [0, 'Available copies cannot be negative'],
        default: function () {
            return this.totalCopies;
        }
    },
    shelf: {
        type: String,
        trim: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    }
}, {
    timestamps: true
});

// Update status based on available copies
bookSchema.pre('save', function (next) {
    if (this.availableCopies > 0) {
        this.status = 'available';
    } else {
        this.status = 'unavailable';
    }
    next();
});

// Create index for search
bookSchema.index({ title: 'text', author: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
