import type { NextFunction, Request, Response } from 'express';
import { type ErrorResponse, HttpError, HttpStatusCode } from '../models/errors.js';

/**
 * Generic error handling middleware
 * Handles different HTTP error codes and determines appropriate response format
 */
export const errorHandler = (
  error: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId = req.requestId || 'unknown';
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const acceptHeader = req.get('Accept') || '';
  const wantsJSON =
    acceptHeader.includes('application/json') || req.originalUrl.startsWith('/api/');

  let statusCode: number;
  let message: string;
  let isOperational = true;

  // Determine if this is an HttpError or generic Error
  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else {
    // Generic error - treat as internal server error
    statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    message = isDevelopment ? error.message : 'Something went wrong';
    isOperational = false;
  }

  // Log error details with proper typing
  const errorDetails = {
    error: error.message,
    stack: isDevelopment ? error.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode,
    isOperational,
  };

  if (statusCode >= 500) {
    console.error(
      `[${new Date().toISOString()}] [${requestId}] ERROR: ${statusCode} - ${message}`,
      errorDetails,
    );
  } else {
    console.warn(
      `[${new Date().toISOString()}] [${requestId}] WARN: ${statusCode} - ${message}`,
      errorDetails,
    );
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    message: getErrorMessage(statusCode, message),
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    requestId,
  };

  // Add detailed error info in development
  if (isDevelopment) {
    errorResponse.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  // Decide response format based on request type and error code
  if (wantsJSON || statusCode >= 500) {
    // Send JSON response for API endpoints or server errors
    res.status(statusCode).json(errorResponse);
  } else {
    // Send HTML response for client errors on web pages
    try {
      res.status(statusCode).render('error', {
        ...errorResponse,
        title: getErrorTitle(statusCode),
        showDetails: isDevelopment,
      });
    } catch (renderError) {
      // Fallback to JSON if template rendering fails
      console.error('Error rendering error template:', renderError);
      res.status(statusCode).json(errorResponse);
    }
  }
};

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(statusCode: number, originalMessage: string): string {
  const errorMessages: Record<number, string> = {
    [HttpStatusCode.BAD_REQUEST]: 'The request could not be understood by the server',
    [HttpStatusCode.UNAUTHORIZED]: 'Authentication is required to access this resource',
    [HttpStatusCode.FORBIDDEN]: 'You do not have permission to access this resource',
    [HttpStatusCode.NOT_FOUND]: 'The requested resource could not be found',
    [HttpStatusCode.METHOD_NOT_ALLOWED]: 'The HTTP method is not allowed for this resource',
    [HttpStatusCode.CONFLICT]: 'The request conflicts with the current state of the resource',
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: 'The request was well-formed but contains invalid data',
    [HttpStatusCode.TOO_MANY_REQUESTS]: 'Too many requests - please try again later',
    [HttpStatusCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred on the server',
    [HttpStatusCode.BAD_GATEWAY]: 'The server received an invalid response from an upstream server',
    [HttpStatusCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable',
    [HttpStatusCode.GATEWAY_TIMEOUT]: 'The server timed out waiting for a response',
  };

  return errorMessages[statusCode] || originalMessage;
}

/**
 * Get error title for HTML error pages
 */
function getErrorTitle(statusCode: number): string {
  const errorTitles: Record<number, string> = {
    [HttpStatusCode.BAD_REQUEST]: 'Bad Request',
    [HttpStatusCode.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatusCode.FORBIDDEN]: 'Forbidden',
    [HttpStatusCode.NOT_FOUND]: 'Page Not Found',
    [HttpStatusCode.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [HttpStatusCode.CONFLICT]: 'Conflict',
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HttpStatusCode.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HttpStatusCode.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatusCode.BAD_GATEWAY]: 'Bad Gateway',
    [HttpStatusCode.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HttpStatusCode.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  };

  return errorTitles[statusCode] || 'Error';
}
