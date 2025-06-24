import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Order, Cart, Book, User } from '../models';
import { ResponseHandler, PaginationUtils } from '../utils';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const createOrderValidation = [
  body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer']).withMessage('Valid payment method is required')
];

// Frontend-compatible order validation (simpler format)
export const frontendOrderValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('totalPrice').isNumeric().withMessage('Total price must be a number'),
  body('detail').isArray({ min: 1 }).withMessage('Order detail must be an array with at least one item')
];

export class OrderController {
  // Create new order
  static createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user?.userId }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return ResponseHandler.badRequest(res, 'Cart is empty');
    }

    // Validate stock availability and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = item.book as any;
      
      if (!book || !book.isActive) {
        return ResponseHandler.badRequest(res, `Book "${book?.mainText || 'Unknown'}" is no longer available`);
      }

      if (book.quantity < item.quantity) {
        return ResponseHandler.badRequest(res, `Insufficient stock for "${book.mainText}". Only ${book.quantity} available`);
      }

      const currentPrice = book.price;
      const itemTotal = currentPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.mainText,
        author: book.author,
        quantity: item.quantity,
        price: currentPrice,
        total: itemTotal
      });
    }

    // Calculate shipping and total
    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free shipping for orders >= 500k VND
    const tax = 0; // No tax for now
    const discount = 0; // No discount for now
    const totalAmount = subtotal + shippingFee + tax - discount;

    // Create order
    const order = await Order.create({
      user: req.user?.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
      discount,
      totalAmount,
      notes
    });

    // Update book stock
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(
        (item.book as any)._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate order for response
    await order.populate('items.book', 'mainText author thumbnail');

    ResponseHandler.created(res, 'Order created successfully', order);
  });

  // Frontend-compatible create order method
  static createFrontendOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    const { name, address, phone, totalPrice, detail } = req.body;

    // Validate and prepare order items
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of detail) {
      // Find the book by ID
      const book = await Book.findById(item._id);
      if (!book || !book.isActive) {
        return ResponseHandler.badRequest(res, `Book "${item.bookName || 'Unknown'}" is no longer available`);
      }

      if (book.quantity < item.quantity) {
        return ResponseHandler.badRequest(res, `Insufficient stock for "${book.mainText}". Only ${book.quantity} available`);
      }

      const itemTotal = book.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.mainText,
        author: book.author,
        quantity: item.quantity,
        price: book.price,
        total: itemTotal
      });
    }

    // Validate total price
    if (Math.abs(calculatedTotal - totalPrice) > 1) {
      return ResponseHandler.badRequest(res, 'Total price mismatch');
    }

    // Split name properly, ensuring lastName is never empty
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    // Generate order number first
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create order with simplified structure
    const order = await Order.create({
      user: req.user?.userId,
      orderNumber: orderNumber,
      items: orderItems,
      shippingAddress: {
        firstName: firstName,
        lastName: lastName,
        email: req.user?.email || '',
        phone: phone,
        street: address,
        city: 'Ho Chi Minh City', // Default
        state: 'Ho Chi Minh', // Default
        zipCode: '700000', // Default
        country: 'Vietnam'
      },
      paymentMethod: 'cash', // Default to cash on delivery
      subtotal: calculatedTotal,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      totalAmount: calculatedTotal,
      orderStatus: 'pending'
    });

    // Update book stock and sold count
    for (const item of detail) {
      await Book.findByIdAndUpdate(
        item._id,
        { 
          $inc: { 
            quantity: -item.quantity,
            sold: item.quantity 
          } 
        }
      );
    }

    // Populate order for response
    await order.populate('items.book', 'mainText author thumbnail');

    ResponseHandler.created(res, 'Order created successfully', {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    });
  });

  // Get user's orders
  static getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { current = 1, pageSize = 10, status } = req.query;
    
    const page = parseInt(current as string);
    const limit = parseInt(pageSize as string);
    const skip = (page - 1) * limit;

    const filter: any = { user: req.user?.userId };
    if (status) {
      filter.orderStatus = status;
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('items.book', 'mainText author thumbnail price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    // Format response to match frontend expectations
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber || order._id,
      totalPrice: order.totalAmount,
      orderStatus: order.orderStatus,
      detail: order.items.map(item => ({
        bookName: item.title,
        quantity: item.quantity,
        _id: item.book,
        price: item.price
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    const response = {
      meta: {
        current: page,
        pageSize: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      result: formattedOrders
    };

    ResponseHandler.success(res, 'Orders retrieved successfully', response);
  });

  // Get order by ID
  static getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user?.userId
    }).populate('items.book', 'mainText author thumbnail');

    if (!order) {
      return ResponseHandler.notFound(res, 'Order not found');
    }

    ResponseHandler.success(res, 'Order retrieved successfully', order);
  });

  // Cancel order (only if pending or confirmed)
  static cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user?.userId
    });

    if (!order) {
      return ResponseHandler.notFound(res, 'Order not found');
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return ResponseHandler.badRequest(res, 'Order cannot be cancelled');
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();

    // Restore book stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { quantity: item.quantity } }
      );
    }

    ResponseHandler.success(res, 'Order cancelled successfully', order);
  });

  // Admin: Get all orders
  static getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { current = 1, pageSize = 10, sort } = req.query;

    const page = parseInt(current as string);
    const limit = parseInt(pageSize as string);
    const skip = (page - 1) * limit;

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

    const [orders, totalCount] = await Promise.all([
      Order.find({})
        .populate('user', 'fullName email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Order.countDocuments({})
    ]);

    // Format response to match frontend expectations
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      address: order.shippingAddress.street,
      phone: order.shippingAddress.phone,
      totalPrice: order.totalAmount,
      orderStatus: order.orderStatus,
      detail: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user
    }));

    const response = {
      meta: {
        current: page,
        pageSize: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      result: formattedOrders
    };

    ResponseHandler.success(res, 'All orders retrieved successfully', response);
  });

  // Admin: Update order status
  static updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return ResponseHandler.badRequest(res, 'Invalid order status');
    }

    const updateData: any = { orderStatus };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }
    
    if (orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'fullName email');

    if (!order) {
      return ResponseHandler.notFound(res, 'Order not found');
    }

    ResponseHandler.success(res, 'Order status updated successfully', order);
  });

  // Admin: Get order statistics
  static getOrderStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $match: { orderStatus: { $in: ['delivered'] } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    ResponseHandler.success(res, 'Order statistics retrieved successfully', {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats
    });
  });
}
