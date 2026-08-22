import { Router } from 'express';
import { patientController } from '../controllers/patientController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// GET /api/patients
router.get('/', (req, res) => patientController.getPatients(req, res));

// GET /api/patients/:id
router.get('/:id', (req, res) => patientController.getPatientById(req, res));

// POST /api/patients
router.post('/', (req, res) => patientController.createPatient(req, res));

// PUT /api/patients/:id - Update patient profile (Auth-protected)
router.put('/:id', requireAuth, (req, res) => patientController.updatePatient(req, res));

// DELETE /api/patients/:id - Delete patient profile (Auth-protected, NEW_USER only)
router.delete('/:id', requireAuth, (req, res) => patientController.deletePatient(req, res));

export default router;
