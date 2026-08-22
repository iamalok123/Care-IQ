import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
  demoProfiles: any[];
  accountType: 'DEMO' | 'NEW_USER';
  loading: boolean;
  feedbackBanner: string | null;
  setFeedbackBanner: (banner: string | null) => void;

  // Actions
  handleSelectPatient: (patient: any) => Promise<void>;
  handleLoadDemoProfile: (profileId: string) => Promise<void>;
  handleStartJourney: (hospitalId: string) => Promise<void>;
  refreshVerificationItems: () => Promise<void>;
  loadDataForPatient: (patient: any) => Promise<void>;

  // Modal & Drawer State
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
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
  const {
    patient: authPatient,
    policy: authPolicy,
    journey: authJourney,
    loginAsDemo,
    isDemoMode
  } = useAuth();

  // Navigation / Drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Data State
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [activePolicy, setActivePolicy] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [journey, setJourney] = useState<any>(null);
  const [verificationItems, setVerificationItems] = useState<any[]>([]);
  const [demoProfiles, setDemoProfiles] = useState<any[]>([]);

  // Account Type
  const accountType: 'DEMO' | 'NEW_USER' =
    authPatient?.account_type === 'NEW_USER' || (!isDemoMode && authPatient?.account_type !== 'DEMO')
      ? 'NEW_USER'
      : 'DEMO';

  // Feedback & Loading
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Questions Modal
  const [questionsModal, setQuestionsModal] = useState<QuestionsModalState>({
    isOpen: false,
    hospitalName: ''
  });

  const openQuestionsModal = (hospitalName?: string, isRoomExceeded?: boolean) => {
    const defaultName =
      hospitalName || hospitals.find((h) => h.id === journey?.hospital_id)?.name || 'the hospital';
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
        setJourney(null);
      }

      setVerificationItems(vers || []);
    } catch (err) {
      console.error('Error loading patient context:', err);
    }
  };

  const initApp = async () => {
    setLoading(true);
    try {
      const [pts, hosps, demos] = await Promise.all([
        api.getPatients(),
        api.getHospitals(),
        api.getDemoProfiles()
      ]);

      setPatients(pts || []);
      setHospitals(hosps || []);
      setDemoProfiles(demos || []);

      if (authPatient) {
        setActivePatient(authPatient);
        await loadDataForPatient(authPatient);
      } else {
        setActivePatient(null);
        setPolicies([]);
        setActivePolicy(null);
        setJourney(null);
        setVerificationItems([]);
      }
    } catch (err) {
      console.error('Failed to initialize app:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  // Synchronize state when AuthContext changes active profile or switches demo session
  useEffect(() => {
    if (authPatient) {
      setActivePatient(authPatient);
      if (authPolicy) {
        setActivePolicy(authPolicy);
        setPolicies([authPolicy]);
      }
      if (authJourney) {
        setJourney(authJourney);
      } else {
        setJourney(null);
      }
      loadDataForPatient(authPatient);
    }
  }, [authPatient?.id, authPolicy?.id, authJourney?.id]);

  const handleSelectPatient = async (patient: any) => {
    setActivePatient(patient);
    await loadDataForPatient(patient);
    setFeedbackBanner(`Switched active profile to ${patient.display_name} (${patient.city})`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  const handleLoadDemoProfile = async (profileId: string) => {
    setLoading(true);
    try {
      const res = await loginAsDemo(profileId);
      if (res.patient) {
        setActivePatient(res.patient);
      }
      if (res.policy) {
        setActivePolicy(res.policy);
        setPolicies([res.policy]);
      }
      if (res.journey) {
        setJourney(res.journey);
      }
      if (res.verificationItems) {
        setVerificationItems(res.verificationItems);
      }
      setFeedbackBanner(`Loaded Demo Profile: ${res.patient?.display_name || profileId}`);
      setTimeout(() => setFeedbackBanner(null), 3500);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch demo profile:', err);
    } finally {
      setLoading(false);
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
        demoProfiles,
        accountType,
        loading,
        feedbackBanner,
        setFeedbackBanner,
        handleSelectPatient,
        handleLoadDemoProfile,
        handleStartJourney,
        refreshVerificationItems,
        loadDataForPatient,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
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
