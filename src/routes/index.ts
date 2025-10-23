import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics-controller.js';
import { HomeController } from '../controllers/index.js';
import { JobRoleController } from '../controllers/job-role-controller.js';
import { requireAdmin } from '../middleware/require-admin.js';
import { requireAuth } from '../middleware/require-auth.js';
import { jobRoleService } from '../services/job-role-service.js';
import { JobApplicationValidator } from '../validators/index.js';
import { authRoutes } from './auth-routes.js';

const router = Router();

const applicationValidator = new JobApplicationValidator();
const jobRoleController = new JobRoleController(jobRoleService, applicationValidator);
const analyticsController = new AnalyticsController();

/**
 * Home Routes
 */
router.get('/', HomeController.index);
router.get('/daisyui-test', HomeController.daisyuiTest);

/**
 * Analytics Routes (Admin Only)
 */
router.get(
  '/analytics',
  requireAdmin,
  analyticsController.getAnalyticsDashboard.bind(analyticsController)
);

/**
 * Authentication Routes
 */
router.use('/auth', authRoutes);

/**
 * User Application Routes
 */
router.get(
  '/my-applications',
  requireAuth,
  jobRoleController.getMyApplications.bind(jobRoleController)
);

/**
 * Job Role Routes
 * Note: Specific routes (like /jobs/new, /jobs/report) must come BEFORE parameterized routes (like /jobs/:id)
 */
// List all jobs
router.get('/jobs', jobRoleController.getAllJobRoles.bind(jobRoleController));

// Special routes that don't use :id parameter - MUST come before /jobs/:id routes
router.get(
  '/jobs/report',
  requireAdmin,
  jobRoleController.generateJobRolesReport.bind(jobRoleController)
);
router.get('/jobs/new', requireAdmin, jobRoleController.showNewJobRoleForm.bind(jobRoleController));
router.post('/jobs/new', requireAdmin, jobRoleController.createJobRole.bind(jobRoleController));

// Parameterized routes - these use :id so they should come after specific routes
router.get(
  '/jobs/:id/edit',
  requireAdmin,
  jobRoleController.showEditJobRoleForm.bind(jobRoleController)
);
router.post(
  '/jobs/:id/edit',
  requireAdmin,
  jobRoleController.updateJobRole.bind(jobRoleController)
);
router.get('/jobs/:id/details', jobRoleController.getJobRoleDetails.bind(jobRoleController));
router.get(
  '/jobs/:id/apply',
  requireAuth,
  jobRoleController.getJobRoleApplication.bind(jobRoleController)
);
router.post(
  '/jobs/:id/apply',
  requireAuth,
  jobRoleController.submitJobRoleApplication.bind(jobRoleController)
);
router.post(
  '/jobs/:id/delete',
  requireAdmin,
  jobRoleController.deleteJobRole.bind(jobRoleController)
);
router.delete('/jobs/:id', requireAdmin, jobRoleController.deleteJobRole.bind(jobRoleController));

// Admin application management routes
router.post(
  '/jobs/:id/hire/:applicationId',
  requireAdmin,
  jobRoleController.hireApplicant.bind(jobRoleController)
);
router.post(
  '/jobs/:id/reject/:applicationId',
  requireAdmin,
  jobRoleController.rejectApplicant.bind(jobRoleController)
);

// Generic job by ID - MUST be last as it's the most general pattern
router.get('/jobs/:id', jobRoleController.getJobRoleById.bind(jobRoleController));

export default router;
