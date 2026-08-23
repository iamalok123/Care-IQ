/**
 * One answer to "what stage is this patient in".
 *
 * Before this file there were three: Dashboard defaulted a missing stage to
 * ADMISSION, CareJourneyView and CaregiverShareModal defaulted it to PROCEDURE.
 * So a patient with no journey was shown at the start of care on the dashboard
 * and mid-procedure on the journey page — which is precisely the "the dashboard
 * says something the section it links to doesn't" problem.
 *
 * The fix is not to pick one default. It is to stop defaulting: no journey
 * means no stage, and the UI says so.
 */
import type { CareJourney, JourneyStage } from '../types/domain';

/** The five stages shown in the stepper, in clinical order. */
export const JOURNEY_STAGES: JourneyStage[] = [
  'ADMISSION',
  'INVESTIGATION',
  'PROCEDURE',
  'RECOVERY',
  'DISCHARGE'
];

/** Stages a journey can hold that sit outside the stepper. */
export const TERMINAL_STAGES: JourneyStage[] = ['CLAIM_SUPPORT', 'COMPLETED'];

export const STAGE_LABELS: Record<JourneyStage, string> = {
  ADMISSION: 'Admission',
  INVESTIGATION: 'Investigation',
  PROCEDURE: 'Procedure',
  RECOVERY: 'Recovery',
  DISCHARGE: 'Discharge',
  CLAIM_SUPPORT: 'Claim support',
  COMPLETED: 'Completed'
};

export interface ResolvedStage {
  /** Null when there is no journey — do not substitute a stage. */
  stage: JourneyStage | null;
  label: string;
  /** -1 when there is no journey, so no step renders as current. */
  index: number;
  totalStages: number;
  /** True once care has moved past the stepper (claim support / completed). */
  isPastStepper: boolean;
  hasJourney: boolean;
}

export function resolveJourneyStage(journey: CareJourney | null | undefined): ResolvedStage {
  const stage = journey?.current_stage ?? null;

  if (!stage) {
    return {
      stage: null,
      label: 'Journey not started',
      index: -1,
      totalStages: JOURNEY_STAGES.length,
      isPastStepper: false,
      hasJourney: false
    };
  }

  const index = JOURNEY_STAGES.indexOf(stage);
  const isPastStepper = index === -1;

  return {
    stage,
    label: STAGE_LABELS[stage] ?? stage,
    // A journey in CLAIM_SUPPORT or COMPLETED has finished every stepper stage,
    // so the bar reads full rather than snapping back to step one.
    index: isPastStepper ? JOURNEY_STAGES.length - 1 : index,
    totalStages: JOURNEY_STAGES.length,
    isPastStepper,
    hasJourney: true
  };
}

/** Progress along the stepper, 0-100. Zero when there is no journey. */
export function stageProgressPercent(resolved: ResolvedStage): number {
  if (!resolved.hasJourney || resolved.index < 0) return 0;
  if (resolved.isPastStepper) return 100;
  return Math.round((resolved.index / (resolved.totalStages - 1)) * 100);
}
