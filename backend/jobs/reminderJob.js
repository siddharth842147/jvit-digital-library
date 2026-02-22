const cron = require('node-cron');
const Borrow = require('../models/Borrow');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const initReminderJob = () => {
    // 1. Daily Due Reminder & Overdue Update
    // Runs every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily library reminder job...');
        try {
            // Find books due in exactly 2 days
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
            twoDaysFromNow.setHours(23, 59, 59, 999);

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const nearingDue = await Borrow.find({
                status: 'borrowed',
                dueDate: { $gte: tomorrow, $lte: twoDaysFromNow }
            }).populate('user').populate('book');

            for (const borrow of nearingDue) {
                if (borrow.user && borrow.user.email) {
                    await sendEmail({
                        email: borrow.user.email,
                        subject: 'Library Reminder: Book Due Soon ⏳',
                        message: `Hello ${borrow.user.name},\n\n This is a reminder that the book "${borrow.book.title}" is due for return on ${new Date(borrow.dueDate).toLocaleDateString()}.\n\nPlease return it on time to avoid fines.\n\nBest regards,\nLibrary Team`
                    });
                }
            }

            // Also check for books that just became overdue today
            const result = await Borrow.updateMany(
                {
                    dueDate: { $lt: new Date() },
                    status: 'borrowed',
                    returnDate: null
                },
                {
                    $set: { status: 'overdue' }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`Updated ${result.modifiedCount} records to overdue status.`);
            }

        } catch (error) {
            console.error('Error in daily reminder job:', error);
        }
    });

    // 2. Weekly Overdue Fine Summary
    // Runs every Monday at 10:30 AM
    cron.schedule('30 10 * * 1', async () => {
        console.log('Running weekly overdue fine summary job...');
        try {
            const overdue = await Borrow.find({
                status: 'overdue'
            }).populate('user').populate('book');

            for (const borrow of overdue) {
                if (borrow.user && borrow.user.email) {
                    // Temporarily set returnDate to current time to calculate what the fine WOULD BE if returned now
                    // We don't save this returnDate, just use it for calculation
                    const originalReturnDate = borrow.returnDate;
                    borrow.returnDate = new Date();
                    const currentFine = await borrow.calculateFine();
                    borrow.returnDate = originalReturnDate;

                    await sendEmail({
                        email: borrow.user.email,
                        subject: 'Weekly Overdue Alert & Fine Summary ⚖️',
                        message: `Hello ${borrow.user.name},\n\nYour borrowed book "${borrow.book.title}" is currently OVERDUE.\n\nAs of today, your calculated fine for this book is: ₹${currentFine}.\n\nPlease return the book at the earliest to prevent further fine accumulation.\n\nNote: Fines do not count for Sundays, 1st/3rd Saturdays and government holidays.\n\nBest regards,\nLibrary Team`
                    });
                }
            }
        } catch (error) {
            console.error('Error in weekly overdue job:', error);
        }
    });

    console.log('✅ Automated Reminder Jobs initialized');
};

module.exports = { initReminderJob };
