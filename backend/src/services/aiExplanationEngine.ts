import {
  HospitalMatchResult,
  CostEstimateResult,
  CareJourney,
  NetworkStatus,
  RoomCategoryCode,
  VerificationCategory,
  VerificationItemStatus
} from '../types/domain';
import { geminiService } from './geminiService';
import { dataRepository } from './dataRepository';
import { rulesEngine } from './rulesEngine';
import { getHospitalCoverage } from './enrichmentService';
import { getEligibleRoomTariff, getRoomTariff } from './tariffService';

export interface ExplanationResponse {
  summary: string;
  keyFactors: string[];
  caveatsAndUncertainties: string[];
  disclaimer: string;
  isAiGenerated?: boolean;
  modelUsed?: string;
}

export interface QuestionsToAskResponse {
  billingDeskQuestions: string[];
  insuranceCoordinatorQuestions: string[];
  nursingAdminQuestions: string[];
}

export class AiExplanationEngine {
  /**
   * Generates caregiver-friendly explanation for a hospital match result.
   */
  public explainHospitalMatch(result: HospitalMatchResult, patientName: string): ExplanationResponse {
    const isCashless = result.cashlessSupported;
    const isRoomOk = result.roomCategoryMatch;

    let summary = `${result.hospital.name} achieved an alignment score of ${result.matchScore}/100 for ${patientName}. `;
    if (isCashless && isRoomOk) {
      summary += 'The facility is in-network with cashless admission supported, and the selected room category aligns with policy limits.';
    } else if (!isCashless) {
      summary += 'Note that cashless admission is not confirmed here; reimbursement or manual verification is required.';
    } else if (!isRoomOk) {
      summary += 'While in-network, the selected room category exceeds policy limits, which will trigger out-of-pocket proportionate deductions.';
    }

    const keyFactors = result.reasons;
    const caveatsAndUncertainties: string[] = [];

    if (result.networkStatus === 'UNKNOWN') {
      caveatsAndUncertainties.push('Network status is based on public reference data and requires direct desk verification.');
    }
    if (!result.roomCategoryMatch) {
      caveatsAndUncertainties.push('Proportionate deduction penalty may increase final patient payment beyond room tariff difference.');
    }
    caveatsAndUncertainties.push('Preauthorization must be confirmed by the TPA desk prior to surgery.');

    return {
      summary,
      keyFactors,
      caveatsAndUncertainties,
      disclaimer:
        'This explanation is provided for decision support and informational guidance only. It does not constitute medical advice or binding claim approval.',
      isAiGenerated: false,
      modelUsed: 'deterministic-rules-engine'
    };
  }

  /**
   * Generates real-time Gemini AI explanation for hospital match.
   */
  public async explainHospitalMatchAsync(result: HospitalMatchResult, patientName: string): Promise<ExplanationResponse> {
    const fallback = this.explainHospitalMatch(result, patientName);
    if (!geminiService.isAvailable()) {
      return fallback;
    }

    const prompt = `You are CareIQ, an expert Indian Health Insurance Decision-Support AI.
Generate a concise, compassionate explanation for why ${result.hospital.name} in ${result.hospital.city} was recommended for patient ${patientName}.
Match Score: ${result.matchScore}/100
Network Status: ${result.networkStatus} (Cashless Supported: ${result.cashlessSupported})
Room Category Compatible: ${result.roomCategoryMatch}
Estimated Out-of-Pocket: ₹${result.estimatedPatientExposure}
Key Reasons: ${result.reasons.join('; ')}

Respond ONLY with valid JSON conforming to this schema:
{
  "summary": "string",
  "keyFactors": ["string", "string", "string"],
  "caveatsAndUncertainties": ["string", "string"],
  "disclaimer": "This explanation is provided for decision support and informational guidance only. It does not constitute medical advice or binding claim approval."
}`;

    const res = await geminiService.generateJson<ExplanationResponse>(prompt);
    if (res.success && res.data && res.data.summary) {
      return {
        ...res.data,
        isAiGenerated: true,
        modelUsed: res.model
      };
    }

    return fallback;
  }


