import { Router, Request, Response, NextFunction } from 'express';
import { OrderController, createOrderValidation, frontendOrderValidation } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = Router();

// Routes that match frontend API calls

// For /api/v1/order (create order and admin get all orders)
router.post('/', authenticate, frontendOrderValidation, OrderController.createFrontendOrder);
router.get('/', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  // If user is admin and has query params, show all orders
  if (req.user?.role === 'admin' && Object.keys(req.query).length > 0) {
    return OrderController.getAllOrders(req, res, next);
  }
  // Otherwise show user orders
  return OrderController.getUserOrders(req, res, next);
});

// Other order routes
router.get('/:id', authenticate, OrderController.getOrderById);
router.put('/:id/cancel', authenticate, OrderController.cancelOrder);

// Admin routes
router.put('/admin/:id/status', authenticate, authorize('admin'), OrderController.updateOrderStatus);
router.get('/admin/stats', authenticate, authorize('admin'), OrderController.getOrderStats);

export default router;
