// Standardized Model Structure (Frontend & Backend)
// Base interface with all fields
export interface JobRole {
  id: number;
  name: string;
  location: string;
  closingDate: string;
  capabilityId: number | null;
  capabilityName: string | null;
  bandId: number | null;
  bandName: string | null;
  description?: string | null;
  responsibilities?: string | null;
  jobSpecUrl?: string | null;
  status?: string;
  openPositions?: number;
}

// Full details (extends JobRole)
export interface JobRoleDetails extends JobRole {
  description: string | null;
  responsibilities: string | null;
  jobSpecUrl: string | null;
  status: string;
  openPositions: number;
}

// For creating (no id, IDs are required)
export interface JobRoleCreate {
  name: string;
  location: string;
  closingDate: string;
  capabilityId: number;
  bandId: number;
  description?: string | null;
  responsibilities?: string | null;
  jobSpecUrl?: string | null;
  status?: string;
  openPositions?: number;
}

// For updating (all optional)
export interface JobRoleUpdate {
  name?: string;
  location?: string;
  closingDate?: string;
  capabilityId?: number;
  bandId?: number;
  description?: string | null;
  responsibilities?: string | null;
  jobSpecUrl?: string | null;
  status?: string;
  openPositions?: number;
}

// Capability and Band with standardized names
export interface Capability {
  id: number;
  name: string;
}

export interface Band {
  id: number;
  name: string;
}
