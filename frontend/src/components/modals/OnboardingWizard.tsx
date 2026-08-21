import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  FileText, 
  Play, 
  HeartHandshake,
  Users,
  Compass,
  X
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onNavigateTab
}) => {
  const [step, setStep] = useState<number>(1);
  const [userRole, setUserRole] = useState<'patient' | 'caregiver' | 'family'>('caregiver');
  const [insuranceStatus, setInsuranceStatus] = useState<'private' | 'government' | 'unsure' | 'none'>('private');

  if (!isOpen) return null;

  const handleCompleteWithDemo = (scenarioId: string = 'sc-01') => {
    localStorage.setItem('careiq_onboarding_completed', 'true');
    onSelectScenario(scenarioId);
    onClose();
  };

  const handleCompleteManual = (tab: string = 'insurance') => {
    localStorage.setItem('careiq_onboarding_completed', 'true');
    onNavigateTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 bg-linear-to-br from-teal-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close onboarding wizard"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">CareIQ Welcome Guide</span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium">
                Insurance-aware hospital care navigation & decision support
              </p>
            </div>
          </div>

          {/* Progress Indicator Dots / Bar */}
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-white h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: User Persona / Role */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Who is navigating this hospital admission?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CareIQ tailors decision support prompts based on whether you are managing your own care or advocating for a family member.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserRole('caregiver')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    userRole === 'caregiver'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 w-fit mb-3">
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Primary Caregiver</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                      Parent, spouse, child or friend managing desk & bills
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserRole('patient')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    userRole === 'patient'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 w-fit mb-3">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Patient</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                      Undergoing planned or emergency admission
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserRole('family')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    userRole === 'family'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit mb-3">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Family / Remote</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                      Tracking treatment progress & financial safety
                    </span>
                  </div>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
                <Compass size={16} className="text-teal-600 shrink-0" />
                <span>
                  CareIQ provides <strong>actionable questions for billing & TPA desks</strong> so caregivers never feel lost.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Insurance Type */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  What health coverage applies to this admission?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Different policies apply unique room caps, copay %, and network cashless rules.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'private',
                    title: 'Private or Employer Health Insurance',
                    desc: 'Star Health, HDFC ERGO, ICICI Lombard, Niva Bupa, Care Health, Corporate Floater',
                    badge: 'Private'
                  },
                  {
                    id: 'government',
                    title: 'Government Scheme Coverage',
                    desc: 'Ayushman Bharat PM-JAY, CGHS, ESI, Arogya Karnataka, Yeshaswini',
                    badge: 'Govt. 100% Cashless'
                  },
                  {
                    id: 'unsure',
                    title: 'Have Insurance, but Unsure of Limits',
                    desc: 'CareIQ will extract room rent caps & PED waiting periods from policy documents',
                    badge: 'AI Extraction'
                  },
                  {
                    id: 'none',
                    title: 'No Active Insurance / Direct Hospital Out-of-Pocket',
                    desc: 'Compare hospital tariffs, room category packages and estimated gross costs',
                    badge: 'Tariff Fit'
                  }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      insuranceStatus === item.id
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="insuranceStatus"
                        checked={insuranceStatus === item.id}
                        onChange={() => setInsuranceStatus(item.id as any)}
                        className="mt-1 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shrink-0 ml-2">
                      {item.badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Choose Starting Mode */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  How would you like to explore CareIQ?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a live preconfigured scenario or upload your own policy document.
                </p>
              </div>

              {/* Recommended Demo Action */}
              <div 
                onClick={() => handleCompleteWithDemo('sc-01')}
                className="bg-linear-to-br from-teal-50 to-indigo-50 border-2 border-teal-500 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all relative group"
              >
                <span className="absolute -top-2.5 right-4 bg-teal-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Recommended for Jury & Demo
                </span>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                    <Play size={20} className="fill-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-900">
                      🎯 Launch Preconfigured Demo Scenario
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Explore <strong>Ananya Sharma</strong> (Total Knee Replacement • Star Health • In-Network 100% Cashless Fit).
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-teal-700 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Alternative Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleCompleteManual('insurance')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                      <FileText size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Upload Policy</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Upload insurance PDF or schedule for AI parameter extraction
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompleteWithDemo('sc-08')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Building2 size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">PM-JAY Scheme Demo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Test 100% cashless government healthcare package rules
                  </p>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Skip Intro
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/20 transition-all cursor-pointer"
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleCompleteWithDemo('sc-01')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-linear-to-r from-teal-600 to-indigo-600 text-white shadow-md shadow-teal-600/30 hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              Enter CareIQ Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
