import { Router } from 'express';
import { patientController } from '../controllers/patientController';

const router = Router();

// GET /api/patients
router.get('/', (req, res) => patientController.getPatients(req, res));

// GET /api/patients/:id
router.get('/:id', (req, res) => patientController.getPatientById(req, res));

// POST /api/patients
router.post('/', (req, res) => patientController.createPatient(req, res));

export default router;
