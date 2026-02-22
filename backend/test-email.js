require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
    console.log('--- Email Diagnostic Test ---');
    console.log(`Using Email: ${process.env.EMAIL_USER}`);
    console.log(`Using From: ${process.env.EMAIL_FROM}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ Error: EMAIL_USER or EMAIL_PASSWORD missing in .env');
        process.exit(1);
    }

    try {
        console.log('Attempting to send test email...');
        await sendEmail({
            email: process.env.EMAIL_USER, // Send to self
            subject: 'JVIT Library - Email Diagnostic Test ✅',
            message: 'If you are reading this, your email configuration (transporter, auth, and credentials) is working correctly!'
        });
        console.log('✅ Success! Test email sent specifically to ' + process.env.EMAIL_USER);
    } catch (error) {
        console.error('❌ Failed to send email.');
        console.error('Error Details:', error.message);
        console.log('\nCommon fixes:');
        console.log('1. Verify your Gmail App Password is correct.');
        console.log('2. Ensure "Less Secure Apps" is NOT the issue (use App Passwords instead).');
        console.log('3. If on Render, ensure you have added these variables to the Render Dashboard.');
    }
};

testEmail();
