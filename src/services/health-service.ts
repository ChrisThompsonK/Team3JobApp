import type { HealthStatus } from '../models/health-status.js';
import { HealthRepository } from '../repositories/health-repository.js';

/**
 * Health Service
 * Contains business logic for health check operations
 */
export const HealthService = {
  /**
   * Get health status with business logic
   */
  getHealthStatus(): HealthStatus {
    const healthData = HealthRepository.getHealthStatus();

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
