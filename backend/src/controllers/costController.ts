import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { costEngine } from '../services/costEngine';
import { rulesEngine } from '../services/rulesEngine';
import { RoomCategoryCode } from '../types/domain';

export const DEFAULT_ROOM_TARIFFS: Record<RoomCategoryCode, number> = {
  [RoomCategoryCode.GENERAL]: 1800,
  [RoomCategoryCode.SEMI_PRIVATE]: 3500,
  [RoomCategoryCode.PRIVATE_AC]: 6500,
  [RoomCategoryCode.DELUXE]: 11000,
  [RoomCategoryCode.SUITE]: 22000,
  [RoomCategoryCode.ANY_ROOM]: 6500
};

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

  // POST /api/cost/what-if
  public whatIf(req: Request, res: Response): void {
    const {
      policy_id,
      hospital_id,
      procedure_id,
      current_room_category,
      alternative_room_category,
      current_tariff,
      alternative_tariff
    } = req.body;

    const policy = policy_id ? dataRepository.getPolicyById(policy_id) : undefined;
    if (!policy) {
      res.status(400).json({
        success: false,
        error: { code: 'POLICY_REQUIRED', message: 'A valid policy_id is required to calculate what-if simulation' }
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

    const curRoom = (current_room_category as RoomCategoryCode) || policy.room_eligibility || RoomCategoryCode.PRIVATE_AC;
    const altRoom = (alternative_room_category as RoomCategoryCode) || RoomCategoryCode.DELUXE;

    const curTariff = current_tariff || DEFAULT_ROOM_TARIFFS[curRoom] || 6500;
    const altTariff = alternative_tariff || DEFAULT_ROOM_TARIFFS[altRoom] || 11000;
    const eligibleTariff = DEFAULT_ROOM_TARIFFS[policy.room_eligibility] || 6500;

    const currentEstimate = costEngine.calculateEstimate(
      policy,
      procCost,
      components,
      curRoom,
      eligibleTariff,
      curTariff
    );

    const alternativeEstimate = costEngine.calculateEstimate(
      policy,
      procCost,
      components,
      altRoom,
      eligibleTariff,
      altTariff
    );

    const oopDelta = alternativeEstimate.indicativePatientExposure - currentEstimate.indicativePatientExposure;
    const coveredDelta = alternativeEstimate.estimatedCoveredAmount - currentEstimate.estimatedCoveredAmount;
    const nonCoveredDelta = alternativeEstimate.potentialNonCoveredAmount - currentEstimate.potentialNonCoveredAmount;
    const grossDelta = alternativeEstimate.typicalGrossCost - currentEstimate.typicalGrossCost;

    const isRoomUpgrade = altTariff > curTariff;
    const altRoomEval = rulesEngine.evaluateRoomCategory(policy, altRoom, eligibleTariff, altTariff);
    const penaltyApplies = !altRoomEval.isCompatible;
    const penaltyPercent = Math.round((1 - altRoomEval.proportionatePenaltyRatio) * 100);

    let explanation = '';
    if (oopDelta === 0) {
      explanation = `Choosing ${altRoom} has no additional impact on your estimated out-of-pocket exposure under ${policy.policy_name}.`;
    } else if (oopDelta > 0) {
      if (penaltyApplies) {
        explanation = `Upgrading to ${altRoom} (₹${altTariff.toLocaleString()}/day) triggers a ${penaltyPercent}% proportionate deduction across doctor & surgical fees, increasing your out-of-pocket exposure by ₹${oopDelta.toLocaleString()}.`;
      } else {
        explanation = `Selecting ${altRoom} increases your estimated out-of-pocket exposure by ₹${oopDelta.toLocaleString()}.`;
      }
    } else {
      explanation = `Downgrading to ${altRoom} (₹${altTariff.toLocaleString()}/day) reduces your estimated out-of-pocket exposure by ₹${Math.abs(oopDelta).toLocaleString()}.`;
    }

    res.json({
      success: true,
      data: {
        currentEstimate,
        alternativeEstimate,
        delta: {
          oopDelta,
          coveredDelta,
          nonCoveredDelta,
          grossDelta,
          isRoomUpgrade,
          penaltyApplies,
          penaltyPercent,
          percentageOopChange: currentEstimate.indicativePatientExposure > 0
            ? Math.round((oopDelta / currentEstimate.indicativePatientExposure) * 100)
            : 0
        },
        explanation,
        currentRoom: {
          code: curRoom,
          tariff: curTariff,
          eligible: policy.room_eligibility === curRoom || rulesEngine.evaluateRoomCategory(policy, curRoom, eligibleTariff, curTariff).isCompatible
        },
        alternativeRoom: {
          code: altRoom,
          tariff: altTariff,
          eligible: altRoomEval.isCompatible
        }
      }
    });
  }
}

export const costController = new CostController();

