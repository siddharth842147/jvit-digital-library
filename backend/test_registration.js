const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function simulateRegistration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = `test_student_${Date.now()}@example.com`;
        const newUser = await User.create({
            name: 'Test Student',
            email: testEmail,
            password: 'password123',
            role: 'student'
        });
        console.log(`Registered new student: ${newUser.email}`);

        const studentCount = await User.countDocuments({ role: 'student' });
        console.log(`Current student count: ${studentCount}`);

        // Clean up
        await User.deleteOne({ _id: newUser._id });
        console.log('Cleaned up test student');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

simulateRegistration();
