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

    // 1. Try Gemini API if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
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

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              ...parsed,
              isAiGenerated: true,
              modelUsed: 'gemini-2.5-flash'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic stage engine:', err);
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


