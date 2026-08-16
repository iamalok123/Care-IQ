import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { insurancePolicySchema } from '../schemas/zodSchemas';
import { DataStatus, VerificationStatus, ConfidenceLevel } from '../types/domain';

const router = Router();

// GET /api/policies
router.get('/', (req: Request, res: Response) => {
  const patientId = req.query.patient_id as string | undefined;
  const policies = patientId
    ? dataRepository.getPoliciesByPatientId(patientId)
    : dataRepository.getPolicies();

  res.json({
    success: true,
    data: policies,
    meta: { total: policies.length }
  });
});

// GET /api/policies/:id
router.get('/:id', (req: Request, res: Response) => {
  const policy = dataRepository.getPolicyById(req.params.id as string);
  if (!policy) {
    return res.status(404).json({
      success: false,
      error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' }
    });
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
});

// POST /api/policies
router.post('/', (req: Request, res: Response) => {
  const parsed = insurancePolicySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map((i) => i.message).join(', ') }
    });
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
});

export default router;
