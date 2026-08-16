import { Router } from 'express';
import { costController } from '../controllers/costController';

const router = Router();

// POST /api/cost/estimate
router.post('/estimate', (req, res) => costController.estimate(req, res));

export default router;
