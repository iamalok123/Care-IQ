import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  PlayCircle,
  ShieldCheck,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  ChevronRight,
  HeartPulse,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);

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

  const demoBadges = [
    {
      id: 'demo-01-private-insurance',
      badge: 'Private Insurance',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      name: 'Ananya Sharma (38F)',
      policy: 'Star Health Comprehensive ₹5L',
      city: 'Bengaluru',
      procedure: 'Total Knee Replacement',
      highlight: '0% Copay • Private AC Room • Cashless Admission',
      scenarioDesc: 'Learn how pre-authorization and network validation protect against out-of-pocket costs.'
    },
    {
      id: 'demo-02-gov-scheme',
      badge: 'Government Scheme',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: Building2,
      iconColor: 'text-sky-400',
      name: 'Rajesh Verma (55M)',
      policy: 'Ayushman Bharat PM-JAY ₹5L',
      city: 'Mumbai (KEM Hospital)',
      procedure: 'Phaco Cataract Surgery',
      highlight: '100% Package Rate • General Ward • Zero Deposit',
      scenarioDesc: 'Biometric Ayushman Mitra verification and zero-billing package compliance.'
    },
    {
      id: 'demo-03-corporate-plan',
      badge: 'Employer Provided',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Briefcase,
      iconColor: 'text-purple-400',
      name: 'Meera Iyer (32F)',
      policy: 'ICICI Lombard Corporate ₹7L',
      city: 'Bengaluru (Apollo Hospital)',
      procedure: 'General Laparoscopic Surgery',
      highlight: '10% Copay • Room Upgrade Dilemma • Deductible',
      scenarioDesc: 'See what-if room category simulations and proportionate deduction warnings.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.18),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-slate-200 to-cyan-400">
                CareIQ
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Decision Core
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Hospital & Health Insurance Decision Intelligence
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth?tab=login"
            className="text-xs text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Get Started with CareIQ
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3"
          >
            How would you like to explore?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 leading-relaxed"
          >
            Register with your own insurance policy and clinical background, or instantly explore with 3 pre-built real-world insurance personas.
          </motion.p>
        </div>

        {/* Two Core Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Option 1: New User Account */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 bg-linear-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />

            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Personalized Experience
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-3">
                Create New Account
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Set up your personalized patient profile, add your insurance policy, and unlock customized hospital matching in Mumbai and Bengaluru.
              </p>

              <div className="space-y-2.5 mb-8">
                {[
                  'Add custom health policy or scheme',
                  'Itemized out-of-pocket forecasts',
                  'AI policy clause evidence binding',
                  'Automated pre-auth verification tasks'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/auth?tab=register')}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-px"
              >
                <span>Register & Setup Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-slate-400">Already registered? </span>
                <Link
                  to="/auth?tab=login"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Log in to your account
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Option 2: Explore with Curated Demos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-8 bg-linear-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Instant Guest Access
                    </span>
                    <h2 className="text-xl font-bold text-white">
                      Try 3 Interactive Scenarios
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>No login required</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Select any pre-configured scenario below to explore CareIQ's matching engine, room category deductions, and AI clause citations:
              </p>

              {/* 3 Scenario Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {demoBadges.map((demo) => {
                  const Icon = demo.icon;
                  const isLoading = loadingDemoId === demo.id;

                  return (
                    <div
                      key={demo.id}
                      onClick={() => !isLoading && handleSelectDemo(demo.id)}
                      className={`relative bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-slate-900/80 hover:shadow-lg flex flex-col justify-between group ${
                        isLoading ? 'opacity-70 pointer-events-none' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}
                          >
                            {demo.badge}
                          </span>
                          <Icon className={`w-4 h-4 ${demo.iconColor}`} />
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                          {demo.name}
                        </h3>

                        <div className="text-[11px] text-cyan-400 font-medium mb-2">
                          {demo.policy}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-snug mb-3 line-clamp-3">
                          {demo.scenarioDesc}
                        </p>

                        <div className="text-[10px] text-slate-500 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mb-3">
                          <span className="text-slate-300 font-medium">Focus: </span>
                          {demo.highlight}
                        </div>
                      </div>

                      <button
                        disabled={isLoading}
                        className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <span>Loading Demo...</span>
                          </div>
                        ) : (
                          <>
                            <span>Launch Demo</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Demo Launch Footer */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero clinical assumptions. Real Indian hospital & IRDAI datasets.</span>
              </div>
              <button
                onClick={() => handleSelectDemo('demo-01-private-insurance')}
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1"
              >
                <span>Quick Launch Default (Ananya Star Health)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        CareIQ AI Decision Support is built for informational and transparency purposes.
      </footer>
    </div>
  );
};
