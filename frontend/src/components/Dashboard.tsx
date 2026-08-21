import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Sparkles,
  BedDouble,
  HelpCircle,
  Landmark,
  Share2,
  ArrowRight
} from 'lucide-react';

import { CoverageConfidenceGauge } from './CoverageConfidenceGauge';
import { MissingInfoCard } from './MissingInfoCard';
import { CaregiverShareModal } from './CaregiverShareModal';
import { InfoPopover } from './InfoPopover';

interface DashboardProps {
  patient: any;
  policy: any;
  journey: any;
  verificationItems: any[];
  onNavigate: (tab: string) => void;
  onOpenQuestionsModal: () => void;
  onOpenScenarioGuide?: () => void;
  onOpenChatbot?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  patient,
  policy,
  journey,
  verificationItems,
  onNavigate,
  onOpenQuestionsModal,
  onOpenScenarioGuide,
  onOpenChatbot
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const pendingVerifications = verificationItems.filter((v) => v.status === 'PENDING');
  const highPriorityAlert = pendingVerifications.find((v) => v.priority === 'HIGH') || pendingVerifications[0];

  const currentStage = journey?.current_stage || 'ADMISSION';
  const stages = ['ADMISSION', 'INVESTIGATION', 'PROCEDURE', 'RECOVERY', 'DISCHARGE'];
  const stageIndex = stages.indexOf(currentStage);

  // Government Scheme detection (e.g. Ayushman Bharat PM-JAY)
  const isGovScheme = 
    policy?.scheme_type === 'GOV_PMJAY' || 
    policy?.policy_name?.toLowerCase().includes('pm-jay') || 
    policy?.policy_name?.toLowerCase().includes('ayushman') ||
    policy?.insurer_name?.toLowerCase().includes('ayushman');

