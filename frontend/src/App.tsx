import { useState, useEffect } from 'react';
import { Navbar, Sidebar } from './components/layout';
import { LandingPage } from './components/landing';
import { 
  Dashboard, 
  HospitalMatchView, 
  InsuranceView, 
  CareJourneyView, 
  CostBreakdownView, 
  VerificationCenter 
} from './components/views';
import { 
  AiQuestionsModal, 
  OnboardingWizard, 
  ScenarioReferenceModal 
} from './components/modals';
import { PolicyRagAssistant } from './components/widgets';
import { api } from './services/api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
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
  
  // UI & Feedback State
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [questionsModal, setQuestionsModal] = useState<{
    isOpen: boolean;
    hospitalName: string;
    isRoomExceeded?: boolean;
  }>({
    isOpen: false,
    hospitalName: ''
  });

  const loadDataForPatient = async (patient: any) => {
    try {
      const [pols, jrns, vers] = await Promise.all([
        api.getPolicies(patient.id),
        api.getJourneys(patient.id),
        api.getVerificationItems(patient.id)
      ]);

      setPolicies(pols);
      setActivePolicy(pols[0] || null);

      if (jrns && jrns.length > 0) {
        setJourney(jrns[0]);
      } else {
        const allJourneys = await api.getJourneys();
        setJourney(allJourneys[0] || null);
      }

      setVerificationItems(vers);
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

      setPatients(pts);
      setHospitals(hosps);
      setScenarios(scens);

      if (pts.length > 0) {
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
      }
      const vers = await api.getVerificationItems(res.patient?.id);
      setVerificationItems(vers);

      setFeedbackBanner(`Loaded Scenario: ${res.scenario?.name || scenarioId}`);
      setTimeout(() => setFeedbackBanner(null), 4000);
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
      setVerificationItems(vers);
      setActiveTab('journey');
      setFeedbackBanner(`Initiated care trajectory at hospital.`);
      setTimeout(() => setFeedbackBanner(null), 3000);
    } catch (err) {
      console.error('Failed to start journey:', err);
    }
  };

  const refreshVerificationItems = async () => {
    if (activePatient) {
      const vers = await api.getVerificationItems(activePatient.id);
      setVerificationItems(vers);
    }
  };

  const pendingCount = verificationItems.filter((v) => v.status === 'PENDING').length;

  if (activeTab === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => setActiveTab('dashboard')}
        onStartJourney={() => setActiveTab('dashboard')}
        onSelectScenario={(scId) => {
          handleLoadScenario(scId);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 relative">
      
      {/* Classical Full-Height Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingVerificationCount={pendingCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Right Area Container (Offset by lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64">
        
        {/* Top Header Navbar */}
        <Navbar
          patients={patients}
          activePatient={activePatient}
          onSelectPatient={handleSelectPatient}
          scenarios={scenarios}
          onLoadScenario={handleLoadScenario}
          onSelectTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenOnboarding={() => {
            localStorage.removeItem('careiq_onboarding_completed');
            setShowOnboarding(true);
          }}
          onOpenScenarioGuide={() => setShowScenarioGuide(true)}
        />

        {/* Main View Content Canvas */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 max-w-350 w-full mx-auto pb-16">
          
          {/* Feedback Alert Toast */}
          {feedbackBanner && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-xs mb-3.5 animate-fade-in">
              <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
              {feedbackBanner}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 px-4">
              <Sparkles size={36} className="text-teal-600 mx-auto animate-spin" />
              <h3 className="text-lg font-bold text-slate-900 mt-3">
                Loading CareIQ Decision Engine...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting policy models and hospital networks
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  patient={activePatient}
                  policy={activePolicy}
                  journey={journey}
                  verificationItems={verificationItems}
                  onNavigate={setActiveTab}
                  onOpenQuestionsModal={() =>
                    setQuestionsModal({
                      isOpen: true,
                      hospitalName: hospitals.find((h) => h.id === journey?.hospital_id)?.name || 'the hospital'
                    })
                  }
                  onOpenScenarioGuide={() => setShowScenarioGuide(true)}
                  onOpenChatbot={() => setIsChatbotOpen(true)}
                />
              )}

              {activeTab === 'hospitals' && (
                <HospitalMatchView
                  policy={activePolicy}
                  activePatient={activePatient}
                  onStartJourney={handleStartJourney}
                  onOpenQuestions={(hospName, isRoomExceeded) =>
                    setQuestionsModal({
                      isOpen: true,
                      hospitalName: hospName,
                      isRoomExceeded
                    })
                  }
                />
              )}

              {activeTab === 'insurance' && (
                <InsuranceView
                  policies={policies}
                  activePatient={activePatient}
                  onPolicyAdded={() => activePatient && loadDataForPatient(activePatient)}
                  onOpenChatbot={() => setIsChatbotOpen(true)}
                />
              )}

              {activeTab === 'journey' && (
                <CareJourneyView
                  journey={journey}
                  hospital={hospitals.find((h) => h.id === journey?.hospital_id)}
                  policy={activePolicy}
                  onEventAdded={() => activePatient && loadDataForPatient(activePatient)}
                />
              )}

              {activeTab === 'cost' && (
                <CostBreakdownView
                  policy={activePolicy}
                  hospitals={hospitals}
                />
              )}

              {activeTab === 'verification' && (
                <VerificationCenter
                  verificationItems={verificationItems}
                  onItemResolved={refreshVerificationItems}
                />
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-3.5 px-6 text-center text-xs text-slate-500">
          <p>
            <strong>CareIQ</strong> — Decision-Support Platform for Precision Care Challenge 2026. Non-clinical & non-diagnostic. Coverage estimates are indicative.
          </p>
        </footer>

      </div>

      {/* 🚀 Bottom-Right Floating Action Button (FAB) for Policy Copilot (Only on Dashboard and Insurance pages) */}
      {(activeTab === 'dashboard' || activeTab === 'insurance') && (
        <>
          <div className="fixed bottom-5 right-5 z-40">
            <button
              type="button"
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer select-none border ${
                isChatbotOpen
                  ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
                  : 'bg-teal-700 hover:bg-teal-800 text-white border-teal-800 shadow-teal-900/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
              title="Ask CareIQ Policy AI Copilot"
              aria-label="Toggle Policy Chatbot"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold tracking-tight hidden sm:inline">
                {isChatbotOpen ? 'Close Copilot' : 'Ask Policy Copilot'}
              </span>
              <span className="text-xs font-bold tracking-tight sm:hidden">
                {isChatbotOpen ? 'Close' : 'Copilot'}
              </span>
            </button>
          </div>

          {/* 💬 Floating Policy AI Copilot Modal Window */}
          <PolicyRagAssistant
            selectedPolicyId={activePolicy?.id}
            policyName={activePolicy?.policy_name}
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            isFloating={true}
          />
        </>
      )}

      {/* Global AI Questions Modal */}
      {questionsModal.isOpen && (
        <AiQuestionsModal
          hospitalName={questionsModal.hospitalName}
          isRoomExceeded={questionsModal.isRoomExceeded}
          onClose={() => setQuestionsModal({ isOpen: false, hospitalName: '' })}
        />
      )}

      {/* User Onboarding Welcome Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSelectScenario={handleLoadScenario}
        onNavigateTab={setActiveTab}
      />

      {/* 11 Scenarios Comparative Reference Guide Modal */}
      <ScenarioReferenceModal
        isOpen={showScenarioGuide}
        onClose={() => setShowScenarioGuide(false)}
        onSelectScenario={handleLoadScenario}
      />

    </div>
  );
}

export default App;
