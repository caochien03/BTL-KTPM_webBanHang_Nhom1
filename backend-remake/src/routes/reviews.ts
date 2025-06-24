import { Router } from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Review, Book, Order } from '../models';
import { ResponseHandler, ValidationUtils, PaginationUtils } from '../utils';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = Router();

// Validation rules
const createReviewValidation = [
  body('bookId').custom((value) => {
    if (!ValidationUtils.isValidObjectId(value)) {
      throw new Error('Invalid book ID');
    }
    return true;
  }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().notEmpty().withMessage('Review title is required'),
  body('comment').trim().notEmpty().withMessage('Review comment is required')
];

// Get reviews for a book
router.get('/book/:bookId', asyncHandler(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const { page, limit, sort = 'createdAt', order = 'desc' } = req.query;

  if (!ValidationUtils.isValidObjectId(bookId)) {
    return ResponseHandler.badRequest(res, 'Invalid book ID');
  }

  const { page: pageNum, limit: limitNum, skip } = PaginationUtils.getPaginationParams(
    page as string,
    limit as string
  );

  const sortOrder = order === 'desc' ? -1 : 1;
  const sortObj: any = {};
  sortObj[sort as string] = sortOrder;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ book: bookId, isApproved: true })
      .populate('user', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ book: bookId, isApproved: true })
  ]);

  const pagination = PaginationUtils.getPaginationInfo(totalCount, pageNum, limitNum);

  ResponseHandler.success(res, 'Reviews retrieved successfully', reviews, 200, pagination);
}));

// Create a review (requires authentication)
router.post('/', authenticate, createReviewValidation, asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseHandler.validationError(res, 'Validation failed', errors.array());
  }

  const { bookId, rating, title, comment } = req.body;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return ResponseHandler.notFound(res, 'Book not found');
  }

  // Check if user already reviewed this book
  const existingReview = await Review.findOne({ user: req.user?.userId, book: bookId });
  if (existingReview) {
    return ResponseHandler.conflict(res, 'You have already reviewed this book');
  }

  // Check if user purchased this book
  const userOrder = await Order.findOne({
    user: req.user?.userId,
    'items.book': bookId,
    orderStatus: 'delivered'
  });

  const review = await Review.create({
    user: req.user?.userId,
    book: bookId,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!userOrder
  });

  // Update book rating
  const allReviews = await Review.find({ book: bookId, isApproved: true });
  const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  
  await Book.findByIdAndUpdate(bookId, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': allReviews.length
  });

  await review.populate('user', 'firstName lastName');

  ResponseHandler.created(res, 'Review created successfully', review);
}));

// Update a review (requires authentication)
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: id, user: req.user?.userId });
  if (!review) {
    return ResponseHandler.notFound(res, 'Review not found');
  }

  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  await review.save();

  // Update book rating
  const allReviews = await Review.find({ book: review.book, isApproved: true });
  const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
  
  await Book.findByIdAndUpdate(review.book, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': allReviews.length
  });

  await review.populate('user', 'firstName lastName');

  ResponseHandler.success(res, 'Review updated successfully', review);
}));

// Delete a review (requires authentication)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const review = await Review.findOne({ _id: id, user: req.user?.userId });
  if (!review) {
    return ResponseHandler.notFound(res, 'Review not found');
  }

  await Review.findByIdAndDelete(id);

  // Update book rating
  const allReviews = await Review.find({ book: review.book, isApproved: true });
  const averageRating = allReviews.length > 0 
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
    : 0;
  
  await Book.findByIdAndUpdate(review.book, {
    'rating.average': Math.round(averageRating * 10) / 10,
    'rating.count': allReviews.length
  });

  ResponseHandler.success(res, 'Review deleted successfully');
}));

// Admin: Get all reviews
router.get('/admin/all', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit, approved } = req.query;

  const { page: pageNum, limit: limitNum, skip } = PaginationUtils.getPaginationParams(
    page as string,
    limit as string
  );

  const filter: any = {};
  if (approved !== undefined) {
    filter.isApproved = approved === 'true';
  }

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter)
  ]);

  const pagination = PaginationUtils.getPaginationInfo(totalCount, pageNum, limitNum);

  ResponseHandler.success(res, 'All reviews retrieved successfully', reviews, 200, pagination);
}));

// Admin: Approve/reject review
router.put('/admin/:id/approve', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  const review = await Review.findByIdAndUpdate(
    id,
    { isApproved },
    { new: true }
  ).populate('user', 'firstName lastName').populate('book', 'title');

  if (!review) {
    return ResponseHandler.notFound(res, 'Review not found');
  }

  ResponseHandler.success(res, `Review ${isApproved ? 'approved' : 'rejected'} successfully`, review);
}));

export default router;
