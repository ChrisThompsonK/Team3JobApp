// frontend/src/services/api.ts
import axios from 'axios';
import type { JobRole, JobRoleDetails } from '../models/job-roles.js';

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend API response type (now includes names from joined tables)
interface BackendJobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capabilityName: string;
  bandName: string;
  closingDate: string;
}

// Backend API response type for job details (includes all fields)
interface BackendJobRoleDetails extends BackendJobRole {
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  status?: string;
  openPositions?: number;
}

// Transform backend response to frontend format
function transformJobRole(backendJob: BackendJobRole): JobRole {
  return {
    id: backendJob.jobRoleId.toString(),
    name: backendJob.roleName,
    location: backendJob.location,
    capability: backendJob.capabilityName,
    band: backendJob.bandName,
    closingDate: new Date(backendJob.closingDate),
  };
}

// Transform backend job details response to frontend format
function transformJobRoleDetails(backendJob: BackendJobRoleDetails): JobRoleDetails {
  // Validate required fields
  if (!backendJob || !backendJob.jobRoleId) {
    throw new Error('Invalid job role data: missing jobRoleId');
  }

  const baseJob: JobRole = {
    id: backendJob.jobRoleId.toString(),
    name: backendJob.roleName || 'Unknown Role',
    location: backendJob.location || 'Unknown Location',
    capability: backendJob.capabilityName || 'Unknown Capability',
    band: backendJob.bandName || 'Unknown Band',
    closingDate: backendJob.closingDate ? new Date(backendJob.closingDate) : new Date(),
  };

  const details: JobRoleDetails = { ...baseJob };

  if (backendJob.description) details.description = backendJob.description;
  if (backendJob.responsibilities) details.responsibilities = backendJob.responsibilities;
  if (backendJob.jobSpecUrl) details.jobSpecUrl = backendJob.jobSpecUrl;
  if (backendJob.status) details.status = backendJob.status as 'Open' | 'Closing Soon' | 'Closed';
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

  // Update a job role
  updateJob: async (
    id: string,
    updates: {
      roleName?: string;
      location?: string;
      capabilityId?: number;
      bandId?: number;
      closingDate?: string;
    }
  ): Promise<JobRole | null> => {
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
};
