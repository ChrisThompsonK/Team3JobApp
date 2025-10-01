import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Request logging middleware with request ID
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const requestId = randomUUID();

  // Add request ID to request object for tracking
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  console.log(`[${timestamp}] [${requestId}] ${method} ${url} - ${userAgent}`);

  next();
};
