/**
 * CareIQ Runtime Feature Flags
 * Controls active intelligence engines and AI integrations safely.
 */
export interface FeatureFlags {
  AI_POLICY_EXTRACTION: boolean;
  RAG_ENABLED: boolean;
  COST_ENGINE: boolean;
  DEMO_MODE: boolean;
  CAREGIVER_MODE: boolean;
  AI_QUESTIONS: boolean;
  PROPORTIONATE_DEDUCTIONS: boolean;
}

export const featureFlags: FeatureFlags = {
  AI_POLICY_EXTRACTION: true,
  RAG_ENABLED: true,
  COST_ENGINE: true,
  DEMO_MODE: true,
  CAREGIVER_MODE: true,
  AI_QUESTIONS: true,
  PROPORTIONATE_DEDUCTIONS: true
};
