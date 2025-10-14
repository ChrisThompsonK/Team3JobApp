import type { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // First check if user is authenticated
  if (!req.user) {
    if (req.method === 'GET') {
      const returnUrl = encodeURIComponent(req.originalUrl);
      res.redirect(`/auth/login?returnUrl=${returnUrl}`);
      return;
    } else {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    if (req.method === 'GET') {
      // For web requests, render an error page
      res.status(403).render('error', { 
        message: 'Access Forbidden', 
        details: 'You do not have permission to access this resource. Admin privileges required.' 
      });
      return;
    } else {
      // For API requests, return 403
      res.status(403).json({ error: 'Admin privileges required' });
      return;
    }
  }

  // User is authenticated and has admin role, continue
  next();
}