import {
  InsurancePolicy,
  ProcedureCost,
  CostComponent,
  RoomCategoryCode,
  CostEstimateResult
} from '../types/domain';
import { rulesEngine } from './rulesEngine';

export class CostEngine {
  public calculateEstimate(
    policy?: InsurancePolicy,
    procedureCost?: ProcedureCost,
    components: CostComponent[] = [],
    selectedRoomCategory: RoomCategoryCode = RoomCategoryCode.PRIVATE_AC,
    eligibleRoomTariff: number = 6500,
    selectedRoomTariff: number = 6500
  ): CostEstimateResult {
    const procCost = procedureCost || {
      id: 'proc-default',
      hospital_id: 'hosp-default',
      procedure_id: 'proc-default',
      typical_cost: 150000,
      min_cost: 100000,
      max_cost: 200000,
      decision_support_only: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Room evaluation
    const roomEval = rulesEngine.evaluateRoomCategory(
      policy,
      selectedRoomCategory,
      eligibleRoomTariff,
      selectedRoomTariff
    );

    // 2. Separate components into covered candidates and non-payable
    let candidateAmount = 0;
    let nonCoveredAmount = 0;

    components.forEach((c) => {
      if (c.coverage_candidate) {
        // If room penalty applies, apply proportionate deduction to clinical/professional fees
        if (
          !roomEval.isCompatible &&
          (c.component_code === 'PROFESSIONAL_FEE' || c.component_code === 'PROCEDURE')
        ) {
          const reduced = Math.round(c.estimated_amount * roomEval.proportionatePenaltyRatio);
          candidateAmount += reduced;
          nonCoveredAmount += c.estimated_amount - reduced;
        } else {
          candidateAmount += c.estimated_amount;
        }
      } else {
        nonCoveredAmount += c.estimated_amount;
      }
    });

    const componentSum = candidateAmount + nonCoveredAmount;
    const typicalGrossCost = componentSum > 0 ? componentSum : procCost.typical_cost;

    if (components.length === 0) {
      // Fallback distribution if no itemized components exist
      nonCoveredAmount = Math.round(typicalGrossCost * 0.1); // ~10% consumables
      candidateAmount = typicalGrossCost - nonCoveredAmount;
    }

    // 3. Deductible application
    const deductibleAmount = Math.min(candidateAmount, policy?.deductible_amount || 0);
    const amountAfterDeductible = Math.max(0, candidateAmount - deductibleAmount);

    // 4. Copay application
    const copayPercentage = policy?.copay_percentage || 0;
    const copayAmount = Math.round(amountAfterDeductible * (copayPercentage / 100));
    const netAdmissibleClaim = amountAfterDeductible - copayAmount;

    // 5. Apply Sum Insured Cap and Gross Cost Cap
    const remainingCover = policy ? (policy.remaining_sum_insured ?? policy.sum_insured) : 0;
    const coveredAmount = policy ? Math.min(netAdmissibleClaim, remainingCover, typicalGrossCost) : 0;

    // 6. Patient exposure = Gross Cost - Insurer Covered
    const indicativePatientExposure = Math.max(0, typicalGrossCost - coveredAmount);

    return {
      procedureName: procCost.procedure_id,
      typicalGrossCost,
      estimatedCoveredAmount: coveredAmount,
      estimatedCopayAmount: copayAmount,
      estimatedDeductibleAmount: deductibleAmount,
      potentialNonCoveredAmount: nonCoveredAmount,
      indicativePatientExposure,
      costComponents: components,
      disclaimer:
        'Indicative decision-support estimate based on configured demo data and declared policy terms. Not an insurance guarantee or official hospital quotation.'
    };
  }
}

export const costEngine = new CostEngine();
