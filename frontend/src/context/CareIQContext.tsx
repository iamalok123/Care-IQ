import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { countOpen } from '../lib/verification';
import type {
  AccountType,
  CareJourney,
  DemoProfile,
  EnrichedInsurancePolicy,
  Hospital,
  Patient,
  RoomCategoryCode,
  VerificationItem
} from '../types/domain';

export interface QuestionsModalState {
  isOpen: boolean;
  /** Null when we do not know which hospital — the modal says so. */
  hospitalName: string | null;
  isRoomExceeded?: boolean;
}

export interface StartJourneyInput {
  hospitalId: string;
  procedureId?: string;
  selectedRoomCategory?: RoomCategoryCode;
  admissionDate?: string;
  diagnosis?: string;
}

export interface CareIQContextType {
  activePatient: Patient | null;
  policies: EnrichedInsurancePolicy[];
  activePolicy: EnrichedInsurancePolicy | null;
  hospitals: Hospital[];
  journey: CareJourney | null;
  setJourney: (journey: CareJourney | null) => void;
  verificationItems: VerificationItem[];
  /** Checkpoints still needing action: PENDING plus IN_PROGRESS. */
  pendingCount: number;
  demoProfiles: DemoProfile[];
  accountType: AccountType;
  loading: boolean;
  /** Set when a load failed, so views can say so instead of showing blanks. */
  loadError: string | null;
  feedbackBanner: string | null;

  handleLoadDemoProfile: (profileId: string) => Promise<void>;
  handleStartJourney: (input: StartJourneyInput) => Promise<void>;
  refreshVerificationItems: () => Promise<void>;
  loadDataForPatient: (patient: Patient) => Promise<void>;

  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean) => void;
  questionsModal: QuestionsModalState;
  openQuestionsModal: (hospitalName?: string | null, isRoomExceeded?: boolean) => void;
  closeQuestionsModal: () => void;
}

const CareIQContext = createContext<CareIQContextType | undefined>(undefined);

function message(err: unknown, fallback: string): string {
  if (err instanceof ApiError || err instanceof Error) return err.message || fallback;
  return fallback;
}

/**
 * Picks the journey to show. Prefers the one still ACTIVE, most recently
 * updated. Previously this was `jrns[0]` — whatever the API happened to return
 * first, which meant a completed journey could shadow the live one.
 */
function pickJourney(journeys: CareJourney[]): CareJourney | null {
  if (journeys.length === 0) return null;
  const byRecency = [...journeys].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  return byRecency.find((j) => j.journey_status === 'ACTIVE') ?? byRecency[0];
}

/**
 * Picks the policy to show. If a journey names a policy, that is the policy in
 * play — anything else contradicts the journey the rest of the UI is rendering.
 */
function pickPolicy(
  policies: EnrichedInsurancePolicy[],
  journey: CareJourney | null
): EnrichedInsurancePolicy | null {
  if (policies.length === 0) return null;
  if (journey?.policy_id) {
    const linked = policies.find((p) => p.id === journey.policy_id);
    if (linked) return linked;
  }
  return policies[0];
}

