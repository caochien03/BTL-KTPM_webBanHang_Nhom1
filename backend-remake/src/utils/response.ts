import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = 200,
    pagination?: ApiResponse['pagination']
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(pagination && { pagination })
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(error && { error })
    };

    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string = 'Bad Request', error?: string): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Not Found'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = 'Conflict'): Response {
    return this.error(res, message, 409);
  }

  static validationError(res: Response, message: string = 'Validation Error', errors?: any): Response {
    return this.error(res, message, 422, errors);
  }

  static created<T>(res: Response, message: string = 'Created Successfully', data?: T): Response {
    return this.success(res, message, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