  /**
   * Generates actionable questions for caregiver to ask hospital staff.
   */
  /**
   * The checklist a caregiver takes to each desk.
   *
   * `hospitalName` and `stage` used to be accepted and then ignored — every
   * caller got the same nine questions regardless of which hospital or which
   * point in the admission, while the controller substituted 'the hospital' for
   * a missing name. Both are now optional and both actually change the output:
   * an unnamed hospital produces questions that do not name one, and the stage
   * decides which questions are worth asking today.
   */
  public generateQuestionsToAsk(context: {
    hospitalName?: string;
    insurerName?: string;
    stage?: string;
    isRoomExceeded?: boolean;
  }): QuestionsToAskResponse {
    const insurer = context.insurerName || 'my insurance policy';
    const at = context.hospitalName ? ` at ${context.hospitalName}` : '';

    const billingDeskQuestions = [
      `Is cashless processing actively supported for ${insurer} today?`,
      `Can I get an advance estimate of non-payable consumables and administrative charges${at}?`,
      'What is the daily billing cutoff time for inpatient room rent calculation?'
    ];

    const insuranceCoordinatorQuestions = [
      'Has the initial preauthorization request been submitted to the TPA portal?',
      'What is the preauthorization reference number and initial sanctioned amount?',
      'Will the hospital submit interim bills if additional surgical items or days are required?'
    ];

    const nursingAdminQuestions = [
      'What room category is recorded in the patient admission file?',
      'Are routine disposables (gloves, sanitizers, thermometer) billed per item or bundled in room nursing?'
    ];

    // Stage-specific additions. What matters at admission is not what matters
    // on discharge day, and asking the discharge questions on day one is how a
    // checklist gets ignored.
    switch (context.stage) {
      case 'INVESTIGATION':
        billingDeskQuestions.push(
          'Are in-house diagnostic tests billed inside the pre-auth package, or claimed separately?'
        );
        break;
      case 'PROCEDURE':
        billingDeskQuestions.push(
          'Are surgeon and anaesthetist fees within the pre-authorised package limit?'
        );
        nursingAdminQuestions.push(
          'Will I be given the implant invoice with the barcode or serial stickers?'
        );
        break;
      case 'RECOVERY':
        insuranceCoordinatorQuestions.push(
          'Has an enhancement request gone to the TPA if the running bill now exceeds the sanctioned amount?'
        );
        nursingAdminQuestions.push(
          'Can I see an interim billing summary of consumables charged so far?'
        );
        break;
      case 'DISCHARGE':
      case 'CLAIM_SUPPORT':
        billingDeskQuestions.push(
          'What is the final approved cashless amount, and what balance do I settle myself?'
        );
        insuranceCoordinatorQuestions.push(
          'Have the final bill and discharge summary been uploaded to the TPA portal?'
        );
        break;
      default:
        break;
    }

    if (context.isRoomExceeded) {
      billingDeskQuestions.unshift(
        'Because the selected room exceeds my policy entitlement, what is the exact percentage deduction applied to doctor fees and OT?'
      );
    }

    return {
      billingDeskQuestions,
      insuranceCoordinatorQuestions,
      nursingAdminQuestions
    };
  }

