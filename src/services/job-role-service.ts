import type { JobRole, JobRoleCreate, JobRoleDetails, JobRoleUpdate } from '../models/job-roles.js';

// Re-export standardized types for convenience
export type CreateJobRoleRequest = JobRoleCreate;
export type UpdateJobRoleRequest = JobRoleUpdate;

export interface JobRoleService {
  getAllJobRoles(): Promise<JobRole[]>;
  getJobRoleById(id: string | number): Promise<JobRole | null>;
  getJobRoleDetailsById(id: string | number): Promise<JobRoleDetails | null>;
  createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails>;
  updateJobRole(
    id: string | number,
    jobRoleData: UpdateJobRoleRequest
  ): Promise<JobRoleDetails | null>;
  deleteJobRole(id: string | number): Promise<boolean>;
  generateJobRolesReportCsv(): Promise<string>;
}

export class MockJobRoleService implements JobRoleService {
  private readonly sampleJobRoles: JobRoleDetails[] = [
    {
      id: 1,
      name: 'Software Engineer',
      location: 'Belfast',
      capabilityId: 2,
      capabilityName: 'Engineering',
      bandId: 1,
      bandName: 'Associate',
      closingDate: '2024-12-15',
      description:
        'We are looking for a passionate Software Engineer to join our dynamic team in Belfast. You will be working on cutting-edge applications and contributing to innovative solutions that make a real impact.',
      responsibilities:
        'Design, develop, and maintain high-quality software applications\nCollaborate with cross-functional teams to deliver features\nParticipate in code reviews and maintain coding standards\nTroubleshoot and debug applications\nStay up-to-date with emerging technologies and industry trends',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/software-engineer-1.pdf',
      status: 'Open',
      openPositions: 3,
    },
    {
      id: 2,
      name: 'Senior Software Engineer',
      location: 'London',
      capabilityId: 2,
      capabilityName: 'Engineering',
      bandId: 2,
      bandName: 'Senior Associate',
      closingDate: '2024-11-30',
      description:
        'Join our London team as a Senior Software Engineer and take the lead on complex technical challenges while mentoring junior developers.',
      responsibilities:
        'Lead the design and architecture of software systems\nMentor junior developers and conduct technical interviews\nDrive technical decisions and best practices\nCollaborate with product teams to deliver scalable solutions\nContribute to the technical strategy and roadmap',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/senior-software-engineer-2.pdf',
      status: 'Closing Soon',
      openPositions: 2,
    },
    {
      id: 3,
      name: 'Product Manager',
      location: 'Manchester',
      capabilityId: 3,
      capabilityName: 'Product',
      bandId: 2,
      bandName: 'Senior Associate',
      closingDate: '2024-12-01',
      description:
        'Drive product strategy and execution for our core platform products. Work closely with engineering, design, and business stakeholders.',
      responsibilities:
        'Define and execute product roadmaps\nConduct market research and competitive analysis\nWork with engineering teams to deliver features\nAnalyze product metrics and user feedback\nCollaborate with stakeholders across the organization',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/product-manager-3.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: 4,
      name: 'UX Designer',
      location: 'Birmingham',
      capabilityId: 4,
      capabilityName: 'Design',
      bandId: 1,
      bandName: 'Associate',
      closingDate: '2024-11-25',
      description:
        'Create exceptional user experiences for our digital products. You will be responsible for user research, wireframing, and prototyping.',
      responsibilities:
        'Conduct user research and usability testing\nCreate wireframes, prototypes, and design specifications\nCollaborate with product and engineering teams\nMaintain and evolve design systems\nPresent design concepts to stakeholders',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/ux-designer-4.pdf',
      status: 'Closing Soon',
      openPositions: 1,
    },
    {
      id: 5,
      name: 'Data Scientist',
      location: 'Edinburgh',
      capabilityId: 5,
      capabilityName: 'Data & Analytics',
      bandId: 2,
      bandName: 'Senior Associate',
      closingDate: '2024-12-10',
      description:
        'Join our data team to extract insights from large datasets and build predictive models that drive business decisions.',
      responsibilities:
        'Analyze large datasets to identify trends and patterns\nBuild and deploy machine learning models\nCreate data visualizations and reports\nCollaborate with business teams to define analytics requirements\nEnsure data quality and governance standards',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/data-scientist-5.pdf',
      status: 'Open',
      openPositions: 2,
    },
    {
      id: 6,
      name: 'DevOps Engineer',
      location: 'Belfast',
      capabilityId: 2,
      capabilityName: 'Engineering',
      bandId: 1,
      bandName: 'Associate',
      closingDate: '2024-12-05',
      description:
        'Build and maintain our cloud infrastructure and deployment pipelines. Help teams deliver software faster and more reliably.',
      responsibilities:
        'Design and implement CI/CD pipelines\nManage cloud infrastructure and monitoring\nAutomate deployment and scaling processes\nEnsure security and compliance standards\nSupport development teams with infrastructure needs',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/devops-engineer-6.pdf',
      status: 'Open',
      openPositions: 2,
    },
    {
      id: 7,
      name: 'Principal Software Engineer',
      location: 'London',
      capabilityId: 2,
      capabilityName: 'Engineering',
      bandId: 3,
      bandName: 'Principal',
      closingDate: '2024-12-20',
      description:
        'Lead technical strategy and architecture decisions across multiple teams. Drive innovation and technical excellence.',
      responsibilities:
        'Define technical strategy and architecture standards\nLead complex technical initiatives\nMentor senior engineers and technical leads\nDrive adoption of best practices and new technologies\nCollaborate with leadership on technical vision',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/principal-engineer-7.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: 8,
      name: 'Business Analyst',
      location: 'Leeds',
      capabilityId: 6,
      capabilityName: 'Business Analysis',
      bandId: 1,
      bandName: 'Associate',
      closingDate: '2024-11-28',
      description:
        'Bridge the gap between business needs and technical solutions. Analyze requirements and drive process improvements.',
      responsibilities:
        'Gather and analyze business requirements\nCreate detailed documentation and specifications\nFacilitate workshops and stakeholder meetings\nSupport testing and user acceptance activities\nIdentify process improvement opportunities',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/business-analyst-8.pdf',
      status: 'Closing Soon',
      openPositions: 1,
    },
    {
      id: 9,
      name: 'Scrum Master',
      location: 'Glasgow',
      capabilityId: 7,
      capabilityName: 'Delivery',
      bandId: 2,
      bandName: 'Senior Associate',
      closingDate: '2024-12-03',
      description:
        'Facilitate agile ceremonies and remove impediments for development teams. Drive continuous improvement and agile adoption.',
      responsibilities:
        'Facilitate scrum ceremonies and meetings\nCoach teams on agile practices\nRemove impediments and blockers\nTrack and report on team metrics\nDrive continuous improvement initiatives',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/scrum-master-9.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: 10,
      name: 'Security Engineer',
      location: 'London',
      capabilityId: 8,
      capabilityName: 'Cyber Security',
      bandId: 2,
      bandName: 'Senior Associate',
      closingDate: '2024-12-12',
      description:
        'Protect our systems and data by implementing security best practices and monitoring for threats.',
      responsibilities:
        'Implement security controls and monitoring\nConduct security assessments and audits\nRespond to security incidents and threats\nDevelop security policies and procedures\nTrain teams on security best practices',
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/security-engineer-10.pdf',
      status: 'Open',
      openPositions: 1,
    },
  ];

