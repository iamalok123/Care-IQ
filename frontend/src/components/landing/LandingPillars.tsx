import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Stethoscope, 
  IndianRupee, 
  FileText, 
  BedDouble, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

interface LandingPillarsProps {
  onLaunchApp?: () => void;
}

export const LandingPillars: React.FC<LandingPillarsProps> = () => {
  const [accuracyVal, setAccuracyVal] = useState<number>(0);

  useEffect(() => {
    let curr = 0;
    const target = 998; // 99.8%
    const timer = setInterval(() => {
      curr += 21;
      if (curr >= target) {
        curr = target;
        clearInterval(timer);
      }
      setAccuracyVal(curr);
    }, 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="relative z-30 bg-white py-20 sm:py-28 border-b border-slate-100 overflow-hidden scroll-mt-28">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100"
          >
            <Sparkles size={12} />
            <span>3 Pillars of Decision Intelligence</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Eliminating Hidden Traps<br />With Mathematical Precision
          </motion.h2>
        </div>

        {/* 3 Interactive Visual Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Animated SVG Precision Gauge */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="bg-linear-to-b from-blue-50/60 to-white rounded-3xl p-7 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Animated SVG Dial Meter (Spacious, Zero Overlap) */}
              <div className="h-40 flex flex-col items-center justify-center relative mb-3">
                <svg className="w-48 h-30 overflow-visible" viewBox="0 0 160 95">
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#06B6D4" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Background Track Arc */}
                  <path
                    d="M 18 85 A 62 62 0 0 1 142 85"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Animated Progress Arc */}
                  <motion.path
                    d="M 18 85 A 62 62 0 0 1 142 85"
                    fill="none"
                    stroke="url(#blueGradient)"
                    strokeWidth="10"
                    strokeDasharray="194.8"
                    strokeDashoffset={194.8 - (194.8 * (accuracyVal / 1000))}
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                </svg>

                {/* Center Counter Value Positioned with ample breathing room */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
                  <span className="text-3xl font-black text-slate-950 tracking-tight leading-none">
                    {(accuracyVal / 10).toFixed(1)}%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ZERO HALLUCINATIONS
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                Deterministic Policy RAG
              </h3>
              
              <div className="space-y-2 text-xs font-semibold text-slate-600 mt-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Verbatim clause citations with page refs</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Room rent & ICU sub-limit calculations</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full">
                540+ Daycare Procedures Indexed
              </span>
            </div>
          </motion.div>

          {/* Pillar 2: 360° Rotating Dashed Verification Orbit */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-linear-to-b from-indigo-50/60 to-white rounded-3xl p-7 border border-indigo-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* 360° Rotating Orbit Ring Graphic */}
              <div className="h-40 flex items-center justify-center relative mb-3">
                {/* Rotating Dashed Circle */}
                <div className="w-27.5 h-27.5 rounded-full border-2 border-dashed border-indigo-300 animate-spin-slow flex items-center justify-center relative">
                  {/* Orbiting Satellites */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-blue-600 shadow-md border border-indigo-100 flex items-center justify-center">
                    <Stethoscope size={14} />
                  </div>
                  <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-emerald-600 shadow-md border border-indigo-100 flex items-center justify-center">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-amber-600 shadow-md border border-indigo-100 flex items-center justify-center">
                    <IndianRupee size={14} />
                  </div>
                  <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-white text-indigo-600 shadow-md border border-indigo-100 flex items-center justify-center">
                    <FileText size={14} />
                  </div>
                </div>

                {/* Center Pulsing Logo Glyph */}
                <div className="absolute w-11 h-11 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center p-2 shadow-lg animate-pulse">
                  <img src="/logo.svg" alt="CareIQ" className="w-full h-full object-contain brightness-0 invert" />
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                Multi-Entity Matching
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-600 mt-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>Real-time hospital cashless agreements</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-indigo-500 shrink-0" />
                  <span>Ayushman Bharat PM-JAY co-coverage</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-3 py-1 rounded-full">
                NABH Tier-1 Hospital Integration
              </span>
            </div>
          </motion.div>

          {/* Pillar 3: Animated Balance Scale Room Rent Shield */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="bg-linear-to-b from-emerald-50/60 to-white rounded-3xl p-7 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Balance Scale Graphic */}
              <div className="h-40 flex flex-col items-center justify-center relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex flex-col items-center justify-center text-emerald-700 shadow-inner">
                  <BedDouble size={26} className="text-emerald-600 mb-1" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-800">0% COPAY</span>
                </div>
                <div className="mt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Zap size={12} /> Single Private AC Protected
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 text-center mb-2">
                Room Rent Trap Shield
              </h3>

              <div className="space-y-2 text-xs font-semibold text-slate-600 mt-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Simulate room upgrades before admission</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span>Prevents retroactive surgeon fee penalties</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                Saves up to ₹1.5 Lakhs per Admission
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
