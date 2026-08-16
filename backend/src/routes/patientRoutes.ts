import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { patientSchema } from '../schemas/zodSchemas';

const router = Router();

// GET /api/patients
router.get('/', (req: Request, res: Response) => {
  const patients = dataRepository.getPatients();
  res.json({
    success: true,
    data: patients,
    meta: { total: patients.length }
  });
});

// GET /api/patients/:id
router.get('/:id', (req: Request, res: Response) => {
  const patient = dataRepository.getPatientById(req.params.id as string);
  if (!patient) {
    return res.status(404).json({
      success: false,
      error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' }
    });
  }
  const policies = dataRepository.getPoliciesByPatientId(req.params.id as string);
  res.json({
    success: true,
    data: { ...patient, policies }
  });
});

// POST /api/patients
router.post('/', (req: Request, res: Response) => {
  const parsed = patientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
    });
  }

  const newPatient = {
    ...parsed.data,
    id: parsed.data.id || `pat-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  dataRepository.addPatient(newPatient);
  res.status(201).json({
    success: true,
    data: newPatient
  });
});

export default router;
