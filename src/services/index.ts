import type { AppInfo, HealthStatus } from '../models/index.js';
import { AppRepository } from '../repositories/index.js';

/**
 * Application Service
 * Contains business logic for application operations
 */
export const AppService = {
  /**
   * Get application information with business logic
   */
  getAppInfo(userName = 'Developer'): AppInfo {
    // Business logic: validate user name
    const validatedUserName = userName.trim() || 'Guest';

    // Get data from repository
    return AppRepository.getAppInfo(validatedUserName);
  },

  /**
   * Get health status with business logic
   */
  getHealthStatus(): HealthStatus {
    const healthData = AppRepository.getHealthStatus();

    // Business logic: determine if system is healthy based on uptime
    const isHealthy = healthData.uptime > 0;

    return {
      ...healthData,
      status: isHealthy ? 'healthy' : 'unhealthy',
    };
  },

  /**
   * Get system information for dashboard
   */
  getSystemInfo(): {
    nodeVersion: string;
    platform: string;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
    };
  },
} as const;

/**
 * User Service
 * Contains business logic for user operations
 */
export const UserService = {
  /**
   * Validate user data
   */
  validateUserName(name: string): boolean {
    return name.trim().length > 0 && name.length <= 100;
  },

  /**
   * Format user name according to business rules
   */
  formatUserName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
  },
} as const;
