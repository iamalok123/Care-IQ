import { Router } from 'express';
import { hospitalController } from '../controllers/hospitalController';

const router = Router();

// GET /api/hospitals
router.get('/', (req, res) => hospitalController.getHospitals(req, res));

// GET /api/hospitals/:id
router.get('/:id', (req, res) => hospitalController.getHospitalById(req, res));

// POST /api/hospitals/match
router.post('/match', (req, res) => hospitalController.match(req, res));

export default router;
