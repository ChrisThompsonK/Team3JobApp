import type { NextFunction, Request, Response } from 'express';
import type { AuthUser } from '../models/user.js';
import { userRepository } from '../repositories/user-repository.js';
import { verifyAccessToken } from '../services/token-service.js';

// Extend Request interface to include user and token
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      accessToken?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Extract access token from cookies
  const token = req.cookies?.['access_token'];

  if (!token) {
    // No token present, continue as anonymous user
    next();
    return;
  }
  try {
    // Verify and decode the token
    const payload = verifyAccessToken(token);

    // Try to fetch full user from DB so we have email and latest role
    const dbUser = await userRepository.findById(payload.sub);

    // Create user object
    const user: AuthUser = dbUser
      ? {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
        }
      : {
          id: payload.sub,
          email: '',
          role: payload.role as 'admin' | 'user',
        };

    // Attach user and token to request object
    req.user = user;
    req.accessToken = token;

    // Also make user available to templates via res.locals
    res.locals['user'] = user;
  } catch (error) {
    // Token is invalid or expired, continue as anonymous user
    // Don't throw error, just log and continue
    console.log('Invalid access token:', error instanceof Error ? error.message : 'Unknown error');
  }

  next();
}
