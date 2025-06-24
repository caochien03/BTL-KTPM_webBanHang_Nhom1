const mongoose = require('mongoose');
const { Book } = require('../dist/models/Book');
const { User } = require('../dist/models/User');

// Kết nối đến database cũ
const OLD_DB_URI = 'mongodb+srv://jimm9tran:jycvmI0dbYaDh30K@jimm9tran.20x5o.mongodb.net/product-management';
// Kết nối đến database mới
const NEW_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

// Schema cho database cũ
const oldBookSchema = new mongoose.Schema({}, { strict: false });
const oldUserSchema = new mongoose.Schema({}, { strict: false });

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from old backend...');
    
    // Kết nối đến database cũ
    const oldConnection = mongoose.createConnection(OLD_DB_URI);
    console.log('📊 Connected to old database');
    
    const OldBook = oldConnection.model('Book', oldBookSchema);
    const OldUser = oldConnection.model('User', oldUserSchema);
    
    // Lấy dữ liệu từ database cũ
    console.log('📚 Fetching books from old database...');
    const oldBooks = await OldBook.find({}).lean();
    console.log(`Found ${oldBooks.length} books in old database`);
    
    console.log('👥 Fetching users from old database...');
    const oldUsers = await OldUser.find({}).lean();
    console.log(`Found ${oldUsers.length} users in old database`);
    
    // In ra cấu trúc của một book mẫu để hiểu schema
    if (oldBooks.length > 0) {
      console.log('📖 Sample book structure:', JSON.stringify(oldBooks[0], null, 2));
    }
    
    // In ra cấu trúc của một user mẫu để hiểu schema
    if (oldUsers.length > 0) {
      console.log('👤 Sample user structure:', JSON.stringify(oldUsers[0], null, 2));
    }
    
    await oldConnection.close();
    console.log('✅ Old database connection closed');
    
    // Kết nối đến database mới
    await mongoose.connect(NEW_DB_URI);
    console.log('📊 Connected to new database');
    
    // Xóa dữ liệu cũ trong database mới
    await Book.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 Cleared existing data in new database');
    
    // Migration logic với dữ liệu thật
    console.log('📚 Migrating books...');
    const migratedBooks = [];
    
    for (const oldBook of oldBooks) {
      try {
        const newBook = {
          mainText: oldBook.mainText || 'Unknown Title',
          author: oldBook.author || 'Unknown Author',
          price: oldBook.price || 0,
          sold: oldBook.sold || 0,
          quantity: oldBook.quantity || 0,
          category: oldBook.category || 'Uncategorized',
          thumbnail: oldBook.thumbnail ? `/images/book/${oldBook.thumbnail}` : null,
          slider: oldBook.slider ? oldBook.slider.map(img => `/images/book/${img}`) : [],
          isActive: true,
          language: 'english'
        };
        
        const createdBook = await Book.create(newBook);
        migratedBooks.push(createdBook);
        console.log(`✅ Migrated book: ${newBook.mainText}`);
      } catch (error) {
        console.error(`❌ Error migrating book: ${oldBook.mainText}`, error.message);
      }
    }
    
    console.log('👥 Migrating users...');
    const migratedUsers = [];
    
    for (const oldUser of oldUsers) {
      try {
        const newUser = {
          fullName: oldUser.fullName || 'Unknown User',
          email: oldUser.email || `user${Date.now()}@example.com`,
          password: '123456', // Reset all passwords to default
          role: oldUser.email === 'admin@admin.com' ? 'admin' : 'user',
          isActive: oldUser.status === 'active' || true
        };
        
        const createdUser = await User.create(newUser);
        migratedUsers.push(createdUser);
        console.log(`✅ Migrated user: ${newUser.fullName} (${newUser.email})`);
      } catch (error) {
        console.error(`❌ Error migrating user: ${oldUser.email}`, error.message);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log(`📖 Migrated ${migratedBooks.length} books`);
    console.log(`👤 Migrated ${migratedUsers.length} users`);
    console.log('🔑 All user passwords have been reset to: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateData();
