import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BedDouble, 
  HeartPulse, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  TrendingDown,
  Zap
} from 'lucide-react';

interface LandingLiveDilemmasProps {
  onLaunchApp: () => void;
}

export const LandingLiveDilemmas: React.FC<LandingLiveDilemmasProps> = ({ onLaunchApp }) => {
  const [activeDilemma, setActiveDilemma] = useState<number>(0);

  const dilemmas = [
    {
      id: 'room-trap',
      title: 'Room Rent Proportionate Trap',
      patient: 'Aman Verma (45M) • Cardiac Stent',
      hospital: 'Apollo Hospital (Tier 1 Cashless)',
      policy: '₹5 Lakh Sum Insured • 1% Room Cap',
      savedAmount: '₹1,40,800 Saved',
      withoutCareIQ: 'Upgraded to ₹9,000 deluxe room unaware of 1% cap. Retroactive 44% proportionate cut across ₹3,20,000 total bill.',
      withCareIQ: 'CareIQ flagged 1% cap and matched Single Private AC at ₹4,800/day. 0% retroactive deductions!',
      icon: BedDouble,
      accent: 'from-amber-500 to-orange-600'
    },
    {
      id: 'daycare-chemo',
      title: 'Daycare Chemotherapy Approval',
      patient: 'Priya Nair (38F) • Oncology Protocol',
      hospital: 'Manipal Hospital (Cashless Network)',
      policy: 'HDFC ERGO • 540+ Daycare Procedures',
      savedAmount: '100% Cashless Settle',
      withoutCareIQ: 'TPA delayed cashless citing under 24hr stay requirement, forcing patient to swipe ₹85,000 card.',
      withCareIQ: 'Policy RAG cited Clause 4.2.1 verbatim proving Daycare exemption. Cashless approved in 25 mins.',
      icon: HeartPulse,
      accent: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'ayushman-copay',
      title: 'Ayushman Bharat PM-JAY Co-Pay',
      patient: 'Sunita Devi (62F) • Knee Replacement',
      hospital: 'Fortis Healthcare (Empanelled)',
      policy: 'PM-JAY Gold Card (₹5 Lakh Gov Coverage)',
      savedAmount: '₹0 Patient Copay',
      withoutCareIQ: 'Unsure about implant brand coverage under government scheme, delaying surgery by 2 weeks.',
      withCareIQ: 'Mapped HBP 2.2 package code, confirmed standard implant coverage with zero co-pay.',
      icon: ShieldCheck,
      accent: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'ped-waiting',
      title: 'Pre-Existing Disease (PED) Dispute',
      patient: 'Vikram Malhotra (58M) • Gallbladder Surgery',
      hospital: 'Max Healthcare (Cashless Network)',
      policy: 'Care Health • 24M PED Waiting Period',
      savedAmount: 'Rejection Averted',
      withoutCareIQ: 'Insurer flagged diabetes history as potential non-disclosure, threatening claim denial.',
      withCareIQ: 'Verified continuous 36-month tenure, proving 24-month PED waiting period was satisfied.',
      icon: Building2,
      accent: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <section id="scenarios" className="relative z-30 bg-slate-50/70 py-20 sm:py-28 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Sparkles size={12} />
            <span>Interactive Scenario Matrix</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Real Hospital Dilemmas.<br />Solved Before Admission.
          </motion.h2>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {dilemmas.map((d, idx) => {
            const Icon = d.icon;
            const isSelected = activeDilemma === idx;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDilemma(idx)}
                className={`px-4 py-2.5 rounded-full font-extrabold text-xs transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={15} />
                <span>{d.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Card */}
        <motion.div
          key={activeDilemma}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-9"
        >
          {/* Header metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                  Scenario {activeDilemma + 1} of 4
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {dilemmas[activeDilemma].patient}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {dilemmas[activeDilemma].title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital: <strong className="text-slate-700">{dilemmas[activeDilemma].hospital}</strong> • Policy: <strong className="text-slate-700">{dilemmas[activeDilemma].policy}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm self-start sm:self-center shadow-2xs">
              <TrendingDown size={16} className="text-emerald-600" />
              <span>{dilemmas[activeDilemma].savedAmount}</span>
            </div>
          </div>

          {/* Comparison Split: Without vs With CareIQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Red Box: Without CareIQ */}
            <div className="p-5 sm:p-6 rounded-2xl bg-red-50/60 border border-red-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-wider mb-2">
                  <AlertTriangle size={15} />
                  <span>The Hidden Trap (Without CareIQ)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {dilemmas[activeDilemma].withoutCareIQ}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-red-200/80 text-[11px] font-bold text-red-800">
                Outcome: Huge Unexpected Copay
              </div>
            </div>

            {/* Green Box: With CareIQ */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider mb-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>With CareIQ AI Guidance</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                  {dilemmas[activeDilemma].withCareIQ}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] font-black text-emerald-800 flex items-center gap-1">
                <Zap size={13} className="text-emerald-600" />
                <span>Outcome: 100% Cashless Settlement</span>
              </div>
            </div>

          </div>

          <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Want to see all 11 patient personas simulated?
            </span>
            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All 11 Personas</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
