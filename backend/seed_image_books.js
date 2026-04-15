const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');

const seedImageBooks = async () => {
    try {
        console.log('🔄 Starting book seed process...');
        
        // Find an admin user to assign as addedBy
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ No admin user found to add books. Please ensure an admin exists.');
            return;
        }

        // Clear existing books
        await Book.deleteMany();
        console.log('🗑️  Cleared existing books collection.');

        const booksToInsert = [
            {
                title: 'APPLIED PHYSICS FOR CSE STREAM',
                author: 'DILEEP M S',
                publisher: 'INFLINITE LEARNING',
                category: 'Science',
                pages: 195,
                totalCopies: 1,
                addedBy: adminUser._id
            },
            {
                title: 'APPLIED PHYSICS FOR EEE STREAM',
                author: 'DILEEP M S',
                publisher: 'INFLINITE LEARNING',
                category: 'Science',
                pages: 195,
                totalCopies: 29,
                addedBy: adminUser._id
            },
            {
                title: 'BIOLOGY FOR ENGINEERS',
                author: 'RAJENDRA SINGH C',
                publisher: 'RASHA PUBLICATION',
                category: 'Science',
                pages: 250,
                totalCopies: 10,
                addedBy: adminUser._id
            },
            {
                title: 'ENGINEERING DESIGN ON INTRODUCATION',
                author: 'KARSNITZ JOHN R',
                publisher: 'CENGAGE LEARNING',
                category: 'Technology',
                pages: 525,
                totalCopies: 15,
                addedBy: adminUser._id
            },
            {
                title: 'QUANTUM COMPUTING A BEGINNERS INTRODUCTION',
                author: 'PARAG LALA K',
                publisher: 'MEGRAW HILL EDU',
                category: 'Technology',
                pages: 995,
                totalCopies: 4,
                addedBy: adminUser._id
            }
        ];

        // Insert new books
        const createdBooks = await Book.create(booksToInsert);
        console.log(`✅ Successfully inserted ${createdBooks.length} distinct book titles based on your image.`);
    } catch (error) {
        console.error('❌ Error in seeding books:', error);
    }
};

module.exports = seedImageBooks;