  async getAllJobRoles(): Promise<JobRole[]> {
    // Simulate API delay
    await this.delay(100);
    return [...this.sampleJobRoles];
  }

  async getJobRoleById(id: string | number): Promise<JobRole | null> {
    // Simulate API delay
    await this.delay(50);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const jobRole = this.sampleJobRoles.find((role) => role.id === numId);
    return jobRole || null;
  }

  async getJobRoleDetailsById(id: string | number): Promise<JobRoleDetails | null> {
    // Simulate API delay
    await this.delay(50);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const jobRoleDetails = this.sampleJobRoles.find((role) => role.id === numId);
    return jobRoleDetails || null;
  }

  async createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails> {
    // Generate a new ID
    const newId = Math.max(...this.sampleJobRoles.map((role) => role.id), 0) + 1;

    // Create the detailed job role using standardized format
    const newJobRoleDetails: JobRoleDetails = {
      id: newId,
      name: jobRoleData.name,
      location: jobRoleData.location,
      capabilityId: jobRoleData.capabilityId,
      capabilityName: null, // Would be looked up from capabilities table in real implementation
      bandId: jobRoleData.bandId,
      bandName: null, // Would be looked up from bands table in real implementation
      closingDate: jobRoleData.closingDate,
      description: jobRoleData.description || null,
      responsibilities: jobRoleData.responsibilities || null,
      jobSpecUrl: jobRoleData.jobSpecUrl || null,
      status: jobRoleData.status || 'Open',
      openPositions: jobRoleData.openPositions || 1,
    };

    // Add to our mock data
    this.sampleJobRoles.push(newJobRoleDetails);

    return newJobRoleDetails;
  }

