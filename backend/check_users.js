const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const allUsers = await User.find({}, 'name email role');
        console.log('Total Users count:', allUsers.length);

        const counts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('Role counts:', JSON.stringify(counts, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
