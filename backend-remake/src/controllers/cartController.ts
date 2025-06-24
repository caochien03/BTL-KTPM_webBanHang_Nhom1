import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Cart, Book } from '../models';
import { ResponseHandler, ValidationUtils } from '../utils';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const addToCartValidation = [
  body('bookId').custom((value) => {
    if (!ValidationUtils.isValidObjectId(value)) {
      throw new Error('Invalid book ID');
    }
    return true;
  }),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
];

export class CartController {
  // Get user's cart
  static getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.user?.userId })
      .populate({
        path: 'items.book',
        select: 'mainText author price quantity thumbnail slider isActive',
        match: { isActive: true }
      });

    if (!cart) {
      return ResponseHandler.success(res, 'Cart retrieved successfully', {
        items: [],
        totalAmount: 0
      });
    }

    // Filter out items with inactive books
    cart.items = cart.items.filter(item => item.book);

    // Recalculate total if items were filtered
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    await cart.save();

    ResponseHandler.success(res, 'Cart retrieved successfully', cart);
  });

  // Add item to cart
  static addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    const { bookId, quantity } = req.body;

    // Check if book exists and is active
    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) {
      return ResponseHandler.notFound(res, 'Book not found');
    }

    // Check if book is in stock
    if (book.quantity < quantity) {
      return ResponseHandler.badRequest(res, 'Insufficient stock');
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user?.userId });
    if (!cart) {
      cart = new Cart({ user: req.user?.userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    const currentPrice = book.price;

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > 10) {
        return ResponseHandler.badRequest(res, 'Cannot add more than 10 items of the same book');
      }

      if (book.quantity < newQuantity) {
        return ResponseHandler.badRequest(res, 'Insufficient stock');
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = currentPrice;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        quantity,
        price: currentPrice
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.book',
      select: 'mainText author price thumbnail'
    });

    ResponseHandler.success(res, 'Item added to cart successfully', cart);
  });

  // Update cart item quantity
  static updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bookId } = req.params;
    const { quantity } = req.body;

    if (!ValidationUtils.isValidObjectId(bookId)) {
      return ResponseHandler.badRequest(res, 'Invalid book ID');
    }

    if (!quantity || quantity < 1 || quantity > 10) {
      return ResponseHandler.badRequest(res, 'Quantity must be between 1 and 10');
    }

    const cart = await Cart.findOne({ user: req.user?.userId });
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return ResponseHandler.notFound(res, 'Item not found in cart');
    }

    // Check stock availability
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return ResponseHandler.notFound(res, 'Book not found');
    }

    if (book.quantity < quantity) {
      return ResponseHandler.badRequest(res, 'Insufficient stock');
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = book.price;

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.book',
      select: 'mainText author price thumbnail'
    });

    ResponseHandler.success(res, 'Cart item updated successfully', cart);
  });

  // Remove item from cart
  static removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bookId } = req.params;

    if (!ValidationUtils.isValidObjectId(bookId)) {
      return ResponseHandler.badRequest(res, 'Invalid book ID');
    }

    const cart = await Cart.findOne({ user: req.user?.userId });
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart not found');
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.book.toString() !== bookId
    );

    await cart.save();

    // Populate cart for response
    await cart.populate({
      path: 'items.book',
      select: 'mainText author price thumbnail'
    });

    ResponseHandler.success(res, 'Item removed from cart successfully', cart);
  });

  // Clear entire cart
  static clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.user?.userId });
    if (!cart) {
      return ResponseHandler.notFound(res, 'Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    ResponseHandler.success(res, 'Cart cleared successfully', cart);
  });

  // Get cart item count
  static getCartCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const cart = await Cart.findOne({ user: req.user?.userId });
    
    const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

    ResponseHandler.success(res, 'Cart count retrieved successfully', { count });
  });
}
