import type { HealthStatus } from "../models/health-status.js";

/**
 * Health Repository
 * Handles data access for health check information
 */
export const HealthRepository = {
	/**
	 * Get health status information
	 */
	getHealthStatus(): HealthStatus {
		return {
			status: "healthy",
			uptime: Math.round(process.uptime()),
			timestamp: new Date().toISOString(),
		};
	},
} as const;
