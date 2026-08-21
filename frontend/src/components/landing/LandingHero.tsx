import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  BedDouble, 
  CheckCircle2, 
  AlertTriangle, 
  PlayCircle, 
  Activity
} from 'lucide-react';
import { DotPattern } from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';

interface LandingHeroProps {
  onLaunchApp: () => void;
  onStartJourney?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchApp,
  onStartJourney
}) => {
  const handleAction = onStartJourney || onLaunchApp;
  const [activeTab, setActiveTab] = useState<'Decision Engine' | 'What-If Simulator' | 'Policy Citations'>('Decision Engine');
  const [selectedRoom, setSelectedRoom] = useState<'Single' | 'Deluxe' | 'Twin'>('Single');

  return (
    <section className="relative overflow-hidden bg-white pt-28 sm:pt-36 pb-16 sm:pb-24 text-slate-900 border-b border-slate-100">
      
      {/* 🌟 Minimal Dot Pattern Background with Radial Gradient Mask */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "mask-[radial-gradient(850px_circle_at_center,white,transparent)]",
          "fill-slate-300/80 pointer-events-none absolute inset-0 h-full w-full"
        )}
      />

      {/* Subtle Ambient Color Glows behind dots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-162.5 h-87.5 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-teal-400/10 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Floating Animated Badges in Minimal Style */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden xl:flex absolute top-36 left-12 bg-white/90 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-2xl items-center gap-3 shadow-xl z-20"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <ShieldCheck size={20} />
        </div>
        <div className="text-left">
          <div className="text-xs font-black text-slate-900">Room Rent Shield</div>
          <div className="text-[10px] text-emerald-600 font-bold">0% Proportionate Penalty</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden xl:flex absolute top-48 right-12 bg-white/90 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-2xl items-center gap-3 shadow-xl z-20"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <Activity size={20} />
        </div>
        <div className="text-left">
          <div className="text-xs font-black text-slate-900">Pre-Auth Turnaround</div>
          <div className="text-[10px] text-blue-600 font-bold">⚡ Approved in ~35 mins</div>
        </div>
      </motion.div>

      {/* Main Hero Header */}
      <div className="relative z-30 max-w-240 mx-auto px-4 sm:px-6 text-center pt-2 sm:pt-6 pb-4">
        
        {/* Top Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-semibold mb-6 shadow-xs"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-extrabold tracking-wide text-slate-900">PRECISION CARE 2026</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium">Smart Hospital & Insurance Decision Support</span>
        </motion.div>

        {/* Minimal Punchy Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-[68px] font-black tracking-tight text-slate-950 leading-[1.06] drop-shadow-xs"
        >
          Stop Overpaying on <br className="hidden sm:inline" />
          <span className="bg-linear-to-r from-blue-700 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
            Hospital Insurance Claims.
          </span>
        </motion.h1>

        {/* Visual Highlights Row (Clean Minimal Badges) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold max-w-190 mx-auto"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
            <BedDouble size={14} className="text-blue-600" />
            <span>Room Rent Trap Detector</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Deterministic Policy RAG</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
            <Building2 size={14} className="text-indigo-600" />
            <span>Cashless Network Hospital Match</span>
          </span>
        </motion.div>

        {/* Action CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            className="px-8 py-3.5 rounded-full text-sm font-extrabold bg-slate-900 hover:bg-slate-950 text-white shadow-xl transition-all cursor-pointer flex items-center gap-2.5"
          >
            <Sparkles size={16} className="text-amber-300" />
            <span>Start Free Patient Journey</span>
            <ArrowRight size={16} />
          </motion.button>

          <motion.a
            href="#scenarios"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-6 py-3.5 rounded-full text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <PlayCircle size={17} className="text-blue-600" />
            <span>Explore 11 Live Scenarios</span>
          </motion.a>
        </motion.div>
      </div>

      {/* 🌟 Interactive Mac Safari Mockup Window (Clean Minimal Card) */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-30 max-w-260 mx-auto px-3 sm:px-6 mt-8"
      >
        <div className="rounded-3xl border border-slate-200/90 shadow-[0_25px_70px_rgba(15,23,42,0.1)] bg-white overflow-hidden text-[#14161F]">
          
          {/* Safari Browser Window Top Bar */}
          <div className="bg-[#F8FAFC] px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 select-none">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
              <div className="flex items-center gap-2 ml-3 text-slate-400 text-xs font-mono">
                <span>&lt;</span>
                <span>&gt;</span>
              </div>
            </div>

            {/* URL Bar */}
            <div className="flex-1 max-w-xs sm:max-w-sm mx-auto bg-white border border-slate-200 rounded-full px-4 py-1 flex items-center justify-center gap-2 text-[11px] text-slate-600 shadow-2xs font-sans">
              <Lock size={11} className="text-emerald-600" />
              <span className="text-slate-800 font-semibold">careiq.ai/patient/active-decision-engine</span>
            </div>

            {/* Live Interactive Status Pill */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE ENGINE
              </span>
            </div>
          </div>

          {/* Inside CareIQ Interactive Mockup Canvas */}
          <div className="p-4 sm:p-6 bg-slate-50/70 flex flex-col gap-4 text-xs">
            
            {/* Mockup Internal Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 p-1.5 flex items-center justify-center shadow-xs">
                  <img src="/logo.svg" alt="CareIQ" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    CareIQ Decision Support
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-md">
                      Patient: Rajesh Sharma (52M)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Admission Plan: Manipal Hospital • Cardiac Stent Implantation
                  </div>
                </div>
              </div>

              {/* Interactive Mockup Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {(['Decision Engine', 'What-If Simulator', 'Policy Citations'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Interactive Tab Views */}
            {activeTab === 'Decision Engine' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
                {/* 4 Telemetry Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sum Insured</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">₹10,00,000</div>
                    <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Star Health Comprehensive
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Rent Cap</div>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">Single Private AC</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">
                      0% Proportionate Penalty Risk
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cashless Hospitals</div>
                    <div className="text-xl font-black text-blue-600 mt-0.5">3 Tier-1 Matched</div>
                    <div className="text-[10px] text-blue-700 font-bold mt-1">
                      Manipal, Apollo & Fortis
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pre-Auth Speed</div>
                    <div className="text-xl font-black text-indigo-600 mt-0.5">~35 Minutes</div>
                    <div className="text-[10px] text-indigo-700 font-bold mt-1">
                      Direct TPA Integration
                    </div>
                  </div>
                </div>

                {/* Main Split Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  <div className="md:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-slate-900 text-xs">Pre-Admission Clause Verification</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                        100% VERIFIED
                      </span>
                    </div>

                    <div className="space-y-2 my-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span className="font-bold text-slate-800 text-xs">Pre & Post Hospitalization</span>
                        </div>
                        <span className="font-black text-slate-700 text-xs">60d Pre / 90d Post</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span className="font-bold text-slate-800 text-xs">540+ Daycare Procedures</span>
                        </div>
                        <span className="font-black text-slate-700 text-xs">100% Cashless</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                      <span className="text-blue-900 font-bold">Estimated Out-of-Pocket Cost:</span>
                      <span className="text-emerald-700 font-black text-sm">₹0 (Zero Surprises)</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 bg-linear-to-br from-slate-900 to-blue-950 text-white p-4 rounded-2xl shadow-md flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-cyan-300">Recommended Network Hospital</div>
                      <div className="font-black text-white text-sm mt-0.5">Manipal Hospital (Old Airport Rd)</div>
                      <div className="text-[10px] text-blue-200">NABH Accredited • 0.8 km from patient</div>
                    </div>

                    <div className="my-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Package Tariff:</span>
                        <span className="font-bold text-white">₹2,45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Pre-Auth Approval:</span>
                        <span className="font-bold text-emerald-300">100% Cashless ✓</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleAction}
                      className="w-full py-2 rounded-xl bg-white text-slate-950 font-extrabold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles size={13} className="text-blue-600" />
                      <span>Start Guided Admission</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Interactive Tab 2: What-If Simulator */}
            {activeTab === 'What-If Simulator' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm">Interactive Room Rent Proportionate Deduction Calculator</h4>
                    <p className="text-[11px] text-slate-500">Test how upgrading room category impacts your surgeon and ICU deductions</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {(['Twin', 'Single', 'Deluxe'] as const).map((room) => (
                      <button
                        key={room}
                        onClick={() => setSelectedRoom(room)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          selectedRoom === room ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {room === 'Twin' ? 'Twin Sharing' : room === 'Single' ? 'Single Private AC' : 'Deluxe Suite'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Room Daily Tariff</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {selectedRoom === 'Twin' ? '₹3,500/day' : selectedRoom === 'Single' ? '₹6,000/day' : '₹12,000/day'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Proportionate Penalty</div>
                    <div className={`text-base font-black mt-0.5 ${
                      selectedRoom === 'Deluxe' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {selectedRoom === 'Deluxe' ? '40% Penalty Applied' : '0% Deductions'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Out-of-Pocket</div>
                    <div className={`text-base font-black mt-0.5 ${
                      selectedRoom === 'Deluxe' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {selectedRoom === 'Deluxe' ? '₹98,000 Extra Copay' : '₹0 Copay'}
                    </div>
                  </div>
                </div>

                {selectedRoom === 'Deluxe' ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0" />
                    <span>Warning: Opting for Deluxe Suite exceeds the 1% policy limit, triggering retroactive 40% proportionate cuts across surgeon and anesthesia charges!</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Optimal choice! Single Private AC is 100% covered under Star Health Comprehensive with zero penalties.</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Interactive Tab 3: Policy Citations */}
            {activeTab === 'Policy Citations' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-extrabold text-slate-900">Deterministic Verbatim Clause Indexing (Zero Hallucinations)</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-blue-700">Clause 3.1.4: Room Category Eligibility</div>
                    <p className="text-slate-600 mt-1 italic">
                      "The Insured Person is eligible for Single Private AC Room up to ₹8,000 per day. If opted, no proportionate reduction shall apply to other associated medical expenses."
                    </p>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">Page 14 • Schedule Section III</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-blue-700">Clause 4.2.1: Daycare Oncology & Chemotherapy</div>
                    <p className="text-slate-600 mt-1 italic">
                      "Chemotherapy and Radiotherapy performed as Daycare under continuous medical supervision are covered 100% without minimum 24-hour hospitalization constraint."
                    </p>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">Page 19 • Schedule Section IV</div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </motion.div>

    </section>
  );
};
