/**
 * The API contract, as the frontend sees it.
 *
 * This mirrors backend/src/types/domain.ts. It is a hand-kept mirror rather
 * than a shared import for one reason: the backend declares its vocabularies
 * as TypeScript `enum`s, and this app compiles with `erasableSyntaxOnly`, which
 * rejects enum declarations outright. String-literal unions are the erasable
 * equivalent and they compare cleanly against the JSON the API actually sends.
 *
 * Why this file exists at all: 35 props across 10 components were typed `any`.
 * That is what allowed `patient?.name` — a field `Patient` has never had, the
 * real one is `display_name` — to silently evaluate to undefined and fall
 * through to a hardcoded `|| 'Ananya Sharma'`. Every user saw Ananya's name.
 * With these types the same line is a compile error, so the whole class of
 * "missed lookup quietly becomes someone else's data" is caught by the build.
 *
 * Rule of thumb when extending this file: only declare a field the API really
 * returns. An optional field that does not exist server-side is worse than no
 * field, because it type-checks and then reads undefined at runtime.
 */

// ---------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------

export type DataStatus =
  | 'PUBLIC_REFERENCE'
  | 'USER_PROVIDED'
  | 'SYNTHETIC'
  | 'DERIVED'
  | 'AI_GENERATED';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'NEEDS_VERIFICATION'
  | 'EXPIRED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type AccountType = 'DEMO' | 'NEW_USER';

export type UserRole = 'PATIENT' | 'CAREGIVER' | 'DEMO_ADMIN';

export type InsurerType = 'PRIVATE' | 'PUBLIC' | 'EMPLOYER' | 'SCHEME_ADMINISTRATOR';

export type PolicyType =
  | 'INDIVIDUAL'
  | 'FAMILY_FLOATER'
  | 'EMPLOYER_GROUP'
  | 'GOVERNMENT_SCHEME'
  | 'CRITICAL_ILLNESS';

export type RoomCategoryCode =
  | 'GENERAL'
  | 'SEMI_PRIVATE'
  | 'PRIVATE_AC'
  | 'DELUXE'
  | 'SUITE'
  | 'ANY_ROOM';

export type RuleCategory =
  | 'ROOM'
  | 'NETWORK'
  | 'PREAUTH'
  | 'PROCEDURE'
  | 'DIAGNOSTIC'
  | 'CONSUMABLE'
  | 'COPAY'
  | 'DEDUCTIBLE'
  | 'LIMIT'
  | 'EXCLUSION'
  | 'WAITING_PERIOD'
  | 'CLAIM_DOCUMENT';

export type HospitalType =
  | 'MULTISPECIALTY'
  | 'SPECIALTY'
  | 'GENERAL'
  | 'DIAGNOSTIC'
  | 'PUBLIC'
  | 'PRIVATE'
  | 'TEACHING'
  | 'OTHER';

export type OwnershipType = 'PRIVATE' | 'PUBLIC' | 'TRUST' | 'CORPORATE';

export type NetworkStatus = 'IN_NETWORK' | 'OUT_OF_NETWORK' | 'UNKNOWN';

export type RoomAvailability =
  | 'STATIC_REFERENCE'
  | 'SIMULATED'
  | 'USER_ENTERED'
  | 'LIVE_IF_INTEGRATED';

export type JourneyStage =
  | 'ADMISSION'
  | 'INVESTIGATION'
  | 'PROCEDURE'
  | 'RECOVERY'
  | 'DISCHARGE'
  | 'CLAIM_SUPPORT'
  | 'COMPLETED';

export type JourneyStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type EventStatus = 'PENDING' | 'CURRENT' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';

export type VerificationCategory =
  | 'ROOM'
  | 'NETWORK'
  | 'PREAUTH'
  | 'COST'
  | 'EXCLUSION'
  | 'DOCUMENT'
  | 'CLAIM'
  | 'HOSPITAL'
  | 'POLICY';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * The only four states a verification item can be in. Note there is no
 * 'VERIFIED' — several components tested for it and therefore counted nothing.
 * Settled means RESOLVED or DISMISSED; see isSettled() in lib/verification.ts.
 */
