import { z } from 'zod';
import {
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  UserRole,
  RelationshipType,
  PermissionLevel,
  InsurerType,
  PolicyType,
  RoomCategoryCode,
  RuleCategory,
  HospitalType,
  OwnershipType,
  NetworkStatus,
  RoomAvailability,
  JourneyStage,
  JourneyStatus,
  EventStatus,
  VerificationCategory,
  PriorityLevel,
  VerificationItemStatus,
  RecommendationType
} from '../types/domain';

export const dataProvenanceSchema = z.object({
  data_status: z.nativeEnum(DataStatus).default(DataStatus.USER_PROVIDED),
  verification_status: z.nativeEnum(VerificationStatus).default(VerificationStatus.UNVERIFIED),
  confidence: z.nativeEnum(ConfidenceLevel).default(ConfidenceLevel.HIGH),
  source_id: z.string().optional(),
  last_verified_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.PATIENT),
  display_name: z.string().min(1, 'Display name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const patientSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid('Valid user ID required'),
  display_name: z.string().min(1, 'Patient name is required'),
  date_of_birth: z.string().optional(),
  age_band: z.string().optional(),
  gender: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().optional(),
  preferred_language: z.string().default('English')
});

export const insurancePolicySchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  insurer_id: z.string().min(1, 'Insurer selection is required'),
  policy_name: z.string().min(1, 'Policy name is required'),
  policy_type: z.nativeEnum(PolicyType).default(PolicyType.INDIVIDUAL),
  policy_number_masked: z.string().optional(),
  sum_insured: z.number().positive('Sum insured must be positive'),
  remaining_sum_insured: z.number().nonnegative().optional(),
  room_eligibility: z.nativeEnum(RoomCategoryCode).default(RoomCategoryCode.PRIVATE_AC),
  copay_percentage: z.number().min(0).max(100).default(0),
  deductible_amount: z.number().min(0).default(0),
  cashless_supported: z.boolean().default(true),
  preauthorization_supported: z.boolean().default(true),
  pre_hospitalization_days: z.number().default(30),
  post_hospitalization_days: z.number().default(60),
  policy_start_date: z.string().optional(),
  policy_end_date: z.string().optional(),
  source_document_id: z.string().optional()
}).merge(dataProvenanceSchema.partial());

export const policyRuleSchema = z.object({
  id: z.string().uuid().optional(),
  policy_id: z.string().min(1),
  rule_code: z.string().min(1),
  category: z.nativeEnum(RuleCategory),
  subject: z.string().min(1),
  condition_json: z.record(z.string(), z.any()),
  result_json: z.record(z.string(), z.any()),
  priority: z.number().default(1),
  source_document_id: z.string().optional(),
  source_page: z.number().optional(),
  confidence: z.nativeEnum(ConfidenceLevel).default(ConfidenceLevel.HIGH),
  verification_status: z.nativeEnum(VerificationStatus).default(VerificationStatus.VERIFIED)
});

export const hospitalSearchSchema = z.object({
  city: z.string().min(1, 'City filter required'),
  specialty_code: z.string().optional(),
  service_code: z.string().optional(),
  insurer_id: z.string().optional(),
  preferred_room_category: z.nativeEnum(RoomCategoryCode).optional(),
  max_cost: z.number().optional(),
  network_only: z.boolean().optional().default(false)
});

export const journeyEventSchema = z.object({
  id: z.string().uuid().optional(),
  journey_id: z.string().min(1, 'Journey ID required'),
  stage: z.nativeEnum(JourneyStage),
  event_type: z.string().min(1, 'Event type required'),
  title: z.string().min(1, 'Event title required'),
  description: z.string(),
  status: z.nativeEnum(EventStatus).default(EventStatus.COMPLETED),
  occurred_at: z.string().default(() => new Date().toISOString()),
  insurance_relevance: z.string(),
  requires_verification: z.boolean().default(false),
  metadata_json: z.record(z.string(), z.any()).optional()
});

export const verificationItemSchema = z.object({
  id: z.string().uuid().optional(),
  patient_id: z.string().min(1),
  journey_id: z.string().optional(),
  category: z.nativeEnum(VerificationCategory),
  title: z.string().min(1),
  question: z.string().min(1),
  reason: z.string().min(1),
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  status: z.nativeEnum(VerificationItemStatus).default(VerificationItemStatus.PENDING),
  target_entity_type: z.string().optional(),
  target_entity_id: z.string().optional()
});
