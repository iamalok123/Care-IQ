import { Router, Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { costEngine } from '../services/costEngine';
import { RoomCategoryCode } from '../types/domain';

const router = Router();

// POST /api/cost/estimate
router.post('/estimate', (req: Request, res: Response) => {
  const { policy_id, hospital_id, procedure_id, preferred_room_category, selected_tariff } = req.body;

  const policy = policy_id ? dataRepository.getPolicyById(policy_id) : undefined;
  if (!policy) {
    return res.status(400).json({
      success: false,
      error: { code: 'POLICY_REQUIRED', message: 'A valid policy_id is required to calculate insurance-aware estimate' }
    });
  }

  const effectiveHospitalId = hospital_id || 'hosp-manipal-old-airport';
  const effectiveProcedureId = procedure_id || 'proc-knee-replacement';

  const procCost = dataRepository.getProcedureCost(effectiveHospitalId, effectiveProcedureId);
  if (!procCost) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROCEDURE_COST_NOT_FOUND', message: 'No cost data found for this procedure and hospital' }
    });
  }

  const components = dataRepository.getCostComponents(procCost.id);
  const roomCategory = (preferred_room_category as RoomCategoryCode) || policy.room_eligibility;

  const estimate = costEngine.calculateEstimate(
    policy,
    procCost,
    components,
    roomCategory,
    6500,
    selected_tariff || 6500
  );

  res.json({
    success: true,
    data: estimate
  });
});

export default router;
