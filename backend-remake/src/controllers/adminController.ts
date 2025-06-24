import { Request, Response } from 'express';
import { User, Book } from '../models';
import { ResponseHandler } from '../utils';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class AdminController {
  // Initialize admin user if not exists
  static initializeAdmin = asyncHandler(async (req: Request, res: Response) => {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return ResponseHandler.success(res, 'Admin user already exists', {
        adminExists: true,
        email: adminExists.email
      });
    }

    // Create default admin
    const adminUser = await User.create({
      fullName: 'Administrator',
      email: 'admin@admin.com',
      password: 'admin123', // Will be hashed automatically
      phone: '0123456789',
      role: 'admin'
    });

    ResponseHandler.created(res, 'Admin user created successfully', {
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: adminUser.role,
      defaultPassword: 'admin123'
    });
  });

  // Seed sample data
  static seedData = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Check if books already exist
    const bookCount = await Book.countDocuments();
    
    if (bookCount > 0) {
      return ResponseHandler.success(res, 'Sample data already exists', {
        booksCount: bookCount
      });
    }

    // Create sample books
    const sampleBooks = [
      {
        mainText: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Programming',
        price: 299000,
        quantity: 50,
        sold: 10,
        thumbnail: '/images/book/clean-code.jpg',
        slider: ['/images/book/clean-code.jpg'],
        description: 'A handbook of agile software craftsmanship'
      },
      {
        mainText: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        category: 'Programming',
        price: 250000,
        quantity: 30,
        sold: 5,
        thumbnail: '/images/book/js-good-parts.jpg',
        slider: ['/images/book/js-good-parts.jpg'],
        description: 'The definitive guide to JavaScript'
      },
      {
        mainText: 'Design Patterns',
        author: 'Gang of Four',
        category: 'Programming',
        price: 350000,
        quantity: 25,
        sold: 8,
        thumbnail: '/images/book/design-patterns.jpg',
        slider: ['/images/book/design-patterns.jpg'],
        description: 'Elements of Reusable Object-Oriented Software'
      },
      {
        mainText: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Development',
        price: 180000,
        quantity: 100,
        sold: 25,
        thumbnail: '/images/book/atomic-habits.jpg',
        slider: ['/images/book/atomic-habits.jpg'],
        description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones'
      },
      {
        mainText: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        category: 'Self-Development',
        price: 150000,
        quantity: 75,
        sold: 15,
        thumbnail: '/images/book/think-grow-rich.jpg',
        slider: ['/images/book/think-grow-rich.jpg'],
        description: 'The classic guide to wealth and success'
      }
    ];

    const createdBooks = await Book.insertMany(sampleBooks);

    ResponseHandler.created(res, 'Sample data seeded successfully', {
      booksCreated: createdBooks.length,
      books: createdBooks
    });
  });

  // Get system statistics
  static getSystemStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const [userCount, bookCount, adminCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Book.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);

    ResponseHandler.success(res, 'System statistics retrieved', {
      users: userCount,
      books: bookCount,
      admins: adminCount,
      systemHealth: 'good'
    });
  });
}

export default AdminController;
