import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user-repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './token-service.js';
import type { LoginCredentials, RegisterData, AuthUser, CreateUserData } from '../models/user.js';

const SALT_ROUNDS = Number.parseInt(process.env['PASSWORD_HASH_ROUNDS'] || '12');

export class AuthService {
  async register(registerData: RegisterData): Promise<AuthUser> {
    const { email, password, confirmPassword } = registerData;

    // Validate input
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userData: CreateUserData = {
      email: email.toLowerCase(),
      passwordHash,
      role: 'user', // Default role
      isActive: true
    };

    const newUser = await userRepository.create(userData);

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Generate tokens
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    return {
      user: authUser,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      
      // Find user to ensure they still exist and are active
      const user = await userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      // Generate new access token
      const newAccessToken = signAccessToken(authUser);

      // Optionally rotate refresh token (recommended for security)
      const newRefreshToken = signRefreshToken(authUser);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Find user
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const validation = await this.validatePassword(newPassword);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Hash new password
    // const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password in database
    // Note: You'll need to add this method to UserRepository
    // await userRepository.updatePassword(userId, passwordHash);

    // TODO: Implement password update functionality
    throw new Error('Password change not yet implemented');
  }
}

export const authService = new AuthService();