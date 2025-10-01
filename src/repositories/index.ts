import type { AppInfo, HealthStatus, User } from '../models/index.js';

/**
 * Generate a greeting message
 */
const generateGreeting = (name: string): string => {
  return `Hello, ${name}! Welcome to the Team 3 Job Application Frontend.`;
};

/**
 * Application Repository
 * Handles data access for application information
 */
export const AppRepository = {
  /**
   * Get application information
   */
  getAppInfo(userName: string): AppInfo {
    return {
      message: 'Hello World!',
      service: 'Team 3 Job Application Frontend',
      environment: process.env['NODE_ENV'] || 'development',
      timestamp: new Date().toISOString(),
      greeting: generateGreeting(userName),
    };
  },

  /**
   * Get health status information
   */
  getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  },
} as const;

/**
 * User Repository
 * Handles data access for user information
 * This is a placeholder for future database integration
 */
export const UserRepository = {
  /**
   * Get user by ID
   * In a real application, this would connect to a database
   */
  async getUserById(id: string): Promise<User | null> {
    // Placeholder implementation
    // In a real app, this would query a database
    if (id === 'developer') {
      return {
        id: 'developer',
        name: 'Developer',
        email: 'developer@example.com',
      };
    }
    return null;
  },

  /**
   * Get all users
   * Placeholder for database query
   */
  async getAllUsers(): Promise<User[]> {
    // Placeholder implementation
    return [
      {
        id: 'developer',
        name: 'Developer',
        email: 'developer@example.com',
      },
    ];
  },
} as const;
