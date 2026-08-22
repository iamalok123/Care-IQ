import { Router } from 'express';
import { policyController } from '../controllers/policyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// GET /api/policies
router.get('/', (req, res) => policyController.getPolicies(req, res));

// GET /api/policies/:id
router.get('/:id', (req, res) => policyController.getPolicyById(req, res));

// POST /api/policies
router.post('/', (req, res) => policyController.createPolicy(req, res));

// PUT /api/policies/:id - Update policy (Auth-protected)
router.put('/:id', requireAuth, (req, res) => policyController.updatePolicy(req, res));

// DELETE /api/policies/:id - Delete policy (Auth-protected)
router.delete('/:id', requireAuth, (req, res) => policyController.deletePolicy(req, res));

export default router;
