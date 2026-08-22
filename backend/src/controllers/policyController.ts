import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { insurancePolicySchema } from '../schemas/zodSchemas';
import { DataStatus, VerificationStatus, ConfidenceLevel } from '../types/domain';

export class PolicyController {
  // GET /api/policies
  public getPolicies(req: Request, res: Response): void {
    const patientId = req.query.patient_id as string | undefined;
    const policies = patientId
      ? dataRepository.getPoliciesByPatientId(patientId)
      : dataRepository.getPolicies();

    res.json({
      success: true,
      data: policies,
      meta: { total: policies.length }
    });
  }

  // GET /api/policies/:id
  public getPolicyById(req: Request, res: Response): void {
    const policy = dataRepository.getPolicyById(req.params.id as string);
    if (!policy) {
      res.status(404).json({
        success: false,
        error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' }
      });
      return;
    }

    const rules = dataRepository.getRulesForPolicy(policy.id);
    const exclusions = dataRepository.getExclusionsForPolicy(policy.id);

    res.json({
      success: true,
      data: {
        ...policy,
        rules,
        exclusions
      }
    });
  }

  // POST /api/policies
  public createPolicy(req: Request, res: Response): void {
    const parsed = insurancePolicySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
      });
      return;
    }

    const newPolicy = {
      ...parsed.data,
      id: parsed.data.id || `pol-${Date.now()}`,
      data_status: parsed.data.data_status || DataStatus.USER_PROVIDED,
      verification_status: parsed.data.verification_status || VerificationStatus.UNVERIFIED,
      confidence: parsed.data.confidence || ConfidenceLevel.HIGH,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataRepository.addPolicy(newPolicy);

    res.status(201).json({
      success: true,
      data: newPolicy
    });
  }

  // PUT /api/policies/:id
  public updatePolicy(req: Request, res: Response): void {
    const policyId = req.params.id as string;
    const policy = dataRepository.getPolicyById(policyId);
    if (!policy) {
      res.status(404).json({
        success: false,
        error: { code: 'POLICY_NOT_FOUND', message: 'Insurance policy not found.' }
      });
      return;
    }

    const parsed = insurancePolicySchema.partial().safeParse(req.body);
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

    const updated = dataRepository.updatePolicy(policyId, parsed.data);
    res.json({
      success: true,
      message: 'Insurance policy updated successfully.',
      data: updated
    });
  }

  // DELETE /api/policies/:id
  public deletePolicy(req: Request, res: Response): void {
    const policyId = req.params.id as string;
    const policy = dataRepository.getPolicyById(policyId);
    if (!policy) {
      res.status(404).json({
        success: false,
        error: { code: 'POLICY_NOT_FOUND', message: 'Insurance policy not found.' }
      });
      return;
    }

    const deleted = dataRepository.deletePolicy(policyId);
    if (deleted) {
      res.json({
        success: true,
        message: 'Insurance policy deleted successfully.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'DELETE_FAILED', message: 'Failed to delete insurance policy.' }
      });
    }
  }
}

export const policyController = new PolicyController();
