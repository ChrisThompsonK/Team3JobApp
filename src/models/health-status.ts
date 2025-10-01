/**
 * Health Status Model
 * Represents the health check information structure
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
}
