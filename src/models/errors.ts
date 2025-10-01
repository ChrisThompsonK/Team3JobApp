/**
 * HTTP Error Class
 * Represents HTTP errors with status codes and messages
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

/**
 * HTTP Status Codes enum for better type safety
 */
export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Error response interface
 */
export interface ErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  error?: string | object;
  requestId?: string;
}

/**
 * Helper functions to create common HTTP errors
 */
export const createHttpError = {
  badRequest: (message = 'Bad Request') => new HttpError(message, HttpStatusCode.BAD_REQUEST),
  unauthorized: (message = 'Unauthorized') => new HttpError(message, HttpStatusCode.UNAUTHORIZED),
  forbidden: (message = 'Forbidden') => new HttpError(message, HttpStatusCode.FORBIDDEN),
  notFound: (message = 'Not Found') => new HttpError(message, HttpStatusCode.NOT_FOUND),
  methodNotAllowed: (message = 'Method Not Allowed') =>
    new HttpError(message, HttpStatusCode.METHOD_NOT_ALLOWED),
  conflict: (message = 'Conflict') => new HttpError(message, HttpStatusCode.CONFLICT),
  unprocessableEntity: (message = 'Unprocessable Entity') =>
    new HttpError(message, HttpStatusCode.UNPROCESSABLE_ENTITY),
  tooManyRequests: (message = 'Too Many Requests') =>
    new HttpError(message, HttpStatusCode.TOO_MANY_REQUESTS),
  internalServerError: (message = 'Internal Server Error') =>
    new HttpError(message, HttpStatusCode.INTERNAL_SERVER_ERROR),
  badGateway: (message = 'Bad Gateway') => new HttpError(message, HttpStatusCode.BAD_GATEWAY),
  serviceUnavailable: (message = 'Service Unavailable') =>
    new HttpError(message, HttpStatusCode.SERVICE_UNAVAILABLE),
  gatewayTimeout: (message = 'Gateway Timeout') =>
    new HttpError(message, HttpStatusCode.GATEWAY_TIMEOUT),
};
