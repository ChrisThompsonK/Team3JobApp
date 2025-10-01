import type { Request, Response } from 'express';
import { jobRoleService } from '../services/job-role-service.js';

export class JobRoleController {
  async getAllJobRoles(_req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getAllJobRoles();

      res.render('job-roles/list', {
        title: 'Available Job Roles',
        jobRoles,
        totalCount: jobRoles.length,
      });
    } catch (error) {
      console.error('Error fetching job roles:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load job roles',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }

  async getJobRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).render('error', {
          title: 'Bad Request',
          message: 'Job role ID is required',
        });
        return;
      }

      const jobRole = await jobRoleService.getJobRoleById(id);

      if (!jobRole) {
        res.status(404).render('error', {
          title: 'Job Role Not Found',
          message: `Job role with ID ${id} not found`,
        });
        return;
      }

      res.render('job-roles/detail', {
        title: `${jobRole.name} - Job Role Details`,
        jobRole,
      });
    } catch (error) {
      console.error('Error fetching job role:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load job role details',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }

  async getJobRolesByCapability(req: Request, res: Response): Promise<void> {
    try {
      const { capability } = req.params;

      if (!capability) {
        res.status(400).render('error', {
          title: 'Bad Request',
          message: 'Capability parameter is required',
        });
        return;
      }

      const jobRoles = await jobRoleService.getJobRolesByCapability(capability);

      res.render('job-roles/list', {
        title: `${capability} Job Roles`,
        jobRoles,
        totalCount: jobRoles.length,
        filterType: 'capability',
        filterValue: capability,
      });
    } catch (error) {
      console.error('Error fetching job roles by capability:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load job roles',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }

  async getJobRolesByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;

      if (!location) {
        res.status(400).render('error', {
          title: 'Bad Request',
          message: 'Location parameter is required',
        });
        return;
      }

      const jobRoles = await jobRoleService.getJobRolesByLocation(location);

      res.render('job-roles/list', {
        title: `${location} Job Roles`,
        jobRoles,
        totalCount: jobRoles.length,
        filterType: 'location',
        filterValue: location,
      });
    } catch (error) {
      console.error('Error fetching job roles by location:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load job roles',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }

  async getJobRolesByBand(req: Request, res: Response): Promise<void> {
    try {
      const { band } = req.params;

      if (!band) {
        res.status(400).render('error', {
          title: 'Bad Request',
          message: 'Band parameter is required',
        });
        return;
      }

      const jobRoles = await jobRoleService.getJobRolesByBand(band);

      res.render('job-roles/list', {
        title: `${band} Job Roles`,
        jobRoles,
        totalCount: jobRoles.length,
        filterType: 'band',
        filterValue: band,
      });
    } catch (error) {
      console.error('Error fetching job roles by band:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load job roles',
        error: process.env['NODE_ENV'] === 'development' ? error : {},
      });
    }
  }
}

// Export singleton instance
export const jobRoleController = new JobRoleController();
