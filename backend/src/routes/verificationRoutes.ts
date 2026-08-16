import { Router } from 'express';
import { verificationController } from '../controllers/verificationController';

const router = Router();

// GET /api/verification-items
router.get('/', (req, res) => verificationController.getVerificationItems(req, res));

// POST /api/verification-items/:id/resolve
router.post('/:id/resolve', (req, res) => verificationController.resolveVerificationItem(req, res));

// POST /api/verification-items
router.post('/', (req, res) => verificationController.createVerificationItem(req, res));

export default router;
