import React from 'react';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  IndianRupee,
  Sparkles,
  BedDouble,
  HelpCircle
} from 'lucide-react';
import { PolicyRagAssistant } from './PolicyRagAssistant';

interface DashboardProps {
  patient: any;
  policy: any;
  journey: any;
  verificationItems: any[];
  onNavigate: (tab: string) => void;
  onOpenQuestionsModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  policy,
  journey,
  verificationItems,
  onNavigate,
  onOpenQuestionsModal
}) => {
  const pendingVerifications = verificationItems.filter((v) => v.status === 'PENDING');
  const highPriorityAlert = pendingVerifications.find((v) => v.priority === 'HIGH') || pendingVerifications[0];

  const currentStage = journey?.current_stage || 'ADMISSION';
  const stages = ['ADMISSION', 'INVESTIGATION', 'PROCEDURE', 'RECOVERY', 'DISCHARGE'];
  const stageIndex = stages.indexOf(currentStage);

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Care Journey Active Stage Progress Banner */}
      <div className="bg-linear-to-br from-white to-teal-50/60 border border-teal-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Active Journey Stage
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Updated: {journey ? new Date(journey.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
              {currentStage === 'ADMISSION' && 'Stage 1: Admission & Desk Verification'}
              {currentStage === 'INVESTIGATION' && 'Stage 2: Clinical Diagnostics & Imaging'}
              {currentStage === 'PROCEDURE' && 'Stage 3: Operation Theatre & Procedure'}
              {currentStage === 'RECOVERY' && 'Stage 4: Inpatient Recovery & Ward Care'}
              {currentStage === 'DISCHARGE' && 'Stage 5: Discharge & Claim Settlement'}
              {!stages.includes(currentStage) && `Stage: ${currentStage}`}
            </h2>
          </div>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/30 transition-all cursor-pointer"
            onClick={() => onNavigate('journey')}
          >
            <Sparkles size={16} />
            View Full Journey Timeline
          </button>
        </div>

        {/* Multi-Stage Step Progress Bar */}
        <div className="flex items-center justify-between relative mt-4 pt-2">
          <div className="absolute top-5 left-5 right-5 h-1 bg-slate-200 z-1" />
          <div
            className="absolute top-5 left-5 h-1 bg-teal-600 z-2 transition-all duration-300"
            style={{ width: `${Math.max(0, (stageIndex / (stages.length - 1)) * 100)}%` }}
          />

          {stages.map((stageName, idx) => {
            const isCompleted = idx < stageIndex;
            const isCurrent = idx === stageIndex;

            return (
              <div key={stageName} className="flex flex-col items-center relative z-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                      ? 'bg-white border-2 border-teal-600 text-teal-600 ring-4 ring-teal-500/20'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 capitalize ${
                    isCurrent ? 'font-bold text-slate-900' : 'font-medium text-slate-500'
                  }`}
                >
                  {stageName.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Key Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card A: Policy Coverage Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500">Insurance Coverage</span>
              <ShieldCheck size={18} className="text-teal-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              {policy?.policy_name || 'No Policy Configured'}
            </h3>
            <p className="text-xs text-slate-500">
              Remaining Sum Insured: <strong className="text-teal-600 font-bold">₹{policy?.remaining_sum_insured ? (policy.remaining_sum_insured / 100000).toFixed(1) + ' Lakhs' : '5.0 Lakhs'}</strong>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BedDouble size={12} />
              Eligible Room: {policy?.room_eligibility || 'Private AC'}
            </span>
            <button
              onClick={() => onNavigate('insurance')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 border border-teal-200 cursor-pointer transition-colors"
            >
              Inspect Rules
            </button>
          </div>
        </div>

        {/* Card B: Indicative Exposure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-500">Indicative Out-of-Pocket</span>
              <IndianRupee size={18} className="text-amber-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1 flex items-baseline gap-2">
              ₹14,000 <span className="text-xs font-semibold text-slate-500">est. non-payable</span>
            </h3>
            <p className="text-xs text-slate-500">
              Includes surgical consumables & admin kits not covered by policy.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle size={12} />
              Pre-Auth: Pending Final
            </span>
            <button
              onClick={() => onNavigate('cost')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-600 hover:bg-teal-50 border border-teal-200 cursor-pointer transition-colors"
            >
              Cost Details
            </button>
          </div>
        </div>

        {/* Card C: Pending Verification Action Items */}
        <div className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${
          pendingVerifications.length > 0
            ? 'bg-amber-50/70 border-amber-200/90'
            : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-800">
                Verify Before You Rely
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                {pendingVerifications.length} Pending
              </span>
            </div>
            <h4 className="text-sm font-bold text-amber-950 mb-1">
              {highPriorityAlert?.title || 'All verification items resolved'}
            </h4>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {highPriorityAlert?.reason || 'No immediate desk verification required for this care phase.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/60 flex justify-between items-center">
            <button
              onClick={onOpenQuestionsModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
            >
              <HelpCircle size={13} />
              What to Ask Desk
            </button>
            <button
              onClick={() => onNavigate('verification')}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors shadow-xs"
            >
              Checklist
            </button>
          </div>
        </div>

      </div>

      {/* Policy Document RAG Assistant Widget (Phase 24) */}
      <PolicyRagAssistant
        selectedPolicyId={policy?.id}
        policyName={policy?.policy_name}
      />

      {/* 3. Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('hospitals')}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Hospital Matcher</div>
              <div className="text-xs text-slate-500">Rank eligible network options</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('cost')}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <IndianRupee size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Cost Breakdown</div>
              <div className="text-xs text-slate-500">Itemized procedure estimates</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('verification')}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Verification Center</div>
              <div className="text-xs text-slate-500">Pre-auth & room cap checklist</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
        </button>
      </div>

    </div>
  );
};
