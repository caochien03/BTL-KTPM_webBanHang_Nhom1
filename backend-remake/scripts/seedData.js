const mongoose = require('mongoose');
const Book = require('../dist/models/Book').Book;
const User = require('../dist/models/User').User;

// Sample categories
const categories = [
  'Programming',
  'Technology',
  'Science Fiction',
  'Fantasy',
  'Business',
  'Self-Help',
  'History',
  'Biography',
  'Art & Design',
  'Cooking'
];

// Sample books data
const sampleBooks = [
  {
    mainText: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    price: 299000,
    quantity: 50,
    sold: 25,
    category: 'Programming',
    thumbnail: '/images/book/javascript-good-parts.jpg',
    slider: [
      '/images/book/javascript-good-parts.jpg',
      '/images/book/javascript-good-parts-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    price: 450000,
    quantity: 30,
    sold: 15,
    category: 'Programming',
    thumbnail: '/images/book/clean-code.jpg',
    slider: [
      '/images/book/clean-code.jpg',
      '/images/book/clean-code-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    price: 399000,
    quantity: 40,
    sold: 35,
    category: 'Programming',
    thumbnail: '/images/book/pragmatic-programmer.jpg',
    slider: [
      '/images/book/pragmatic-programmer.jpg',
      '/images/book/pragmatic-programmer-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'You Don\'t Know JS: Scope & Closures',
    author: 'Kyle Simpson',
    price: 250000,
    quantity: 60,
    sold: 45,
    category: 'Programming',
    thumbnail: '/images/book/ydkjs-scope.jpg',
    slider: [
      '/images/book/ydkjs-scope.jpg',
      '/images/book/ydkjs-scope-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'React: The Complete Guide',
    author: 'Maximilian Schwarzmüller',
    price: 599000,
    quantity: 25,
    sold: 20,
    category: 'Programming',
    thumbnail: '/images/book/react-complete-guide.jpg',
    slider: [
      '/images/book/react-complete-guide.jpg',
      '/images/book/react-complete-guide-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'Node.js Design Patterns',
    author: 'Mario Casciaro',
    price: 499000,
    quantity: 35,
    sold: 28,
    category: 'Programming',
    thumbnail: '/images/book/nodejs-patterns.jpg',
    slider: [
      '/images/book/nodejs-patterns.jpg',
      '/images/book/nodejs-patterns-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'TypeScript Handbook',
    author: 'Microsoft TypeScript Team',
    price: 349000,
    quantity: 45,
    sold: 30,
    category: 'Programming',
    thumbnail: '/images/book/typescript-handbook.jpg',
    slider: [
      '/images/book/typescript-handbook.jpg',
      '/images/book/typescript-handbook-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'MongoDB: The Definitive Guide',
    author: 'Shannon Bradshaw',
    price: 459000,
    quantity: 20,
    sold: 12,
    category: 'Technology',
    thumbnail: '/images/book/mongodb-guide.jpg',
    slider: [
      '/images/book/mongodb-guide.jpg',
      '/images/book/mongodb-guide-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'System Design Interview',
    author: 'Alex Xu',
    price: 549000,
    quantity: 30,
    sold: 25,
    category: 'Technology',
    thumbnail: '/images/book/system-design.jpg',
    slider: [
      '/images/book/system-design.jpg',
      '/images/book/system-design-2.jpg'
    ],
    isActive: true
  },
  {
    mainText: 'The Lean Startup',
    author: 'Eric Ries',
    price: 329000,
    quantity: 40,
    sold: 35,
    category: 'Business',
    thumbnail: '/images/book/lean-startup.jpg',
    slider: [
      '/images/book/lean-startup.jpg',
      '/images/book/lean-startup-2.jpg'
    ],
    isActive: true
  }
];

// Sample admin user
const adminUser = {
  fullName: 'Admin User',
  email: 'admin@admin.com',
  password: '123456',
  phone: '0123456789',
  role: 'admin',
  isActive: true
};

// Sample regular user
const regularUser = {
  fullName: 'John Doe',
  email: 'user@test.com',
  password: '123456',
  phone: '0987654321',
  role: 'user',
  isActive: true
};

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore');
    console.log('📊 Connected to database');

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create users
    await User.create(adminUser);
    await User.create(regularUser);
    console.log('👥 Created sample users');

    // Create books
    console.log('📚 Creating sample books...');
    for (let i = 0; i < sampleBooks.length; i++) {
      try {
        await Book.create(sampleBooks[i]);
        console.log(`✅ Created book ${i + 1}: ${sampleBooks[i].mainText}`);
      } catch (error) {
        console.error(`❌ Error creating book ${i + 1}: ${sampleBooks[i].mainText}`, error.message);
        break;
      }
    }
    console.log('📚 Finished creating books');

    console.log('✅ Sample data seeded successfully!');
    console.log(`📖 Created ${sampleBooks.length} books`);
    console.log(`👤 Created 2 users (admin: admin@admin.com, user: user@test.com)`);
    console.log(`🔑 Password for both users: 123456`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
