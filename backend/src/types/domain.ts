export enum DataStatus {
  PUBLIC_REFERENCE = 'PUBLIC_REFERENCE',
  USER_PROVIDED = 'USER_PROVIDED',
  SYNTHETIC = 'SYNTHETIC',
  DERIVED = 'DERIVED',
  AI_GENERATED = 'AI_GENERATED'
}

export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  PARTIALLY_VERIFIED = 'PARTIALLY_VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  NEEDS_VERIFICATION = 'NEEDS_VERIFICATION',
  EXPIRED = 'EXPIRED'
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  UNKNOWN = 'UNKNOWN'
}

export enum UserRole {
  PATIENT = 'PATIENT',
  CAREGIVER = 'CAREGIVER',
  DEMO_ADMIN = 'DEMO_ADMIN'
}

export enum RelationshipType {
  SELF = 'SELF',
  PARENT = 'PARENT',
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  GUARDIAN = 'GUARDIAN',
  OTHER = 'OTHER'
}

export enum PermissionLevel {
  VIEW = 'VIEW',
  VIEW_AND_UPDATE = 'VIEW_AND_UPDATE',
  FULL_DEMO_ACCESS = 'FULL_DEMO_ACCESS'
}

export enum InsurerType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  EMPLOYER = 'EMPLOYER',
  SCHEME_ADMINISTRATOR = 'SCHEME_ADMINISTRATOR'
}

export enum PolicyType {
  INDIVIDUAL = 'INDIVIDUAL',
  FAMILY_FLOATER = 'FAMILY_FLOATER',
  EMPLOYER_GROUP = 'EMPLOYER_GROUP',
  GOVERNMENT_SCHEME = 'GOVERNMENT_SCHEME',
  CRITICAL_ILLNESS = 'CRITICAL_ILLNESS'
}

export enum RoomCategoryCode {
  GENERAL = 'GENERAL',
  SEMI_PRIVATE = 'SEMI_PRIVATE',
  PRIVATE_AC = 'PRIVATE_AC',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  ANY_ROOM = 'ANY_ROOM'
}

export enum RuleCategory {
  ROOM = 'ROOM',
  NETWORK = 'NETWORK',
  PREAUTH = 'PREAUTH',
  PROCEDURE = 'PROCEDURE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  CONSUMABLE = 'CONSUMABLE',
  COPAY = 'COPAY',
  DEDUCTIBLE = 'DEDUCTIBLE',
  LIMIT = 'LIMIT',
  EXCLUSION = 'EXCLUSION',
  WAITING_PERIOD = 'WAITING_PERIOD',
  CLAIM_DOCUMENT = 'CLAIM_DOCUMENT'
}

export enum HospitalType {
  MULTISPECIALTY = 'MULTISPECIALTY',
  SPECIALTY = 'SPECIALTY',
  GENERAL = 'GENERAL',
  DIAGNOSTIC = 'DIAGNOSTIC',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEACHING = 'TEACHING',
  OTHER = 'OTHER'
}

export enum OwnershipType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  TRUST = 'TRUST',
  CORPORATE = 'CORPORATE'
}

export enum NetworkStatus {
  IN_NETWORK = 'IN_NETWORK',
  OUT_OF_NETWORK = 'OUT_OF_NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export enum RoomAvailability {
  STATIC_REFERENCE = 'STATIC_REFERENCE',
  SIMULATED = 'SIMULATED',
  USER_ENTERED = 'USER_ENTERED',
  LIVE_IF_INTEGRATED = 'LIVE_IF_INTEGRATED'
}

export enum JourneyStage {
  ADMISSION = 'ADMISSION',
  INVESTIGATION = 'INVESTIGATION',
  PROCEDURE = 'PROCEDURE',
  RECOVERY = 'RECOVERY',
  DISCHARGE = 'DISCHARGE',
  CLAIM_SUPPORT = 'CLAIM_SUPPORT',
  COMPLETED = 'COMPLETED'
}

export enum JourneyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum EventStatus {
  PENDING = 'PENDING',
  CURRENT = 'CURRENT',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED'
}

