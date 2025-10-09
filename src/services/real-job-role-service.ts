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
   * Create a new job role in the backend database
   */
  async createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails> {
    // Fetch capabilities and bands to get IDs
    const [capabilities, bands] = await Promise.all([api.getCapabilities(), api.getBands()]);

    // Debug logging
    console.log('Fetched capabilities from backend:', capabilities);
    console.log('Fetched bands from backend:', bands);
    console.log('Looking for capability:', jobRoleData.capability);
    console.log('Looking for band:', jobRoleData.band);

    // Find the matching IDs
    const capability = capabilities.find(
      (cap) => cap.name.toLowerCase() === jobRoleData.capability.toLowerCase()
    );
    const band = bands.find((b) => b.name.toLowerCase() === jobRoleData.band.toLowerCase());

    if (!capability) {
      throw new Error(`Capability '${jobRoleData.capability}' not found`);
    }
    if (!band) {
      throw new Error(`Band '${jobRoleData.band}' not found`);
    }

    // Format closing date as YYYY-MM-DD
    const closingDateStr = jobRoleData.closingDate.toISOString().split('T')[0];
    if (!closingDateStr) {
      throw new Error('Invalid closing date');
    }

    // Create the job role with backend-expected format
    const createJobPayload: {
      roleName: string;
      location: string;
      capabilityId: number;
      bandId: number;
      closingDate: string;
      description?: string;
      responsibilities?: string;
      jobSpecUrl?: string;
      statusId?: number;
      openPositions?: number;
    } = {
      roleName: jobRoleData.name,
      location: jobRoleData.location,
      capabilityId: capability.id,
      bandId: band.id,
      closingDate: closingDateStr,
      // Default the status to 'Open'.
      // NOTE: This assumes the backend 'status' table has the 'Open' status with ID = 1.
      // If your backend uses different IDs, update this value or fetch statuses from the API.
      statusId: 1,
    };

    // Add optional fields only if they exist
    if (jobRoleData.description) {
      createJobPayload.description = jobRoleData.description;
    }
    if (jobRoleData.responsibilities) {
      createJobPayload.responsibilities = jobRoleData.responsibilities;
    }
    if (jobRoleData.jobSpecUrl) {
      createJobPayload.jobSpecUrl = jobRoleData.jobSpecUrl;
    }
    if (jobRoleData.openPositions !== undefined) {
      createJobPayload.openPositions = jobRoleData.openPositions;
    }

    const newJob = await api.createJob(createJobPayload);

    // Fetch the full details to return as JobRoleDetails
    const jobDetails = await this.getJobRoleDetailsById(newJob.id);
    if (!jobDetails) {
      throw new Error('Failed to retrieve created job role details');
    }

    return jobDetails;
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
