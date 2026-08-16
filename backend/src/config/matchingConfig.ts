/**
 * Configurable weights and thresholds for Hospital Matching Engine.
 */
export interface MatchingWeights {
  networkWeight: number;
  roomCompatibilityWeight: number;
  specialtyServiceWeight: number;
  criticalCareWeight: number;
  costAlignmentWeight: number;
}

export const defaultMatchingWeights: MatchingWeights = {
  networkWeight: 35,
  roomCompatibilityWeight: 25,
  specialtyServiceWeight: 15,
  criticalCareWeight: 10,
  costAlignmentWeight: 15
};
