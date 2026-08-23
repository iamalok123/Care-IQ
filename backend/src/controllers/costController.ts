import { Request, Response } from 'express';
import { dataRepository } from '../services/dataRepository';
import { costEngine } from '../services/costEngine';
import { rulesEngine } from '../services/rulesEngine';
import { getEligibleRoomTariff, getPublishedRoomTariffs, getRoomTariff } from '../services/tariffService';
import {
  RoomCategoryCode,
  ProcedureCost,
  CostComponent,
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  type InsurancePolicy
} from '../types/domain';

/**
 * Where the numbers behind an estimate came from. The frontend must show this:
 * a figure taken from a hospital's published price list and a figure modelled
 * from a national package rate are not the same claim, and the patient is
 * entitled to know which one they are looking at.
 */
export interface CostProvenance {
  procedure_cost_source: 'HOSPITAL_PRICE_LIST' | 'PEER_HOSPITAL_PRICE_LIST' | 'MODELLED_PACKAGE_RATE';
  components_source: 'HOSPITAL_ITEMISED' | 'MODELLED_SPLIT';
  room_tariff_source: 'HOSPITAL_TARIFF_CARD';
  is_estimated: boolean;
  notes: string[];
}

/**
 * Package rates used only when neither this hospital nor any peer has a price
 * on record for the procedure. These are national reference bands, not this
 * hospital's prices, and every response built from them carries
 * is_estimated: true plus a note saying so.
 */
const REFERENCE_PACKAGE_RATES: Record<string, number> = {
  'proc-angiography': 22000,
  'proc-angioplasty': 185000,
  'proc-appendectomy': 95000,
  'proc-cataract-surgery': 45000,
  'proc-dialysis-session': 3500,
  'proc-gallbladder-removal': 120000,
  'proc-knee-replacement': 240000,
  'proc-mri-brain': 12000
};

interface ResolvedCosts {
  procCost: ProcedureCost;
  components: CostComponent[];
  provenance: CostProvenance;
}

