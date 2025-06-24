import { Router } from 'express';
import { CartController, addToCartValidation } from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/add', addToCartValidation, CartController.addToCart);
router.put('/update/:bookId', CartController.updateCartItem);
router.delete('/remove/:bookId', CartController.removeFromCart);
router.delete('/clear', CartController.clearCart);
router.get('/count', CartController.getCartCount);

export default router;
