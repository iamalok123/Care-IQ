import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  HeartHandshake, 
  Building2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Printer,
  ExternalLink
} from 'lucide-react';

interface CaregiverShareModalProps {

  isOpen: boolean;
  onClose: () => void;
  patient?: any;
  policy?: any;
  hospital?: any;
  journey?: any;
  verificationItems?: any[];
  costEstimate?: any;
}

export const CaregiverShareModal: React.FC<CaregiverShareModalProps> = ({
  isOpen,
  onClose,
  patient,
  policy,
  hospital,
  journey,
  verificationItems = [],
  costEstimate
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const patientName = patient?.name || 'Ananya Sharma';
  const hospitalName = hospital?.name || 'Manipal Hospital, Old Airport Road';
  const policyName = policy?.policy_name || 'Star Comprehensive Health Insurance';
  const currentStage = journey?.current_stage || 'PROCEDURE';
  const lastUpdated = journey?.updated_at 
    ? new Date(journey.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  const estimatedOop = costEstimate?.indicativePatientExposure || 14000;
  const estimatedCovered = costEstimate?.estimatedCoveredAmount || 226000;

  const unresolvedItems = verificationItems.filter((i) => i.status !== 'RESOLVED');

  const shareableUrl = `${window.location.origin}/?view=summary&patient=${encodeURIComponent(patientName)}&stage=${currentStage}`;

  const formattedSummaryText = `🏥 *CareIQ Caregiver Update for ${patientName}*
• *Hospital:* ${hospitalName}
• *Current Stage:* ${currentStage}
• *Insurance Policy:* ${policyName}
• *Pre-Auth Status:* Cashless In-Network (Sanction in progress)
• *Est. Out-of-Pocket:* ₹${estimatedOop.toLocaleString()} (Covered: ₹${estimatedCovered.toLocaleString()})
• *Next Action Items:* ${unresolvedItems.length > 0 ? unresolvedItems.map((i, idx) => `\n  ${idx + 1}. ${i.title || i.item_name || i}`).join('') : 'All critical checks verified.'}
• *Last Updated:* ${lastUpdated}

Live CareIQ Trajectory: ${shareableUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(formattedSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-linear-to-r from-teal-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <HeartHandshake size={22} className="text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Caregiver Share Mode</h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Read-Only Summary
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simplified, real-time snapshot for family members & co-caregivers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-900">
          
          {/* Patient & Facility Summary Strip */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 block mb-0.5">
                Active Inpatient Trajectory
              </span>
              <h4 className="text-lg font-black text-slate-900">{patientName}</h4>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-teal-600" />
                {hospitalName}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Stage</span>
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-teal-600 text-white uppercase tracking-wider shadow-xs">
                {currentStage}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Insurance Policy
              </span>
              <span className="text-xs font-extrabold text-slate-900 line-clamp-1">
                {policyName}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                ✓ Cashless Empanelled
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Estimated Out-of-Pocket
              </span>
              <span className="text-xs font-extrabold text-rose-700">
                ₹{estimatedOop.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Covered: ₹{estimatedCovered.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Last Status Update
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                {lastUpdated}
              </span>
              <span className="text-[10px] text-teal-700 font-bold block mt-0.5">
                ✓ Live Sync Active
              </span>
            </div>

          </div>

          {/* Key Caregiver Action Checklist */}
          <div className="p-4.5 rounded-2xl bg-amber-50/60 border border-amber-200">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-2.5">
              <AlertCircle size={15} className="text-amber-600" />
              Pending Caregiver Next Steps & Verification Items
            </h5>
            
            {unresolvedItems.length === 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 size={16} className="text-emerald-600" />
                All hospital desk and insurance verification items are currently resolved!
              </div>
            ) : (
              <div className="space-y-1.5">
                {unresolvedItems.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-950 font-medium bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                    <span>{item.title || item.item_name || item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share Actions Grid */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
              Share With Family Members:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Copy WhatsApp text */}
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-600" />
                  <span>Copy WhatsApp / SMS Text</span>
                </div>
                {copiedText ? <Check size={16} className="text-emerald-700" /> : <Copy size={14} />}
              </button>

              {/* Copy Shareable Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 text-xs font-extrabold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={16} className="text-indigo-600" />
                  <span>Copy Shareable Link</span>
                </div>
                {copiedLink ? <Check size={16} className="text-indigo-700" /> : <Copy size={14} />}
              </button>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Printer size={14} />
            Print Summary
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
