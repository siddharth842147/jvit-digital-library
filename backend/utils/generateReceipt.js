const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = async (payment) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Ensure receipts directory exists
            const receiptsDir = path.join(__dirname, '../receipts');
            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir, { recursive: true });
            }

            const fileName = `receipt_${payment.transactionId}.pdf`;
            const filePath = path.join(receiptsDir, fileName);

            // Create PDF document
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc
                .fontSize(20)
                .text('Library Management System', { align: 'center' })
                .fontSize(10)
                .text('Payment Receipt', { align: 'center' })
                .moveDown();

            // Draw line
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke()
                .moveDown();

            // Receipt details
            doc
                .fontSize(12)
                .text(`Receipt No: ${payment.transactionId}`, { bold: true })
                .text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`)
                .text(`Time: ${new Date(payment.paidAt).toLocaleTimeString()}`)
                .moveDown();

            // Customer details
            await payment.populate('user', 'name email phone');

            doc
                .fontSize(14)
                .text('Customer Details:', { underline: true })
                .fontSize(11)
                .text(`Name: ${payment.user.name}`)
                .text(`Email: ${payment.user.email}`)
                .text(`Phone: ${payment.user.phone || 'N/A'}`)
                .moveDown();

            // Payment details
            doc
                .fontSize(14)
                .text('Payment Details:', { underline: true })
                .fontSize(11)
                .text(`Payment Type: ${payment.paymentType.toUpperCase()}`)
                .text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`)
                .text(`Transaction ID: ${payment.transactionId}`)
                .text(`Order ID: ${payment.orderId}`)
                .moveDown();

            // Amount
            doc
                .fontSize(16)
                .text(`Amount Paid: ${payment.currency} ${payment.amount}`, {
                    bold: true,
                    align: 'right'
                })
                .moveDown(2);

            // Footer
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke()
                .moveDown()
                .fontSize(10)
                .text('Thank you for your payment!', { align: 'center' })
                .text('This is a computer-generated receipt.', { align: 'center' })
                .moveDown()
                .fontSize(8)
                .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                resolve(`/receipts/${fileName}`);
            });

            stream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateReceipt;
