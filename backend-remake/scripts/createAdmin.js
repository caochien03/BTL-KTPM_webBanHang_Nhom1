const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema definitions
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://TranNgocMinhDuy:yFm2SWpXSgp0xJpS@cluster0.k2bpfsa.mongodb.net/bookstore-new?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const adminUser = new User({
        fullName: 'Administrator',
        email: 'admin@admin.com',
        password: hashedPassword,
        phone: '0123456789',
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('Admin user created successfully');
      console.log('Email: admin@admin.com');
      console.log('Password: 123456');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
