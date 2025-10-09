import type { JobRole, JobRoleDetails } from '../models/job-roles.js';
import { api } from './api.js';
import type {
  CreateJobRoleRequest,
  JobRoleService,
  UpdateJobRoleRequest,
} from './job-role-service.js';

/**
 * Real implementation of JobRoleService that connects to the backend API
 */
export class RealJobRoleService implements JobRoleService {
  /**
   * Get all job roles from the backend database
   */
  async getAllJobRoles(): Promise<JobRole[]> {
    return api.getJobs();
  }

  /**
   * Get a single job role by ID from the backend database
   */
  async getJobRoleById(id: string | number): Promise<JobRole | null> {
    try {
      return await api.getJobById(id);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get detailed job role information by ID from the backend database
   */
  async getJobRoleDetailsById(id: string | number): Promise<JobRoleDetails | null> {
    try {
      return await api.getJobById(id);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Create a new job role in the backend database
   */
  async createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails> {
    // Create job role with standardized format - no transformation needed
    const newJob = await api.createJob(jobRoleData);
    return newJob;
  }

  /**
   * Update a job role in the backend database
   */
  async updateJobRole(
    id: string | number,
    updates: UpdateJobRoleRequest
  ): Promise<JobRoleDetails | null> {
    // No transformation needed - using standardized format
    return await api.updateJob(id, updates);
  }

  /**
   * Delete a job role (not yet implemented in backend)
   */
  async deleteJobRole(_id: string | number): Promise<boolean> {
    throw new Error('Delete job role not yet implemented for real API');
  }

  /**
   * Generate CSV report from backend database data
   */
  async generateJobRolesReportCsv(): Promise<string> {
    // Get all job roles from the backend database
    const allJobRoles = await this.getAllJobRoles();

    // Create CSV headers
    const headers = ['ID', 'Job Name', 'Location', 'Capability', 'Band', 'Closing Date'];

    // Create CSV rows from real backend data - using standardized property names
    const rows = allJobRoles.map((job) => [
      job.id,
      `"${job.name.replace(/"/g, '""')}"`, // Escape quotes in job names
      job.location,
      job.capabilityName || 'N/A',
      job.bandName || 'N/A',
      job.closingDate, // Already in YYYY-MM-DD format
    ]);

    // Combine headers and rows into CSV format
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csvContent;
  }
}
