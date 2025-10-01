import type { Request, Response } from 'express';
import { AppService } from '../services/index.js';

/**
 * Home Controller
 * Handles presentation logic for home-related routes
 */
export const HomeController = {
  /**
   * Render the home page
   */
  index(req: Request, res: Response): void {
    try {
      const userName = typeof req.query['user'] === 'string' ? req.query['user'] : 'Developer';
      const appInfo = AppService.getAppInfo(userName);

      res.render('index', appInfo);
    } catch (error) {
      console.error('Error in HomeController.index:', error);
      res.status(500).render('error', {
        message: 'Internal Server Error',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  },
} as const;

/**
 * Health Controller
 * Handles presentation logic for health check routes
 */
export const HealthController = {
  /**
   * Render the health check page
   */
  index(_req: Request, res: Response): void {
    try {
      const healthStatus = AppService.getHealthStatus();

      res.render('health', healthStatus);
    } catch (error) {
      console.error('Error in HealthController.index:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to get health status',
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Return health status as JSON (API endpoint)
   */
  api(_req: Request, res: Response): void {
    try {
      const healthStatus = AppService.getHealthStatus();
      const systemInfo = AppService.getSystemInfo();

      res.json({
        ...healthStatus,
        system: systemInfo,
      });
    } catch (error) {
      console.error('Error in HealthController.api:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to get health status',
        timestamp: new Date().toISOString(),
      });
    }
  },
} as const;
