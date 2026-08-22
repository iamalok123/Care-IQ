import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { patientSchema } from '../schemas/zodSchemas';

export class PatientController {
  // GET /api/patients
  public getPatients(_req: Request, res: Response): void {
    const patients = dataRepository.getPatients();
    res.json({
      success: true,
      data: patients,
      meta: { total: patients.length }
    });
  }

  // GET /api/patients/:id
  public getPatientById(req: Request, res: Response): void {
    const patient = dataRepository.getPatientById(req.params.id as string);
    if (!patient) {
      res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' }
      });
      return;
    }
    const policies = dataRepository.getPoliciesByPatientId(req.params.id as string);
    res.json({
      success: true,
      data: { ...patient, policies }
    });
  }

  // POST /api/patients
  public createPatient(req: Request, res: Response): void {
    const parsed = patientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
      });
      return;
    }

    const newPatient = {
      ...parsed.data,
      id: parsed.data.id || `pat-${Date.now()}`,
      user_id: parsed.data.user_id || req.user?.auth_user_id || req.user?.id || `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataRepository.addPatient(newPatient);
    res.status(201).json({
      success: true,
      data: newPatient
    });
  }
}

export const patientController = new PatientController();
