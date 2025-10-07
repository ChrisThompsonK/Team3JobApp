import { Router } from 'express';
import { HealthController, HomeController } from '../controllers/index.js';
import { JobRoleController } from '../controllers/job-role-controller.js';
import { jobRoleService } from '../services/job-role-service.js';

const router = Router();

const jobRoleController = new JobRoleController(jobRoleService);
/**
 * Home Routes
 */
router.get('/', HomeController.index);
router.get('/daisyui-test', HomeController.daisyuiTest);

/**
 * Health Routes
 */
router.get('/health', HealthController.index);

/**
 * Job Role Routes
 */
router.get('/jobs', jobRoleController.getAllJobRoles.bind(jobRoleController));
router.get('/jobs/new', jobRoleController.showNewJobRoleForm.bind(jobRoleController));
router.post('/jobs/new', jobRoleController.createJobRole.bind(jobRoleController));
router.get('/jobs/:id/edit', jobRoleController.showEditJobRoleForm.bind(jobRoleController));
router.post('/jobs/:id/edit', jobRoleController.updateJobRole.bind(jobRoleController));
router.get('/jobs/:id/details', jobRoleController.getJobRoleDetails.bind(jobRoleController));
router.get('/jobs/:id/apply', jobRoleController.getJobRoleApplication.bind(jobRoleController));
router.delete('/jobs/:id', jobRoleController.deleteJobRole.bind(jobRoleController));
router.post('/jobs/:id/delete', jobRoleController.deleteJobRole.bind(jobRoleController));
router.get('/jobs/:id', jobRoleController.getJobRoleById.bind(jobRoleController));

export default router;
