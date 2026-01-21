const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'admin@library.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        address: '123 Admin Street, City'
    },
    {
        name: 'John Librarian',
        email: 'librarian@library.com',
        password: 'librarian123',
        role: 'librarian',
        phone: '9876543211',
        address: '456 Librarian Avenue, City'
    }
];

const books = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: 'Fiction',
        publisher: 'Scribner',
        publishedYear: 1925,
        language: 'English',
        pages: 180,
        description: 'A classic American novel set in the Jazz Age',
        coverImage: 'https://images.unsplash.com/photo-1543005814-14b24e777353?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 5,
        shelf: 'A-101'
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        category: 'Fiction',
        publisher: 'Harper Perennial',
        publishedYear: 1960,
        language: 'English',
        pages: 324,
        description: 'A gripping tale of racial injustice and childhood innocence',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 4,
        shelf: 'A-102'
    },
    {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: 'Technology',
        publisher: 'Prentice Hall',
        publishedYear: 2008,
        language: 'English',
        pages: 464,
        description: 'A handbook of agile software craftsmanship',
        coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 3,
        shelf: 'T-201'
    },
    {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '9780062316097',
        category: 'History',
        publisher: 'Harper',
        publishedYear: 2015,
        language: 'English',
        pages: 443,
        description: 'A brief history of humankind',
        coverImage: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 6,
        shelf: 'H-301'
    },
    {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '9780307887894',
        category: 'Business',
        publisher: 'Crown Business',
        publishedYear: 2011,
        language: 'English',
        pages: 336,
        description: 'How constant innovation creates radically successful businesses',
        coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 4,
        shelf: 'B-401'
    },
    {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        category: 'Self-Help',
        publisher: 'Avery',
        publishedYear: 2018,
        language: 'English',
        pages: 320,
        description: 'An easy and proven way to build good habits and break bad ones',
        coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 5,
        shelf: 'S-501'
    },
    {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '9780262033848',
        category: 'Technology',
        publisher: 'MIT Press',
        publishedYear: 2009,
        language: 'English',
        pages: 1312,
        description: 'Comprehensive introduction to algorithms',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 3,
        shelf: 'T-202'
    },
    {
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '9781599869773',
        category: 'Philosophy',
        publisher: 'Pax Librorum',
        publishedYear: 2009,
        language: 'English',
        pages: 273,
        description: 'Ancient Chinese military treatise',
        coverImage: 'https://images.unsplash.com/photo-1506466010722-395ee2bef877?auto=format&fit=crop&q=80&w=300&h=450',
        totalCopies: 4,
        shelf: 'P-601'
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Book.deleteMany();
        console.log('Cleared existing data');

        // Create users
        const createdUsers = await User.create(users);
        console.log(`Created ${createdUsers.length} users`);

        // Add addedBy field to books (use admin user)
        const adminUser = createdUsers.find(user => user.role === 'admin');
        const booksWithUser = books.map(book => ({
            ...book,
            addedBy: adminUser._id
        }));

        // Create books
        const createdBooks = await Book.create(booksWithUser);
        console.log(`Created ${createdBooks.length} books`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nDefault Login Credentials:');
        console.log('Admin: admin@library.com / admin123');
        console.log('Librarian: librarian@library.com / librarian123');
        console.log('Student: alice@student.com / student123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
