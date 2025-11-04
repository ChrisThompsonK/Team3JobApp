/**
 * Test data generators and mock data
 */

/**
 * Generate a random email address
 */
export function generateEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate a random password
 */
export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate a random username
 */
export function generateUsername(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `user_${timestamp}_${random}`;
}

/**
 * Test user data
 */
export interface TestUser {
  email: string;
  password: string;
  username?: string;
}

/**
 * Create a test user object
 */
export function createTestUser(): TestUser {
  return {
    email: generateEmail(),
    password: generatePassword(),
    username: generateUsername(),
  };
}

/**
 * Mock job role data
 */
export interface MockJobRole {
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
}

/**
 * Sample job roles for testing
 */
export const mockJobRoles: MockJobRole[] = [
  {
    title: 'Software Engineer',
    description: 'Full-stack development role',
    company: 'Tech Corp',
    location: 'Remote',
    salary: '$80,000 - $100,000',
  },
  {
    title: 'Frontend Developer',
    description: 'React and TypeScript specialist',
    company: 'Web Solutions Inc',
    location: 'New York, NY',
    salary: '$70,000 - $90,000',
  },
  {
    title: 'Backend Developer',
    description: 'Node.js and PostgreSQL',
    company: 'Data Systems LLC',
    location: 'San Francisco, CA',
    salary: '$90,000 - $120,000',
  },
];

/**
 * Environment configuration
 */
export const testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  defaultUser: {
    email: 'test@example.com',
    password: 'password123',
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
  },
};
