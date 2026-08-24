import fs from 'fs';
import path from 'path';
import {
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  UserRole,
  PolicyType,
  RoomCategoryCode,
  JourneyStage,
  JourneyStatus,
  EventStatus,
  VerificationCategory,
  PriorityLevel,
  VerificationItemStatus,
  RecommendationType,
  Patient,
  InsurancePolicy,
  CareJourney,
  JourneyEvent,
  VerificationItem,
  Recommendation
} from '../types/domain';

const ROOT_DATA_DIR = path.resolve(__dirname, '../../data');
const SYNTHETIC_DIR = path.join(ROOT_DATA_DIR, 'synthetic');
const SCENARIOS_DIR = path.join(ROOT_DATA_DIR, 'scenarios');

// Ensure directories exist
[SYNTHETIC_DIR, SCENARIOS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Generating deterministic synthetic datasets for CareIQ (Bengaluru Region)...');

// 1. Synthetic Patients — Exclusively Bengaluru Based
const syntheticPatients: Patient[] = [
  {
    id: "pat-01-ananya",
    user_id: "usr-01-ananya",
    display_name: "Ananya Sharma",
    age_band: "35-45",
    gender: "Female",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    preferred_language: "English",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-02-rahul",
    user_id: "usr-02-rahul",
    display_name: "Rahul Mehta",
    age_band: "45-55",
    gender: "Male",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560076",
    preferred_language: "English",
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-03-priya",
    user_id: "usr-03-priya",
    display_name: "Priya Nair",
    age_band: "28-35",
    gender: "Female",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560002",
    preferred_language: "English",
    created_at: "2026-08-03T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-04-suresh",
    user_id: "usr-04-suresh",
    display_name: "Suresh Kumar",
    age_band: "55-65",
    gender: "Male",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560017",
    preferred_language: "English",
    created_at: "2026-08-04T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-05-sunita",
    user_id: "usr-05-sunita",
    display_name: "Sunita Patel",
    age_band: "50-60",
    gender: "Female",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560041",
    preferred_language: "English",
    created_at: "2026-08-05T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-06-vikram",
    user_id: "usr-06-vikram",
    display_name: "Vikram Rao",
    age_band: "40-50",
    gender: "Male",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560099",
    preferred_language: "English",
    created_at: "2026-08-06T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-07-kavita",
    user_id: "usr-07-kavita",
    display_name: "Kavita Deshmukh",
    age_band: "32-40",
    gender: "Female",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    preferred_language: "English",
    created_at: "2026-08-07T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pat-08-ramesh",
    user_id: "usr-08-ramesh",
    display_name: "Ramesh Gowda",
    age_band: "60-70",
    gender: "Male",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560099",
    preferred_language: "English",
    created_at: "2026-08-08T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  }
];

// 2. Synthetic Policies
const syntheticPolicies: InsurancePolicy[] = [
  {
    id: "pol-syn-ananya",
    patient_id: "pat-01-ananya",
    insurer_id: "ins-star-health",
    policy_name: "Star Comprehensive Family Care",
    policy_type: PolicyType.INDIVIDUAL,
    policy_number_masked: "STAR-IND-XXXX-9912",
    sum_insured: 500000,
    remaining_sum_insured: 500000,
    room_eligibility: RoomCategoryCode.PRIVATE_AC,
    copay_percentage: 0,
    deductible_amount: 0,
    cashless_supported: true,
    preauthorization_supported: true,
    pre_hospitalization_days: 60,
    post_hospitalization_days: 90,
    data_status: DataStatus.SYNTHETIC,
    verification_status: VerificationStatus.VERIFIED,
    confidence: ConfidenceLevel.HIGH,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pol-syn-rahul",
    patient_id: "pat-02-rahul",
    insurer_id: "ins-hdfc-ergo",
    policy_name: "HDFC ERGO Health Suraksha",
    policy_type: PolicyType.INDIVIDUAL,
    policy_number_masked: "HDFC-SUR-XXXX-3829",
    sum_insured: 500000,
    remaining_sum_insured: 500000,
    room_eligibility: RoomCategoryCode.PRIVATE_AC,
    copay_percentage: 0,
    deductible_amount: 0,
    cashless_supported: true,
    preauthorization_supported: true,
    pre_hospitalization_days: 60,
    post_hospitalization_days: 90,
    data_status: DataStatus.SYNTHETIC,
    verification_status: VerificationStatus.VERIFIED,
    confidence: ConfidenceLevel.HIGH,
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pol-syn-sunita",
    patient_id: "pat-05-sunita",
    insurer_id: "ins-new-india",
    policy_name: "New India Senior Citizen Mediclaim",
    policy_type: PolicyType.INDIVIDUAL,
    policy_number_masked: "NIA-SR-XXXX-1928",
    sum_insured: 300000,
    remaining_sum_insured: 120000,
    room_eligibility: RoomCategoryCode.SEMI_PRIVATE,
    copay_percentage: 10,
    deductible_amount: 0,
    cashless_supported: true,
    preauthorization_supported: true,
    pre_hospitalization_days: 30,
    post_hospitalization_days: 60,
    data_status: DataStatus.SYNTHETIC,
    verification_status: VerificationStatus.VERIFIED,
    confidence: ConfidenceLevel.HIGH,
    created_at: "2026-08-05T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  },
  {
    id: "pol-syn-vikram",
    patient_id: "pat-06-vikram",
    insurer_id: "ins-care-health",
    policy_name: "Care Supreme Health Plan",
    policy_type: PolicyType.INDIVIDUAL,
    policy_number_masked: "CARE-SUP-XXXX-8821",
    sum_insured: 700000,
    remaining_sum_insured: 700000,
    room_eligibility: RoomCategoryCode.PRIVATE_AC,
    copay_percentage: 0,
    deductible_amount: 0,
    cashless_supported: true,
    preauthorization_supported: true,
    pre_hospitalization_days: 60,
    post_hospitalization_days: 90,
    data_status: DataStatus.SYNTHETIC,
    verification_status: VerificationStatus.VERIFIED,
    confidence: ConfidenceLevel.HIGH,
    created_at: "2026-08-06T10:00:00Z",
    updated_at: "2026-08-16T10:00:00Z"
  }
];

// 3. Synthetic Journeys
const syntheticJourneys: CareJourney[] = [
  {
    id: "jrn-01-ananya",
    patient_id: "pat-01-ananya",
    hospital_id: "hosp-manipal-old-airport",
    policy_id: "pol-syn-ananya",
    current_stage: JourneyStage.PROCEDURE,
    journey_status: JourneyStatus.ACTIVE,
    started_at: "2026-08-16T08:30:00Z",
    updated_at: "2026-08-16T11:00:00Z",
    events: [
      {
        id: "evt-01-adm",
        journey_id: "jrn-01-ananya",
        stage: JourneyStage.ADMISSION,
        event_type: "ADMISSION_FORM_SUBMITTED",
        title: "Admission Form & Cashless Pre-Auth Requested",
        description: "Patient admitted for Planned Total Knee Replacement. TPA desk initialized cashless preauthorization with Star Health.",
        status: EventStatus.COMPLETED,
        occurred_at: "2026-08-16T08:45:00Z",
        insurance_relevance: "Initiates the initial TPA cashless sanction process.",
        requires_verification: true,
        created_at: "2026-08-16T08:45:00Z"
      },
      {
        id: "evt-01-inv",
        journey_id: "jrn-01-ananya",
        stage: JourneyStage.INVESTIGATION,
        event_type: "PRE_OP_DIAGNOSTICS_COMPLETED",
        title: "Pre-Operative Blood Panels & Cardiac Clearance",
        description: "Complete blood count, ECG, and Knee X-Rays completed.",
        status: EventStatus.COMPLETED,
        occurred_at: "2026-08-16T09:30:00Z",
        insurance_relevance: "Covered under pre-hospitalization / inpatient diagnostics.",
        requires_verification: false,
        created_at: "2026-08-16T09:30:00Z"
      },
      {
        id: "evt-01-proc",
        journey_id: "jrn-01-ananya",
        stage: JourneyStage.PROCEDURE,
        event_type: "SURGERY_IN_PROGRESS",
        title: "Unilateral Knee Arthroplasty (Surgery)",
        description: "Patient transferred to OT 3. Implant verified: Stryker Triathlon Single Radius.",
        status: EventStatus.CURRENT,
        occurred_at: "2026-08-16T10:15:00Z",
        insurance_relevance: "Primary surgical procedure covered under policy. Consumables and surgical pack capped as per empanelled tariff.",
        requires_verification: true,
        created_at: "2026-08-16T10:15:00Z"
      }
    ]
  },
  {
    id: "jrn-02-rahul",
    patient_id: "pat-02-rahul",
    hospital_id: "hosp-apollo-bannerghatta",
    policy_id: "pol-syn-rahul",
    current_stage: JourneyStage.ADMISSION,
    journey_status: JourneyStatus.ACTIVE,
    started_at: "2026-08-15T14:00:00Z",
    updated_at: "2026-08-15T15:30:00Z",
    events: [
      {
        id: "evt-02-adm",
        journey_id: "jrn-02-rahul",
        stage: JourneyStage.ADMISSION,
        event_type: "ROOM_UPGRADE_SELECTED",
        title: "Deluxe Suite Selected by Patient",
        description: "Patient opted for Deluxe Room (₹12,500/day) while policy eligibility is Single Private AC (₹7,000/day).",
        status: EventStatus.CURRENT,
        occurred_at: "2026-08-15T15:00:00Z",
        insurance_relevance: "WARNING: Upgrading above policy entitlement will trigger proportionate deduction across doctor fees and OT charges, resulting in substantial out-of-pocket expenses.",
        requires_verification: true,
        created_at: "2026-08-15T15:00:00Z"
      }
    ]
  }
];

// 4. Synthetic Verification Items
const syntheticVerificationItems: VerificationItem[] = [
  {
    id: "ver-01-ananya-preauth",
    patient_id: "pat-01-ananya",
    journey_id: "jrn-01-ananya",
    category: VerificationCategory.PREAUTH,
    title: "Confirm Preauthorization Status & Differential Approval",
    question: "Has the TPA insurance desk received approval for the additional surgical consumables and OT estimate?",
    reason: "Initial authorization was approved for ₹1.50L against an estimated ₹1.80L total bill.",
    priority: PriorityLevel.HIGH,
    status: VerificationItemStatus.PENDING,
    created_at: "2026-08-16T09:00:00Z"
  },
  {
    id: "ver-01-ananya-consumables",
    patient_id: "pat-01-ananya",
    journey_id: "jrn-01-ananya",
    category: VerificationCategory.COST,
    title: "Verify Itemized Non-Payable Consumable Charges",
    question: "Can the billing desk provide an advance list of non-reimbursable consumables not covered under Star Health?",
    reason: "Typical orthopaedic procedures generate ~₹12,000 - ₹15,000 in non-medical disposables.",
    priority: PriorityLevel.MEDIUM,
    status: VerificationItemStatus.PENDING,
    created_at: "2026-08-16T09:15:00Z"
  },
  {
    id: "ver-02-rahul-room-cap",
    patient_id: "pat-02-rahul",
    journey_id: "jrn-02-rahul",
    category: VerificationCategory.ROOM,
    title: "Room Upgrade Proportionate Deduction Risk",
    question: "Is the patient aware that opting for Deluxe Room (₹12,500/day vs ₹7,000 eligible) will cause a ~44% co-deduction on associated medical charges?",
    reason: "Policy rule ROOM_CAP_PRIVATE_AC enforces proportionate deduction when room entitlement is exceeded.",
    priority: PriorityLevel.HIGH,
    status: VerificationItemStatus.PENDING,
    created_at: "2026-08-16T10:00:00Z"
  }
];

// Write synthetic datasets
fs.writeFileSync(path.join(SYNTHETIC_DIR, 'patients.json'), JSON.stringify(syntheticPatients, null, 2));
fs.writeFileSync(path.join(SYNTHETIC_DIR, 'policies.json'), JSON.stringify(syntheticPolicies, null, 2));
fs.writeFileSync(path.join(SYNTHETIC_DIR, 'journeys.json'), JSON.stringify(syntheticJourneys, null, 2));
fs.writeFileSync(path.join(SYNTHETIC_DIR, 'verification_items.json'), JSON.stringify(syntheticVerificationItems, null, 2));

// 5. Generate all 11 Scenarios into data/scenarios/ (All Bengaluru Region)
const scenarios = [
  {
    id: "01_simple_match",
    name: "Persona 01 — Simple Compatible Admission",
    patientId: "pat-01-ananya",
    hospitalId: "hosp-manipal-old-airport",
    policyId: "pol-syn-ananya",
    procedureId: "proc-knee-replacement",
    roomCategory: "PRIVATE_AC",
    expectedResult: {
      status: "COMPATIBLE",
      networkStatus: "IN_NETWORK",
      cashlessSupported: true,
      roomMatch: true,
      estimatedGrossCost: 240000,
      estimatedPatientExposure: 14000,
      confidence: "HIGH"
    }
  },
  {
    id: "02_room_mismatch",
    name: "Persona 02 — Room Category Mismatch (Proportionate Deduction)",
    patientId: "pat-02-rahul",
    hospitalId: "hosp-apollo-bannerghatta",
    policyId: "pol-syn-rahul",
    procedureId: "proc-knee-replacement",
    roomCategory: "DELUXE",
    expectedResult: {
      status: "WARNING",
      networkStatus: "IN_NETWORK",
      roomMatch: false,
      warning: "Selected Deluxe room exceeds Single Private AC policy limit. Triggers proportionate deduction.",
      estimatedPatientExposure: 65000
    }
  },
  {
    id: "03_network_unknown",
    name: "Persona 03 — Unconfirmed Network Status",
    patientId: "pat-06-vikram",
    hospitalId: "hosp-fortis-cunningham",
    policyId: "pol-care-supreme-7l",
    expectedResult: {
      status: "NEEDS_VERIFICATION",
      networkStatus: "UNKNOWN",
      cashlessSupported: false,
      warning: "Network status unconfirmed. Verify with hospital desk before assuming cashless admission."
    }
  },
  {
    id: "04_preauth_pending",
    name: "Persona 04 — Preauthorization Pending at Admission",
    patientId: "pat-04-suresh",
    hospitalId: "hosp-manipal-old-airport",
    procedureId: "proc-angioplasty",
    expectedResult: {
      status: "ATTENTION_REQUIRED",
      preauthStatus: "PENDING",
      actionItem: "Follow up with TPA desk for differential sanction approval."
    }
  },
  {
    id: "05_cost_exposure",
    name: "Persona 05 — Low Remaining Sum Insured Gap",
    patientId: "pat-05-sunita",
    hospitalId: "hosp-aster-cmi",
    procedureId: "proc-knee-replacement",
    expectedResult: {
      status: "HIGH_EXPOSURE",
      remainingSumInsured: 120000,
      typicalGrossCost: 260000,
      estimatedPatientExposure: 145000,
      warning: "Procedure cost exceeds remaining policy balance by ~₹1,40,000."
    }
  },
  {
    id: "06_missing_policy",
    name: "Persona 06 — Missing Policy Document",
    patientId: "pat-03-priya",
    expectedResult: {
      status: "INPUT_REQUIRED",
      message: "Please enter or upload policy details to unlock insurance-aware hospital matching."
    }
  },
  {
    id: "07_multi_policy",
    name: "Persona 07 — Dual Policy Coordination",
    patientId: "pat-07-kavita",
    primaryPolicyId: "pol-new-india-mediclaim-3l",
    secondaryPolicyId: "pol-care-supreme-7l",
    expectedResult: {
      status: "COORDINATION_GUIDANCE",
      guidance: "Utilize Primary Corporate Policy first; claim balance under Super Top-up with hospital settlement summary."
    }
  },
  {
    id: "08_government_scheme",
    name: "Persona 08 — Ayushman Bharat PM-JAY Cashless Package",
    patientId: "pat-08-ramesh",
    hospitalId: "hosp-narayana-health-city",
    schemeId: "sch-pmjay",
    procedureId: "proc-angioplasty",
    expectedResult: {
      status: "SCHEME_CASHLESS",
      coverageModel: "100% Cashless within pre-defined package rates at empanelled hospital.",
      estimatedPatientExposure: 0
    }
  },
  {
    id: "09_extraction_uncertain",
    name: "Persona 09 — Low Confidence AI Policy Extraction",
    expectedResult: {
      status: "MANUAL_VERIFICATION_REQUIRED",
      confidence: "LOW",
      extractedFieldsRequiringReview: ["room_eligibility", "copay_percentage"]
    }
  },
  {
    id: "10_transfer_option",
    name: "Persona 10 — Out-of-Network Transfer Alternative Suggestion",
    currentHospitalId: "hosp-victoria-government",
    recommendedHospitalId: "hosp-narayana-health-city",
    expectedResult: {
      status: "ALTERNATIVE_SUGGESTION",
      reason: "Narayana Health City is fully in-network with active cashless facility for PM-JAY and Star Health.",
      safetyDisclaimer: "Discuss clinical stability with medical team before considering administrative hospital transfer."
    }
  },
  {
    id: "11_full_demo",
    name: "Persona 11 — Complete End-to-End CareIQ Hackathon Story",
    patientId: "pat-01-ananya",
    hospitalId: "hosp-manipal-old-airport",
    policyId: "pol-syn-ananya",
    procedureId: "proc-knee-replacement",
    journeyId: "jrn-01-ananya"
  }
];

scenarios.forEach((sc) => {
  fs.writeFileSync(path.join(SCENARIOS_DIR, `${sc.id}.json`), JSON.stringify(sc, null, 2));
});

console.log(`Successfully generated synthetic patients, policies, journeys, verification items, and ${scenarios.length} scenarios for Bengaluru region.`);