export const CareIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { patient: authPatient, loginAsDemo, isDemoMode } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [policies, setPolicies] = useState<EnrichedInsurancePolicy[]>([]);
  const [activePolicy, setActivePolicy] = useState<EnrichedInsurancePolicy | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [demoProfiles, setDemoProfiles] = useState<DemoProfile[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [questionsModal, setQuestionsModal] = useState<QuestionsModalState>({
    isOpen: false,
    hospitalName: null
  });

  /**
   * DEMO unless the account says otherwise. The old expression treated any
   * signed-in patient without an explicit 'DEMO' marker as NEW_USER even in a
   * demo session, so a demo persona could be labelled as a real account.
   */
  const accountType: AccountType =
    authPatient?.account_type ?? (isDemoMode ? 'DEMO' : 'NEW_USER');

  const showBanner = useCallback((text: string) => {
    setFeedbackBanner(text);
    window.setTimeout(() => setFeedbackBanner(null), 3500);
  }, []);

  const openQuestionsModal = useCallback(
    (hospitalName?: string | null, isRoomExceeded?: boolean) => {
      // No 'the hospital' fallback. If the caller does not know the hospital,
      // the modal must say the hospital is not recorded, not invent a subject.
      setQuestionsModal({ isOpen: true, hospitalName: hospitalName ?? null, isRoomExceeded });
    },
    []
  );

  const closeQuestionsModal = useCallback(() => {
    setQuestionsModal({ isOpen: false, hospitalName: null });
  }, []);

  const loadDataForPatient = useCallback(async (patient: Patient) => {
    try {
      const [pols, jrns, vers] = await Promise.all([
        api.getPolicies(patient.id),
        api.getJourneys(patient.id),
        api.getVerificationItems(patient.id)
      ]);

      const chosenJourney = pickJourney(jrns ?? []);
      setPolicies(pols ?? []);
      setJourney(chosenJourney);
      setActivePolicy(pickPolicy(pols ?? [], chosenJourney));
      setVerificationItems(vers ?? []);
      setLoadError(null);
    } catch (err) {
      // A failed load clears the patient-scoped state. Leaving the previous
      // patient's policies on screen is how one profile's numbers ended up
      // rendered under another profile's name.
      setPolicies([]);
      setActivePolicy(null);
      setJourney(null);
      setVerificationItems([]);
      setLoadError(message(err, 'Could not load this profile’s records.'));
    }
  }, []);

  // Reference data: the same for every visitor, so it loads once and is not
  // reloaded when the signed-in patient changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hosps, demos] = await Promise.all([api.getHospitals(), api.getDemoProfiles()]);
        if (cancelled) return;
        setHospitals(hosps ?? []);
        setDemoProfiles(demos ?? []);
      } catch (err) {
        if (cancelled) return;
        setLoadError(message(err, 'Could not load hospital reference data.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Patient-scoped data. Keyed on the patient id so signing in, signing out and
  // switching demo personas all run through exactly one path.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (!authPatient) {
        setActivePatient(null);
        setPolicies([]);
        setActivePolicy(null);
        setJourney(null);
        setVerificationItems([]);
        setLoading(false);
        return;
      }
      setActivePatient(authPatient);
      await loadDataForPatient(authPatient);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authPatient, loadDataForPatient]);

  const handleLoadDemoProfile = useCallback(
    async (profileId: string) => {
      setLoading(true);
      try {
        const res = await loginAsDemo(profileId);
        if (res.patient) setActivePatient(res.patient);

        const linkedJourney = res.journey ?? null;
        const linkedPolicies = res.policies ?? (res.policy ? [res.policy] : []);
        setJourney(linkedJourney);
        setPolicies(linkedPolicies);
        setActivePolicy(pickPolicy(linkedPolicies, linkedJourney));
        // The response field is verification_items. Reading `verificationItems`
        // was always undefined, so the checkpoint list stayed empty until a
        // separate effect happened to refill it.
        setVerificationItems(res.verification_items ?? []);
        setLoadError(null);

        showBanner(`Loaded demo profile: ${res.patient?.display_name ?? profileId}`);
        navigate('/dashboard');
      } catch (err) {
        setLoadError(message(err, 'Could not load that demo profile.'));
      } finally {
        setLoading(false);
      }
    },
    [loginAsDemo, navigate, showBanner]
  );

  const handleStartJourney = useCallback(
    async (input: StartJourneyInput) => {
      if (!activePatient) {
        setLoadError('Sign in before starting a care journey.');
        return;
      }
      try {
        const newJourney = await api.createJourney({
          patient_id: activePatient.id,
          hospital_id: input.hospitalId,
          policy_id: activePolicy?.id,
          procedure_id: input.procedureId,
          selected_room_category: input.selectedRoomCategory,
          admission_date: input.admissionDate,
          diagnosis: input.diagnosis
        });
        setJourney(newJourney);
        const vers = await api.getVerificationItems(activePatient.id);
        setVerificationItems(vers ?? []);
        setLoadError(null);
        showBanner('Care journey started.');
        navigate('/care-journey');
      } catch (err) {
        setLoadError(message(err, 'Could not start the care journey.'));
      }
    },
    [activePatient, activePolicy?.id, navigate, showBanner]
  );

  const refreshVerificationItems = useCallback(async () => {
    if (!activePatient) return;
    try {
      const vers = await api.getVerificationItems(activePatient.id);
      setVerificationItems(vers ?? []);
    } catch (err) {
      setLoadError(message(err, 'Could not refresh the checkpoint list.'));
    }
  }, [activePatient]);

  // PENDING plus IN_PROGRESS. Counting PENDING alone made a checkpoint vanish
  // from the badge the moment someone started working on it.
  const pendingCount = countOpen(verificationItems);

  return (
    <CareIQContext.Provider
      value={{
        activePatient,
        policies,
        activePolicy,
        hospitals,
        journey,
        setJourney,
        verificationItems,
        pendingCount,
        demoProfiles,
        accountType,
        loading,
        loadError,
        feedbackBanner,
        handleLoadDemoProfile,
        handleStartJourney,
        refreshVerificationItems,
        loadDataForPatient,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isChatbotOpen,
        setIsChatbotOpen,
        questionsModal,
        openQuestionsModal,
        closeQuestionsModal
      }}
    >
      {children}
    </CareIQContext.Provider>
  );
};

export function useCareIQ(): CareIQContextType {
  const context = useContext(CareIQContext);
  if (!context) {
    throw new Error('useCareIQ must be used within a CareIQProvider');
  }
  return context;
}
