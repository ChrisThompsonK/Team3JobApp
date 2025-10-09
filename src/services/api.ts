// frontend/src/services/api.ts
import axios from 'axios';
import type {
  Band,
  Capability,
  JobRole,
  JobRoleCreate,
  JobRoleDetails,
} from '../models/job-roles.js';

const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
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
  // No transformation needed - backend returns standardized format
  getJobs: async (): Promise<JobRole[]> => {
    const response = await apiClient.get<JobRole[]>('/jobs');
    return response.data;
  },

  // Get single job role by ID with full details
  getJobById: async (id: string | number): Promise<JobRoleDetails> => {
    const response = await apiClient.get<JobRoleDetails>(`/jobs/${id}`);
    return response.data;
  },

  // Update a job role
  updateJob: async (
    id: string | number,
    updates: {
      name?: string;
      location?: string;
      capabilityId?: number;
      bandId?: number;
      closingDate?: string;
      description?: string | null;
      responsibilities?: string | null;
      jobSpecUrl?: string | null;
      status?: string;
      openPositions?: number;
    }
  ): Promise<JobRoleDetails | null> => {
    try {
      const response = await apiClient.put<JobRoleDetails>(`/jobs/${id}`, updates);
      return response.data;
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
    const capabilities = [
      ...new Set(
        jobs.map((job) => job.capabilityName).filter((name): name is string => name !== null)
      ),
    ].sort();
    const bands = [
      ...new Set(jobs.map((job) => job.bandName).filter((name): name is string => name !== null)),
    ].sort();

    return { locations, capabilities, bands };
  },

  // Get all capabilities with their IDs
  getCapabilities: async (): Promise<Capability[]> => {
    const response = await apiClient.get<Capability[]>('/capabilities');
    return response.data;
  },

  // Get all bands with their IDs
  getBands: async (): Promise<Band[]> => {
    const response = await apiClient.get<Band[]>('/bands');
    return response.data;
  },

  // Create a new job role
  createJob: async (jobData: JobRoleCreate): Promise<JobRoleDetails> => {
    try {
      console.log('Sending job creation request:', JSON.stringify(jobData, null, 2));
      const response = await apiClient.post<JobRoleDetails>('/jobs/job', jobData);
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', JSON.stringify(response.data, null, 2));

      // Validate the response has the expected structure
      if (!response.data) {
        throw new Error('Backend returned empty response');
      }

      return response.data;
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
