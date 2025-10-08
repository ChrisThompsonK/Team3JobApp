import type { JobRole, JobRoleDetails } from '../models/job-roles';
import { api } from './api';
import type {
  CreateJobRoleRequest,
  JobRoleService,
  UpdateJobRoleRequest,
} from './job-role-service';

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
   * Create a new job role (not yet implemented in backend)
   */
  async createJobRole(_jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails> {
    throw new Error('Create job role not yet implemented for real API');
  }

  /**
   * Update a job role in the backend database
   */
  async updateJobRole(id: string, updates: UpdateJobRoleRequest): Promise<JobRoleDetails | null> {
    // Transform the frontend format to backend format
    const backendUpdates: Record<string, string | number> = {};

    if (updates.name !== undefined) {
      backendUpdates['roleName'] = updates.name;
    }
    if (updates.location !== undefined) {
      backendUpdates['location'] = updates.location;
    }
    if (updates.closingDate !== undefined) {
      // Convert Date to ISO string for the API
      const dateStr = updates.closingDate.toISOString().split('T')[0];
      if (dateStr !== undefined) {
        backendUpdates['closingDate'] = dateStr;
      }
    }

    // Note: capability and band are currently strings in UpdateJobRoleRequest
    // but the backend expects IDs. You may need to add mapping logic here
    // or update the form to pass IDs instead of names.

    const result = await api.updateJob(
      id,
      backendUpdates as {
        roleName?: string;
        location?: string;
        capabilityId?: number;
        bandId?: number;
        closingDate?: string;
      }
    );
    return result as JobRoleDetails | null;
  }

  /**
   * Delete a job role (not yet implemented in backend)
   */
  async deleteJobRole(_id: string): Promise<boolean> {
    throw new Error('Delete job role not yet implemented for real API');
  }

  /**
   * Generate CSV report (not yet implemented in backend)
   */
  async generateJobRolesReportCsv(): Promise<string> {
    throw new Error('CSV report generation not yet implemented for real API');
  }
}
