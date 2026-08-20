import { Router } from 'express';
import { costController } from '../controllers/costController';

const router = Router();

// POST /api/cost/estimate
router.post('/estimate', (req, res) => costController.estimate(req, res));

// POST /api/cost/what-if
router.post('/what-if', (req, res) => costController.whatIf(req, res));

export default router;

