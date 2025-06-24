import { Request, Response } from 'express';
import { Book, User, Order } from '../models';
import { ResponseHandler } from '../utils';
import { asyncHandler } from '../middleware/error';

export class DatabaseController {
  // Get all categories
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    // Get unique categories from books
    const categories = await Book.distinct('category');
    
    ResponseHandler.success(res, 'Categories retrieved successfully', categories);
  });

  // Get dashboard statistics (admin only)
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    // Get counts and statistics
    const [totalUsers, totalBooks, totalOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Book.countDocuments({ isActive: true }),
      Order.countDocuments()
    ]);

    // Get total revenue from delivered orders
    const revenueData = await Order.aggregate([
      {
        $match: { orderStatus: 'delivered' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent orders with populated data
    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .populate('items.book', 'mainText')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalAmount orderStatus createdAt user items');

    // Monthly statistics for charts
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    ResponseHandler.success(res, 'Dashboard data retrieved successfully', {
      countUser: totalUsers,
      countOrder: totalOrders,
      countBook: totalBooks,
      totalRevenue,
      recentOrders,
      monthlyStats
    });
  });
}