  return (
    <div className="flex flex-col gap-4">
      
      {/* 🏛️ Government Scheme Banner (Active when PM-JAY or Govt Scheme is loaded) */}
      {isGovScheme && (
        <div className="bg-linear-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white rounded-2xl p-3.5 sm:p-4 shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
              <Landmark size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm tracking-tight">
                  Government Scheme: Ayushman Bharat PM-JAY
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-white text-emerald-800 uppercase">
                  100% Cashless Package
                </span>
                <InfoPopover
                  title="PM-JAY Scheme Entitlement"
                  size="xs"
                  variant="emerald"
                  content="Ayushman Bharat PM-JAY covers up to ₹5 Lakhs per family per year for secondary and tertiary hospitalization. When treated at an empaneled hospital, all medicines, diagnostics, food, and bed charges are 100% cashless under pre-defined package codes."
                  details={[
                    { label: 'Annual Benefit', value: '₹5,00,000 / family' },
                    { label: 'Out-of-Pocket', value: '₹0 for statutory package code' },
                    { label: 'Room Rent Deductions', value: 'None (Standard ward package)' }
                  ]}
                />
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Empaneled Network Hospital • Zero out-of-pocket for standard package codes • No room rent deduction applies.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('insurance')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Scheme Rules
          </button>
        </div>
      )}

      {/* 1. Care Journey Active Stage Progress Banner */}
      <div className="bg-linear-to-br from-white to-teal-50/50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Active Journey Stage
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Updated: {journey ? new Date(journey.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
              </span>
              <InfoPopover
                title="Care Journey Trajectory"
                size="xs"
                variant="teal"
                content="CareIQ tracks patient milestone triggers from pre-admission authorization to final discharge settlement to ensure insurance compliance at every phase."
                details={[
                  { label: 'Stage 1: Admission', value: 'TPA Pre-Auth submission & initial enhancement' },
                  { label: 'Stage 2: Investigation', value: 'Preserve diagnostic bills for pre-hosp claims' },
                  { label: 'Stage 3: Procedure', value: 'Surgical implant codes & consumable logging' },
                  { label: 'Stage 4: Recovery', value: 'Ward room rent rate verification' },
                  { label: 'Stage 5: Discharge', value: 'Final bill audit & TPA deduction check' }
                ]}
              />
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900">
              {currentStage === 'ADMISSION' && 'Stage 1: Admission & Desk Verification'}
              {currentStage === 'INVESTIGATION' && 'Stage 2: Clinical Diagnostics & Imaging'}
              {currentStage === 'PROCEDURE' && 'Stage 3: Operation Theatre & Procedure'}
              {currentStage === 'RECOVERY' && 'Stage 4: Inpatient Recovery & Ward Care'}
              {currentStage === 'DISCHARGE' && 'Stage 5: Discharge & Claim Settlement'}
              {!stages.includes(currentStage) && `Stage: ${currentStage}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onOpenScenarioGuide && (
              <button
                type="button"
                onClick={onOpenScenarioGuide}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                title="Explore 11 Scenarios Comparative Matrix"
              >
                <Sparkles size={14} className="text-indigo-600" />
                Scenario Guide
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 size={14} className="text-indigo-600" />
              Share with Caregiver
            </button>

            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/30 transition-all cursor-pointer"
              onClick={() => onNavigate('journey')}
            >
              <Sparkles size={14} />
              View Full Timeline
            </button>
          </div>
        </div>

        {/* Multi-Stage Step Progress Bar */}
        <div className="flex items-center justify-between relative mt-3 pt-1">
          <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 z-1" />
          <div
            className="absolute top-4 left-4 h-1 bg-teal-600 z-2 transition-all duration-300"
            style={{ width: `${Math.max(0, (stageIndex / (stages.length - 1)) * 100)}%` }}
          />

          {stages.map((stageName, idx) => {
            const isCompleted = idx < stageIndex;
            const isCurrent = idx === stageIndex;

            return (
              <div key={stageName} className="flex flex-col items-center relative z-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                      ? 'bg-white border-2 border-teal-600 text-teal-600 ring-3 ring-teal-500/20'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-1 capitalize ${
                    isCurrent ? 'font-black text-slate-900' : 'font-medium text-slate-400'
                  }`}
                >
                  {stageName.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Coverage Confidence Score Radial Gauge Widget */}
      <CoverageConfidenceGauge
        policy={policy}
        journey={journey}
        verificationItems={verificationItems}
        onOpenQuestionsModal={onOpenQuestionsModal}
      />

      {/* 3. What We Don't Know Yet & Actionable Items Card */}
      <MissingInfoCard
        verificationItems={verificationItems}
        onOpenQuestionsModal={onOpenQuestionsModal}
        onNavigate={onNavigate}
      />

      {/* 4. Structured 3-Column Financial & Guardrail Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Card A: Policy Coverage Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Insurance Coverage
              </span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={16} className="text-teal-600" />
                <InfoPopover
                  title="Policy Parameters & Sub-limits"
                  size="xs"
                  variant="teal"
                  content="Key policy rules extracted from the insurance schedule defining eligible room categories, waiting periods, and pre/post-hospitalization days."
                  details={[
                    { label: 'Insurer', value: policy?.insurer_name || 'Configured Insurer' },
                    { label: 'Policy Type', value: policy?.policy_type || 'Comprehensive' },
                    { label: 'Eligible Room', value: policy?.room_eligibility || 'Private AC' },
                    { label: 'Pre-Hosp Window', value: `${policy?.pre_hosp_days || 30} Days` },
                    { label: 'Post-Hosp Window', value: `${policy?.post_hosp_days || 60} Days` },
                    { label: 'Co-Payment %', value: `${policy?.copay_percentage || 0}%` }
                  ]}
                />
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-black text-slate-900 mb-0.5 truncate">
              {policy?.policy_name || 'No Policy Configured'}
            </h3>
            <p className="text-xs text-slate-500">
              Remaining Sum Insured: <strong className="text-teal-700 font-black">₹{policy?.remaining_sum_insured ? (policy.remaining_sum_insured / 100000).toFixed(1) + ' Lakhs' : '5.0 Lakhs'}</strong>
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BedDouble size={11} />
              Eligible Room: {policy?.room_eligibility || 'Private AC'}
            </span>
            <button
              onClick={() => onNavigate('insurance')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-200 cursor-pointer transition-colors"
            >
              Inspect Rules
            </button>
          </div>
        </div>

        {/* Card B: Indicative Exposure */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Indicative Out-of-Pocket
              </span>
              <div className="flex items-center gap-1">
                <IndianRupee size={16} className="text-amber-500" />
                <InfoPopover
                  title="Estimated Out-of-Pocket Math"
                  size="xs"
                  variant="amber"
                  content="Estimated total patient liability combining non-payable medical items, room category upgrade penalties, and policy co-payments."
                  details={[
                    { label: 'Non-Payable Consumables', value: '₹14,000 (PPE, Syringes, Gloves)' },
                    { label: 'Room Proportionate Penalty', value: '₹0 (Room within cap)' },
                    { label: 'Policy Co-Payment', value: '₹0' },
                    { label: 'Hospital Pre-Auth Status', value: 'Pending Final Settlement' }
                  ]}
                />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-0.5 flex items-baseline gap-1.5">
              ₹14,000 <span className="text-[11px] font-semibold text-slate-400">est. non-payable</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-tight">
              Includes surgical consumables & admin items typically excluded from claims.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle size={11} />
              Pre-Auth: Pending Final
            </span>
            <button
              onClick={() => onNavigate('cost')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-200 cursor-pointer transition-colors"
            >
              Cost Details
            </button>
          </div>
        </div>

        {/* Card C: Pending Verification Action Items */}
        <div className={`border rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${
          pendingVerifications.length > 0
            ? 'bg-amber-50/60 border-amber-200/90'
            : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                  Verify Before You Rely
                </span>
                <InfoPopover
                  title="Hospital Verification Protocol"
                  size="xs"
                  variant="amber"
                  content="Hospital billing and TPA desks operate on strict admission checklists. Verifying these items upfront prevents discharge day billing delays."
                  details={[
                    { label: 'Pending Items', value: `${pendingVerifications.length} items` },
                    { label: 'Highest Priority', value: highPriorityAlert?.priority || 'NORMAL' },
                    { label: 'Target Desk', value: 'Hospital TPA / Cashless Desk' }
                  ]}
                />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.3 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                {pendingVerifications.length} Pending
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 mb-0.5 truncate">
              {highPriorityAlert?.title || 'All verification items resolved'}
            </h4>
            <p className="text-[11px] text-amber-800/90 leading-relaxed line-clamp-2">
              {highPriorityAlert?.reason || 'No immediate desk verification required for this care stage.'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex justify-between items-center">
            <button
              onClick={onOpenQuestionsModal}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors"
            >
              <HelpCircle size={12} />
              What to Ask
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

      {/* 5. 🤖 Compact Policy Copilot Launch Banner (Subtle solid colors) */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-700 text-white rounded-xl shadow-xs shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">
                CareIQ Policy AI Copilot
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Grounded Vector RAG
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Need immediate clause clarity? Ask plain-English questions about room rent deductions, robotic surgery, and consumable exclusions.
            </p>
          </div>
        </div>

        {onOpenChatbot && (
          <button
            type="button"
            onClick={onOpenChatbot}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <Sparkles size={14} />
            Ask Policy Copilot
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Caregiver Share Summary Modal */}
      <CaregiverShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        patient={patient}
        policy={policy}
        journey={journey}
        verificationItems={verificationItems}
      />

    </div>
  );
};
