import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Special routes (must be before parameterized routes)
router.get('/featured', BookController.getFeaturedBooks);
router.get('/search', BookController.searchBooks);
router.get('/category/:category', BookController.getBooksByCategory);

// Routes to match frontend API calls
// GET /api/v1/book - Get all books with filtering and pagination
router.get('/', BookController.getAllBooks);

// GET /api/v1/book/:id - Get book by ID  
router.get('/:id', BookController.getBookById);

// POST /api/v1/book - Create new book (admin only)
router.post('/', authenticate, authorize('admin'), BookController.createBook);

// PUT /api/v1/book/:id - Update book (admin only)
router.put('/:id', authenticate, authorize('admin'), BookController.updateBook);

// DELETE /api/v1/book/:id - Delete book (admin only)
router.delete('/:id', authenticate, authorize('admin'), BookController.deleteBook);

export default router;
