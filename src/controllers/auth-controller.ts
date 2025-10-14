import type { Request, Response } from 'express';
import type { LoginCredentials, RegisterData } from '../models/user.js';
import { authService } from '../services/auth-service.js';
import { clearAuthCookies, setAuthCookies } from '../services/token-service.js';

export class AuthController {
  // GET /auth/login - Show login form
  showLogin = (req: Request, res: Response): void => {
    const returnUrl = (req.query['returnUrl'] as string) || '/';
    const error = req.query['error'] as string;

    res.render('auth/login', {
      returnUrl,
      error,
      title: 'Login',
    });
  };

  // POST /auth/login - Process login
  processLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email,
        password,
        returnUrl = '/',
      } = req.body as LoginCredentials & { returnUrl?: string };

      // Validate input
      if (!email || !password) {
        res.redirect(
          `/auth/login?error=${encodeURIComponent('Email and password are required')}&returnUrl=${encodeURIComponent(returnUrl)}`
        );
        return;
      }

      // Attempt login
      const { tokens } = await authService.login({ email, password });

      // Set authentication cookies
      setAuthCookies(res, tokens);

      // Redirect to return URL or home
      res.redirect(returnUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const returnUrl = req.body.returnUrl || '/';
      res.redirect(
        `/auth/login?error=${encodeURIComponent(message)}&returnUrl=${encodeURIComponent(returnUrl)}`
      );
    }
  };

  // GET /auth/register - Show registration form
  showRegister = (req: Request, res: Response): void => {
    const error = req.query['error'] as string;

    res.render('auth/register', {
      error,
      title: 'Register',
    });
  };

  // POST /auth/register - Process registration
  processRegister = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, confirmPassword } = req.body as RegisterData;

      // Validate input
      if (!email || !password || !confirmPassword) {
        res.redirect(`/auth/register?error=${encodeURIComponent('All fields are required')}`);
        return;
      }

      // Attempt registration
      await authService.register({ email, password, confirmPassword });

      // Auto-login after successful registration
      const { tokens } = await authService.login({ email, password });
      setAuthCookies(res, tokens);

      // Redirect to home page
      res.redirect('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.redirect(`/auth/register?error=${encodeURIComponent(message)}`);
    }
  };

  // POST /auth/logout - Process logout
  processLogout = (_req: Request, res: Response): void => {
    // Clear authentication cookies
    clearAuthCookies(res);

    // Redirect to home page
    res.redirect('/');
  };

  // POST /auth/refresh - Refresh access token (API endpoint)
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.['refresh_token'];

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not provided' });
        return;
      }

      const result = await authService.refresh(refreshToken);

      // Set new tokens as cookies
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || refreshToken,
      });

      res.json({
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
      });
    } catch (_error) {
      clearAuthCookies(res);
      res.status(401).json({
        error: 'Invalid refresh token',
      });
    }
  };

  // GET /auth/profile - Show user profile (protected route)
  showProfile = (req: Request, res: Response): void => {
    if (!req.user) {
      res.redirect('/auth/login');
      return;
    }

    res.render('auth/profile', {
      user: req.user,
      title: 'Profile',
    });
  };
}

export const authController = new AuthController();
