const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const PDFDocument = require('pdfkit');

// @desc    Generate Inventory Report PDF
// @route   GET /api/reports/inventory
// @access  Private (Admin)
exports.getInventoryReport = async (req, res) => {
    try {
        const books = await Book.find().sort({ title: 1 });

        const doc = new PDFDocument();
        const filename = `Inventory_Report_${Date.now()}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('JVIT Digital Library', { align: 'center' });
        doc.fontSize(16).text('Inventory Status Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(14).text('Book Details:', { underline: true });
        doc.moveDown();

        books.forEach((book, index) => {
            doc.fontSize(12).text(`${index + 1}. ${book.title}`);
            doc.fontSize(10).text(`   Author: ${book.author} | ISBN: ${book.isbn}`);
            doc.text(`   Copies: ${book.availableCopies}/${book.totalCopies} | Location: ${book.shelfLocation || 'Main Hall'}`);
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate Fine Report PDF
// @route   GET /api/reports/fines
// @access  Private (Admin)
exports.getFineReport = async (req, res) => {
    try {
        const studentsWithFines = await User.find({ totalFines: { $gt: 0 } }).sort({ totalFines: -1 });

        const doc = new PDFDocument();
        const filename = `Fine_Report_${Date.now()}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('JVIT Digital Library', { align: 'center' });
        doc.fontSize(16).text('Outstanding Fines Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
        doc.moveDown();

        doc.fontSize(14).text('Students with Outstanding Fines:', { underline: true });
        doc.moveDown();

        let totalFinesSum = 0;
        studentsWithFines.forEach((student, index) => {
            doc.fontSize(12).text(`${index + 1}. ${student.name} (USN: ${student.usn || 'N/A'})`);
            doc.fontSize(10).text(`   Pending Fine: ₹${student.totalFines}`);
            doc.moveDown(0.5);
            totalFinesSum += student.totalFines;
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Outstanding Fines: ₹${totalFinesSum}`, { bold: true });

        doc.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
