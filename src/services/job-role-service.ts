import type {
  CreateJobRoleRequest as BackendCreateJobRoleRequest,
  JobRole,
  JobRoleDetails,
  UpdateJobRoleRequest,
} from '../models/job-roles.js';
import { api } from './api.js';

export interface CreateJobRoleRequest {
  name: string;
  location: string;
  capabilityId: number;
  bandId: number;
  statusId?: number; // Optional, defaults to "Open"
  closingDate: Date;
  description?: string | undefined;
  responsibilities?: string | undefined;
  jobSpecUrl?: string | undefined;
  openPositions?: number | undefined;
}

/**
 * Service for managing job roles via the backend API
 */
export class JobRoleService {
  /**
   * Get all job roles from the backend database
   */
  async getAllJobRoles(limit?: number, offset?: number): Promise<JobRole[]> {
    return api.getJobs(undefined, undefined, limit, offset);
  }

  /**
   * Get a single job role by ID from the backend database
   */
  async getJobRoleById(id: string): Promise<JobRole | null> {
    return api.getJobById(id);
  }

  /**
   * Get detailed job role information by ID from the backend database
   */
  async getJobRoleDetailsById(id: string): Promise<JobRoleDetails | null> {
    // For now, the API returns the same data for both
    // If the backend has a different endpoint for details, update this
    const jobRole = await api.getJobById(id);
    return jobRole as JobRoleDetails | null;
  }

  /**
   * Create a new job role using the backend API
   */
  async createJobRole(jobRoleData: CreateJobRoleRequest, accessToken?: string): Promise<JobRoleDetails> {
    // Transform the frontend format to backend format
    const closingDateStr = jobRoleData.closingDate.toISOString().split('T')[0];
    if (!closingDateStr) {
      throw new Error('Invalid closing date');
    }

    const backendJobData: BackendCreateJobRoleRequest = {
      name: jobRoleData.name,
      location: jobRoleData.location,
      capabilityId: jobRoleData.capabilityId,
      bandId: jobRoleData.bandId,
      closingDate: closingDateStr, // Format as YYYY-MM-DD
      ...(jobRoleData.statusId && { statusId: jobRoleData.statusId }), // Add statusId if provided
      ...(jobRoleData.description && { description: jobRoleData.description }),
      ...(jobRoleData.responsibilities && { responsibilities: jobRoleData.responsibilities }),
      ...(jobRoleData.jobSpecUrl && { jobSpecUrl: jobRoleData.jobSpecUrl }),
      ...(jobRoleData.openPositions && { openPositions: jobRoleData.openPositions }),
    };

    return api.createJob(backendJobData, accessToken);
  }

  /**
   * Update a job role in the backend database
   */
  async updateJobRole(id: string, updates: UpdateJobRoleRequest, accessToken?: string): Promise<JobRoleDetails | null> {
    // The updates already match the backend format, no transformation needed
    const result = await api.updateJob(id, updates, accessToken);
    return result as JobRoleDetails | null;
  }

  /**
   * Delete a job role from the backend database
   */
  async deleteJobRole(id: string, accessToken?: string): Promise<boolean> {
    return api.deleteJob(id, accessToken);
  }

  /**
   * Generate CSV report from backend database data
   */
  async generateJobRolesReportCsv(): Promise<string> {
    // Get all job roles from the backend database
    const allJobRoles = await this.getAllJobRoles();

    // Create CSV headers
    const headers = ['ID', 'Job Name', 'Location', 'Capability', 'Band', 'Closing Date'];

    // Create CSV rows from real backend data
    const rows = allJobRoles.map((job) => [
      job.id,
      `"${job.name.replace(/"/g, '""')}"`, // Escape quotes in job names
      job.location,
      job.capability,
      job.band,
      job.closingDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    ]);

    // Combine headers and rows into CSV format
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csvContent;
  }
}

// Export a singleton instance for easy use
export const jobRoleService = new JobRoleService();
