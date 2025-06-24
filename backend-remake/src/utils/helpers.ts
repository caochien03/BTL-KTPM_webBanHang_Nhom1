import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class JWTUtils {
  private static readonly secret = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}

export class ValidationUtils {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }
}

export class PaginationUtils {
  static getPaginationParams(page?: string, limit?: string) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    
    const validPage = pageNum > 0 ? pageNum : 1;
    const validLimit = limitNum > 0 && limitNum <= 100 ? limitNum : 10;
    
    const skip = (validPage - 1) * validLimit;
    
    return {
      page: validPage,
      limit: validLimit,
      skip
    };
  }

  static getPaginationInfo(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}

export class SlugUtils {
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

export class PriceUtils {
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  static calculateDiscount(originalPrice: number, discountPrice: number): number {
    if (discountPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  }
}