  async updateJobRole(
    id: string | number,
    jobRoleData: UpdateJobRoleRequest
  ): Promise<JobRoleDetails | null> {
    await this.delay(50);
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const index = this.sampleJobRoles.findIndex((jobRole) => jobRole.id === numId);
    if (index === -1) {
      return null;
    }

    const existingJobRole = this.sampleJobRoles[index];
    if (!existingJobRole) {
      return null;
    }

    // Update the job role with new data using standardized format
    const updatedJobRole: JobRoleDetails = {
      id: existingJobRole.id,
      name: jobRoleData.name ?? existingJobRole.name,
      location: jobRoleData.location ?? existingJobRole.location,
      capabilityId: jobRoleData.capabilityId ?? existingJobRole.capabilityId,
      capabilityName: existingJobRole.capabilityName, // Name doesn't change when ID changes (would need lookup)
      bandId: jobRoleData.bandId ?? existingJobRole.bandId,
      bandName: existingJobRole.bandName, // Name doesn't change when ID changes (would need lookup)
      closingDate: jobRoleData.closingDate ?? existingJobRole.closingDate,
      description:
        jobRoleData.description !== undefined
          ? jobRoleData.description
          : existingJobRole.description,
      responsibilities:
        jobRoleData.responsibilities !== undefined
          ? jobRoleData.responsibilities
          : existingJobRole.responsibilities,
      jobSpecUrl:
        jobRoleData.jobSpecUrl !== undefined ? jobRoleData.jobSpecUrl : existingJobRole.jobSpecUrl,
      status: jobRoleData.status ?? existingJobRole.status,
      openPositions: jobRoleData.openPositions ?? existingJobRole.openPositions,
    };

    this.sampleJobRoles[index] = updatedJobRole;
    return updatedJobRole;
  }

  async deleteJobRole(id: string | number): Promise<boolean> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const index = this.sampleJobRoles.findIndex((jobRole) => jobRole.id === numId);
    if (index === -1) {
      return false;
    }
    this.sampleJobRoles.splice(index, 1);
    return true;
  }

  async generateJobRolesReportCsv(): Promise<string> {
    const allJobRoles = await this.getAllJobRoles();

    // Create CSV headers
    const headers = ['ID', 'Job Name', 'Location', 'Capability', 'Band', 'Closing Date'];

    // Create CSV rows using standardized property names
    const rows = allJobRoles.map((job) => [
      job.id,
      `"${job.name.replace(/"/g, '""')}"`, // Escape quotes in job names
      job.location,
      job.capabilityName || 'N/A',
      job.bandName || 'N/A',
      job.closingDate, // Already in YYYY-MM-DD format
    ]);

    // Combine headers and rows into CSV format
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return csvContent;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Import RealJobRoleService
import { RealJobRoleService } from './real-job-role-service.js';

// Export a singleton instance for easy use
// Switch between Mock and Real service based on environment
const USE_REAL_API = process.env['USE_REAL_API'] === 'true' || true; // Set to true to use real API
export const jobRoleService = USE_REAL_API ? new RealJobRoleService() : new MockJobRoleService();
