import { Router } from 'express';
import { DatabaseController } from '../controllers/databaseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/category', DatabaseController.getCategories);

// Admin routes
router.get('/dashboard', authenticate, authorize('admin'), DatabaseController.getDashboard);

export default router;
