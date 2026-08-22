import { Router } from 'express';
import { authController } from '../controllers/authController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register - Register Supabase auth user + patient profile + policy
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login - Authenticate with email and password
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/logout - Invalidate Supabase session
router.post('/logout', (req, res) => authController.logout(req, res));

// GET /api/auth/me - Retrieve authenticated patient profile
router.get('/me', optionalAuth, (req, res) => authController.getMe(req, res));

// POST /api/auth/demo-login - Instant guest login to curated demo profiles
router.post('/demo-login', (req, res) => authController.demoLogin(req, res));

export default router;
