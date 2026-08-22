import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  PlayCircle,
  ShieldCheck,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);
  const [showDemoOptions, setShowDemoOptions] = useState<boolean>(false);

  const handleSelectDemo = async (demoId: string) => {
    setLoadingDemoId(demoId);
    try {
      await loginAsDemo(demoId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error starting demo session:', err);
    } finally {
      setLoadingDemoId(null);
    }
  };

  const demoOptions = [
    {
      id: 'demo-01-private-insurance',
      badge: 'Private Insurance',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      name: 'Ananya Sharma (38F)',
      policy: 'Star Health Comprehensive • ₹5L',
      detail: 'Knee Replacement • Cashless Admission • Bengaluru'
    },
    {
      id: 'demo-02-gov-scheme',
      badge: 'Government Scheme',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Building2,
      iconColor: 'text-sky-600',
      name: 'Rajesh Verma (55M)',
      policy: 'Ayushman Bharat PM-JAY • ₹5L',
      detail: 'Cataract Package • KEM Hospital • Mumbai'
    },
    {
      id: 'demo-03-corporate-plan',
      badge: 'Corporate Plan',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Briefcase,
      iconColor: 'text-purple-600',
      name: 'Meera Iyer (32F)',
      policy: 'ICICI Lombard Corporate • ₹7L',
      detail: 'Laparoscopic Surgery • Apollo Hospital • Bengaluru'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative">
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.07),transparent)] pointer-events-none" />

      {/* Clean White Top Header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs shrink-0 group-hover:bg-teal-900 transition-colors">
            <img src="/logo.svg" alt="CareIQ Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Care<span className="text-blue-600">IQ</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to="/auth?tab=login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors shadow-2xs"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* Minimal Hero Heading */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Sparkles size={12} />
            Get Started
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How would you like to explore?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Create a personalized health profile or try instant interactive demo personas.
          </p>
        </div>

        {/* 2 Main Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
          {/* Card 1: Create a New Account */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UserPlus size={20} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Personalized
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Create a New Account
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add your health policy and clinical profile to unlock tailored cashless hospital matches in Mumbai & Bengaluru.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/auth?tab=register')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Create Account</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 2: Instant Guest Access */}
          <div
            onClick={() => setShowDemoOptions(!showDemoOptions)}
            className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group ${
              showDemoOptions ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200/90 hover:border-indigo-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PlayCircle size={20} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  No login needed
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Guest Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Instant Guest Access
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Explore with 3 pre-built scenarios across Private, PM-JAY Government, and Corporate policies.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>{showDemoOptions ? 'Hide Scenarios' : 'Select a Demo Scenario'}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showDemoOptions ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Expanded Option Cards (Revealed when Instant Guest Access is selected) */}
        <AnimatePresence>
          {showDemoOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden max-w-3xl mx-auto w-full mt-6"
            >
              <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-700">
                    Select a persona to test:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Instant one-click launch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {demoOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isLoading = loadingDemoId === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => !isLoading && handleSelectDemo(opt.id)}
                        className={`bg-white border border-slate-200/90 hover:border-slate-400 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group ${
                          isLoading ? 'opacity-70 pointer-events-none' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${opt.badgeClass}`}>
                              {opt.badge}
                            </span>
                            <Icon size={14} className={opt.iconColor} />
                          </div>
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {opt.name}
                          </h3>
                          <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                            {opt.policy}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                            {opt.detail}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isLoading}
                          className="mt-3 w-full py-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                          {isLoading ? (
                            <span className="animate-spin text-xs">⌛</span>
                          ) : (
                            <>
                              <span>Launch</span>
                              <ArrowRight size={11} />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/50 py-3.5 px-6 text-center text-xs text-slate-500">
        CareIQ Indian Hospital & Insurance Decision Support Platform
      </footer>
    </div>
  );
};
