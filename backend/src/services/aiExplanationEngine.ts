import { HospitalMatchResult, CostEstimateResult, CareJourney } from '../types/domain';

export interface ExplanationResponse {
  summary: string;
  keyFactors: string[];
  caveatsAndUncertainties: string[];
  disclaimer: string;
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
        'This explanation is provided for decision support and informational guidance only. It does not constitute medical advice or binding claim approval.'
    };
  }

  /**
   * Generates actionable questions for caregiver to ask hospital staff.
   */
  public generateQuestionsToAsk(context: {
    hospitalName: string;
    insurerName?: string;
    stage?: string;
    isRoomExceeded?: boolean;
  }): QuestionsToAskResponse {
    const billingDeskQuestions = [
      `Is cashless processing actively supported for ${context.insurerName || 'my insurance policy'} today?`,
      'Can I get an advance estimate of non-payable consumables and administrative charges?',
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
   * Calculates deterministic coverage confidence score (0-100) and factors breakdown.
   */
  public calculateCoverageConfidence(params: {
    policyId?: string;
    hospitalId?: string;
    patientId?: string;
    isNetworkCashless?: boolean;
    hasRoomMismatch?: boolean;
    isPreauthPending?: boolean;
    hasConsumablesVerified?: boolean;
  }) {
    const isNetworkCashless = params.isNetworkCashless ?? true;
    const hasRoomMismatch = params.hasRoomMismatch ?? false;
    const isPreauthPending = params.isPreauthPending ?? false;
    const hasConsumablesVerified = params.hasConsumablesVerified ?? true;
    const hasPolicy = !!params.policyId;

    const networkScore = isNetworkCashless ? 30 : 15;
    const roomScore = !hasRoomMismatch ? 25 : 10;
    const procedureScore = !isPreauthPending ? 20 : 12;
    const policyScore = hasPolicy ? 15 : 5;
    const costScore = hasConsumablesVerified ? 10 : 6;

    const totalScore = Math.min(100, Math.max(0, networkScore + roomScore + procedureScore + policyScore + costScore));

    let ratingLabel = 'High Information Certainty';
    if (totalScore < 70) {
      ratingLabel = 'Action Required';
    } else if (totalScore < 85) {
      ratingLabel = 'Verification Recommended';
    }

    return {
      totalScore,
      ratingLabel,
      factors: {
        network: { score: networkScore, maxScore: 30, status: isNetworkCashless ? 'CONFIRMED' : 'UNCONFIRMED', label: isNetworkCashless ? 'In-Network Cashless' : 'Unknown / Reimburse' },
        room: { score: roomScore, maxScore: 25, status: !hasRoomMismatch ? 'ALIGNED' : 'MISMATCH', label: !hasRoomMismatch ? 'Within Policy Cap' : 'Mismatch Warning' },
        procedure: { score: procedureScore, maxScore: 20, status: !isPreauthPending ? 'APPROVED' : 'PENDING', label: !isPreauthPending ? 'Pre-Auth Approved' : 'Pre-Auth In Review' },
        policy: { score: policyScore, maxScore: 15, status: hasPolicy ? 'VALIDATED' : 'MISSING', label: hasPolicy ? 'Extracted & Grounded' : 'Unconfigured' },
        cost: { score: costScore, maxScore: 10, status: hasConsumablesVerified ? 'MAPPED' : 'ESTIMATED', label: hasConsumablesVerified ? 'Tariffs Mapped' : 'Consumables Est.' }
      },
      disclaimer: 'Coverage confidence measures data completeness and rule alignment. It is not an insurance guarantee or binding claim decision.'
    };
  }
}

export const aiExplanationEngine = new AiExplanationEngine();

