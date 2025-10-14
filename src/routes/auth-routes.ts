import { Router } from 'express';
import { authController } from '../controllers/auth-controller.js';
import { requireAuth } from '../middleware/require-auth.js';

const router = Router();

// Authentication routes
router.get('/login', authController.showLogin);
router.post('/login', authController.processLogin);

router.get('/register', authController.showRegister);
router.post('/register', authController.processRegister);

router.post('/logout', authController.processLogout);

// API routes
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', requireAuth, authController.showProfile);

export { router as authRoutes };
