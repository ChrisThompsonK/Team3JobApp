import type { Request, Response } from 'express';
import type { JobApplicationData, JobRole, NewJobRole } from '../models/job-roles.js';
import { api } from '../services/api.js';
import type { JobRoleService } from '../services/job-role-service.js';
import type { JobApplicationValidator } from '../validators/index.js';

export class JobRoleController {
  constructor(
    private readonly jobRoleService: JobRoleService,
    private readonly applicationValidator: JobApplicationValidator
  ) {}

  async getAllJobRoles(req: Request, res: Response): Promise<void> {
    try {
      // Fetch job roles from the API instead of mock service
      const allJobRoles: JobRole[] = await api.getJobs();

      const { search, capability } = req.query;

      let filteredJobRoles = allJobRoles;

      // Filter by capability if specified
      if (capability && typeof capability === 'string') {
        filteredJobRoles = filteredJobRoles.filter(
          (job) => job.capability.toLowerCase() === capability.toLowerCase()
        );
      }

      // Filter by search term if specified (search in job name, location, or capability)
      if (search && typeof search === 'string') {
        const searchTerm = search.toLowerCase();
        filteredJobRoles = filteredJobRoles.filter(
          (job) =>
            job.name.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm) ||
            job.capability.toLowerCase().includes(searchTerm)
        );
      }

      let title = 'Available Job Roles';
      if (capability) {
        title = `${capability} Job Roles`;
      } else if (search) {
        title = `Job Roles - Search: "${search}"`;
      }

      res.render('job-roles/job-role-list', {
        title,
        jobRoles: filteredJobRoles,
        currentFilter: { search, capability },
      });
    } catch (error) {
      console.error('Error fetching job roles:', error);
      res.status(500).send('Error loading job roles');
    }
  }

  async getJobRoleById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      // Fetch job role details directly from the backend API
      const jobRole = await api.getJobById(id);

      res.render('job-roles/detail', {
        title: jobRole.name,
        jobRole,
      });
    } catch (error) {
      console.error('Error fetching job role:', error);
      // Check if it's a 404 error
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          res.status(404).send(`Job role with ID ${id} not found`);
          return;
        }
      }
      res.status(500).send('Error loading job role details');
    }
  }

  async getJobRoleDetails(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { applicationSubmitted } = req.query;

    try {
      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      // Fetch job role details directly from the backend API
      const jobRoleDetails = await api.getJobById(id);

      res.render('job-roles/detail', {
        title: `${jobRoleDetails.name} - Job Details`,
        jobRole: jobRoleDetails,
        applicationSubmitted: applicationSubmitted === 'true',
      });
    } catch (error) {
      console.error('Error fetching job role details:', error);
      // Check if it's a 404 error
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          res.status(404).send(`Job role with ID ${id} not found`);
          return;
        }
      }
      res.status(500).send('Error loading job role details');
    }
  }

  async getJobRoleApplication(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      // Fetch job role details directly from the backend API
      const jobRoleDetails = await api.getJobById(id);

      if (!jobRoleDetails) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      // Render the application form
      res.render('job-roles/apply', {
        title: `Apply for ${jobRoleDetails.name}`,
        jobRole: jobRoleDetails,
      });
    } catch (error) {
      console.error('Error fetching job role for application:', error);
      // Check if it's a 404 error
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          res.status(404).send(`Job role with ID ${id} not found`);
          return;
        }
      }
      res.status(500).send('Error loading job application page');
    }
  }

  async submitJobRoleApplication(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      // Get form data
      const applicationData = req.body as JobApplicationData;

      // Validate application data
      const validationResult = this.applicationValidator.validate(applicationData);
      if (!validationResult.isValid) {
        res.status(400).send(validationResult.errors.join(', '));
        return;
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        currentJobTitle,
        yearsOfExperience,
        linkedinUrl,
        coverLetter,
        additionalComments,
      } = applicationData;

      // TODO: In a real application, you would:
      // 1. Upload the CV file to storage
      // 2. Save the application to a database
      // 3. Send confirmation email to applicant
      // 4. Notify HR team

      console.log('Application received:', {
        jobRoleId: id,
        firstName,
        lastName,
        email,
        phone,
        currentJobTitle,
        yearsOfExperience,
        linkedinUrl,
        coverLetter: `${coverLetter.substring(0, 50)}...`,
        additionalComments,
      });

      // For now, redirect to a success page or back to job details with a success message
      // You can create a success page later
      res.redirect(`/jobs/${id}/details?applicationSubmitted=true`);
    } catch (error) {
      console.error('Error submitting job application:', error);
      res.status(500).send('Error submitting application. Please try again.');
    }
  }

  async generateJobRolesReport(_req: Request, res: Response): Promise<void> {
    try {
      const csvContent = await this.jobRoleService.generateJobRolesReportCsv();

      // Set headers for file download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `job-roles-report-${timestamp}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Error generating job roles report:', error);
      res.status(500).send('Error generating report');
    }
  }

  async showNewJobRoleForm(_req: Request, res: Response): Promise<void> {
    try {
      const locationOptions = [
        'Belfast',
        'London',
        'Manchester',
        'Birmingham',
        'Edinburgh',
        'Leeds',
        'Glasgow',
        'Remote',
      ];

      const capabilityOptions = [
        'Engineering',
        'Product',
        'Design',
        'Data & Analytics',
        'Business Analysis',
        'Delivery',
        'Cyber Security',
        'Quality Assurance',
        'DevOps',
      ];

      const bandOptions = ['Graduate', 'Associate', 'Senior Associate', 'Principal', 'Director'];

      res.render('job-roles/new', {
        title: 'Add New Job Role',
        locationOptions,
        capabilityOptions,
        bandOptions,
      });
    } catch (error) {
      console.error('Error loading new job role form:', error);
      res.status(500).send('Error loading form');
    }
  }

  async createJobRole(req: Request, res: Response): Promise<void> {
    try {
      const jobRoleData = req.body as NewJobRole;

      // Validate required fields
      if (
        !jobRoleData.name ||
        !jobRoleData.location ||
        !jobRoleData.capability ||
        !jobRoleData.band ||
        !jobRoleData.closingDate
      ) {
        res
          .status(400)
          .send(
            'Missing required fields: name, location, capability, band, and closingDate are required'
          );
        return;
      }

      // Create the job role
      const newJobRole = await this.jobRoleService.createJobRole({
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capability: jobRoleData.capability,
        band: jobRoleData.band,
        closingDate: new Date(jobRoleData.closingDate),
        description: jobRoleData.description?.trim() || undefined,
        responsibilities: jobRoleData.responsibilities?.trim() || undefined,
        jobSpecUrl: jobRoleData.jobSpecUrl?.trim() || undefined,
        openPositions: jobRoleData.openPositions
          ? parseInt(jobRoleData.openPositions, 10)
          : undefined,
      });

      // Redirect to the new job role details page
      res.redirect(`/jobs/${newJobRole.id}/details`);
    } catch (error) {
      console.error('Error creating job role:', error);
      res.status(500).send('Error creating job role');
    }
  }

  async deleteJobRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      const success = await this.jobRoleService.deleteJobRole(id);

      if (!success) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      // Redirect to the job list page with a success message
      res.redirect('/jobs?deleted=true');
    } catch (error) {
      console.error('Error deleting job role:', error);
      res.status(500).send('Error deleting job role');
    }
  }

  async showEditJobRoleForm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      const jobRole = await this.jobRoleService.getJobRoleDetailsById(id);

      if (!jobRole) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      const locationOptions = [
        'Belfast',
        'London',
        'Manchester',
        'Birmingham',
        'Edinburgh',
        'Leeds',
        'Glasgow',
        'Remote',
      ];

      const capabilityOptions = [
        'Engineering',
        'Product',
        'Design',
        'Data & Analytics',
        'Business Analysis',
        'Delivery',
        'Cyber Security',
        'Quality Assurance',
        'DevOps',
      ];

      const bandOptions = ['Graduate', 'Associate', 'Senior Associate', 'Principal', 'Director'];

      const statusOptions = ['Open', 'Closing Soon', 'Closed'];

      // Format responsibilities as string for textarea
      const responsibilitiesText = Array.isArray(jobRole.responsibilities)
        ? jobRole.responsibilities.join('\n')
        : jobRole.responsibilities || '';

      // Format closing date for input field (YYYY-MM-DD)
      const closingDateFormatted = jobRole.closingDate.toISOString().split('T')[0];

      res.render('job-roles/edit', {
        title: `Edit ${jobRole.name}`,
        jobRole: {
          ...jobRole,
          responsibilities: responsibilitiesText,
          closingDate: closingDateFormatted,
        },
        locationOptions,
        capabilityOptions,
        bandOptions,
        statusOptions,
      });
    } catch (error) {
      console.error('Error loading edit job role form:', error);
      res.status(500).send('Error loading form');
    }
  }

  async updateJobRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      // Validate that ID is a positive integer
      const numericId = Number.parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
        res.status(400).send('Invalid job role ID. ID must be a positive integer.');
        return;
      }

      const jobRoleData = req.body as NewJobRole;

      // Validate required fields
      if (
        !jobRoleData.name ||
        !jobRoleData.location ||
        !jobRoleData.capability ||
        !jobRoleData.band ||
        !jobRoleData.closingDate
      ) {
        res
          .status(400)
          .send(
            'Missing required fields: name, location, capability, band, and closingDate are required'
          );
        return;
      }

      // Build update object
      const updateData = {
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capability: jobRoleData.capability,
        band: jobRoleData.band,
        closingDate: new Date(jobRoleData.closingDate),
      };

      // Add optional fields
      const optionalData: {
        description?: string;
        responsibilities?: string;
        jobSpecUrl?: string;
        openPositions?: number;
        status?: 'Open' | 'Closing Soon' | 'Closed';
      } = {};

      if (jobRoleData.description?.trim()) {
        optionalData.description = jobRoleData.description.trim();
      }
      if (jobRoleData.responsibilities?.trim()) {
        optionalData.responsibilities = jobRoleData.responsibilities.trim();
      }
      if (jobRoleData.jobSpecUrl?.trim()) {
        optionalData.jobSpecUrl = jobRoleData.jobSpecUrl.trim();
      }
      if (jobRoleData.openPositions) {
        optionalData.openPositions = parseInt(jobRoleData.openPositions, 10);
      }
      if (req.body.status) {
        optionalData.status = req.body.status as 'Open' | 'Closing Soon' | 'Closed';
      }

      // Update the job role
      const updatedJobRole = await this.jobRoleService.updateJobRole(id, {
        ...updateData,
        ...optionalData,
      });

      if (!updatedJobRole) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      // Redirect to the updated job role details page
      res.redirect(`/jobs/${id}/details`);
    } catch (error) {
      console.error('Error updating job role:', error);
      res.status(500).send('Error updating job role');
    }
  }
}
