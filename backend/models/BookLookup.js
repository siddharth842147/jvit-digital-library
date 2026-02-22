const mongoose = require('mongoose');

const BookLookupSchema = new mongoose.Schema({
    isbn13: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed },
    fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookLookup', BookLookupSchema);
