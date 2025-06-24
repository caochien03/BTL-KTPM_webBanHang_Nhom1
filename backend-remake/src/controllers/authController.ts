import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { JWTUtils, ResponseHandler } from '../utils';
import { asyncHandler } from '../middleware/error';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Validation rules for frontend compatibility
export const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Valid phone number is required')
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    const { fullName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.conflict(res, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phone
    });

    // Generate JWT token
    const token = JWTUtils.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    ResponseHandler.created(res, 'User registered successfully', {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ResponseHandler.unauthorized(res, 'Email hoặc mật khẩu không đúng');
    }

    // Check if user is active
    if (!user.isActive) {
      return ResponseHandler.unauthorized(res, 'Tài khoản đã bị vô hiệu hóa');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return ResponseHandler.unauthorized(res, 'Email hoặc mật khẩu không đúng');
    }

    // Generate JWT token
    const token = JWTUtils.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    ResponseHandler.success(res, 'Đăng nhập thành công', {
      access_token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  });

  // Logout user
  static logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // For stateless JWT, we just return success
    // In production, you might want to blacklist the token
    ResponseHandler.success(res, 'Logout successful');
  });

  // Get current user profile (for /api/v1/auth/account)
  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }

    ResponseHandler.success(res, 'Account retrieved successfully', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  });

  // Update user profile
  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fullName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        fullName,
        phone,
        address
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }

    ResponseHandler.success(res, 'Profile updated successfully', user);
  });

  // Change password (frontend compatible)
  static changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, oldpass, newpass } = req.body; // frontend sends these field names

    if (!oldpass || !newpass) {
      return ResponseHandler.badRequest(res, 'Old password and new password are required');
    }

    if (newpass.length < 6) {
      return ResponseHandler.badRequest(res, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user?.userId).select('+password');
    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(oldpass);
    if (!isCurrentPasswordValid) {
      return ResponseHandler.unauthorized(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newpass;
    await user.save();

    ResponseHandler.success(res, 'Password changed successfully');
  });

  // Verify token (for frontend validation)
  static verifyToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    ResponseHandler.success(res, 'Token is valid', {
      user: {
        id: req.user?.userId,
        email: req.user?.email,
        role: req.user?.role
      }
    });
  });

  // Refresh token (for frontend compatibility)
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // For JWT, we don't use refresh tokens typically
    // This endpoint exists for frontend compatibility
    // Frontend should handle token expiration and redirect to login
    return ResponseHandler.unauthorized(res, 'Token expired, please login again');
  });

  // Get all users (admin only)
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, sort, fullName, email, phone } = req.query;
    const page = parseInt(current as string);
    const limit = parseInt(pageSize as string);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (fullName) {
      filter.fullName = { $regex: fullName, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: 'i' };
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

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort(sortObj),
      User.countDocuments(filter)
    ]);

    ResponseHandler.success(res, 'Users retrieved successfully', {
      meta: {
        current: page,
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total
      },
      result: users.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  });

  // Create user (admin only)
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return ResponseHandler.badRequest(res, 'Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.conflict(res, 'Email đã tồn tại trong hệ thống');
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phone
    });

    ResponseHandler.created(res, 'Tạo mới user thành công', {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  });

  // Bulk create users (admin only)
  static bulkCreateUsers = asyncHandler(async (req: Request, res: Response) => {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return ResponseHandler.badRequest(res, 'Users array is required');
    }

    const createdUsers = [];
    const errors = [];

    for (const userData of users) {
      try {
        const { fullName, email, password, phone } = userData;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          errors.push({ email, error: 'User already exists' });
          continue;
        }

        const user = await User.create({
          fullName,
          email,
          password,
          phone
        });

        createdUsers.push({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        });
      } catch (error) {
        errors.push({ email: userData.email, error: (error as Error).message });
      }
    }

    ResponseHandler.success(res, 'Bulk user creation completed', {
      countSuccess: createdUsers.length,
      countError: errors.length,
      detail: {
        created: createdUsers,
        errors: errors
      }
    });
  });

  // Update user (admin only or self)
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { _id, fullName, phone, avatar } = req.body;

    if (!_id) {
      return ResponseHandler.badRequest(res, 'User ID is required');
    }

    // Update data - only update fields that are provided
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(_id, updateData, { 
      new: true, 
      runValidators: true 
    }).select('-password');

    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }

    ResponseHandler.success(res, 'Cập nhật user thành công', {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role
    });
  });

  // Delete user (admin only)
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }

    ResponseHandler.success(res, 'Xóa user thành công');
  });

  // Bulk delete users (admin only)
  static bulkDeleteUsers = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return ResponseHandler.badRequest(res, 'Danh sách ID không hợp lệ');
    }

    const result = await User.deleteMany({ _id: { $in: ids } });
    
    ResponseHandler.success(res, `Đã xóa ${result.deletedCount} user thành công`, {
      deletedCount: result.deletedCount
    });
  });
}

export default AuthController;