export class CostController {
  /**
   * Resolves a procedure's cost and its itemised components, preferring real
   * rows and reporting honestly when it had to model them.
   */
  private resolveProcedureCostAndComponents(
    hospitalId: string,
    procedureId: string
  ): ResolvedCosts {
    const notes: string[] = [];

    // 1. This hospital's own price for this procedure
    const ownCost = dataRepository.getProcedureCost(hospitalId, procedureId);
    const ownComponents = ownCost ? dataRepository.getCostComponents(ownCost.id) : [];

    if (ownCost && ownComponents.length > 0) {
      return {
        procCost: ownCost,
        components: ownComponents,
        provenance: {
          procedure_cost_source: 'HOSPITAL_PRICE_LIST',
          components_source: 'HOSPITAL_ITEMISED',
          room_tariff_source: 'HOSPITAL_TARIFF_CARD',
          is_estimated: false,
          notes
        }
      };
    }

    // 2. This hospital has a headline price but no itemised breakdown
    if (ownCost) {
      notes.push(
        'This hospital publishes a package price but not an itemised bill breakdown. The component split below is modelled on the standard IRDAI billing heads.'
      );
      return {
        procCost: ownCost,
        components: this.modelComponents(ownCost.id, Number(ownCost.typical_cost)),
        provenance: {
          procedure_cost_source: 'HOSPITAL_PRICE_LIST',
          components_source: 'MODELLED_SPLIT',
          room_tariff_source: 'HOSPITAL_TARIFF_CARD',
          is_estimated: true,
          notes
        }
      };
    }

    // 3. No price for this hospital. Use a peer of the same ownership type in
    //    the same city before falling back to a national band — a government
    //    hospital's price is not comparable to a corporate one.
    const hospital = dataRepository.getHospitalById(hospitalId);
    const peers = dataRepository.procedureCosts.filter((pc) => pc.procedure_id === procedureId);
    const peerHospitals = peers.map((pc) => ({
      cost: pc,
      hospital: dataRepository.getHospitalById(pc.hospital_id)
    }));

    const comparablePeer =
      peerHospitals.find(
        (p) =>
          p.hospital?.ownership_type === hospital?.ownership_type &&
          p.hospital?.city === hospital?.city
      ) ||
      peerHospitals.find((p) => p.hospital?.ownership_type === hospital?.ownership_type) ||
      peerHospitals[0];

    const syntheticId = `pc-modelled-${hospitalId}-${procedureId}`;

    if (comparablePeer?.hospital) {
      const peerCost = Number(comparablePeer.cost.typical_cost);
      notes.push(
        `${hospital?.name || 'This hospital'} has not published a price for this procedure. The figure shown is ${comparablePeer.hospital.name}'s published price for the same procedure, used as the closest comparable.`
      );
      return {
        procCost: this.buildProcedureCost(syntheticId, hospitalId, procedureId, peerCost),
        components: this.modelComponents(syntheticId, peerCost),
        provenance: {
          procedure_cost_source: 'PEER_HOSPITAL_PRICE_LIST',
          components_source: 'MODELLED_SPLIT',
          room_tariff_source: 'HOSPITAL_TARIFF_CARD',
          is_estimated: true,
          notes
        }
      };
    }

    // 4. Nothing on record anywhere — national reference band.
    const referenceRate = REFERENCE_PACKAGE_RATES[procedureId];
    const procedureName = dataRepository.procedures.find((p) => p.id === procedureId)?.name;
    // A public hospital charges a fraction of a corporate one; without that
    // adjustment a government-hospital estimate is badly overstated.
    const ownershipFactor = hospital?.ownership_type === 'PUBLIC' ? 0.35 : 1.0;
    const modelledCost = Math.round((referenceRate || 150000) * ownershipFactor);

    notes.push(
      referenceRate
        ? `No hospital on record publishes a price for ${procedureName || 'this procedure'}. The figure shown is a national reference package rate${ownershipFactor < 1 ? ', adjusted for a government facility' : ''} and should be confirmed with the hospital billing desk.`
        : 'No reference price exists for this procedure. The figure shown is a broad surgical average and is indicative only.'
    );

    return {
      procCost: this.buildProcedureCost(syntheticId, hospitalId, procedureId, modelledCost),
      components: this.modelComponents(syntheticId, modelledCost),
      provenance: {
        procedure_cost_source: 'MODELLED_PACKAGE_RATE',
        components_source: 'MODELLED_SPLIT',
        room_tariff_source: 'HOSPITAL_TARIFF_CARD',
        is_estimated: true,
        notes
      }
    };
  }

  private buildProcedureCost(
    id: string,
    hospitalId: string,
    procedureId: string,
    typicalCost: number
  ): ProcedureCost {
    const now = new Date().toISOString();
    return {
      id,
      hospital_id: hospitalId,
      procedure_id: procedureId,
      min_cost: Math.round(typicalCost * 0.85),
      max_cost: Math.round(typicalCost * 1.25),
      typical_cost: typicalCost,
      currency: 'INR',
      data_status: DataStatus.PUBLIC_REFERENCE,
      verification_status: VerificationStatus.UNVERIFIED,
      confidence: ConfidenceLevel.MEDIUM,
      created_at: now,
      updated_at: now
    };
  }

  /** Standard IRDAI billing heads. Used only when a hospital has no itemised bill. */
  private modelComponents(procedureCostId: string, typicalCost: number): CostComponent[] {
    const professional = Math.round(typicalCost * 0.35);
    const procedure = Math.round(typicalCost * 0.25);
    const investigation = Math.round(typicalCost * 0.15);
    const medicine = Math.round(typicalCost * 0.15);
    const nonPayable = Math.max(
      1000,
      typicalCost - (professional + procedure + investigation + medicine)
    );

    const head = (
      suffix: string,
      name: string,
      code: string,
      amount: number,
      candidate: boolean
    ): CostComponent => ({
      id: `cc-${procedureCostId}-${suffix}`,
      procedure_cost_id: procedureCostId,
      component_name: name,
      component_code: code,
      estimated_amount: amount,
      coverage_candidate: candidate,
      data_status: DataStatus.PUBLIC_REFERENCE
    });

    return [
      head('1', 'Surgeon, Anesthetist & Professional Charges', 'PROFESSIONAL_FEE', professional, true),
      head('2', 'Operating Theatre & Equipment Usage', 'PROCEDURE', procedure, true),
      head('3', 'Inpatient Investigations & Pathology', 'INVESTIGATION', investigation, true),
      head('4', 'Admissible Pharmacy & Surgical Medicines', 'MEDICINE', medicine, true),
      head(
        '5',
        'Non-Payable Consumables (PPE, kits, admin charges)',
        'CONSUMABLE_EXCLUDED',
        nonPayable,
        false
      )
    ];
  }

