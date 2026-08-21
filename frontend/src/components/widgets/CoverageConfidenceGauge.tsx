import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { InfoPopover } from '../common/InfoPopover';

interface CoverageConfidenceGaugeProps {
  policy: any;
  hospital?: any;
  journey?: any;
  verificationItems?: any[];
  onOpenQuestionsModal?: () => void;
}

export const CoverageConfidenceGauge: React.FC<CoverageConfidenceGaugeProps> = ({
  policy,
  hospital,
  verificationItems = [],
  onOpenQuestionsModal
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Compute sub-factors deterministically
  const pendingVerifications = verificationItems.filter((v) => v.status === 'PENDING');
  const hasRoomMismatch = pendingVerifications.some((v) => v.category === 'ROOM' || v.title?.toLowerCase().includes('room'));
  const isNetworkCashless = hospital?.cashless_available ?? true;
  const isPreauthPending = pendingVerifications.some((v) => v.category === 'PREAUTH' || v.title?.toLowerCase().includes('preauth'));
  const hasConsumablesVerified = !pendingVerifications.some((v) => v.category === 'COST' || v.title?.toLowerCase().includes('consumable'));

  // 1. Network Factor (30 pts max)
  const networkScore = isNetworkCashless ? 30 : 15;
  
  // 2. Room Factor (25 pts max)
  const roomScore = !hasRoomMismatch ? 25 : 10;
  
  // 3. Preauth & Procedure (20 pts max)
  const procedureScore = !isPreauthPending ? 20 : 12;

  // 4. Policy Completeness (15 pts max)
  const policyScore = policy ? 15 : 5;

  // 5. Cost Certainty (10 pts max)
  const costScore = hasConsumablesVerified ? 10 : 6;

  const totalScore = Math.min(100, Math.max(0, networkScore + roomScore + procedureScore + policyScore + costScore));

  // Determine status color and label
  let ratingLabel = 'High Information Certainty';
  let ratingColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let strokeColor = '#0d9488'; // teal-600

  if (totalScore < 70) {
    ratingLabel = 'Action Required';
    ratingColor = 'text-red-700 bg-red-50 border-red-200';
    strokeColor = '#e11d48'; // rose-600
  } else if (totalScore < 85) {
    ratingLabel = 'Verification Recommended';
    ratingColor = 'text-amber-800 bg-amber-50 border-amber-200';
    strokeColor = '#d97706'; // amber-600
  }

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Score & Gauge */}
        <div className="flex items-center gap-4">
          
          {/* Radial SVG Gauge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 leading-none">
                {totalScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                / 100
              </span>
            </div>
          </div>

          {/* Title & Summary with Info Button */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Coverage Confidence Score
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ratingColor}`}>
                {ratingLabel}
              </span>
              <InfoPopover
                title="Coverage Confidence Index"
                size="xs"
                variant="teal"
                content="A deterministic composite index reflecting data availability, room rent rule alignment, and TPA pre-authorization status."
                details={[
                  { label: 'Hospital Network Status', value: `${networkScore}/30 pts` },
                  { label: 'Room Category Entitlement', value: `${roomScore}/25 pts` },
                  { label: 'Pre-Authorization Status', value: `${procedureScore}/20 pts` },
                  { label: 'Policy Parameter Grounding', value: `${policyScore}/15 pts` },
                  { label: 'Consumables & Cost Clarity', value: `${costScore}/10 pts` }
                ]}
              />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              {totalScore >= 85 && 'Strong Alignment with Policy Terms'}
              {totalScore >= 70 && totalScore < 85 && 'Room or Pre-Auth Verification Recommended'}
              {totalScore < 70 && 'Critical Discrepancy or Desk Confirmation Needed'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Measures policy data completeness, room eligibility match, and cashless certainty.
            </p>
          </div>

        </div>

        {/* Right Side: Toggle Details & Action */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {isExpanded ? 'Hide Factors' : 'Inspect 5 Factors'}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

      </div>

      {/* Expandable Breakdown Drawer */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            
            {/* Factor 1: Network */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">1. Hospital Network</span>
                {isNetworkCashless ? (
                  <CheckCircle2 size={15} className="text-teal-600" />
                ) : (
                  <AlertTriangle size={15} className="text-amber-500" />
                )}
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {isNetworkCashless ? 'In-Network Cashless' : 'Unknown / Reimburse'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Weight: {networkScore}/30 pts
              </span>
            </div>

            {/* Factor 2: Room */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">2. Room Entitlement</span>
                {!hasRoomMismatch ? (
                  <CheckCircle2 size={15} className="text-teal-600" />
                ) : (
                  <AlertTriangle size={15} className="text-amber-500" />
                )}
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {!hasRoomMismatch ? 'Within Policy Cap' : 'Mismatch Warning'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Weight: {roomScore}/25 pts
              </span>
            </div>

            {/* Factor 3: Procedure */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">3. Pre-Auth Status</span>
                {!isPreauthPending ? (
                  <CheckCircle2 size={15} className="text-teal-600" />
                ) : (
                  <AlertTriangle size={15} className="text-amber-500" />
                )}
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {!isPreauthPending ? 'Pre-Auth Approved' : 'Pre-Auth In Review'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Weight: {procedureScore}/20 pts
              </span>
            </div>

            {/* Factor 4: Policy Model */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">4. Policy Rules</span>
                <CheckCircle2 size={15} className="text-teal-600" />
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {policy ? 'Extracted & Grounded' : 'Unconfigured'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Weight: {policyScore}/15 pts
              </span>
            </div>

            {/* Factor 5: Cost Certainty */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600">5. Cost Certainty</span>
                {hasConsumablesVerified ? (
                  <CheckCircle2 size={15} className="text-teal-600" />
                ) : (
                  <AlertTriangle size={15} className="text-amber-500" />
                )}
              </div>
              <div className="text-xs font-extrabold text-slate-900">
                {hasConsumablesVerified ? 'Tariffs Mapped' : 'Consumables Est.'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                Weight: {costScore}/10 pts
              </span>
            </div>

          </div>

          {/* Safety Notice Footer */}
          <div className="flex items-center justify-between bg-teal-50/70 border border-teal-200/80 rounded-xl px-3 py-2 text-[11px] text-teal-800">
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-teal-700 shrink-0" />
              <span>
                <strong>Information Confidence Index:</strong> Deterministic model calculation. Subject to final TPA settlement.
              </span>
            </div>
            {onOpenQuestionsModal && pendingVerifications.length > 0 && (
              <button
                type="button"
                onClick={onOpenQuestionsModal}
                className="text-[11px] font-bold text-teal-700 underline hover:text-teal-900 cursor-pointer shrink-0 ml-2"
              >
                Ask Billing Desk →
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
