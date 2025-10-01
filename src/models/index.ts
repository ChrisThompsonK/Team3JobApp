/**
 * Application Information Model
 * Represents the basic application information structure
 */
export interface AppInfo {
  message: string;
  service: string;
  environment: string;
  timestamp: string;
  greeting: string;
}

/**
 * Health Status Model
 * Represents the health check information structure
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
}

/**
 * User Model
 * Represents a user in the system
 */
export interface User {
  id: string;
  name: string;
  email?: string;
}
