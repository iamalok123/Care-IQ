import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { costEngine } from '../services/costEngine';
import { RoomCategoryCode } from '../types/domain';

export class CostController {
  // POST /api/cost/estimate
  public estimate(req: Request, res: Response): void {
    const { policy_id, hospital_id, procedure_id, preferred_room_category, selected_tariff } = req.body;

    const policy = policy_id ? dataRepository.getPolicyById(policy_id) : undefined;
    if (!policy) {
      res.status(400).json({
        success: false,
        error: { code: 'POLICY_REQUIRED', message: 'A valid policy_id is required to calculate insurance-aware estimate' }
      });
      return;
    }

    const effectiveHospitalId = hospital_id || 'hosp-manipal-old-airport';
    const effectiveProcedureId = procedure_id || 'proc-knee-replacement';

    const procCost = dataRepository.getProcedureCost(effectiveHospitalId, effectiveProcedureId);
    if (!procCost) {
      res.status(404).json({
        success: false,
        error: { code: 'PROCEDURE_COST_NOT_FOUND', message: 'No cost data found for this procedure and hospital' }
      });
      return;
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
  }
}

export const costController = new CostController();
