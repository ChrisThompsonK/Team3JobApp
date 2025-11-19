import { config } from '../config/index.js';
import type { AuthUser, LoginCredentials, RegisterData } from '../models/user.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './token-service.js';

export class AuthService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = config.api.baseUrl;
  }

  async register(registerData: RegisterData): Promise<AuthUser> {
    const { email, password, confirmPassword } = registerData;

    // Sanitize input
    const sanitizedEmail = email?.trim().toLowerCase();

    // Basic input validation
    if (!sanitizedEmail || !password || !confirmPassword) {
      throw new Error('All fields are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Please enter a valid email address');
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    const passwordValidation = await this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    try {
      const response = await fetch(`${this.backendUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = credentials;

    try {
      const response = await fetch(`${this.backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user is active
      if (!data.user.isActive) {
        throw new Error('Account is disabled');
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };

      // Generate tokens locally (frontend still manages tokens)
      const accessToken = signAccessToken(authUser);
      const refreshToken = signRefreshToken(authUser);

      return {
        user: authUser,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists on backend
      try {
        const response = await fetch(`${this.backendUrl}/auth/user/${payload.sub}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('User not found');
        }

        const data = await response.json();
        if (!data.user.isActive) {
          throw new Error('User not found or inactive');
        }
      } catch (_error) {
        throw new Error('User not found or inactive');
      }

      const authUser: AuthUser = {
        id: payload.sub,
        email: payload.sub.split(':')[1] || 'unknown@example.com',
        role: 'user',
      };

      // Generate new access token
      const newAccessToken = signAccessToken(authUser);

      // Optionally rotate refresh token
      const newRefreshToken = signRefreshToken(authUser);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (_error) {
      throw new Error('Invalid refresh token');
    }
  }

  async validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < 9) {
      errors.push('Password must be more than 8 characters long');
    }

    // Check maximum length to prevent DoS attacks
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async changePassword(
    _userId: string,
    _currentPassword: string,
    _newPassword: string
  ): Promise<void> {
    // TODO: Implement backend endpoint for password change
    throw new Error('Password change not yet implemented');
  }
}

export const authService = new AuthService();
