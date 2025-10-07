import type { Request, Response } from 'express';
import type { NewJobRole } from '../models/job-roles.js';
import type { JobRoleService } from '../services/job-role-service.js';

export class JobRoleController {
  constructor(private readonly jobRoleService: JobRoleService) {}

  async getAllJobRoles(req: Request, res: Response): Promise<void> {
    try {
      const allJobRoles = await this.jobRoleService.getAllJobRoles();
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
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      const jobRole = await this.jobRoleService.getJobRoleById(id);

      if (!jobRole) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      res.render('job-roles/detail', {
        title: jobRole.name,
        jobRole,
      });
    } catch (error) {
      console.error('Error fetching job role:', error);
      res.status(500).send('Error loading job role details');
    }
  }

  async getJobRoleDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      const jobRoleDetails = await this.jobRoleService.getJobRoleDetailsById(id);

      if (!jobRoleDetails) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      res.render('job-roles/detail', {
        title: `${jobRoleDetails.name} - Job Details`,
        jobRole: jobRoleDetails,
      });
    } catch (error) {
      console.error('Error fetching job role details:', error);
      res.status(500).send('Error loading job role details');
    }
  }

  async getJobRoleApplication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).send('Job role ID is required');
        return;
      }

      const jobRoleDetails = await this.jobRoleService.getJobRoleDetailsById(id);

      if (!jobRoleDetails) {
        res.status(404).send(`Job role with ID ${id} not found`);
        return;
      }

      // For now, redirect to the existing detail page
      // You can create a separate application form view later
      res.render('job-roles/detail', {
        title: `Apply for ${jobRoleDetails.name}`,
        jobRole: jobRoleDetails,
        isApplicationPage: true,
      });
    } catch (error) {
      console.error('Error fetching job role for application:', error);
      res.status(500).send('Error loading job application page');
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
