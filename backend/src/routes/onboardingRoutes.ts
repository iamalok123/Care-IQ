import { Router } from 'express';
import { onboardingController } from '../controllers/onboardingController';

const router = Router();

// GET /api/onboarding/demo-profiles - Retrieve 3 curated demo profiles for guest preview
router.get('/demo-profiles', (req, res) => onboardingController.getDemoProfiles(req, res));

// GET /api/onboarding/insurers - Retrieve list of insurance providers for the onboarding wizard
router.get('/insurers', (req, res) => onboardingController.getInsurers(req, res));

export default router;
