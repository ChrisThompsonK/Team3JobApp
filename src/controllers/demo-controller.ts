import type { NextFunction, Request, Response } from 'express';
import { createHttpError } from '../models/errors.js';

/**
 * Demo Controller
 * Demonstrates different error handling scenarios
 */
export const DemoController = {
  /**
   * Demonstrate 400 Bad Request error
   */
  badRequest(_req: Request, _res: Response, next: NextFunction): void {
    const error = createHttpError.badRequest('Invalid request parameters provided');
    next(error);
  },

  /**
   * Demonstrate 401 Unauthorized error
   */
  unauthorized(_req: Request, _res: Response, next: NextFunction): void {
    const error = createHttpError.unauthorized('Authentication required to access this resource');
    next(error);
  },

  /**
   * Demonstrate 403 Forbidden error
   */
  forbidden(_req: Request, _res: Response, next: NextFunction): void {
    const error = createHttpError.forbidden('You do not have permission to access this resource');
    next(error);
  },

  /**
   * Demonstrate 500 Internal Server Error
   */
  serverError(_req: Request, _res: Response, next: NextFunction): void {
    // Simulate an unexpected error
    const error = new Error('Something went wrong in the server');
    next(error);
  },

  /**
   * Demonstrate 503 Service Unavailable
   */
  serviceUnavailable(_req: Request, _res: Response, next: NextFunction): void {
    const error = createHttpError.serviceUnavailable(
      'The service is temporarily down for maintenance',
    );
    next(error);
  },
} as const;
