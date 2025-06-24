import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { ResponseHandler } from '../utils';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  console.error('Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error as any).map((val: any) => val.message).join(', ');
    return ResponseHandler.validationError(res, 'Validation Error', message);
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    return ResponseHandler.conflict(res, `${field} already exists`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return ResponseHandler.badRequest(res, 'Invalid ID format');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }

  // Express validator errors
  if (Array.isArray(error.errors)) {
    const validationErrors = error.errors.map((err: ValidationError) => err.msg);
    return ResponseHandler.validationError(res, 'Validation failed', validationErrors);
  }

  // Custom errors with status code
  if (error.statusCode) {
    return ResponseHandler.error(res, error.message, error.statusCode);
  }

  // Default server error
  return ResponseHandler.error(res, 'Internal Server Error', 500);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
