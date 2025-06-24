import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Book, Review } from '../models';
import { ResponseHandler, PaginationUtils } from '../utils';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const createBookValidation = [
  body('mainText').trim().notEmpty().withMessage('Main text is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('sold').isInt({ min: 0 }).withMessage('Sold must be a non-negative integer'),
  body('thumbnail').trim().notEmpty().withMessage('Thumbnail is required'),
  body('slider').isArray({ min: 1 }).withMessage('Slider must be an array with at least one image')
];

export class BookController {
  // Get all books with filtering and pagination
  static getAllBooks = asyncHandler(async (req: Request, res: Response) => {
    const {
      current = 1,
      pageSize = 10,
      category,
      author,
      mainText,
      sort,
      price
    } = req.query;

    const page = parseInt(current as string);
    const limit = parseInt(pageSize as string);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    if (mainText) {
      filter.mainText = { $regex: mainText, $options: 'i' };
    }

    if (price) {
      // Handle price range or exact price
      if (typeof price === 'string' && price.includes('-')) {
        const [min, max] = price.split('-').map(Number);
        filter.price = { $gte: min, $lte: max };
      } else {
        filter.price = Number(price);
      }
    }

    // Build sort
    let sortObj: any = { createdAt: -1 }; // default sort
    if (sort) {
      const sortStr = sort as string;
      if (sortStr.startsWith('-')) {
        const field = sortStr.substring(1);
        sortObj = { [field]: -1 };
      } else {
        sortObj = { [sortStr]: 1 };
      }
    }

    // Execute queries
    const [books, totalCount] = await Promise.all([
      Book.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Book.countDocuments(filter)
    ]);

    // Format response to match frontend expectations
    const response = {
      meta: {
        current: page,
        pageSize: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      result: books
    };

    ResponseHandler.success(res, 'Books retrieved successfully', response);
  });

  // Get book by ID with reviews
  static getBookById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, isActive: true });
    if (!book) {
      return ResponseHandler.notFound(res, 'Book not found');
    }

    // Get reviews for this book
    const reviews = await Review.find({ book: id, isApproved: true })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    ResponseHandler.success(res, 'Book retrieved successfully', {
      ...book.toObject(),
      reviews
    });
  });

  // Get featured books
  static getFeaturedBooks = asyncHandler(async (req: Request, res: Response) => {
    const { limit = '8' } = req.query;

    const books = await Book.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('-__v');

    ResponseHandler.success(res, 'Featured books retrieved successfully', books);
  });

  // Get books by category
  static getBooksByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page, limit } = req.query;

    const { page: pageNum, limit: limitNum, skip } = PaginationUtils.getPaginationParams(
      page as string,
      limit as string
    );

    const filter = {
      category: { $regex: new RegExp(category, 'i') },
      isActive: true
    };

    const [books, totalCount] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Book.countDocuments(filter)
    ]);

    const pagination = PaginationUtils.getPaginationInfo(totalCount, pageNum, limitNum);

    ResponseHandler.success(res, `Books in category '${category}' retrieved successfully`, books, 200, pagination);
  });

  // Search books
  static searchBooks = asyncHandler(async (req: Request, res: Response) => {
    const { q, page, limit } = req.query;

    if (!q) {
      return ResponseHandler.badRequest(res, 'Search query is required');
    }

    const { page: pageNum, limit: limitNum, skip } = PaginationUtils.getPaginationParams(
      page as string,
      limit as string
    );

    const searchFilter = {
      $and: [
        { isActive: true },
        {
          $or: [
            { mainText: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    const [books, totalCount] = await Promise.all([
      Book.find(searchFilter)
        .sort({ 'rating.average': -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Book.countDocuments(searchFilter)
    ]);

    const pagination = PaginationUtils.getPaginationInfo(totalCount, pageNum, limitNum);

    ResponseHandler.success(res, `Search results for '${q}'`, books, 200, pagination);
  });

  // Admin: Create new book
  static createBook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { thumbnail, slider, mainText, author, price, sold = 0, quantity, category } = req.body;

    if (!mainText || !author || !price || !quantity || !category || !thumbnail) {
      return ResponseHandler.badRequest(res, 'Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    const bookData = {
      mainText,
      author,
      price: Number(price),
      sold: Number(sold),
      quantity: Number(quantity),
      category,
      thumbnail,
      slider: Array.isArray(slider) ? slider : [thumbnail],
      isActive: true
    };

    const book = await Book.create(bookData);
    ResponseHandler.created(res, 'Tạo mới book thành công', book);
  });

  // Admin: Update book
  static updateBook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { thumbnail, slider, mainText, author, price, sold, quantity, category } = req.body;

    const updateData: any = {};
    if (mainText !== undefined) updateData.mainText = mainText;
    if (author !== undefined) updateData.author = author;
    if (price !== undefined) updateData.price = Number(price);
    if (sold !== undefined) updateData.sold = Number(sold);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (category !== undefined) updateData.category = category;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (slider !== undefined) updateData.slider = Array.isArray(slider) ? slider : [thumbnail];

    const book = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!book) {
      return ResponseHandler.notFound(res, 'Không tìm thấy sách');
    }

    ResponseHandler.success(res, 'Cập nhật book thành công', book);
  });

  // Admin: Delete book (soft delete)
  static deleteBook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const book = await Book.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return ResponseHandler.notFound(res, 'Không tìm thấy sách');
    }

    ResponseHandler.success(res, 'Xóa book thành công');
  });

  // Admin: Get all books including inactive
  static getAllBooksAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;

    const { page: pageNum, limit: limitNum, skip } = PaginationUtils.getPaginationParams(
      page as string,
      limit as string
    );

    const [books, totalCount] = await Promise.all([
      Book.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Book.countDocuments({})
    ]);

    const pagination = PaginationUtils.getPaginationInfo(totalCount, pageNum, limitNum);

    ResponseHandler.success(res, 'All books retrieved successfully', books, 200, pagination);
  });
}
