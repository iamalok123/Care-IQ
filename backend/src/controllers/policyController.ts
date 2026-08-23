import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { supabaseRepository } from '../services/supabaseRepository';
import { enrichPolicies, enrichPolicy } from '../services/enrichmentService';
import { isSupabaseConfigured } from '../config/supabase';
import { insurancePolicySchema } from '../schemas/zodSchemas';
import { DataStatus, VerificationStatus, ConfidenceLevel, InsurancePolicy } from '../types/domain';

export class PolicyController {
  // GET /api/policies
  public async getPolicies(req: Request, res: Response): Promise<void> {
    const scopedPatientId =
      (req.query.patient_id as string | undefined) ||
      req.user?.patient?.id ||
      req.user?.id;
    let policies = scopedPatientId
      ? dataRepository.getPoliciesByPatientId(scopedPatientId)
      : dataRepository.getPolicies();

    if (isSupabaseConfigured) {
      try {
        policies = await supabaseRepository.fetchPolicies(scopedPatientId);
      } catch (err) {
        console.warn('Policy list Supabase fetch failed, using in-memory cache:', err);
      }
    }

    const enriched = enrichPolicies(policies);

    res.json({
      success: true,
      data: enriched,
      meta: { total: enriched.length }
    });
  }

  // GET /api/policies/:id
  public async getPolicyById(req: Request, res: Response): Promise<void> {
    let policy = dataRepository.getPolicyById(req.params.id as string);
    if (!policy && isSupabaseConfigured) {
      policy = (await supabaseRepository.fetchPolicyById(req.params.id as string)) || undefined;
      if (policy) dataRepository.addPolicy(policy);
    }
    if (!policy) {
      res.status(404).json({
        success: false,
        error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' }
      });
      return;
    }
    if (req.user?.patient && policy.patient_id !== req.user.patient.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to view this insurance policy.' }
      });
      return;
    }

    const rules = dataRepository.getRulesForPolicy(policy.id);
    const exclusions = dataRepository.getExclusionsForPolicy(policy.id);

    res.json({
      success: true,
      data: {
        ...enrichPolicy(policy),
        rules,
        exclusions
      }
    });
  }

  // POST /api/policies
  public async createPolicy(req: Request, res: Response): Promise<void> {
    const parsed = insurancePolicySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
      });
      return;
    }

    const patientId =
      parsed.data.patient_id ||
      req.user?.patient?.id ||
      req.user?.id ||
      dataRepository.getPatients()[0]?.id ||
      'pat-default-user';

    const newPolicy: InsurancePolicy = {
      ...parsed.data,
      id: parsed.data.id || `pol-${Date.now()}`,
      patient_id: patientId,
      data_status: parsed.data.data_status || DataStatus.USER_PROVIDED,
      verification_status: parsed.data.verification_status || VerificationStatus.VERIFIED,
      confidence: parsed.data.confidence || ConfidenceLevel.HIGH,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataRepository.addPolicy(newPolicy);

    if (isSupabaseConfigured) {
      try {
        await supabaseRepository.insertPolicy(newPolicy);
      } catch (err: any) {
        console.warn('Policy persistence to Supabase notice:', err?.message || err);
      }
    }

    res.status(201).json({
      success: true,
      data: enrichPolicy(newPolicy)
    });
  }

  // PUT /api/policies/:id
  public async updatePolicy(req: Request, res: Response): Promise<void> {
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
    if (isSupabaseConfigured) {
      try {
        await supabaseRepository.updatePolicy(policyId, parsed.data);
      } catch (err: any) {
        console.warn('Policy update to Supabase notice:', err?.message || err);
      }
    }

    res.json({
      success: true,
      message: 'Insurance policy updated successfully.',
      data: enrichPolicy(updated)
    });
  }

  // DELETE /api/policies/:id
  public async deletePolicy(req: Request, res: Response): Promise<void> {
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
    if (isSupabaseConfigured) {
      try {
        await supabaseRepository.deletePolicy(policyId);
      } catch (err: any) {
        console.warn('Policy delete from Supabase notice:', err?.message || err);
      }
    }

    res.json({
      success: true,
      message: 'Insurance policy deleted successfully.',
      data: { id: policyId, deleted }
    });
  }
}

export const policyController = new PolicyController();
