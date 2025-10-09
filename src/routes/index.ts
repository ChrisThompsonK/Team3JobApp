import { Router } from 'express';
import { HealthController, HomeController } from '../controllers/index.js';
import { JobRoleController } from '../controllers/job-role-controller.js';
import { jobRoleService } from '../services/job-role-service.js';
import { JobApplicationValidator } from '../validators/index.js';

const router = Router();

const applicationValidator = new JobApplicationValidator();
const jobRoleController = new JobRoleController(jobRoleService, applicationValidator);
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
 * Note: Specific routes (like /jobs/job, /jobs/report) must come BEFORE parameterized routes (like /jobs/:id)
 */
// List all jobs
router.get('/jobs', jobRoleController.getAllJobRoles.bind(jobRoleController));

// Special routes that don't use :id parameter - MUST come before /jobs/:id routes
router.get('/jobs/report', jobRoleController.generateJobRolesReport.bind(jobRoleController));
router.get('/jobs/job', jobRoleController.showNewJobRoleForm.bind(jobRoleController));
router.post('/jobs/job', jobRoleController.createJobRole.bind(jobRoleController));

// Parameterized routes - these use :id so they should come after specific routes
router.get('/jobs/:id/edit', jobRoleController.showEditJobRoleForm.bind(jobRoleController));
router.post('/jobs/:id/edit', jobRoleController.updateJobRole.bind(jobRoleController));
router.get('/jobs/:id/details', jobRoleController.getJobRoleDetails.bind(jobRoleController));
router.get('/jobs/:id/apply', jobRoleController.getJobRoleApplication.bind(jobRoleController));
router.post('/jobs/:id/apply', jobRoleController.submitJobRoleApplication.bind(jobRoleController));
router.post('/jobs/:id/delete', jobRoleController.deleteJobRole.bind(jobRoleController));
router.delete('/jobs/:id', jobRoleController.deleteJobRole.bind(jobRoleController));

// Generic job by ID - MUST be last as it's the most general pattern
router.get('/jobs/:id', jobRoleController.getJobRoleById.bind(jobRoleController));

export default router;
