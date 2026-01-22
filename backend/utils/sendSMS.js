/**
 * Utility to send SMS.
 * You can integrate Twilio, Vonage, or any other SMS gateway here.
 * For now, it logs to console and returns a resolved promise.
 */
const sendSMS = async (options) => {
    try {
        const { phone, message } = options;

        console.log(`[SMS Simulation] To: ${phone}, Message: ${message}`);

        // Example Twilio Implementation (uncomment and add env variables to use):
        /*
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}` // Assuming Indian numbers, adjust as needed
        });
        */

        return { success: true };
    } catch (error) {
        console.error('SMS sending error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendSMS;
