import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { HospitalMatchView } from './components/HospitalMatchView';
import { InsuranceView } from './components/InsuranceView';
import { CareJourneyView } from './components/CareJourneyView';
import { CostBreakdownView } from './components/CostBreakdownView';
import { VerificationCenter } from './components/VerificationCenter';
import { AiQuestionsModal } from './components/AiQuestionsModal';
import { api } from './services/api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
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

      setFeedbackBanner(`Loaded Scenario: ${res.scenario.name}`);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={handleSelectPatient}
        scenarios={scenarios}
        onLoadScenario={handleLoadScenario}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingVerificationCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 pb-12">
        
        {/* Feedback Alert Toast */}
        {feedbackBanner && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-xs mb-4 animate-fade-in">
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

      {/* Global AI Questions Modal */}
      {questionsModal.isOpen && (
        <AiQuestionsModal
          hospitalName={questionsModal.hospitalName}
          isRoomExceeded={questionsModal.isRoomExceeded}
          onClose={() => setQuestionsModal({ isOpen: false, hospitalName: '' })}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          <strong>CareIQ</strong> — Decision-Support Platform for Precision Care Challenge 2026. Non-clinical & non-diagnostic. Coverage estimates are indicative.
        </p>
      </footer>

    </div>
  );
}

export default App;
