import type { NextFunction, Request, Response } from "express";
import { HealthService } from "../services/health-service.js";

/**
 * Health Controller
 * Handles presentation logic for health check routes
 */
export const HealthController = {
	/**
	 * Render the health check page
	 * Demonstrates error handling - errors are now handled by middleware
	 */
	index(_req: Request, res: Response, next: NextFunction): void {
		try {
			const healthStatus = HealthService.getHealthStatus();
			res.render("health", healthStatus);
		} catch (error) {
			// Pass error to error handling middleware
			next(error);
		}
	},

	/**
	 * Return health status as JSON (API endpoint)
	 * Demonstrates error handling - errors are now handled by middleware
	 */
	api(_req: Request, res: Response, next: NextFunction): void {
		try {
			const healthStatus = HealthService.getHealthStatus();
			const systemInfo = HealthService.getSystemInfo();

			res.json({
				...healthStatus,
				system: systemInfo,
			});
		} catch (error) {
			// Pass error to error handling middleware
			next(error);
		}
	},
} as const;
