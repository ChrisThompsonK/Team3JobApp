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
      // Extract filter parameters from query string
      const { name, location, capability, band } = req.query;

      // Parse multiple values for checkboxes (location, capability, band can have multiple values)
      const nameFilter = name && typeof name === 'string' ? name : undefined;
      const locationFilters = location
        ? (Array.isArray(location) ? location : [location]).filter(
            (l): l is string => typeof l === 'string'
          )
        : [];
      const capabilityFilters = capability
        ? (Array.isArray(capability) ? capability : [capability]).filter(
            (c): c is string => typeof c === 'string'
          )
        : [];
      const bandFilters = band
        ? (Array.isArray(band) ? band : [band]).filter((b): b is string => typeof b === 'string')
        : [];

      // Fetch all job roles from the API
      let jobRoles: JobRole[] = await api.getJobs();

      // Apply filters on the frontend side
      if (nameFilter) {
        const searchTerm = nameFilter.toLowerCase();
        jobRoles = jobRoles.filter((job) => job.name.toLowerCase().includes(searchTerm));
      }

      if (locationFilters.length > 0) {
        jobRoles = jobRoles.filter((job) =>
          locationFilters.some((loc) => job.location.toLowerCase() === loc.toLowerCase())
        );
      }

      if (capabilityFilters.length > 0) {
        jobRoles = jobRoles.filter((job) =>
          capabilityFilters.some((cap) => job.capability.toLowerCase() === cap.toLowerCase())
        );
      }

      if (bandFilters.length > 0) {
        jobRoles = jobRoles.filter((job) =>
          bandFilters.some((b) => job.band.toLowerCase() === b.toLowerCase())
        );
      }

      // Get distinct values for filter dropdowns from all jobs
      const distinctValues = await api.getDistinctValues();

      // Keep title consistent regardless of filters
      const title = 'Available Job Roles';

      res.render('job-roles/job-role-list', {
        title,
        jobRoles,
        currentFilters: {
          name: nameFilter,
          location: locationFilters,
          capability: capabilityFilters,
          band: bandFilters,
        },
        distinctValues,
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

      // Check if application was just submitted (from query params)
      const applicationSubmitted = req.query['applicationSubmitted'] === 'true';
      const applicationId = req.query['applicationId'] as string | undefined;

      res.render('job-roles/detail', {
        title: jobRole.name,
        jobRole,
        applicationSubmitted,
        applicationId,
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

      // Map frontend form data to backend API format
      const phoneNumber = Number.parseInt(applicationData.phone.replace(/\D/g, ''), 10);
      if (Number.isNaN(phoneNumber)) {
        res.status(400).send('Invalid phone number format');
        return;
      }

      // Combine additional information into notes field
      const notes = [
        `Name: ${applicationData.firstName} ${applicationData.lastName}`,
        `Current Job Title: ${applicationData.currentJobTitle}`,
        `Years of Experience: ${applicationData.yearsOfExperience}`,
        applicationData.linkedinUrl ? `LinkedIn: ${applicationData.linkedinUrl}` : '',
        applicationData.additionalComments ? `Comments: ${applicationData.additionalComments}` : '',
      ]
        .filter((line) => line)
        .join('\n');

      // Submit application to backend API
      const backendApplicationData = {
        jobRoleId: numericId,
        emailAddress: applicationData.email,
        phoneNumber: phoneNumber,
        coverLetter: applicationData.coverLetter,
        notes: notes,
      };

      const result = await api.submitApplication(backendApplicationData);

      if (result.success) {
        // Redirect to success page with application ID
        res.redirect(
          `/jobs/${id}/details?applicationSubmitted=true&applicationId=${result.applicationID}`
        );
      } else {
        res.status(400).send(result.message || 'Failed to submit application');
      }
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

      // Fetch capabilities, bands, and statuses from the API
      const [capabilities, bands, statuses] = await Promise.all([
        api.getCapabilities(),
        api.getBands(),
        api.getStatuses(),
      ]);

      res.render('job-roles/new', {
        title: 'Add New Job Role',
        locationOptions,
        capabilities,
        bands,
        statuses,
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
        !jobRoleData.capabilityId ||
        !jobRoleData.bandId ||
        !jobRoleData.closingDate
      ) {
        res
          .status(400)
          .send(
            'Missing required fields: name, location, capabilityId, bandId, and closingDate are required'
          );
        return;
      }

      // Parse IDs
      const capabilityId = parseInt(jobRoleData.capabilityId, 10);
      const bandId = parseInt(jobRoleData.bandId, 10);
      const statusId = jobRoleData.statusId ? parseInt(jobRoleData.statusId, 10) : undefined;

      if (Number.isNaN(capabilityId) || Number.isNaN(bandId)) {
        res.status(400).send('Invalid capability or band ID');
        return;
      }

      if (statusId !== undefined && Number.isNaN(statusId)) {
        res.status(400).send('Invalid status ID');
        return;
      }

      // Parse openPositions if provided
      let openPositions: number | undefined;
      if (jobRoleData.openPositions) {
        openPositions = parseInt(jobRoleData.openPositions, 10);
        if (Number.isNaN(openPositions) || openPositions < 1) {
          res.status(400).send('Open positions must be a positive number');
          return;
        }
      }

      // Create the job role
      const newJobRole = await this.jobRoleService.createJobRole({
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capabilityId,
        bandId,
        closingDate: new Date(jobRoleData.closingDate),
        description: jobRoleData.description?.trim() || undefined,
        responsibilities: jobRoleData.responsibilities?.trim() || undefined,
        jobSpecUrl: jobRoleData.jobSpecUrl?.trim() || undefined,
        openPositions,
        ...(statusId && { statusId }),
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

      // Fetch capabilities, bands, and statuses from the API
      const [capabilities, bands, statuses] = await Promise.all([
        api.getCapabilities(),
        api.getBands(),
        api.getStatuses(),
      ]);

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
        capabilities,
        bands,
        statuses,
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
        !jobRoleData.capabilityId ||
        !jobRoleData.bandId ||
        !jobRoleData.closingDate
      ) {
        res
          .status(400)
          .send(
            'Missing required fields: name, location, capabilityId, bandId, and closingDate are required'
          );
        return;
      }

      // Parse IDs
      const capabilityId = parseInt(jobRoleData.capabilityId, 10);
      const bandId = parseInt(jobRoleData.bandId, 10);

      if (Number.isNaN(capabilityId) || Number.isNaN(bandId)) {
        res.status(400).send('Invalid capability or band ID');
        return;
      }

      // Build update object
      const updateData = {
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capabilityId,
        bandId,
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
