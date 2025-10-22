import { describe, expect, it } from 'vitest';
import { AuthService } from './auth-service.js';

describe('AuthService Password Validation', () => {
  const authService = new AuthService();

  describe('validatePassword', () => {
    it('should reject passwords with 8 or fewer characters', async () => {
      const shortPasswords = ['12345678', 'Test123!', 'A1b!', ''];

      for (const password of shortPasswords) {
        const result = await authService.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be more than 8 characters long');
      }
    });

    it('should reject passwords without uppercase letters', async () => {
      const password = 'lowercase123!';
      const result = await authService.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', async () => {
      const password = 'UPPERCASE123!';
      const result = await authService.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without special characters', async () => {
      const password = 'NoSpecialChar123';
      const result = await authService.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept valid passwords', async () => {
      const validPasswords = [
        'ValidPass123!',
        'MyStrongP@ssw0rd',
        'SecureAcct#9',
        'Complex&Pass123',
        'Test!ng@Account1',
      ];

      for (const password of validPasswords) {
        const result = await authService.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should reject passwords with weak patterns', async () => {
      const weakPasswords = [
        'Password123!', // Contains "password"
        'Qwerty123!', // Contains "qwerty"
        'Test123456!', // Contains sequential numbers
        'Aaabbbccc9!', // Repeated characters
      ];

      for (const password of weakPasswords) {
        const result = await authService.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password contains weak patterns and is not secure');
      }
    });

    it('should reject passwords that are too long', async () => {
      const longPassword = 'A'.repeat(129) + 'b1!'; // 132 characters
      const result = await authService.validatePassword(longPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be less than 128 characters long');
    });
    it('should return multiple errors for passwords with multiple issues', async () => {
      const password = 'weak'; // Short, no uppercase, no special char
      const result = await authService.validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be more than 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });
});
