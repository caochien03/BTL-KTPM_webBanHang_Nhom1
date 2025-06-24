import { Request, Response, NextFunction } from 'express';
import { JWTUtils, ResponseHandler } from '../utils';
import { User } from '../models';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHandler.unauthorized(res, 'Access token is required');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const payload = JWTUtils.verifyToken(token);
      
      // Verify user still exists and is active
      const user = await User.findById(payload.userId).select('isActive role');
      
      if (!user || !user.isActive) {
        ResponseHandler.unauthorized(res, 'User account is inactive or does not exist');
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      ResponseHandler.unauthorized(res, 'Invalid or expired token');
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    ResponseHandler.error(res, 'Authentication failed');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHandler.unauthorized(res, 'Authentication required');
      return;
    }

    // Check roles (case insensitive)
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      ResponseHandler.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = JWTUtils.verifyToken(token);
        const user = await User.findById(payload.userId).select('isActive role');
        
        if (user && user.isActive) {
          req.user = payload;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
