import { Router } from 'express';
import authRoutes from './auth';
import bookRoutes from './books';
import cartRoutes from './cart';
import orderRoutes from './orders';
import reviewRoutes from './reviews';
import uploadRoutes from './upload';
import databaseRoutes from './database';
import adminRoutes from './admin';
import { authenticate } from '../middleware/auth';
import { OrderController } from '../controllers/orderController';

const router = Router();

// API routes to match frontend expectations
router.use('/auth', authRoutes);
router.use('/user', authRoutes); // User management routes (same controller)
router.use('/book', bookRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/file', uploadRoutes);
router.use('/database', databaseRoutes); // For category and dashboard endpoints
router.use('/admin', adminRoutes); // Admin utilities

// Special route for history (frontend calls /api/v1/history)
router.get('/history', authenticate, OrderController.getUserOrders);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