  /**
   * Coverage confidence = how much of this patient's coverage picture is
   * actually on record, scored 0-100.
   *
   * The previous version defaulted every unknown to the favourable answer
   * (`isNetworkCashless ?? true`, `hasConsumablesVerified ?? true`), so an
   * empty request — which is what the dashboard sent — scored 100/100 "High
   * Information Certainty" while knowing nothing at all. Unknown now scores
   * zero for its factor and says UNKNOWN, because "we have not checked" is
   * the opposite of "confirmed".
   *
   * Callers may still pass explicit booleans to override a factor (for
   * what-if simulation); passing nothing means "derive it from the database".
   */
  public calculateCoverageConfidence(params: {
    policyId?: string;
    hospitalId?: string;
    patientId?: string;
    selectedRoomCategory?: RoomCategoryCode;
    procedureId?: string;
    isNetworkCashless?: boolean;
    hasRoomMismatch?: boolean;
    isPreauthPending?: boolean;
    hasConsumablesVerified?: boolean;
  }) {
    const policy = params.policyId ? dataRepository.getPolicyById(params.policyId) : undefined;
    const hospital = params.hospitalId ? dataRepository.getHospitalById(params.hospitalId) : undefined;

    // ---- Network (max 30) ----
    const coverage =
      hospital && policy ? getHospitalCoverage(hospital.id, policy.insurer_id) : undefined;
    let networkScore: number;
    let networkStatus: string;
    let networkLabel: string;

    if (params.isNetworkCashless !== undefined) {
      networkScore = params.isNetworkCashless ? 30 : 12;
      networkStatus = params.isNetworkCashless ? 'CONFIRMED' : 'UNCONFIRMED';
      networkLabel = params.isNetworkCashless ? 'In-network cashless' : 'Reimbursement route';
    } else if (!coverage || coverage.network_data_missing) {
      networkScore = 0;
      networkStatus = 'UNKNOWN';
      networkLabel = !policy
        ? 'No policy selected'
        : !hospital
          ? 'No hospital selected'
          : 'Empanelment not on record';
    } else if (coverage.cashless_available) {
      networkScore = 30;
      networkStatus = 'CONFIRMED';
      networkLabel = 'In-network cashless';
    } else if (coverage.network_status === NetworkStatus.IN_NETWORK) {
      networkScore = 18;
      networkStatus = 'PARTIAL';
      networkLabel = 'In-network, cashless not confirmed';
    } else {
      networkScore = 8;
      networkStatus = 'UNCONFIRMED';
      networkLabel = 'Out of network — reimbursement only';
    }

    // ---- Room entitlement (max 25) ----
    const journey = params.patientId
      ? dataRepository.getJourneyByPatientId(params.patientId)
      : undefined;
    const selectedRoom =
      params.selectedRoomCategory ||
      (journey?.selected_room_category as RoomCategoryCode | undefined);

    let roomScore: number;
    let roomStatus: string;
    let roomLabel: string;

    if (params.hasRoomMismatch !== undefined) {
      roomScore = params.hasRoomMismatch ? 10 : 25;
      roomStatus = params.hasRoomMismatch ? 'MISMATCH' : 'ALIGNED';
      roomLabel = params.hasRoomMismatch ? 'Exceeds policy cap' : 'Within policy cap';
    } else if (!policy || !hospital || !selectedRoom) {
      roomScore = 0;
      roomStatus = 'NOT_SELECTED';
      roomLabel = 'No room category chosen yet';
    } else {
      const eligible = getEligibleRoomTariff(hospital.id, policy.room_eligibility);
      const selected = getRoomTariff(hospital.id, selectedRoom);
      if (!eligible || !selected) {
        roomScore = 0;
        roomStatus = 'UNKNOWN';
        roomLabel = 'Room tariff not published by hospital';
      } else {
        const evaluation = rulesEngine.evaluateRoomCategory(
          policy,
          selectedRoom,
          eligible.tariff_per_day,
          selected.tariff_per_day
        );
        roomScore = evaluation.isCompatible ? 25 : 10;
        roomStatus = evaluation.isCompatible ? 'ALIGNED' : 'MISMATCH';
        roomLabel = evaluation.isCompatible
          ? `Within policy cap (₹${eligible.tariff_per_day.toLocaleString('en-IN')}/day)`
          : `Exceeds cap by ₹${(selected.tariff_per_day - eligible.tariff_per_day).toLocaleString('en-IN')}/day`;
      }
    }

    // ---- Pre-authorisation (max 20) ----
    const verificationItems = params.patientId
      ? dataRepository.getVerificationItems(params.patientId)
      : [];
    const preauthItems = verificationItems.filter(
      (v) => v.category === VerificationCategory.PREAUTH
    );

    let procedureScore: number;
    let procedureStatus: string;
    let procedureLabel: string;

    const isSettled = (v: { status: VerificationItemStatus }) =>
      v.status === VerificationItemStatus.RESOLVED || v.status === VerificationItemStatus.DISMISSED;

    if (params.isPreauthPending !== undefined) {
      procedureScore = params.isPreauthPending ? 10 : 20;
      procedureStatus = params.isPreauthPending ? 'PENDING' : 'APPROVED';
      procedureLabel = params.isPreauthPending ? 'Pre-auth in review' : 'Pre-auth approved';
    } else if (coverage && !coverage.network_data_missing && !coverage.preauth_required) {
      procedureScore = 20;
      procedureStatus = 'NOT_REQUIRED';
      procedureLabel = 'Pre-auth not required here';
    } else if (preauthItems.length === 0) {
      procedureScore = 0;
      procedureStatus = 'NOT_STARTED';
      procedureLabel = 'Pre-auth not raised yet';
    } else if (preauthItems.every(isSettled)) {
      procedureScore = 20;
      procedureStatus = 'APPROVED';
      procedureLabel = 'Pre-auth approved';
    } else {
      const open = preauthItems.filter((v) => !isSettled(v)).length;
      procedureScore = 10;
      procedureStatus = 'PENDING';
      procedureLabel = `Pre-auth in review (${open} open ${open === 1 ? 'item' : 'items'})`;
    }

    // ---- Policy completeness (max 15) ----
    let policyScore: number;
    let policyStatus: string;
    let policyLabel: string;

    if (!policy) {
      policyScore = 0;
      policyStatus = 'MISSING';
      policyLabel = 'No policy on record';
    } else {
      const hasDates = !!policy.policy_start_date && !!policy.policy_end_date;
      const hasCover = Number(policy.sum_insured) > 0;
      if (hasDates && hasCover) {
        policyScore = 15;
        policyStatus = 'VALIDATED';
        policyLabel = 'Terms and validity on record';
      } else {
        policyScore = 7;
        policyStatus = 'INCOMPLETE';
        policyLabel = hasDates ? 'Sum insured not recorded' : 'Policy validity dates missing';
      }
    }

    // ---- Cost detail (max 10) ----
    let costScore: number;
    let costStatus: string;
    let costLabel: string;
    const procedureId = params.procedureId || journey?.procedure_id;
    const procCost =
      hospital && procedureId
        ? dataRepository.getProcedureCost(hospital.id, procedureId)
        : undefined;
    const itemised = procCost ? dataRepository.getCostComponents(procCost.id) : [];

    if (params.hasConsumablesVerified !== undefined) {
      costScore = params.hasConsumablesVerified ? 10 : 5;
      costStatus = params.hasConsumablesVerified ? 'MAPPED' : 'ESTIMATED';
      costLabel = params.hasConsumablesVerified ? 'Tariffs mapped' : 'Consumables estimated';
    } else if (itemised.length > 0) {
      costScore = 10;
      costStatus = 'MAPPED';
      costLabel = `${itemised.length} billing heads itemised by hospital`;
    } else if (procCost) {
      costScore = 5;
      costStatus = 'PARTIAL';
      costLabel = 'Package price only, no itemised bill';
    } else {
      costScore = 0;
      costStatus = 'ESTIMATED';
      costLabel = procedureId ? 'Hospital has not published this price' : 'No procedure selected';
    }

    const totalScore = Math.min(
      100,
      Math.max(0, networkScore + roomScore + procedureScore + policyScore + costScore)
    );

    let ratingLabel = 'High information certainty';
    if (totalScore < 40) {
      ratingLabel = 'Mostly unverified';
    } else if (totalScore < 70) {
      ratingLabel = 'Action required';
    } else if (totalScore < 85) {
      ratingLabel = 'Verification recommended';
    }

    return {
      totalScore,
      ratingLabel,
      factors: {
        network: { score: networkScore, maxScore: 30, status: networkStatus, label: networkLabel },
        room: { score: roomScore, maxScore: 25, status: roomStatus, label: roomLabel },
        procedure: { score: procedureScore, maxScore: 20, status: procedureStatus, label: procedureLabel },
        policy: { score: policyScore, maxScore: 15, status: policyStatus, label: policyLabel },
        cost: { score: costScore, maxScore: 10, status: costStatus, label: costLabel }
      },
      disclaimer:
        'Coverage confidence measures how much of your coverage picture is confirmed in our records. It is not an insurance guarantee or a claim decision.'
    };
  }

