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
          capabilityFilters.some((cap) => job.capabilityName?.toLowerCase() === cap.toLowerCase())
        );
      }

      if (bandFilters.length > 0) {
        jobRoles = jobRoles.filter((job) =>
          bandFilters.some((b) => job.bandName?.toLowerCase() === b.toLowerCase())
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

      // TODO: In a real application, you would:
      // 1. Upload the CV file to storage
      // 2. Save the application to a database
      // 3. Send confirmation email to applicant
      // 4. Notify HR team

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
      // Fetch dynamic data from the API
      const [capabilities, bands, distinctValues] = await Promise.all([
        api.getCapabilities(),
        api.getBands(),
        api.getDistinctValues(),
      ]);

      // Use locations from existing jobs, or fallback to hardcoded list
      const locationOptions =
        distinctValues.locations.length > 0
          ? distinctValues.locations
          : [
              'Belfast',
              'London',
              'Derry',
              'Birmingham',
              'Dublin',
              'Gdansk',
              'Helsinki',
              'Paris',
              'Wommelgem',
              'Buenos Aires',
              'Indianapolis',
              'Toronto',
              'Nova Scotia',
            ];

      // Use capability and band names from the backend
      const capabilityOptions = capabilities.map((cap) => cap.name);
      const bandOptions = bands.map((band) => band.name);

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

      // Log the received data for debugging
      console.log('Received job role data from form:', JSON.stringify(jobRoleData, null, 2));

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
      const parsedOpenPositions = jobRoleData.openPositions
        ? parseInt(jobRoleData.openPositions, 10)
        : undefined;
      const openPositions =
        parsedOpenPositions && !Number.isNaN(parsedOpenPositions) ? parsedOpenPositions : undefined;

      // Fetch capabilities and bands to map names to IDs
      const [capabilities, bands] = await Promise.all([api.getCapabilities(), api.getBands()]);

      const capability = capabilities.find((c) => c.name === jobRoleData.capability);
      const band = bands.find((b) => b.name === jobRoleData.band);

      if (!capability) {
        res.status(400).send(`Invalid capability: ${jobRoleData.capability}`);
        return;
      }

      if (!band) {
        res.status(400).send(`Invalid band: ${jobRoleData.band}`);
        return;
      }

      const newJobRole = await this.jobRoleService.createJobRole({
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capabilityId: capability.id,
        bandId: band.id,
        closingDate: jobRoleData.closingDate,
        description: jobRoleData.description?.trim() || null,
        responsibilities: jobRoleData.responsibilities?.trim() || null,
        jobSpecUrl: jobRoleData.jobSpecUrl?.trim() || null,
        openPositions,
      });

      // Redirect to the new job role details page
      res.redirect(`/jobs/${newJobRole.id}/details`);
    } catch (error) {
      console.error('Error creating job role:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Check if it's an axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        console.error('API Response Status:', axiosError.response?.status);
        console.error('API Response Data:', JSON.stringify(axiosError.response?.data, null, 2));
      }
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
      // closingDate is already a string in format YYYY-MM-DD from the backend
      const closingDateFormatted = jobRole.closingDate.split('T')[0];

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

      // Fetch capabilities and bands to map names to IDs
      const [capabilities, bands] = await Promise.all([api.getCapabilities(), api.getBands()]);

      const capability = capabilities.find((c) => c.name === jobRoleData.capability);
      const band = bands.find((b) => b.name === jobRoleData.band);

      if (!capability) {
        res.status(400).send(`Invalid capability: ${jobRoleData.capability}`);
        return;
      }

      if (!band) {
        res.status(400).send(`Invalid band: ${jobRoleData.band}`);
        return;
      }

      // Build update object with correct types
      const updateData: {
        name?: string;
        location?: string;
        capabilityId?: number;
        bandId?: number;
        closingDate?: string;
        description?: string | null;
        responsibilities?: string | null;
        jobSpecUrl?: string | null;
        openPositions?: number;
        status?: 'Open' | 'Closing Soon' | 'Closed';
      } = {
        name: jobRoleData.name.trim(),
        location: jobRoleData.location,
        capabilityId: capability.id,
        bandId: band.id,
        closingDate: jobRoleData.closingDate,
      };

      // Add optional fields
      if (jobRoleData.description?.trim()) {
        updateData.description = jobRoleData.description.trim();
      }
      if (jobRoleData.responsibilities?.trim()) {
        updateData.responsibilities = jobRoleData.responsibilities.trim();
      }
      if (jobRoleData.jobSpecUrl?.trim()) {
        updateData.jobSpecUrl = jobRoleData.jobSpecUrl.trim();
      }
      if (jobRoleData.openPositions) {
        updateData.openPositions = parseInt(jobRoleData.openPositions, 10);
      }
      if (req.body.status) {
        updateData.status = req.body.status as 'Open' | 'Closing Soon' | 'Closed';
      }

      // Update the job role
      const updatedJobRole = await this.jobRoleService.updateJobRole(id, updateData);

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
