import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileSearch, 
  Calculator, 
  Clock, 
  HeartHandshake
} from 'lucide-react';

export const LandingFeaturesGrid: React.FC = () => {
  return (
    <section id="features" className="relative z-30 bg-slate-50/70 py-20 sm:py-28 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Sparkles size={12} />
            <span>Interactive Intelligence Suite</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Engineered for Caregivers.<br />Built for Real Hospitals.
          </motion.h2>
        </div>

        {/* 2x2 Rich Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Policy OCR Scanning & Vector RAG */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Interactive Graphic: Laser Scanner */}
            <div className="h-52 bg-linear-to-br from-blue-600 via-indigo-600 to-blue-800 p-6 flex flex-col justify-between relative overflow-hidden text-white">
              {/* Animated scanning beam */}
              <motion.div 
                animate={{ y: [0, 120, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-cyan-300 shadow-[0_0_15px_#22d3ee] z-20 pointer-events-none"
              />

              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-cyan-200">
                  01 • POLICY RAG
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-cyan-200">
                  <FileSearch size={18} />
                </div>
              </div>

              {/* Mock Extracted Clause Card */}
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs z-10">
                <div className="flex justify-between font-extrabold text-cyan-200">
                  <span>Clause 4.2 • Room Eligibility</span>
                  <span>Page 14 ✓</span>
                </div>
                <div className="text-white/90 text-[11px] mt-0.5 line-clamp-1">
                  Single Private AC Room covered without sub-limit proportionate cuts.
                </div>
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Deterministic Clause Ingestion
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Upload PDF schedules or e-cards. Our OCR vector index extracts exact sub-limits, waiting periods, and exclusions with verbatim quotes.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Zero Guesswork</span>
                <span>540+ Procedures Coded →</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Room Rent Proportionate Deduction Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Interactive Graphic: Room Rent Delta */}
            <div className="h-52 bg-linear-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-emerald-200">
                  02 • COST SIMULATOR
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-200">
                  <Calculator size={18} />
                </div>
              </div>

              {/* Live Tariff Comparison Badge */}
              <div className="grid grid-cols-2 gap-2 z-10">
                <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-center">
                  <div className="text-[9px] font-bold uppercase text-emerald-200">Single Private Room</div>
                  <div className="text-sm font-black text-white mt-0.5">₹0 Penalty</div>
                </div>
                <div className="bg-red-500/30 backdrop-blur-md p-2.5 rounded-xl border border-red-300/40 text-center">
                  <div className="text-[9px] font-bold uppercase text-red-200">Deluxe Upgrade</div>
                  <div className="text-sm font-black text-red-100 mt-0.5">40% Total Cut</div>
                </div>
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Room Rent Penalty Shield
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Calculates retroactive deductions on surgeon, OT, and ICU bills before admission, preventing ₹50,000 to ₹1.5 Lakh surprise copays.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Tariff Benchmarked</span>
                <span>Run Simulator →</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: 5-Stage Milestone Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Graphic: Animated 5-stage nodes */}
            <div className="h-52 bg-linear-to-br from-amber-500 via-orange-600 to-amber-700 p-6 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-100">
                  03 • 5-STAGE MILESTONES
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-100">
                  <Clock size={18} />
                </div>
              </div>

              {/* 5 Stage Node Progress Graphic */}
              <div className="flex items-center justify-between px-2 z-10">
                {['Pre-Auth', 'Admission', 'In-Patient', 'Discharge', 'Settled'].map((stage, idx) => (
                  <div key={stage} className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      idx <= 1 ? 'bg-white text-orange-600' : 'bg-white/30 text-white'
                    }`}>
                      {idx <= 1 ? '✓' : idx + 1}
                    </div>
                    <span className="text-[9px] font-bold text-white/90">{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  TPA Desk Action Guidance
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Proactive checklists and auto-generated questions for hospital billing desks to speed up cashless approvals and discharge clearance.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Discharge Optimizer</span>
                <span>View Stages →</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: WhatsApp Caregiver Broadcast */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Graphic: WhatsApp Broadcast preview */}
            <div className="h-52 bg-linear-to-br from-purple-600 via-indigo-600 to-purple-800 p-6 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-purple-200">
                  04 • CAREGIVER SYNC
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-purple-200">
                  <HeartHandshake size={18} />
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="bg-emerald-800/60 backdrop-blur-md p-3 rounded-2xl border border-emerald-400/30 text-xs z-10 text-emerald-100">
                <div className="font-extrabold text-white">🏥 CareIQ Update for Rajesh Sharma:</div>
                <div className="text-[11px] mt-0.5 line-clamp-1">
                  Pre-auth approved for Manipal Hospital • 0% Room Copay • Discharge on Friday.
                </div>
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  1-Click Family WhatsApp Sync
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Keep family members and doctors updated with clear, jargon-free progress summaries sent in one tap via WhatsApp.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>WhatsApp Ready</span>
                <span>Try Broadcast →</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
