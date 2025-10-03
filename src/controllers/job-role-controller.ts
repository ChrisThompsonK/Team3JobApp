import type { Request, Response } from 'express';
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

      res.render('job-roles/list', {
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
      const {
        name,
        location,
        capability,
        band,
        closingDate,
        description,
        responsibilities,
        jobSpecUrl,
        openPositions,
      } = req.body;

      // Validate required fields
      if (!name || !location || !capability || !band || !closingDate) {
        res
          .status(400)
          .send(
            'Missing required fields: name, location, capability, band, and closingDate are required'
          );
        return;
      }

      // Create the job role
      const newJobRole = await this.jobRoleService.createJobRole({
        name: name.trim(),
        location,
        capability,
        band,
        closingDate: new Date(closingDate),
        description: description?.trim() || undefined,
        responsibilities: responsibilities?.trim() || undefined,
        jobSpecUrl: jobSpecUrl?.trim() || undefined,
        openPositions: openPositions ? parseInt(openPositions, 10) : undefined,
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
}
