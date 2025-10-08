// frontend/src/services/api.ts
import axios from 'axios';
import type { JobRole } from '../models/job-roles.js';

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
  getJobs: async (): Promise<JobRole[]> => {
    const response = await apiClient.get<BackendJobRole[]>('/jobs');
    // Transform backend format to frontend format
    return response.data.map(transformJobRole);
  },

  // Get a single job role by ID
  getJobById: async (id: string): Promise<JobRole | null> => {
    try {
      const response = await apiClient.get<BackendJobRole>(`/jobs/${id}`);
      return transformJobRole(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
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

  // Get CSV report from backend
  getJobRolesReportCsv: async (): Promise<string> => {
    const response = await apiClient.get('/jobs/report', {
      headers: {
        'Accept': 'text/csv',
      },
    });
    return response.data;
  },
};
