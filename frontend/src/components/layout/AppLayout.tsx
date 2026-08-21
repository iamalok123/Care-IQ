import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Sidebar } from './index';
import { 
  AiQuestionsModal, 
  OnboardingWizard, 
  ScenarioReferenceModal 
} from '../modals';
import { PolicyRagAssistant } from '../widgets';
import { useCareIQ } from '../../context/CareIQContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const {
    loading,
    feedbackBanner,
    activePolicy,
    isChatbotOpen,
    setIsChatbotOpen,
    showOnboarding,
    setShowOnboarding,
    showScenarioGuide,
    setShowScenarioGuide,
    questionsModal,
    closeQuestionsModal,
    handleLoadScenario
  } = useCareIQ();

  const showFloatingAssistant = 
    location.pathname === '/dashboard' || 
    location.pathname === '/insurance' ||
    location.pathname === '/hospital-matcher';

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 relative">
      
      {/* Classical Full-Height Left Sidebar */}
      <Sidebar />

      {/* Main Right Area Container (Offset by lg:pl-56) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-56">
        
        {/* Top Header Navbar */}
        <Navbar />

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
            <Outlet />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-3.5 px-6 text-center text-xs text-slate-500">
          <p>
            <strong>CareIQ</strong> — Decision-Support Platform for Precision Care Challenge 2026. Non-clinical & non-diagnostic. Coverage estimates are indicative.
          </p>
        </footer>

      </div>

      {/* 🚀 Bottom-Right Floating Action Button (FAB) for Policy Copilot */}
      {showFloatingAssistant && (
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
          onClose={closeQuestionsModal}
        />
      )}

      {/* User Onboarding Welcome Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSelectScenario={handleLoadScenario}
      />

      {/* 11 Scenarios Comparative Reference Guide Modal */}
      <ScenarioReferenceModal
        isOpen={showScenarioGuide}
        onClose={() => setShowScenarioGuide(false)}
        onSelectScenario={handleLoadScenario}
      />

    </div>
  );
};
