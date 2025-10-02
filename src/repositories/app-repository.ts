import type { AppInfo } from "../models/app-info.js";

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
			message: "Hello World!",
			service: "Team 3 Job Application Frontend",
			environment: process.env["NODE_ENV"] || "development",
			timestamp: new Date().toISOString(),
			greeting: generateGreeting(userName),
		};
	},
} as const;
