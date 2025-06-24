const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const BookSchema = new mongoose.Schema({
  mainText: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  thumbnail: { type: String },
  slider: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);

const sampleBooks = [
  {
    mainText: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    price: 65000,
    category: "Tâm lý học",
    quantity: 100,
    sold: 25,
    thumbnail: "/images/book/1-5e81d7f66dada42752efb220d7b2956c.jpg",
    slider: ["/images/book/1-5e81d7f66dada42752efb220d7b2956c.jpg"]
  },
  {
    mainText: "Sapiens: Lược sử loài người",
    author: "Yuval Noah Harari",
    price: 125000,
    category: "Lịch sử",
    quantity: 75,
    sold: 30,
    thumbnail: "/images/book/10-e4d30a34e0e1970b921e6c8de04515c6.jpg",
    slider: ["/images/book/10-e4d30a34e0e1970b921e6c8de04515c6.jpg"]
  },
  {
    mainText: "Nhà giả kim",
    author: "Paulo Coelho",
    price: 85000,
    category: "Tiểu thuyết",
    quantity: 120,
    sold: 45,
    thumbnail: "/images/book/11-dc801dd2a968c1a43ec9270728555fbe.jpg",
    slider: ["/images/book/11-dc801dd2a968c1a43ec9270728555fbe.jpg"]
  },
  {
    mainText: "Tư duy nhanh và chậm",
    author: "Daniel Kahneman",
    price: 145000,
    category: "Tâm lý học",
    quantity: 60,
    sold: 20,
    thumbnail: "/images/book/12-45dbffab3a67de798a132d43e80b833e.jpg",
    slider: ["/images/book/12-45dbffab3a67de798a132d43e80b833e.jpg"]
  },
  {
    mainText: "Atomic Habits",
    author: "James Clear",
    price: 155000,
    category: "Phát triển bản thân",
    quantity: 80,
    sold: 35,
    thumbnail: "/images/book/13-1a0fdc34fa85b809e610ee7184a70fed.jpg",
    slider: ["/images/book/13-1a0fdc34fa85b809e610ee7184a70fed.jpg"]
  },
  {
    mainText: "Clean Code",
    author: "Robert C. Martin",
    price: 200000,
    category: "Công nghệ",
    quantity: 50,
    sold: 15,
    thumbnail: "/images/book/14-6fa27e2ec564568754a71805908d4a64.jpg",
    slider: ["/images/book/14-6fa27e2ec564568754a71805908d4a64.jpg"]
  },
  {
    mainText: "The Lean Startup",
    author: "Eric Ries",
    price: 175000,
    category: "Kinh doanh",
    quantity: 65,
    sold: 22,
    thumbnail: "/images/book/15-afa213ab31cefd06d49b977a2f4ab594.jpg",
    slider: ["/images/book/15-afa213ab31cefd06d49b977a2f4ab594.jpg"]
  },
  {
    mainText: "Homo Deus",
    author: "Yuval Noah Harari",
    price: 135000,
    category: "Lịch sử",
    quantity: 70,
    sold: 18,
    thumbnail: "/images/book/16-09fd50a49274ca8b39a91cc535fd1996.jpg",
    slider: ["/images/book/16-09fd50a49274ca8b39a91cc535fd1996.jpg"]
  }
];

async function seedBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore');
    console.log('Connected to MongoDB');

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Insert sample books
    await Book.insertMany(sampleBooks);
    console.log('Sample books inserted successfully');

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
}

seedBooks();
