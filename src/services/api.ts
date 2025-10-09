// frontend/src/services/api.ts
import axios from 'axios';
import type { JobRole, JobRoleDetails } from '../models/job-roles.js';

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3001/api';

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
  capabilityId: number;
  bandId: number;
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
  statusName?: string;
  openPositions?: number;
  open_positions?: number; // Alternative snake_case naming
  numberOfPositions?: number; // Alternative naming
}

// Backend API response types for capabilities and bands
interface BackendCapability {
  capabilityId: number;
  capabilityName: string;
}

interface BackendBand {
  bandId: number;
  bandName: string;
}

// Transform backend response to frontend format
function transformJobRole(backendJob: BackendJobRole): JobRole {
  // Debug: Log the backend response to understand its structure
  console.log('Transforming backend job role:', JSON.stringify(backendJob, null, 2));
  
  // Validate required fields
  if (!backendJob.jobRoleId) {
    console.error('Missing jobRoleId in backend response:', backendJob);
    throw new Error('Backend response missing jobRoleId');
  }

  if (!backendJob.roleName) {
    console.error('Missing roleName in backend response:', backendJob);
    throw new Error('Backend response missing roleName');
  }

  if (!backendJob.capabilityName) {
    console.error('Missing capabilityName in backend response:', backendJob);
    throw new Error('Backend response missing capabilityName');
  }

  if (!backendJob.bandName) {
    console.error('Missing bandName in backend response:', backendJob);
    throw new Error('Backend response missing bandName');
  }

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
  // Debug: Log the backend response to understand its structure
  console.log('Transforming backend job details:', JSON.stringify(backendJob, null, 2));
  
  const baseJob: JobRole = {
    id: backendJob.jobRoleId.toString(),
    name: backendJob.roleName,
    location: backendJob.location,
    capability: backendJob.capabilityName,
    band: backendJob.bandName,
    closingDate: new Date(backendJob.closingDate),
  };

  const details: JobRoleDetails = { ...baseJob };

  if (backendJob.description) details.description = backendJob.description;
  if (backendJob.responsibilities) details.responsibilities = backendJob.responsibilities;
  if (backendJob.jobSpecUrl) details.jobSpecUrl = backendJob.jobSpecUrl;
  
  // Handle status - could be status or statusName from backend
  if (backendJob.status) {
    details.status = backendJob.status as 'Open' | 'Closing Soon' | 'Closed';
  } else if (backendJob.statusName) {
    details.status = backendJob.statusName as 'Open' | 'Closing Soon' | 'Closed';
  }
  
  // Handle openPositions - check multiple possible field names
  const openPositionsValue = backendJob.openPositions ?? backendJob.open_positions ?? backendJob.numberOfPositions;
  if (openPositionsValue !== undefined && openPositionsValue !== null) {
    details.openPositions = openPositionsValue;
  }

  console.log('Transformed job details:', JSON.stringify(details, null, 2));
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
    const response = await apiClient.get<BackendJobRoleDetails>(`/jobs/${id}`);
    // Transform backend format to frontend format
    return transformJobRoleDetails(response.data);
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

  // Get all capabilities with their IDs
  getCapabilities: async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiClient.get<BackendCapability[]>('/capabilities');
    return response.data.map((cap) => ({ id: cap.capabilityId, name: cap.capabilityName }));
  },

  // Get all bands with their IDs
  getBands: async (): Promise<{ id: number; name: string }[]> => {
    const response = await apiClient.get<BackendBand[]>('/bands');
    return response.data.map((band) => ({ id: band.bandId, name: band.bandName }));
  },

  // Create a new job role
  createJob: async (jobData: {
    roleName: string;
    location: string;
    capabilityId: number;
    bandId: number;
    closingDate: string; // YYYY-MM-DD format
    description?: string;
    responsibilities?: string;
    jobSpecUrl?: string;
    statusId?: number;
    openPositions?: number;
  }): Promise<JobRoleDetails> => {
    try {
      console.log('Sending job creation request:', JSON.stringify(jobData, null, 2));
      const response = await apiClient.post<BackendJobRoleDetails>('/jobs/job', jobData);
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', JSON.stringify(response.data, null, 2));
      
      // Validate the response has the expected structure
      if (!response.data) {
        throw new Error('Backend returned empty response');
      }
      
      return transformJobRoleDetails(response.data);
    } catch (error) {
      console.error('Error in createJob API call:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }
      throw error;
    }
  },
};
