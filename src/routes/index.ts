import { Router } from 'express';
import { HealthController, HomeController } from '../controllers/index.js';

const router = Router();

/**
 * Home Routes
 */
router.get('/', HomeController.index);

/**
 * Health Routes
 */
router.get('/health', HealthController.index);
router.get('/api/health', HealthController.api);

export default router;
