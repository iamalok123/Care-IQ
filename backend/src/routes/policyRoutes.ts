import { Router } from 'express';
import { policyController } from '../controllers/policyController';

const router = Router();

// GET /api/policies
router.get('/', (req, res) => policyController.getPolicies(req, res));

// GET /api/policies/:id
router.get('/:id', (req, res) => policyController.getPolicyById(req, res));

// POST /api/policies
router.post('/', (req, res) => policyController.createPolicy(req, res));

export default router;
