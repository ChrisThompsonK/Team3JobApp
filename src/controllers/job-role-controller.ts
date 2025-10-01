import type { Request, Response } from 'express';
import { jobRoleService } from '../services/job-role-service.js';

export class JobRoleController {
  async getAllJobRoles(_req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getAllJobRoles();
      res.render('job-roles/list', {
        title: 'Available Job Roles',
        jobRoles,
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

      const jobRole = await jobRoleService.getJobRoleById(id);

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
}

export const jobRoleController = new JobRoleController();
