const Book = require('../models/Book');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
    try {
        const { search, category, status, page = 1, limit = 12 } = req.query;

        // Build query
        let query = {};

        // Search by title or author
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Pagination
        const skip = (page - 1) * limit;

        const books = await Book.find(query)
            .populate('addedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            count: books.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('addedBy', 'name email role');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
exports.addBook = async (req, res) => {
    try {
        // Add user to req.body
        req.body.addedBy = req.user.id;

        // Handle file upload
        if (req.file) {
            req.body.coverImage = `/uploads/books/${req.file.filename}`;
        }

        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: book
        });
    } catch (error) {
        // Handle duplicate ISBN error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A book with this ISBN already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
exports.updateBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Handle file upload
        if (req.file) {
            req.body.coverImage = `/uploads/books/${req.file.filename}`;
        }

        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if book is currently borrowed
        if (book.availableCopies < book.totalCopies) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book that is currently borrowed'
            });
        }

        await book.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get book categories
// @route   GET /api/books/categories/list
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get book statistics
// @route   GET /api/books/stats/overview
// @access  Private (Admin/Librarian)
exports.getBookStats = async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const availableBooks = await Book.countDocuments({ status: 'available' });
        const unavailableBooks = await Book.countDocuments({ status: 'unavailable' });

        const categoryStats = await Book.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalCopies: { $sum: '$totalCopies' },
                    availableCopies: { $sum: '$availableCopies' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                availableBooks,
                unavailableBooks,
                categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Bulk upload books via CSV
// @route   POST /api/books/bulk-upload
// @access  Private (Admin)
exports.bulkUploadBooks = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
        }

        const books = [];
        const filePath = path.join(__dirname, '..', req.file.path);

        const validCategories = [
            'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
            'Biography', 'Self-Help', 'Business', 'Children', 'Education',
            'Arts', 'Religion', 'Philosophy', 'Other'
        ];

        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().replace(/^\uFEFF/, '').trim()
            }))
            .on('data', (data) => {
                let title = '';
                let author = '';
                let publisher = '';
                let categoryInput = 'Other';
                let pages = undefined;
                let publishedYear = undefined;

                // Robust fuzzy matching for all columns
                for (let [key, val] of Object.entries(data)) {
                    if (!val) continue;
                    val = val.trim();
                    if (val === '') continue;

                    // Title detection (avoiding purely numeric columns below 6 digits like IDs)
                    if (!title && (key === 'book' || key.includes('title') || key.includes('name') || key.includes('book'))) {
                        if (isNaN(val) || val.length > 5) title = val;
                    }
                    if (!author && (key.includes('author') || key.includes('writer'))) author = val;
                    if (!publisher && (key.includes('publish') || key.includes('press'))) publisher = val;
                    if (categoryInput === 'Other' && (key.includes('branch') || key.includes('cat') || key.includes('dept'))) categoryInput = val;
                    if (!pages && (key.includes('price') || key.includes('page'))) pages = val;
                    if (!publishedYear && (key.includes('year') || key.includes('edition') || key.includes('edetion'))) publishedYear = val;
                }

                // If headers completely failed or had random names, grab the longest readable text string as the title fallback!
                if (!title) {
                    const stringValues = Object.values(data).filter(v => isNaN(parseInt(v)) && (typeof v === 'string'));
                    stringValues.sort((a, b) => b.length - a.length);
                    if (stringValues.length > 0) title = stringValues[0];
                }

                if (!author) {
                    const stringValues = Object.values(data).filter(v => isNaN(parseInt(v)) && v !== title && (typeof v === 'string'));
                    stringValues.sort((a, b) => b.length - a.length);
                    if (stringValues.length > 0) author = stringValues[0]; // second longest string
                }

                // Find Category (Smart match branch)
                let resolvedCategory = validCategories.find(c => c.toLowerCase() === categoryInput.toLowerCase()) || 'Other';
                const catLower = categoryInput.toLowerCase();
                if (catLower.includes('cse') || catLower.includes('it') || catLower.includes('tech') || catLower.includes('comput')) {
                    resolvedCategory = 'Technology';
                } else if (catLower.includes('eee') || catLower.includes('ece') || catLower.includes('engin') || catLower.includes('mech')) {
                    resolvedCategory = 'Science';
                }
                
                const processedData = {
                    title: title || 'Unknown Title',
                    author: author || 'Unknown Author',
                    publisher: publisher || 'Unknown Publisher',
                    category: resolvedCategory,
                    addedBy: req.user.id
                };

                // ISBN
                let rawIsbn = (data.isbn || '').toString().trim().toLowerCase();
                if (rawIsbn && rawIsbn !== '' && rawIsbn !== 'null' && rawIsbn !== 'nan') {
                    processedData.isbn = data.isbn.trim();
                }

                // Treat each row as 1 copy by default, grouping loop will aggregate
                let copiesQuery = data.totalcopies || data.copies;
                const totalCopies = parseInt(copiesQuery);
                processedData.totalCopies = isNaN(totalCopies) ? 1 : totalCopies;
                processedData.availableCopies = processedData.totalCopies;

                const pbYear = parseInt(publishedYear);
                if (!isNaN(pbYear) && pbYear > 1000) processedData.publishedYear = pbYear;

                const pagesNum = parseInt(pages);
                if (!isNaN(pagesNum)) processedData.pages = pagesNum;

                books.push(processedData);
            })
            .on('end', async () => {
                try {
                    // Group books from the CSV to handle multiple rows of the same book
                    const groupedBooksMap = new Map();

                    for (const book of books) {
                        // Key for deduplication: ISBN or Title + Author
                        let key = book.isbn ? book.isbn : `${book.title.toLowerCase()}_${book.author.toLowerCase()}`;
                        
                        if (groupedBooksMap.has(key)) {
                            const existing = groupedBooksMap.get(key);
                            existing.totalCopies += book.totalCopies;
                            existing.availableCopies += book.availableCopies;
                        } else {
                            groupedBooksMap.set(key, book);
                        }
                    }

                    const uniqueBooks = Array.from(groupedBooksMap.values());

                    // Prepare BulkWrite operations
                    const bulkOps = uniqueBooks.map(book => {
                        let filter = {};
                        if (book.isbn) {
                            filter = { isbn: book.isbn };
                        } else {
                            // Using case-insensitive regex for title and author to find existing book safely
                            filter = { 
                                title: { $regex: new RegExp('^' + book.title.trim() + '$', 'i') },
                                author: { $regex: new RegExp('^' + book.author.trim() + '$', 'i') }
                            };
                            
                            // Generate a safe unique 13-digit dummy ISBN purely to bypass Mongo unique constraints 
                            // on 'null' fields, preventing E11000 dup key errors entirely for new insertions!
                            book.isbn = '999' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
                        }

                        const { totalCopies, availableCopies, ...insertData } = book;

                        return {
                            updateOne: {
                                filter: filter,
                                update: {
                                    $setOnInsert: insertData,
                                    $inc: {
                                        totalCopies: totalCopies,
                                        availableCopies: availableCopies
                                    }
                                },
                                upsert: true
                            }
                        };
                    });

                    // Execute bulk write
                    if (bulkOps.length > 0) {
                        await Book.bulkWrite(bulkOps);
                    }

                    // Clean up file
                    fs.unlinkSync(filePath);
                    res.status(201).json({
                        success: true,
                        message: `Successfully processed ${books.length} records into ${uniqueBooks.length} distinct titles!`
                    });
                } catch (err) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    res.status(500).json({ success: false, message: err.message });
                }
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
