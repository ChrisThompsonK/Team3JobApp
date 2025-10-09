import type { Request, Response } from 'express';
import type { NewJobRole } from '../models/job-roles.js';
import type { JobRoleService } from '../services/job-role-service.js';

export class CreateJobRoleController {
  constructor(private readonly jobRoleService: JobRoleService) {}

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
}
