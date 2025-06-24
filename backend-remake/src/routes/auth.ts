import { Router } from 'express';
import { AuthController, registerValidation, loginValidation } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/login', loginValidation, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/account', authenticate, AuthController.getProfile);
router.get('/refresh', AuthController.refreshToken); // Add refresh token endpoint

// User routes (for user management)
router.post('/register', registerValidation, AuthController.register);
router.get('/', authenticate, authorize('admin'), AuthController.getAllUsers); // For admin to get all users
router.post('/', authenticate, authorize('admin'), AuthController.createUser); // Admin create user
router.post('/bulk-create', authenticate, authorize('admin'), AuthController.bulkCreateUsers);
router.put('/', authenticate, AuthController.updateUser); // Allow users to update themselves
router.delete('/:id', authenticate, authorize('admin'), AuthController.deleteUser);
router.delete('/bulk-delete', authenticate, authorize('admin'), AuthController.bulkDeleteUsers);
router.post('/change-password', authenticate, AuthController.changePassword);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.get('/verify-token', authenticate, AuthController.verifyToken);

export default router;
