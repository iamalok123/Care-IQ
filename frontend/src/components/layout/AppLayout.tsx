import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';
import { AiQuestionsModal } from '../modals/AiQuestionsModal';
import { PolicyRagAssistant } from '../widgets/PolicyRagAssistant';
import { useCareIQ } from '../../context/CareIQContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, Menu } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    loading: careiqLoading,
    feedbackBanner,
    activePolicy,
    isChatbotOpen,
    setIsChatbotOpen,
    questionsModal,
    closeQuestionsModal,
    setIsMobileSidebarOpen
  } = useCareIQ();
  const { isAuthenticated, isDemoMode, loading: authLoading } = useAuth();

  // Auth Guard: redirect unauthenticated non-demo users to /get-started
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode) {
      navigate('/get-started', { replace: true });
    }
  }, [authLoading, isAuthenticated, isDemoMode, navigate]);

  const showFloatingAssistant =
    location.pathname === '/dashboard' ||
    location.pathname === '/insurance' ||
    location.pathname === '/hospital-matcher';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Sparkles size={32} className="text-cyan-400 mx-auto animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-medium">Initializing CareIQ Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 relative">
      {/* Mobile Floating Menu Button so drawer can still be toggled on mobile */}
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed top-3.5 left-3.5 z-30 lg:hidden p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Open Sidebar Menu"
      >
        <Menu size={18} strokeWidth={2.2} />
      </button>

      {/* Classical Full-Height Left Sidebar */}
      <Sidebar />

      {/* Main Right Area Container (Offset by lg:pl-64) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64">
        {/* Main View Content Canvas */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-7 max-w-350 w-full mx-auto pb-16">
          {/* Feedback Alert Toast */}
          {feedbackBanner && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-xs mb-3.5 animate-fade-in">
              <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
              {feedbackBanner}
            </div>
          )}

          {careiqLoading ? (
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
          <div className="fixed bottom-16 sm:bottom-5 right-4 sm:right-5 z-40">
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

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />
    </div>
  );
};

export default AppLayout;
