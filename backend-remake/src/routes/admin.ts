import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin initialization and management routes
router.post('/init', AdminController.initializeAdmin);
router.post('/seed', authenticate, authorize('admin'), AdminController.seedData);
router.get('/stats', authenticate, authorize('admin'), AdminController.getSystemStats);

export default router;
