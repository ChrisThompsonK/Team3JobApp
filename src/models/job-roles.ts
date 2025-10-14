export interface JobRole {
  id: string;
  name: string;
  location: string;
  capability: string;
  band: string;
  status: string; // Display status name
  closingDate: Date;
}

export interface JobRoleDetails extends JobRole {
  description?: string;
  responsibilities?: string | string[];
  jobSpecUrl?: string;
  openPositions?: number;
}

export interface NewJobRole {
  name: string;
  location: string;
  capabilityId: string; // Will be parsed to number
  bandId: string; // Will be parsed to number
  statusId: string; // Will be parsed to number
  closingDate: string;
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  openPositions?: string;
}

export interface CreateJobRoleRequest {
  name: string;
  location: string;
  capabilityId: number;
  bandId: number;
  statusId?: number; // Optional, defaults to "Open"
  closingDate: string;
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  openPositions?: number;
}

export interface UpdateJobRoleRequest {
  roleName?: string;
  location?: string;
  capabilityId?: number;
  bandId?: number;
  statusId?: number; // Changed from status text
  closingDate?: string;
}

export interface JobApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode?: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  linkedinUrl?: string;
  coverLetter: string;
  additionalComments?: string;
  acceptTerms: boolean;
}

// Status interface for the new status table
export interface Status {
  id: number;
  name: string;
}
