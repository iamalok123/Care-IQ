import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export interface QuestionsModalState {
  isOpen: boolean;
  hospitalName: string;
  isRoomExceeded?: boolean;
}

export interface CareIQContextType {
  // Data State
  patients: any[];
  activePatient: any;
  setActivePatient: (patient: any) => void;
  policies: any[];
  activePolicy: any;
  setActivePolicy: (policy: any) => void;
  hospitals: any[];
  journey: any;
  setJourney: (journey: any) => void;
  verificationItems: any[];
  pendingCount: number;
  scenarios: any[];
  loading: boolean;
  feedbackBanner: string | null;
  setFeedbackBanner: (banner: string | null) => void;

  // Actions
  handleSelectPatient: (patient: any) => Promise<void>;
  handleLoadScenario: (scenarioId: string) => Promise<void>;
  handleStartJourney: (hospitalId: string) => Promise<void>;
  refreshVerificationItems: () => Promise<void>;
  loadDataForPatient: (patient: any) => Promise<void>;

  // Modal & Drawer State
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  showScenarioGuide: boolean;
  setShowScenarioGuide: (show: boolean) => void;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean) => void;
  questionsModal: QuestionsModalState;
  setQuestionsModal: (state: QuestionsModalState) => void;
  openQuestionsModal: (hospitalName?: string, isRoomExceeded?: boolean) => void;
  closeQuestionsModal: () => void;
}

const CareIQContext = createContext<CareIQContextType | undefined>(undefined);

export const CareIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // Navigation / Drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showScenarioGuide, setShowScenarioGuide] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Data State
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [journey, setJourney] = useState<any>(null);
  const [verificationItems, setVerificationItems] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);

  // Feedback & Loading
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Questions Modal
  const [questionsModal, setQuestionsModal] = useState<QuestionsModalState>({
    isOpen: false,
    hospitalName: ''
  });

  const openQuestionsModal = (hospitalName?: string, isRoomExceeded?: boolean) => {
    const defaultName = hospitalName || hospitals.find((h) => h.id === journey?.hospital_id)?.name || 'the hospital';
    setQuestionsModal({
      isOpen: true,
      hospitalName: defaultName,
      isRoomExceeded
    });
  };

  const closeQuestionsModal = () => {
    setQuestionsModal({
      isOpen: false,
      hospitalName: ''
    });
  };

  const loadDataForPatient = async (patient: any) => {
    if (!patient) return;
    try {
      const [pols, jrns, vers] = await Promise.all([
        api.getPolicies(patient.id),
        api.getJourneys(patient.id),
        api.getVerificationItems(patient.id)
      ]);

      setPolicies(pols || []);
      setActivePolicy(pols && pols.length > 0 ? pols[0] : null);

      if (jrns && jrns.length > 0) {
        setJourney(jrns[0]);
      } else {
        const allJourneys = await api.getJourneys();
        setJourney(allJourneys && allJourneys.length > 0 ? allJourneys[0] : null);
      }

      setVerificationItems(vers || []);
    } catch (err) {
      console.error('Error loading patient context:', err);
    }
  };

  const initApp = async () => {
    setLoading(true);
    try {
      const [pts, hosps, scens] = await Promise.all([
        api.getPatients(),
        api.getHospitals(),
        api.getScenarios()
      ]);

      setPatients(pts || []);
      setHospitals(hosps || []);
      setScenarios(scens || []);

      if (pts && pts.length > 0) {
        const firstPatient = pts[0];
        setActivePatient(firstPatient);
        await loadDataForPatient(firstPatient);
      }
    } catch (err) {
      console.error('Failed to initialize app:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
    const hasSeen = localStorage.getItem('careiq_onboarding_completed');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSelectPatient = async (patient: any) => {
    setActivePatient(patient);
    await loadDataForPatient(patient);
    setFeedbackBanner(`Switched active profile to ${patient.display_name} (${patient.city})`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  const handleLoadScenario = async (scenarioId: string) => {
    try {
      const res = await api.loadScenario(scenarioId);
      if (res.patient) {
        setActivePatient(res.patient);
      }
      if (res.policy) {
        setActivePolicy(res.policy);
        setPolicies([res.policy]);
      }
      if (res.journey) {
        setJourney(res.journey);
      } else if (res.patient?.id) {
        const jrns = await api.getJourneys(res.patient.id);
        setJourney(jrns && jrns.length > 0 ? jrns[0] : null);
      }

      if (res.verificationItems && res.verificationItems.length > 0) {
        setVerificationItems(res.verificationItems);
      } else if (res.patient?.id) {
        const vers = await api.getVerificationItems(res.patient.id);
        setVerificationItems(vers || []);
      }

      setFeedbackBanner(`Loaded Scenario: ${res.scenario?.name || scenarioId}`);
      setTimeout(() => setFeedbackBanner(null), 4000);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to activate scenario:', err);
    }
  };

  const handleStartJourney = async (hospitalId: string) => {
    if (!activePatient) return;
    try {
      const newJourney = await api.createJourney({
        patient_id: activePatient.id,
        hospital_id: hospitalId,
        policy_id: activePolicy?.id
      });
      setJourney(newJourney);
      const vers = await api.getVerificationItems(activePatient.id);
      setVerificationItems(vers || []);
      setFeedbackBanner(`Initiated care trajectory at hospital.`);
      setTimeout(() => setFeedbackBanner(null), 3000);
      navigate('/care-journey');
    } catch (err) {
      console.error('Failed to start journey:', err);
    }
  };

  const refreshVerificationItems = async () => {
    if (activePatient) {
      const vers = await api.getVerificationItems(activePatient.id);
      setVerificationItems(vers || []);
    }
  };

  const pendingCount = verificationItems.filter((v) => v.status === 'PENDING').length;

  return (
    <CareIQContext.Provider
      value={{
        patients,
        activePatient,
        setActivePatient,
        policies,
        activePolicy,
        setActivePolicy,
        hospitals,
        journey,
        setJourney,
        verificationItems,
        pendingCount,
        scenarios,
        loading,
        feedbackBanner,
        setFeedbackBanner,
        handleSelectPatient,
        handleLoadScenario,
        handleStartJourney,
        refreshVerificationItems,
        loadDataForPatient,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        showOnboarding,
        setShowOnboarding,
        showScenarioGuide,
        setShowScenarioGuide,
        isChatbotOpen,
        setIsChatbotOpen,
        questionsModal,
        setQuestionsModal,
        openQuestionsModal,
        closeQuestionsModal
      }}
    >
      {children}
    </CareIQContext.Provider>
  );
};

export const useCareIQ = () => {
  const context = useContext(CareIQContext);
  if (!context) {
    throw new Error('useCareIQ must be used within a CareIQProvider');
  }
  return context;
};