export enum VerificationCategory {
  ROOM = 'ROOM',
  NETWORK = 'NETWORK',
  PREAUTH = 'PREAUTH',
  COST = 'COST',
  EXCLUSION = 'EXCLUSION',
  DOCUMENT = 'DOCUMENT',
  CLAIM = 'CLAIM',
  HOSPITAL = 'HOSPITAL',
  POLICY = 'POLICY'
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum VerificationItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

export enum RecommendationType {
  HOSPITAL = 'HOSPITAL',
  ROOM = 'ROOM',
  VERIFICATION = 'VERIFICATION',
  DOCUMENT = 'DOCUMENT',
  COST_CHECK = 'COST_CHECK',
  JOURNEY_ACTION = 'JOURNEY_ACTION'
}

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
  display_name: string;
  date_of_birth?: string;
  age_band?: string;
  gender?: string;
  city: string;
  state: string;
  pincode?: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface CaregiverRelationship {
  id: string;
  caregiver_user_id: string;
  patient_id: string;
  relationship_type: RelationshipType;
  permission_level: PermissionLevel;
  created_at: string;
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

export interface PolicyRule {
  id: string;
  policy_id: string;
  rule_code: string;
  category: RuleCategory;
  subject: string;
  condition_json: Record<string, any>;
  result_json: Record<string, any>;
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

export interface Document {
  id: string;
  owner_user_id?: string;
  document_type: 'POLICY' | 'SCHEME' | 'HOSPITAL_REFERENCE' | 'TARIFF_REFERENCE' | 'OTHER';
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  extraction_status: 'PENDING' | 'EXTRACTED' | 'FAILED' | 'CONFIRMED';
  created_at: string;
  updated_at: string;
}

export interface ExtractionEvidence {
  id: string;
  extraction_id: string;
  field_path: string;
  extracted_value: string;
  source_page?: number;
  source_text?: string;
  confidence: ConfidenceLevel;
  verification_status: VerificationStatus;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  extraction_version: string;
  structured_json: Record<string, any>;
  confidence: ConfidenceLevel;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  model_name?: string;
  created_at: string;
  evidences?: ExtractionEvidence[];
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
}

export interface Specialty {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface HospitalSpecialty {
  hospital_id: string;
  specialty_id: string;
  availability_status: boolean;
  source_id?: string;
  confidence: ConfidenceLevel;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
}

export interface HospitalService {
  hospital_id: string;
  service_id: string;
  availability_status: boolean;
  operating_hours?: string;
  source_id?: string;
  confidence: ConfidenceLevel;
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

export interface ProcedureCost extends DataProvenance {
  id: string;
  hospital_id: string;
  procedure_id: string;
  min_cost: number;
  max_cost: number;
  typical_cost: number;
  currency: string;
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

export interface HospitalNetwork extends DataProvenance {
  id: string;
  hospital_id: string;
  insurer_id: string;
  network_status: NetworkStatus;
  cashless_status: boolean;
  preauth_required: boolean;
}

export interface GovernmentScheme extends DataProvenance {
  id: string;
  name: string;
  short_name: string;
  administering_body: string;
  state_scope: string;
  coverage_model: string;
  eligibility_summary: string;
}

export interface SchemeRule {
  id: string;
  scheme_id: string;
  rule_code: string;
  category: RuleCategory;
  condition_json: Record<string, any>;
  result_json: Record<string, any>;
  source_id?: string;
  source_page?: number;
  confidence: ConfidenceLevel;
  verification_status: VerificationStatus;
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
  metadata_json?: Record<string, any>;
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

export interface Recommendation {
  id: string;
  patient_id: string;
  journey_id?: string;
  recommendation_type: RecommendationType;
  target_entity_type: string;
  target_entity_id: string;
  score: number;
  confidence: ConfidenceLevel;
  reason_json: string[];
  explanation: string;
  requires_verification: boolean;
  created_at: string;
  expires_at?: string;
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

export interface CostEstimateResult {
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