  /**
   * Generates AI-assisted stage-specific guidance for patient care journey.
   * Leverages Gemini 2.5/3.5 Flash when GEMINI_API_KEY is available, with structured deterministic fallback.
   */
  public async generateStageGuidance(params: {
    stage: string;
    policyId?: string;
    hospitalId?: string;
    patientName?: string;
    procedureName?: string;
    isRoomMismatch?: boolean;
  }): Promise<StageGuidanceResult> {
    const stage = (params.stage || 'ADMISSION').toUpperCase();
    const patientName = params.patientName || 'the patient';
    const hospitalName = params.hospitalId ? params.hospitalId.replace('hosp-', '').replace(/-/g, ' ') : 'the hospital';
    const procedureName = params.procedureName || 'the planned medical procedure';

    // 1. Try Gemini API if available
    if (geminiService.isAvailable()) {
      const prompt = `You are CareIQ, an expert Indian Health Insurance Decision-Support AI.
Generate a structured JSON guidance object for a patient navigating the "${stage}" stage of their hospital care journey.
Patient Name: ${patientName}
Hospital: ${hospitalName}
Procedure: ${procedureName}
Room Mismatch / Proportionate Deduction Risk: ${params.isRoomMismatch ? 'YES' : 'NO'}

Respond ONLY with valid JSON conforming to this schema:
{
  "stage": "${stage}",
  "stageTitle": "string",
  "keyGuidance": "string",
  "proactiveTips": ["string", "string", "string"],
  "criticalPitfalls": ["string", "string"],
  "requiredDocuments": ["string", "string", "string", "string"],
  "billingDeskQuestions": ["string", "string", "string"],
  "estimatedTimeline": "string",
  "insuranceCheck": "string"
}`;

      const res = await geminiService.generateJson<StageGuidanceResult>(prompt);
      if (res.success && res.data && res.data.stageTitle) {
        return {
          ...res.data,
          isAiGenerated: true,
          modelUsed: res.model
        };
      }
    }

    // 2. High-Yield Deterministic Fallback Rules
    return this.getDeterministicStageGuidance(stage, patientName, hospitalName, procedureName, params.isRoomMismatch);
  }


