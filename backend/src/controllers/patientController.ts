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

  // PUT /api/patients/:id
  public updatePatient(req: Request, res: Response): void {
    const patientId = req.params.id as string;
    const patient = dataRepository.getPatientById(patientId);
    if (!patient) {
      res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'Patient profile not found.' }
      });
      return;
    }

    // Authorization check if authenticated
    if (req.user && req.user.account_type !== 'DEMO') {
      const isOwner =
        req.user.id === patient.id ||
        req.user.auth_user_id === patient.auth_user_id ||
        req.user.auth_user_id === patient.user_id ||
        (req.user.email && req.user.email === patient.email);

      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not authorized to update this patient profile.' }
        });
        return;
      }
    }

    const parsed = patientSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
      return;
    }

    const updated = dataRepository.updatePatient(patientId, parsed.data);
    res.json({
      success: true,
      message: 'Patient profile updated successfully.',
      data: updated
    });
  }

  // DELETE /api/patients/:id
  public deletePatient(req: Request, res: Response): void {
    const patientId = req.params.id as string;
    const patient = dataRepository.getPatientById(patientId);
    if (!patient) {
      res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'Patient profile not found.' }
      });
      return;
    }

    // Protect demo profiles from deletion
    if (patient.account_type === 'DEMO') {
      res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_DEMO', message: 'Curated demo profiles cannot be deleted.' }
      });
      return;
    }

    // Authorization check if authenticated
    if (req.user && req.user.account_type !== 'DEMO') {
      const isOwner =
        req.user.id === patient.id ||
        req.user.auth_user_id === patient.auth_user_id ||
        req.user.auth_user_id === patient.user_id ||
        (req.user.email && req.user.email === patient.email);

      if (!isOwner) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not authorized to delete this patient profile.' }
        });
        return;
      }
    }

    const deleted = dataRepository.deletePatient(patientId);
    if (deleted) {
      res.json({
        success: true,
        message: 'Patient profile deleted successfully.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_FAILED', message: 'Failed to delete patient profile.' }
      });
    }
  }
}

export const patientController = new PatientController();
