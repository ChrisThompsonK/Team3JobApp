import { Router } from 'express';
import { HealthController, HomeController } from '../controllers/index.js';
import { jobRoleController } from '../controllers/job-role-controller.js';

const router = Router();

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
router.get('/jobs/:id', jobRoleController.getJobRoleById.bind(jobRoleController));

export default router;
