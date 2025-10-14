import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token-service.js';
import type { AuthUser } from '../models/user.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract access token from cookies
  const token = req.cookies?.['access_token'];
  
  if (!token) {
    // No token present, continue as anonymous user
    return next();
  }

  try {
    // Verify and decode the token
    const payload = verifyAccessToken(token);
    
    // Create user object from token payload
    const user: AuthUser = {
      id: payload.sub,
      email: '', // We'll need to fetch this from DB if needed
      role: payload.role as 'admin' | 'user'
    };

    // Attach user to request object
    req.user = user;
    
    // Also make user available to templates via res.locals
    res.locals['user'] = user;
  } catch (error) {
    // Token is invalid or expired, continue as anonymous user
    // Don't throw error, just log and continue
    console.log('Invalid access token:', error instanceof Error ? error.message : 'Unknown error');
  }

  next();
}