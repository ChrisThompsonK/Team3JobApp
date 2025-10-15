// frontend/src/services/api.ts
import axios from 'axios';
import type {
  CreateJobRoleRequest,
  JobRole,
  JobRoleDetails,
  Status,
  UpdateJobRoleRequest,
} from '../models/job-roles.js';

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend API response type (now includes names from joined tables)
// Can have either 'id' or 'jobRoleId' and either 'name' or 'roleName'
interface BackendJobRole {
  id?: number;
  jobRoleId?: number;
  name?: string;
  roleName?: string;
  location: string;
  capabilityName: string;
  bandName: string;
  statusName: string; // Changed from status to statusName
  closingDate: string;
  capabilityId?: number;
  bandId?: number;
  statusId?: number; // Added statusId
}

// Backend API response type for job details (includes all fields)
interface BackendJobRoleDetails extends BackendJobRole {
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  openPositions?: number;
}

// Transform backend response to frontend format
function transformJobRole(backendJob: BackendJobRole): JobRole {
  const id = backendJob.id || backendJob.jobRoleId;
  const name = backendJob.name || backendJob.roleName;

  if (!id) {
    throw new Error('Invalid job role data: missing id');
  }

  return {
    id: id.toString(),
    name: name || 'Unknown Role',
    location: backendJob.location,
    capability: backendJob.capabilityName,
    band: backendJob.bandName,
    status: backendJob.statusName || 'Open', // Use statusName from backend
    closingDate: new Date(backendJob.closingDate),
  };
}

// Transform backend job details response to frontend format
function transformJobRoleDetails(backendJob: BackendJobRoleDetails): JobRoleDetails {
  const id = backendJob.id || backendJob.jobRoleId;
  const name = backendJob.name || backendJob.roleName;

  // Validate required fields
  if (!backendJob || !id) {
    throw new Error('Invalid job role data: missing id');
  }

  const baseJob: JobRole = {
    id: id.toString(),
    name: name || 'Unknown Role',
    location: backendJob.location || 'Unknown Location',
    capability: backendJob.capabilityName || 'Unknown Capability',
    band: backendJob.bandName || 'Unknown Band',
    status: backendJob.statusName || 'Open', // Use statusName from backend
    closingDate: backendJob.closingDate ? new Date(backendJob.closingDate) : new Date(),
  };

  const details: JobRoleDetails = { ...baseJob };

  if (backendJob.description) details.description = backendJob.description;
  if (backendJob.responsibilities) details.responsibilities = backendJob.responsibilities;
  if (backendJob.jobSpecUrl) details.jobSpecUrl = backendJob.jobSpecUrl;
  if (backendJob.openPositions !== undefined) details.openPositions = backendJob.openPositions;

  return details;
}

export const api = {
  // Root endpoint
  getRoot: async (): Promise<unknown> => {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Health check endpoint
  getHealth: async (): Promise<unknown> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Greeting endpoint
  getGreeting: async (): Promise<unknown> => {
    const response = await apiClient.get('/greeting');
    return response.data;
  },

  // Jobs endpoint - returns array of job roles
  // Note: Filtering is done on the frontend until backend supports query parameters
  getJobs: async (): Promise<JobRole[]> => {
    const response = await apiClient.get<BackendJobRole[]>('/jobs');
    // Transform backend format to frontend format
    return response.data.map(transformJobRole);
  },

  // Get single job role by ID with full details
  getJobById: async (id: string): Promise<JobRoleDetails> => {
    try {
      const response = await apiClient.get<BackendJobRoleDetails[] | BackendJobRoleDetails>(
        `/jobs/${id}`
      );

      // Check if response data exists
      if (!response.data) {
        throw new Error(`No data received for job ID: ${id}`);
      }

      // Handle both array and single object responses
      const jobData = Array.isArray(response.data) ? response.data[0] : response.data;

      if (!jobData) {
        throw new Error(`Job with ID ${id} not found`);
      }

      // Transform backend format to frontend format
      return transformJobRoleDetails(jobData);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },

  // Create a new job role
  createJob: async (jobData: CreateJobRoleRequest): Promise<JobRoleDetails> => {
    const response = await apiClient.post<BackendJobRoleDetails>('/jobs/job', jobData);
    return transformJobRoleDetails(response.data);
  },

  // Update a job role
  updateJob: async (id: string, updates: UpdateJobRoleRequest): Promise<JobRole | null> => {
    try {
      const response = await apiClient.put<BackendJobRole>(`/jobs/${id}`, updates);
      return transformJobRole(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get distinct filter values for job roles
  getDistinctValues: async (): Promise<{
    locations: string[];
    capabilities: string[];
    bands: string[];
  }> => {
    // Get all jobs and extract distinct values
    const jobs = await api.getJobs();

    const locations = [...new Set(jobs.map((job) => job.location))].sort();
    const capabilities = [...new Set(jobs.map((job) => job.capability))].sort();
    const bands = [...new Set(jobs.map((job) => job.band))].sort();

    return { locations, capabilities, bands };
  },

  // Delete a job role
  deleteJob: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/job/${id}`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Get all capabilities (for creating/editing job roles)
  getCapabilities: async (): Promise<Array<{ id: number; name: string }>> => {
    const response = await apiClient.get<Array<{ id: number; name: string }>>('/capabilities');
    return response.data;
  },

  // Get all bands (for creating/editing job roles)
  getBands: async (): Promise<Array<{ id: number; name: string }>> => {
    const response = await apiClient.get<Array<{ id: number; name: string }>>('/bands');
    return response.data;
  },

  // Get all statuses (for creating/editing job roles)
  getStatuses: async (): Promise<Status[]> => {
    const response = await apiClient.get<Status[]>('/statuses');
    return response.data;
  },

  // Submit a job application
  submitApplication: async (applicationData: {
    jobRoleId: number;
    emailAddress: string;
    phoneNumber: number;
    coverLetter?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    applicationID?: number;
    message?: string;
  }> => {
    const response = await apiClient.post('/applications', applicationData);
    return response.data;
  },
};