  private getDeterministicStageGuidance(
    stage: string,
    patientName: string,
    hospitalName: string,
    procedureName: string,
    isRoomMismatch?: boolean
  ): StageGuidanceResult {
    switch (stage) {
      case 'ADMISSION':
        return {
          stage: 'ADMISSION',
          stageTitle: 'Inpatient Admission & TPA Desk Verification',
          keyGuidance: `At admission for ${patientName}, present your health insurance e-card and photo ID at the hospital TPA desk. Ensure the admitted room category strictly matches your policy entitlement to prevent proportionate deductions on doctor and OT charges.`,
          proactiveTips: [
            'Request the TPA desk to confirm your initial cashless pre-authorization submission immediately upon room allotment.',
            'Ensure the room tariff recorded on the admission form matches the eligible category under your policy.',
            'Ask for the non-payable items schedule upfront to know anticipated out-of-pocket costs.'
          ],
          criticalPitfalls: [
            'Signing an open-ended room upgrade undertaking without knowing proportionate deduction implications.',
            'Delaying pre-authorization submission until after surgery starts.'
          ],
          requiredDocuments: [
            'Health Insurance E-Card / Policy Schedule',
            'Government Photo ID (Aadhaar / Voter ID / Passport)',
            "Treating Doctor's Admission Advice Note",
            'Past Medical History & First Consultation Reports'
          ],
          billingDeskQuestions: [
            'Is my insurer empanelled for 100% cashless admission at this branch?',
            "What is the hospital's daily room billing cutoff time (e.g. 12 PM / 24-hour cycle)?",
            'What is the estimated advance deposit required for non-medical items?'
          ],
          estimatedTimeline: '1 to 3 hours for TPA initial verification & bed allocation',
          insuranceCheck: 'Pre-auth submission mandatory within 4 hours of planned admission',
          isAiGenerated: false,
          modelUsed: 'deterministic-rules-engine'
        };

      case 'INVESTIGATION':
        return {
          stage: 'INVESTIGATION',
          stageTitle: 'Diagnostic Workup & Pre-Op Investigations',
          keyGuidance: `Ensure all pre-operative diagnostic tests for ${procedureName} (blood panel, cardiac clearance, imaging) are tagged under pre-hospitalization cover (typically covered 30 to 60 days prior to admission).`,
          proactiveTips: [
            'Collect and preserve original test reports, lab bills, and doctor prescription slips for all diagnostics.',
            'Confirm whether specialized contrast agents or MRI scans are included in the packaged procedure estimate.'
          ],
          criticalPitfalls: [
            'Losing diagnostic payment receipts (insurers reject claims without itemized doctor prescriptions).',
            'Undergoing non-essential discretionary lab packages not requested by the treating surgeon.'
          ],
          requiredDocuments: [
            "Doctor's Diagnostic Prescription",
            'Original Lab & Radiology Test Reports',
            'Cardiology / Anesthesia Pre-Op Fitness Certificate'
          ],
          billingDeskQuestions: [
            'Are diagnostic tests conducted inside the hospital billed directly to the pre-auth package?',
            'Will external lab tests need to be claimed separately under pre-hospitalization reimbursement?'
          ],
          estimatedTimeline: '4 to 8 hours for complete pre-operative workup',
          insuranceCheck: 'Pre-hospitalization expenses eligible for reimbursement within 30-60 days window',
          isAiGenerated: false,
          modelUsed: 'deterministic-rules-engine'
        };

      case 'PROCEDURE':
      case 'SURGERY':
        return {
          stage: 'PROCEDURE',
          stageTitle: 'Surgical Procedure & OT Billing Management',
          keyGuidance: `During ${procedureName}, monitor any implant stickers (e.g. prosthetics, stents) and high-value consumables. Ensure implant invoices have clear barcode serial numbers for smooth cashless claim approval.`,
          proactiveTips: [
            'Ask the surgical coordinator for the implant barcode stickers to paste on the patient chart.',
            'Verify that consumable kits and PPE are charged at capped standard hospital rates.',
            'Ensure robotic or laparoscopic assist charges have prior approval if covered under Modern Treatment clauses.'
          ],
          criticalPitfalls: [
            'Missing implant invoice or serial stickers, which delays discharge cashless sanction.',
            'Unsanctioned surgical add-ons not communicated to the insurer TPA desk.'
          ],
          requiredDocuments: [
            'Operative Notes & Surgeon Summary',
            'Implant Invoice with Barcode / Serial Stickers',
            'Anesthesia Record Sheet'
          ],
          billingDeskQuestions: [
            'Are the surgeon and anesthetist fees within the pre-authorized package limit?',
            'Are implant costs billed as per the national NPPA ceiling tariff?'
          ],
          estimatedTimeline: '2 to 4 hours in OT + 2 hours in post-op recovery',
          insuranceCheck: 'Implant barcode stickers & OT notes required for claim settlement',
          isAiGenerated: false,
          modelUsed: 'deterministic-rules-engine'
        };

      case 'RECOVERY':
      case 'POST_OP':
        return {
          stage: 'RECOVERY',
          stageTitle: 'Inpatient Ward Recovery & Interim Billing',
          keyGuidance: `While ${patientName} is recovering in the ward, verify daily pharmacy and nursing entries. If staying extra days due to clinical reasons, ensure the doctor documents medical necessity so the insurer extends coverage.`,
          proactiveTips: [
            'Request an interim billing summary on day 2 or 3 to track running consumable charges.',
            'If additional medications are prescribed, confirm they are dispensed from the in-network hospital pharmacy.',
            'Ensure physiotherapy sessions are documented in daily case sheets for post-hospitalization reimbursement.'
          ],
          criticalPitfalls: [
            'Unplanned extra days without medical justification letters will get rejected by insurer audits.',
            'Purchasing medicines from outside chemists without stamped doctor prescriptions.'
          ],
          requiredDocuments: [
            'Daily Inpatient Doctor Progress Notes',
            'Physiotherapy & Nursing Chart',
            'Interim Pharmacy Dispensation Slips'
          ],
          billingDeskQuestions: [
            'Has an enhancement request been sent to the TPA if running expenses exceed initial sanction?',
            'What is the running total of non-payable consumables to date?'
          ],
          estimatedTimeline: '2 to 4 days post-procedure inpatient monitoring',
          insuranceCheck: 'Enhancement pre-auth required if total bill exceeds initial approval by >20%',
          isAiGenerated: false,
          modelUsed: 'deterministic-rules-engine'
        };

      case 'DISCHARGE':
      default:
        return {
          stage: 'DISCHARGE',
          stageTitle: 'Final Discharge Summary & TPA Cashless Settlement',
          keyGuidance: `Initiate discharge process early in the morning for ${patientName}. Final cashless settlement from TPA typically takes 2 to 4 hours after the hospital uploads final billing. Ensure all original reports and discharge summaries are collected.`,
          proactiveTips: [
            'Ask the doctor to prepare the discharge summary by 9:00 AM to beat the TPA afternoon rush.',
            'Review the itemized final bill carefully before paying the non-payable consumable balance.',
            'Collect all original radiology films, lab reports, and signed discharge summary for post-op care.'
          ],
          criticalPitfalls: [
            'Leaving the hospital without the final TPA settlement letter (Approval Letter / Voucher).',
            'Paying full bill in cash when cashless approval is delayed by 1 hour (reimbursement takes 30-45 days).'
          ],
          requiredDocuments: [
            'Final Itemized Hospital Bill with Breakup',
            'Comprehensive Discharge Summary signed by Treating Consultant',
            'TPA Final Cashless Sanction / Settlement Letter',
            'Payment Receipt for Out-of-Pocket Non-Payable Balance',
            'Post-Discharge Follow-Up & Medication Prescription'
          ],
          billingDeskQuestions: [
            'Has the final bill and discharge summary been uploaded to the TPA portal?',
            'What is the final approved cashless amount vs the non-payable amount I need to settle?',
            'Can I get a stamped copy of the itemized pharmacy bill for tax / records?'
          ],
          estimatedTimeline: '3 to 5 hours for final bill generation, TPA audit & discharge clearance',
          insuranceCheck: 'Post-hospitalization claims (up to 60-90 days) must be filed within 30 days of discharge',
          isAiGenerated: false,
          modelUsed: 'deterministic-rules-engine'
        };
    }
  }
}

export interface StageGuidanceResult {
  stage: string;
  stageTitle: string;
  keyGuidance: string;
  proactiveTips: string[];
  criticalPitfalls: string[];
  requiredDocuments: string[];
  billingDeskQuestions: string[];
  estimatedTimeline: string;
  insuranceCheck: string;
  isAiGenerated: boolean;
  modelUsed: string;
}

export const aiExplanationEngine = new AiExplanationEngine();


