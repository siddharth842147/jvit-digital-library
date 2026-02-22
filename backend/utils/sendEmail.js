const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const mailOptions = {
        from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message.replace(/\n/g, '<br>'),
        attachments: options.attachments || []
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    return info;
};

module.exports = sendEmail;
