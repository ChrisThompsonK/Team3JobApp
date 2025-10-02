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
