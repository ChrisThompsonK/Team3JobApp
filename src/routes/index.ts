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
router.get('/job-roles', jobRoleController.getAllJobRoles.bind(jobRoleController));
router.get('/job-roles/:id/details', jobRoleController.getJobRoleDetails.bind(jobRoleController));
router.get('/job-roles/:id/apply', jobRoleController.getJobRoleApplication.bind(jobRoleController));
router.get('/job-roles/:id', jobRoleController.getJobRoleById.bind(jobRoleController));

export default router;