  /**
   * Resolves the policy for a request. There is deliberately no fallback to
   * "the first policy in the database" — quoting one patient's cover to
   * another is worse than returning an error.
   */
  private resolvePolicy(
    policyId: unknown,
    req: Request
  ): { policy?: InsurancePolicy; error?: { status: number; code: string; message: string } } {
    if (typeof policyId !== 'string' || !policyId.trim()) {
      return {
        error: {
          status: 400,
          code: 'POLICY_ID_REQUIRED',
          message: 'policy_id is required. A coverage estimate cannot be produced without knowing which policy applies.'
        }
      };
    }

    const policy = dataRepository.getPolicyById(policyId.trim());
    if (!policy) {
      return {
        error: {
          status: 404,
          code: 'POLICY_NOT_FOUND',
          message: `No insurance policy found with id "${policyId}".`
        }
      };
    }

    // Scope check: an authenticated non-demo patient may only price their own
    // policy. Unassigned reference policies stay open for comparison tooling.
    const requester = req.user?.patient?.id || req.user?.id;
    if (
      req.user &&
      req.user.account_type !== 'DEMO' &&
      policy.patient_id &&
      requester &&
      policy.patient_id !== requester
    ) {
      return {
        error: {
          status: 403,
          code: 'FORBIDDEN',
          message: 'This insurance policy belongs to another patient.'
        }
      };
    }

    return { policy };
  }

  /** Validates hospital + procedure + room selection against real rows. */
  private resolveContext(
    body: Record<string, unknown>,
    policy: InsurancePolicy,
    roomCategoryKey: string
  ):
    | {
        hospitalId: string;
        procedureId: string;
        roomCategory: RoomCategoryCode;
        selectedTariff: number;
        eligibleTariff: number;
      }
    | { error: { status: number; code: string; message: string; details?: unknown } } {
    const hospitalId = typeof body.hospital_id === 'string' ? body.hospital_id.trim() : '';
    const procedureId = typeof body.procedure_id === 'string' ? body.procedure_id.trim() : '';

    if (!hospitalId || !procedureId) {
      return {
        error: {
          status: 400,
          code: 'CONTEXT_REQUIRED',
          message: 'hospital_id and procedure_id are both required. Costs differ by hospital, so neither can be assumed.'
        }
      };
    }

    const hospital = dataRepository.getHospitalById(hospitalId);
    if (!hospital) {
      return {
        error: { status: 404, code: 'HOSPITAL_NOT_FOUND', message: `No hospital found with id "${hospitalId}".` }
      };
    }

    const procedure = dataRepository.procedures.find((p) => p.id === procedureId);
    if (!procedure) {
      return {
        error: { status: 404, code: 'PROCEDURE_NOT_FOUND', message: `No procedure found with id "${procedureId}".` }
      };
    }

    const published = getPublishedRoomTariffs(hospitalId);
    if (published.length === 0) {
      return {
        error: {
          status: 409,
          code: 'ROOM_TARIFFS_NOT_ON_RECORD',
          message: `${hospital.name} has no published room tariffs on record, so room-rent limits cannot be applied.`
        }
      };
    }

    const requestedCode =
      body[roomCategoryKey] ??
      body.preferred_room_category ??
      body.base_room_category ??
      body.current_room_category ??
      body.selected_room_category;
    const eligible = getEligibleRoomTariff(hospitalId, policy.room_eligibility);
    if (!eligible) {
      return {
        error: {
          status: 409,
          code: 'ELIGIBLE_ROOM_NOT_ON_RECORD',
          message: `${hospital.name} publishes no room matching this policy's ${policy.room_eligibility} entitlement.`
        }
      };
    }

    // Default to what the policy entitles the patient to at this hospital,
    // rather than assuming a private AC room.
    const roomCategory =
      typeof requestedCode === 'string' && requestedCode
        ? (requestedCode as RoomCategoryCode)
        : eligible.code;

    const selected = getRoomTariff(hospitalId, roomCategory);
    if (!selected) {
      return {
        error: {
          status: 409,
          code: 'ROOM_TARIFF_NOT_ON_RECORD',
          message: `${hospital.name} does not publish a ${roomCategory} room.`,
          details: { available_room_categories: published.map((r) => ({ code: r.code, name: r.name, tariff_per_day: r.tariff_per_day })) }
        }
      };
    }

    const overrideTariff = body.selected_tariff ?? body.current_tariff;
    const selectedTariff =
      typeof overrideTariff === 'number' && overrideTariff > 0 ? overrideTariff : selected.tariff_per_day;

    return {
      hospitalId,
      procedureId,
      roomCategory,
      selectedTariff,
      eligibleTariff: eligible.tariff_per_day
    };
  }

