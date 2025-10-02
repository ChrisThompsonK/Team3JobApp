import { Router } from "express";
import { config } from "../config/index.js";
import {
	DemoController,
	HealthController,
	HomeController,
} from "../controllers/index.js";
import { JobRoleController } from "../controllers/job-role-controller.js";
import { jobRoleService } from "../services/job-role-service.js";

const router = Router();

const jobRoleController = new JobRoleController(jobRoleService);

/**
 * Home Routes
 */
router.get("/", HomeController.index);
router.get("/daisyui-test", HomeController.daisyuiTest);

/**
 * Health Routes
 */
router.get("/health", HealthController.index);
router.get("/api/health", HealthController.api);

/**
 * Job Role Routes
 */
router.get("/jobs", jobRoleController.getAllJobRoles.bind(jobRoleController));
router.get(
	"/jobs/:id",
	jobRoleController.getJobRoleById.bind(jobRoleController),
);

/**
 * Demo Routes (Development only)
 */
if (config.env.isDevelopment || config.env.nodeEnv === "development") {
	router.get("/demo/400", DemoController.badRequest);
	router.get("/demo/401", DemoController.unauthorized);
	router.get("/demo/403", DemoController.forbidden);
	router.get("/demo/500", DemoController.serverError);
	router.get("/demo/503", DemoController.serviceUnavailable);
}

export default router;
