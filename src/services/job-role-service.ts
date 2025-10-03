import type { JobRole, JobRoleDetails } from '../models/job-roles.js';

export interface CreateJobRoleRequest {
  name: string;
  location: string;
  capability: string;
  band: string;
  closingDate: Date;
  description?: string | undefined;
  responsibilities?: string | undefined;
  jobSpecUrl?: string | undefined;
  openPositions?: number | undefined;
}

export interface JobRoleService {
  getAllJobRoles(): Promise<JobRole[]>;
  getJobRoleById(id: string): Promise<JobRole | null>;
  getJobRoleDetailsById(id: string): Promise<JobRoleDetails | null>;
  createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails>;
}

export class MockJobRoleService implements JobRoleService {
  private readonly sampleJobRoles: JobRoleDetails[] = [
    {
      id: '1',
      name: 'Software Engineer',
      location: 'Belfast',
      capability: 'Engineering',
      band: 'Associate',
      closingDate: new Date('2024-12-15'),
      description:
        'We are looking for a passionate Software Engineer to join our dynamic team in Belfast. You will be working on cutting-edge applications and contributing to innovative solutions that make a real impact.',
      responsibilities: [
        'Design, develop, and maintain high-quality software applications',
        'Collaborate with cross-functional teams to deliver features',
        'Participate in code reviews and maintain coding standards',
        'Troubleshoot and debug applications',
        'Stay up-to-date with emerging technologies and industry trends',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/software-engineer-1.pdf',
      status: 'Open',
      openPositions: 3,
    },
    {
      id: '2',
      name: 'Senior Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Senior Associate',
      closingDate: new Date('2024-11-30'),
      description:
        'Join our London team as a Senior Software Engineer and take the lead on complex technical challenges while mentoring junior developers.',
      responsibilities: [
        'Lead the design and architecture of software systems',
        'Mentor junior developers and conduct technical interviews',
        'Drive technical decisions and best practices',
        'Collaborate with product teams to deliver scalable solutions',
        'Contribute to the technical strategy and roadmap',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/senior-software-engineer-2.pdf',
      status: 'Closing Soon',
      openPositions: 2,
    },
    {
      id: '3',
      name: 'Product Manager',
      location: 'Manchester',
      capability: 'Product',
      band: 'Senior Associate',
      closingDate: new Date('2024-12-01'),
      description:
        'Drive product strategy and execution for our core platform products. Work closely with engineering, design, and business stakeholders.',
      responsibilities: [
        'Define and execute product roadmaps',
        'Conduct market research and competitive analysis',
        'Work with engineering teams to deliver features',
        'Analyze product metrics and user feedback',
        'Collaborate with stakeholders across the organization',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/product-manager-3.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: '4',
      name: 'UX Designer',
      location: 'Birmingham',
      capability: 'Design',
      band: 'Associate',
      closingDate: new Date('2024-11-25'),
      description:
        'Create exceptional user experiences for our digital products. You will be responsible for user research, wireframing, and prototyping.',
      responsibilities: [
        'Conduct user research and usability testing',
        'Create wireframes, prototypes, and design specifications',
        'Collaborate with product and engineering teams',
        'Maintain and evolve design systems',
        'Present design concepts to stakeholders',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/ux-designer-4.pdf',
      status: 'Closing Soon',
      openPositions: 1,
    },
    {
      id: '5',
      name: 'Data Scientist',
      location: 'Edinburgh',
      capability: 'Data & Analytics',
      band: 'Senior Associate',
      closingDate: new Date('2024-12-10'),
      description:
        'Join our data team to extract insights from large datasets and build predictive models that drive business decisions.',
      responsibilities: [
        'Analyze large datasets to identify trends and patterns',
        'Build and deploy machine learning models',
        'Create data visualizations and reports',
        'Collaborate with business teams to define analytics requirements',
        'Ensure data quality and governance standards',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/data-scientist-5.pdf',
      status: 'Open',
      openPositions: 2,
    },
    {
      id: '6',
      name: 'DevOps Engineer',
      location: 'Belfast',
      capability: 'Engineering',
      band: 'Associate',
      closingDate: new Date('2024-12-05'),
      description:
        'Build and maintain our cloud infrastructure and deployment pipelines. Help teams deliver software faster and more reliably.',
      responsibilities: [
        'Design and implement CI/CD pipelines',
        'Manage cloud infrastructure and monitoring',
        'Automate deployment and scaling processes',
        'Ensure security and compliance standards',
        'Support development teams with infrastructure needs',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/devops-engineer-6.pdf',
      status: 'Open',
      openPositions: 2,
    },
    {
      id: '7',
      name: 'Principal Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Principal',
      closingDate: new Date('2024-12-20'),
      description:
        'Lead technical strategy and architecture decisions across multiple teams. Drive innovation and technical excellence.',
      responsibilities: [
        'Define technical strategy and architecture standards',
        'Lead complex technical initiatives',
        'Mentor senior engineers and technical leads',
        'Drive adoption of best practices and new technologies',
        'Collaborate with leadership on technical vision',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/principal-engineer-7.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: '8',
      name: 'Business Analyst',
      location: 'Leeds',
      capability: 'Business Analysis',
      band: 'Associate',
      closingDate: new Date('2024-11-28'),
      description:
        'Bridge the gap between business needs and technical solutions. Analyze requirements and drive process improvements.',
      responsibilities: [
        'Gather and analyze business requirements',
        'Create detailed documentation and specifications',
        'Facilitate workshops and stakeholder meetings',
        'Support testing and user acceptance activities',
        'Identify process improvement opportunities',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/business-analyst-8.pdf',
      status: 'Closing Soon',
      openPositions: 1,
    },
    {
      id: '9',
      name: 'Scrum Master',
      location: 'Glasgow',
      capability: 'Delivery',
      band: 'Senior Associate',
      closingDate: new Date('2024-12-03'),
      description:
        'Facilitate agile ceremonies and remove impediments for development teams. Drive continuous improvement and agile adoption.',
      responsibilities: [
        'Facilitate scrum ceremonies and meetings',
        'Coach teams on agile practices',
        'Remove impediments and blockers',
        'Track and report on team metrics',
        'Drive continuous improvement initiatives',
      ],
      jobSpecUrl: 'https://sharepoint.company.com/sites/hr/jobspecs/scrum-master-9.pdf',
      status: 'Open',
      openPositions: 1,
    },
    {
      id: '10',
      name: 'Security Engineer',
      location: 'London',
      capability: 'Cyber Security',
      band: 'Senior Associate',
      closingDate: new Date('2024-12-12'),
      description:
        'Protect our systems and data by implementing security best practices and monitoring for threats.',
      responsibilities: [
        'Implement security controls and monitoring',
        'Conduct security assessments and audits',
        'Respond to security incidents and threats',
        'Develop security policies and procedures',
        'Train teams on security best practices',
      ],
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

  async getJobRoleById(id: string): Promise<JobRole | null> {
    // Simulate API delay
    await this.delay(50);
    const jobRole = this.sampleJobRoles.find((role) => role.id === id);
    return jobRole || null;
  }

  async getJobRoleDetailsById(id: string): Promise<JobRoleDetails | null> {
    // Simulate API delay
    await this.delay(50);
    const jobRoleDetails = this.sampleJobRoles.find((role) => role.id === id);
    return jobRoleDetails || null;
  }

  async createJobRole(jobRoleData: CreateJobRoleRequest): Promise<JobRoleDetails> {
    // Simulate API delay
    await this.delay(100);

    // Generate a new ID
    const newId = (
      Math.max(...this.sampleJobRoles.map((role) => parseInt(role.id, 10)), 0) + 1
    ).toString();

    // Parse responsibilities from string to array
    const responsibilities = jobRoleData.responsibilities
      ? jobRoleData.responsibilities.split('\n').filter((line) => line.trim().length > 0)
      : [];

    // Create the detailed job role
    const newJobRoleDetails: JobRoleDetails = {
      id: newId,
      name: jobRoleData.name,
      location: jobRoleData.location,
      capability: jobRoleData.capability,
      band: jobRoleData.band,
      closingDate: jobRoleData.closingDate,
      status: 'Open' as const,
      openPositions: jobRoleData.openPositions || 1,
    };

    // Add optional properties only if they exist
    if (jobRoleData.description) {
      newJobRoleDetails.description = jobRoleData.description;
    }
    if (responsibilities.length > 0) {
      newJobRoleDetails.responsibilities = responsibilities;
    }
    if (jobRoleData.jobSpecUrl) {
      newJobRoleDetails.jobSpecUrl = jobRoleData.jobSpecUrl;
    }

    // Add to our mock data
    this.sampleJobRoles.push(newJobRoleDetails);

    return newJobRoleDetails;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export a singleton instance for easy use
export const jobRoleService = new MockJobRoleService();
