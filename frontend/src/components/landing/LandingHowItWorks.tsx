import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  FileUp,
  Building2,
  CheckCheck
} from 'lucide-react';

interface LandingHowItWorksProps {
  onLaunchApp: () => void;
}

export const LandingHowItWorks: React.FC<LandingHowItWorksProps> = ({ onLaunchApp }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      number: '01',
      title: 'Upload Policy Schedule',
      badge: 'Instant Vector OCR',
      shortDesc: 'Extracts room limits, ICU caps, copay %, and waiting periods with verbatim citations in seconds.',
      icon: FileUp,
      mockPreview: {
        tag: 'OCR Vector Scan',
        title: 'Star Health Family Optima',
        items: [
          '₹10,00,000 Sum Insured',
          'Single Private AC Room (0% Penalty)',
          '540+ Daycare Procedures Covered'
        ]
      }
    },
    {
      number: '02',
      title: 'Compare Network Hospitals',
      badge: 'Cashless & Tariff Match',
      shortDesc: 'Matches NABH hospitals, compares package tariffs, and simulates room rent deductions before admission.',
      icon: Building2,
      mockPreview: {
        tag: 'Hospital Matcher',
        title: 'Manipal Hospital (Old Airport Rd)',
        items: [
          'Tier-1 Cashless Partner',
          '₹2,45,000 Package Benchmark',
          '₹0 Patient Out-of-Pocket Delta'
        ]
      }
    },
    {
      number: '03',
      title: 'Track 5-Stage Milestones',
      badge: 'Discharge Settlement',
      shortDesc: 'Actionable questions for hospital TPA desks, interim bill check-ins, and 1-click WhatsApp family updates.',
      icon: CheckCheck,
      mockPreview: {
        tag: 'Discharge Tracker',
        title: 'Zero Surprise Settlement',
        items: [
          'Pre-Auth Approved in 35m ✓',
          'Interim Bills Reconciled ✓',
          'Discharge Clearance Fast-Tracked ✓'
        ]
      }
    }
  ];

  return (
    <section id="how-it-works" className="relative z-30 bg-white py-20 sm:py-28 border-b border-slate-100 overflow-hidden scroll-mt-28">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200"
          >
            <Sparkles size={12} />
            <span>Effortless 3-Step Flow</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            From Planned Admission<br />To Final Discharge Settlement
          </motion.h2>
        </div>

        {/* 3 Step Interactive Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left 6 Cols: Step Cards */}
          <div className="lg:col-span-6 space-y-3.5">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx + 1;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => setActiveStep(idx + 1)}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/80 border-blue-500 shadow-md scale-[1.02]' 
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-colors shadow-xs ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                          STEP {step.number} • {step.badge}
                        </span>
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                        {step.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {step.shortDesc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right 6 Cols: Live Interactive Stage Simulation Card */}
          <div className="lg:col-span-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-7 sm:p-9 rounded-3xl shadow-2xl border border-white/15 relative overflow-hidden"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                      {steps[activeStep - 1].mockPreview.tag}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Step {activeStep} of 3
                  </span>
                </div>

                <h4 className="text-xl font-black text-white mb-4">
                  {steps[activeStep - 1].mockPreview.title}
                </h4>

                {/* Checklist Visual */}
                <div className="space-y-2.5 my-6">
                  {steps[activeStep - 1].mockPreview.items.map((item) => (
                    <div key={item} className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs font-bold text-white flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-blue-200 font-medium">
                    Try this live in the decision engine
                  </span>
                  <button
                    onClick={onLaunchApp}
                    className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Launch Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};
