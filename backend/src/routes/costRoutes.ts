import { Router } from 'express';
import { costController } from '../controllers/costController';

const router = Router();

// POST /api/cost/estimate
router.post('/estimate', (req, res) => costController.estimate(req, res));

// POST /api/cost/what-if and /api/cost/compare
router.post('/what-if', (req, res) => costController.whatIf(req, res));
router.post('/compare', (req, res) => costController.whatIf(req, res));

export default router;