  // POST /api/cost/estimate
  public estimate(req: Request, res: Response): void {
    const { policy, error: policyError } = this.resolvePolicy(req.body?.policy_id, req);
    if (policyError || !policy) {
      res.status(policyError!.status).json({
        success: false,
        error: { code: policyError!.code, message: policyError!.message }
      });
      return;
    }

    const context = this.resolveContext(req.body || {}, policy, 'preferred_room_category');
    if ('error' in context) {
      res.status(context.error.status).json({
        success: false,
        error: {
          code: context.error.code,
          message: context.error.message,
          details: context.error.details
        }
      });
      return;
    }

    const { procCost, components, provenance } = this.resolveProcedureCostAndComponents(
      context.hospitalId,
      context.procedureId
    );

    const estimate = costEngine.calculateEstimate(
      policy,
      procCost,
      components,
      context.roomCategory,
      context.eligibleTariff,
      context.selectedTariff
    );

    res.json({
      success: true,
      data: {
        ...estimate,
        provenance,
        context: {
          policy_id: policy.id,
          hospital_id: context.hospitalId,
          procedure_id: context.procedureId,
          room_category: context.roomCategory,
          selected_room_tariff: context.selectedTariff,
          eligible_room_tariff: context.eligibleTariff,
          available_room_categories: getPublishedRoomTariffs(context.hospitalId)
        }
      }
    });
  }

