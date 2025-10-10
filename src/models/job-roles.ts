export interface JobRole {
  id: string;
  name: string;
  location: string;
  capability: string;
  band: string;
  closingDate: Date;
}

export interface JobRoleDetails extends JobRole {
  description?: string;
  responsibilities?: string | string[];
  jobSpecUrl?: string;
  status?: 'Open' | 'Closing Soon' | 'Closed';
  openPositions?: number;
}

export interface NewJobRole {
  name: string;
  location: string;
  capability: string;
  band: string;
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