export type VerificationItemStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface DataProvenance {
  data_status: DataStatus;
  verification_status: VerificationStatus;
  confidence: ConfidenceLevel;
  source_id?: string;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  role: UserRole;
  display_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  /** The patient's name. There is no `name` field — this is it. */
  display_name: string;
  account_type?: AccountType;
  auth_user_id?: string;
  email?: string;
  age?: number;
  date_of_birth?: string;
  age_band?: string;
  gender?: string;
  blood_group?: string;
  medical_conditions?: string[];
  current_medications?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  city: string;
  state: string;
  pincode?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Insurer extends DataProvenance {
  id: string;
  name: string;
  short_name: string;
  insurer_type: InsurerType;
  website?: string;
}

export interface InsurancePolicy extends DataProvenance {
  id: string;
  patient_id?: string;
  insurer_id: string;
  policy_name: string;
  policy_type: PolicyType;
  policy_number_masked?: string;
  sum_insured: number;
  remaining_sum_insured?: number;
  room_eligibility: RoomCategoryCode;
  copay_percentage: number;
  deductible_amount: number;
  cashless_supported: boolean;
  preauthorization_supported: boolean;
  pre_hospitalization_days: number;
  post_hospitalization_days: number;
  policy_start_date?: string;
  policy_end_date?: string;
  source_document_id?: string;
}

/**
 * What every policy endpoint actually returns. `insurer_name`, `scheme_type`
 * and `is_government_scheme` are joined from public.insurers by the backend's
 * enrichPolicy() — they are not columns on insurance_policies, which is why
 * reading them off a bare InsurancePolicy always produced undefined and then a
 * hardcoded brand name. Prefer this type anywhere a policy reaches the UI.
 */
export interface EnrichedInsurancePolicy extends InsurancePolicy {
  insurer_name: string;
  insurer_short_name: string;
  scheme_type: InsurerType;
  is_government_scheme: boolean;
}

export interface PolicyRule {
  id: string;
  policy_id: string;
  rule_code: string;
  category: RuleCategory;
  subject: string;
  condition_json: Record<string, unknown>;
  result_json: Record<string, unknown>;
  priority: number;
  source_document_id?: string;
  source_page?: number;
  confidence: ConfidenceLevel;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface PolicyExclusion {
  id: string;
  policy_id: string;
  category: string;
  description: string;
  normalized_code: string;
  source_document_id?: string;
  source_page?: number;
  confidence: ConfidenceLevel;
  verification_status: VerificationStatus;
}

export interface Hospital extends DataProvenance {
  id: string;
  facility_id?: string;
  name: string;
  hospital_type: HospitalType;
  ownership_type: OwnershipType;
  address: string;
  city: string;
  district?: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  beds?: number;
  icu_beds?: number;
  emergency_available: boolean;
  ambulance_available: boolean;
  open_24x7: boolean;
  website?: string;
  /** Metro / non-metro pricing classification, not a quality rating. */
  tier?: string;
  /**
   * "At least one insurer network row says cashless." Undefined means we have
   * not checked — render that as unknown, never as available.
   */
  cashless_available?: boolean;
}

export interface RoomCategory {
  id: string;
  code: RoomCategoryCode;
  name: string;
  rank: number;
  description: string;
}

export interface HospitalRoom extends DataProvenance {
  id: string;
  hospital_id: string;
  room_category_id: string;
  tariff_per_day: number;
  total_rooms?: number;
  availability_status: RoomAvailability;
}

export interface Procedure {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  decision_support_only: boolean;
}

export interface CostComponent {
  id: string;
  procedure_cost_id: string;
  component_code: string;
  component_name: string;
  estimated_amount: number;
  coverage_candidate: boolean;
  data_status: DataStatus;
}

export type DocumentType =
  | 'POLICY'
  | 'SCHEME'
  | 'HOSPITAL_REFERENCE'
  | 'TARIFF_REFERENCE'
  | 'OTHER';

export type ExtractionStatus = 'PENDING' | 'EXTRACTED' | 'FAILED' | 'CONFIRMED';

/**
 * An uploaded policy or tariff document. Named explicitly rather than left to
 * the DOM's global `Document`, which is what api.ts previously resolved to —
 * `getDocuments()` claimed to return a list of browser documents and any field
 * read off it type-checked against the wrong interface entirely.
 */
export interface UploadedDocument {
  id: string;
  owner_user_id?: string;
  document_type: DocumentType;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  extraction_status: ExtractionStatus;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
}

/**
 * Whether a hospital is in an insurer's network. Meaningless without an
 * insurer, which is why GET /hospitals/:id only includes it when the caller
 * passes insurer_id. `network_data_missing` means we hold no network row at all
 * — show that as unknown, not as out-of-network.
 */
export interface HospitalCoverageContext {
  network_status: NetworkStatus;
  cashless_available: boolean;
  preauth_required: boolean;
  network_data_missing: boolean;
}

/**
 * GET /hospitals/:id. `rooms` is the hospital's own published tariff card and
 * `procedures` is only what this hospital has published a price for — both are
 * the reason a room or procedure dropdown never needs hardcoded options again.
 */
export interface HospitalDetail extends Hospital {
  rooms: PublishedRoomTariff[];
  specialties: Specialty[];
  services: Service[];
  procedures: Procedure[];
  coverage?: HospitalCoverageContext;
}

export interface CareJourney {
  id: string;
  patient_id: string;
  hospital_id: string;
  policy_id?: string;
  scheme_id?: string;
  current_stage: JourneyStage;
  journey_status: JourneyStatus;
  started_at: string;
  updated_at: string;
  events?: JourneyEvent[];
  /**
   * Clinical context. Absent means not recorded — the UI must say so rather
   * than substitute a plausible procedure, room or diagnosis.
   */
  procedure_id?: string;
  selected_room_category?: RoomCategoryCode;
  selected_room_tariff?: number;
  admission_date?: string;
  discharge_date?: string;
  diagnosis?: string;
}

export interface JourneyEvent {
  id: string;
  journey_id: string;
  stage: JourneyStage;
  event_type: string;
  title: string;
  description: string;
  status: EventStatus;
  occurred_at: string;
  insurance_relevance: string;
  requires_verification: boolean;
  metadata_json?: Record<string, unknown>;
  created_at: string;
}

export interface VerificationItem {
  id: string;
  patient_id: string;
  journey_id?: string;
  category: VerificationCategory;
  title: string;
  question: string;
  reason: string;
  priority: PriorityLevel;
  status: VerificationItemStatus;
  target_entity_type?: string;
  target_entity_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface DemoProfile {
  id: string;
  name: string;
  insurance_type: string;
  description: string;
  hospital_id: string;
  patient: Patient;
  policy: EnrichedInsurancePolicy;
  journey: CareJourney;
  verification_items: VerificationItem[];
}

export interface HospitalMatchResult {
  hospital: Hospital;
  matchScore: number;
  networkStatus: NetworkStatus;
  cashlessSupported: boolean;
  roomCategoryMatch: boolean;
  roomTariff: number;
  estimatedTotalCost: number;
  estimatedPatientExposure: number;
  reasons: string[];
  verificationItems: string[];
}

// ---------------------------------------------------------------------------
// Derived responses — computed server-side, never recomputed in a component
// ---------------------------------------------------------------------------

/** Where each number in a cost estimate came from. Rendered, not hidden. */
export interface CostProvenance {
  procedure_cost_source:
    | 'HOSPITAL_PRICE_LIST'
    | 'PEER_HOSPITAL_PRICE_LIST'
    | 'MODELLED_PACKAGE_RATE';
  components_source: 'HOSPITAL_ITEMISED' | 'MODELLED_SPLIT';
  room_tariff_source: 'HOSPITAL_TARIFF_CARD';
  is_estimated: boolean;
  notes: string[];
}

export interface PublishedRoomTariff {
  code: RoomCategoryCode;
  name: string;
  rank: number;
  room_category_id: string;
  tariff_per_day: number;
  total_rooms?: number;
}

/** Echo of the inputs the estimate was actually computed from. */
export interface CostEstimateContext {
  policy_id: string;
  hospital_id: string;
  procedure_id: string;
  room_category: RoomCategoryCode;
  selected_room_tariff: number;
  eligible_room_tariff: number;
  available_room_categories: PublishedRoomTariff[];
}

/**
 * What the cost engine itself returns. The what-if endpoint embeds two of
 * these bare — it carries a single top-level `provenance` for both, and no
 * `context` at all, so neither embedded estimate may be typed as the richer
 * CostEstimate below.
 */
export interface CostEstimateCore {
  procedureName: string;
  typicalGrossCost: number;
  estimatedCoveredAmount: number;
  estimatedCopayAmount: number;
  estimatedDeductibleAmount: number;
  potentialNonCoveredAmount: number;
  indicativePatientExposure: number;
  costComponents: CostComponent[];
  disclaimer: string;
}

/**
 * POST /cost/estimate. This is the single source of coverage arithmetic —
 * proportionate deduction, room cap, co-pay, deductible and the sum-insured
 * ceiling all resolved by the backend cost engine. Components must not
 * re-derive any of it from a policy object.
 */
export interface CostEstimate extends CostEstimateCore {
  provenance: CostProvenance;
  context: CostEstimateContext;
}

/** One side of a what-if comparison, with the room it was priced against. */
export interface WhatIfRoom {
  code: RoomCategoryCode;
  tariff: number;
  /** Whether the policy's room cap permits this category without deduction. */
  eligible: boolean;
}

/**
 * The arithmetic difference between the two estimates. Every field is computed
 * server-side by the same engine that produced the estimates, so a component
 * subtracting two numbers itself would be a second, divergent implementation.
 */
export interface WhatIfDelta {
  oopDelta: number;
  coveredDelta: number;
  nonCoveredDelta: number;
  grossDelta: number;
  isRoomUpgrade: boolean;
  penaltyApplies: boolean;
  penaltyPercent: number;
  percentageOopChange: number;
}

/**
 * POST /cost/what-if. The alternative defaults to the next category this
 * hospital actually publishes, not a fixed 'DELUXE' — four of nine hospitals
 * have no deluxe room. When there is nothing above the current category the
 * endpoint answers 409 NO_ALTERNATIVE_ROOM; that message is the UI's content,
 * not an error to swallow.
 */
export interface WhatIfComparison {
  currentEstimate: CostEstimateCore;
  alternativeEstimate: CostEstimateCore;
  provenance: CostProvenance;
  delta: WhatIfDelta;
  explanation: string;
  currentRoom: WhatIfRoom;
  alternativeRoom: WhatIfRoom;
  available_room_categories: PublishedRoomTariff[];
}

export type ConfidenceFactorKey = 'network' | 'room' | 'procedure' | 'policy' | 'cost';

export interface ConfidenceFactor {
  score: number;
  maxScore: number;
  /** e.g. UNKNOWN, NOT_SELECTED, NOT_STARTED, MISSING, ALIGNED, CASHLESS. */
  status: string;
  label: string;
}

/**
 * POST /ai/coverage-confidence. Unknown scores zero and says UNKNOWN — an
 * empty request scores 0/100, not 100/100. Render the factor labels verbatim;
 * they are the explanation.
 */
export interface CoverageConfidence {
  totalScore: number;
  ratingLabel: string;
  factors: Record<ConfidenceFactorKey, ConfidenceFactor>;
  disclaimer: string;
}

/**
 * POST /ai/stage-guidance. `isAiGenerated` false means the deterministic rules
 * engine answered because Gemini was unavailable or returned nothing usable —
 * the UI must show which one spoke rather than badge every answer as AI.
 */
export interface StageGuidance {
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

/**
 * POST /ai/questions. Three fixed desks, not a list of categories — the
 * endpoint returns one object with three arrays, so treating the response as
 * an array meant `.map()` over an object and no questions rendered at all.
 */
export interface QuestionsToAsk {
  billingDeskQuestions: string[];
  insuranceCoordinatorQuestions: string[];
  nursingAdminQuestions: string[];
}

export interface RagCitation {
  pageNumber: number;
  sectionTitle: string;
  quoteExcerpt: string;
  policyName: string;
  relevanceScore: number;
}

/**
 * POST /ai/rag/query. `confidence` has no UNKNOWN here: the retriever always
 * commits to one of three levels, and LOW is what "no clause matched" returns.
 * Do not default a missing confidence to HIGH.
 */
export interface RagAnswer {
  query: string;
  answer: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  citations: RagCitation[];
  uncertaintyNotes: string[];
  disclaimer: string;
}

export interface HospitalMatchExplanation {
  summary: string;
  keyFactors: string[];
  caveatsAndUncertainties: string[];
  disclaimer: string;
  isAiGenerated?: boolean;
  modelUsed?: string;
}

export interface AuthSessionToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user?: { id: string; email?: string };
}

/**
 * POST /auth/login | /auth/register | /auth/demo-login | GET /auth/me.
 *
 * Field names here are the wire names, not tidied ones: the API sends
 * `verification_items` in snake_case and `isDemo` in camelCase. Renaming them
 * in the type would type-check while reading undefined — CareIQContext was
 * reading `res.verificationItems`, which never existed on the response.
 */
export interface AuthSession {
  user: AuthUser;
  session?: AuthSessionToken;
  patient: Patient | null;
  policy?: EnrichedInsurancePolicy | null;
  policies?: EnrichedInsurancePolicy[];
  journey?: CareJourney | null;
  verification_items?: VerificationItem[];
  isDemo?: boolean;
}

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  account_type?: AccountType;
}
