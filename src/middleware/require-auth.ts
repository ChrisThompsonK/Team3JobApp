import type { NextFunction, Request, Response } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    // User is not authenticated, redirect to login
    if (req.method === 'GET') {
      // For GET requests, redirect to login with return URL
      const returnUrl = encodeURIComponent(req.originalUrl);
      res.redirect(`/auth/login?returnUrl=${returnUrl}`);
      return;
    } else {
      // For API requests, return 401
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
  }

  // User is authenticated, continue
  next();
}
