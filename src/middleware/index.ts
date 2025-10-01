import type { NextFunction, Request, Response } from 'express';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    next(error);
    return;
  }

  const isDevelopment = process.env['NODE_ENV'] === 'development';

  res.status(500).json({
    message: 'Internal Server Error',
    error: isDevelopment ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Not found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
};
