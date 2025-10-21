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
        'Secure#Password9',
        'Complex&Pass123',
        'Test!ng@Password1'
      ];
      
      for (const password of validPasswords) {
        const result = await authService.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
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