  // POST /api/cost/what-if
  public whatIf(req: Request, res: Response): void {
    const { policy, error: policyError } = this.resolvePolicy(req.body?.policy_id, req);
    if (policyError || !policy) {
      res.status(policyError!.status).json({
        success: false,
        error: { code: policyError!.code, message: policyError!.message }
      });
      return;
    }

    const context = this.resolveContext(req.body || {}, policy, 'current_room_category');
    if ('error' in context) {
      res.status(context.error.status).json({
        success: false,
        error: {
          code: context.error.code,
          message: context.error.message,
          details: context.error.details
        }
      });
      return;
    }

    const published = getPublishedRoomTariffs(context.hospitalId);
    const requestedAlt = (req.body?.alternative_room_category ?? req.body?.comparison_room_category) as RoomCategoryCode | undefined;

    // Default alternative: the next room up from the current one that this
    // hospital actually publishes. "DELUXE" was hardcoded before, and four of
    // nine hospitals do not have one.
    const currentRank = published.find((r) => r.code === context.roomCategory)?.rank ?? 0;
    const nextUp = published.find((r) => r.rank > currentRank);
    const altRoom = requestedAlt || nextUp?.code;

    if (!altRoom) {
      res.status(409).json({
        success: false,
        error: {
          code: 'NO_ALTERNATIVE_ROOM',
          message: 'This hospital publishes no room above the selected category, so there is no upgrade to compare.',
          details: { available_room_categories: published }
        }
      });
      return;
    }

    const altTariffRow = getRoomTariff(context.hospitalId, altRoom);
    if (!altTariffRow) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ROOM_TARIFF_NOT_ON_RECORD',
          message: `This hospital does not publish a ${altRoom} room.`,
          details: { available_room_categories: published }
        }
      });
      return;
    }

    const altOverride = req.body?.alternative_tariff;
    const altTariff =
      typeof altOverride === 'number' && altOverride > 0 ? altOverride : altTariffRow.tariff_per_day;

    const { procCost, components, provenance } = this.resolveProcedureCostAndComponents(
      context.hospitalId,
      context.procedureId
    );

    const currentEstimate = costEngine.calculateEstimate(
      policy,
      procCost,
      components,
      context.roomCategory,
      context.eligibleTariff,
      context.selectedTariff
    );

    const alternativeEstimate = costEngine.calculateEstimate(
      policy,
      procCost,
      components,
      altRoom,
      context.eligibleTariff,
      altTariff
    );

    const oopDelta = alternativeEstimate.indicativePatientExposure - currentEstimate.indicativePatientExposure;
    const coveredDelta = alternativeEstimate.estimatedCoveredAmount - currentEstimate.estimatedCoveredAmount;
    const nonCoveredDelta = alternativeEstimate.potentialNonCoveredAmount - currentEstimate.potentialNonCoveredAmount;
    const grossDelta = alternativeEstimate.typicalGrossCost - currentEstimate.typicalGrossCost;

    const isRoomUpgrade = altTariff > context.selectedTariff;
    const altRoomEval = rulesEngine.evaluateRoomCategory(
      policy,
      altRoom,
      context.eligibleTariff,
      altTariff
    );
    const penaltyApplies = !altRoomEval.isCompatible;
    const penaltyPercent = Math.round((1 - altRoomEval.proportionatePenaltyRatio) * 100);

    let explanation: string;
    if (oopDelta === 0) {
      explanation = `Choosing ${altRoom} has no additional impact on your estimated out-of-pocket exposure under ${policy.policy_name}.`;
    } else if (oopDelta > 0) {
      explanation = penaltyApplies
        ? `Upgrading to ${altRoom} (₹${altTariff.toLocaleString('en-IN')}/day) triggers a ${penaltyPercent}% proportionate deduction across doctor and surgical fees, increasing your out-of-pocket exposure by ₹${oopDelta.toLocaleString('en-IN')}.`
        : `Selecting ${altRoom} increases your estimated out-of-pocket exposure by ₹${oopDelta.toLocaleString('en-IN')}.`;
    } else {
      explanation = `Moving to ${altRoom} (₹${altTariff.toLocaleString('en-IN')}/day) reduces your estimated out-of-pocket exposure by ₹${Math.abs(oopDelta).toLocaleString('en-IN')}.`;
    }

    const currentRoomEval = rulesEngine.evaluateRoomCategory(
      policy,
      context.roomCategory,
      context.eligibleTariff,
      context.selectedTariff
    );

    res.json({
      success: true,
      data: {
        currentEstimate,
        alternativeEstimate,
        provenance,
        delta: {
          oopDelta,
          coveredDelta,
          nonCoveredDelta,
          grossDelta,
          isRoomUpgrade,
          penaltyApplies,
          penaltyPercent,
          percentageOopChange:
            currentEstimate.indicativePatientExposure > 0
              ? Math.round((oopDelta / currentEstimate.indicativePatientExposure) * 100)
              : 0
        },
        explanation,
        currentRoom: {
          code: context.roomCategory,
          tariff: context.selectedTariff,
          eligible: currentRoomEval.isCompatible
        },
        alternativeRoom: {
          code: altRoom,
          tariff: altTariff,
          eligible: altRoomEval.isCompatible
        },
        available_room_categories: published
      }
    });
  }
}

export const costController = new CostController();
