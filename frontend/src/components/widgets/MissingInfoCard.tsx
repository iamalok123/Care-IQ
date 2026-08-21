import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  FileQuestion,
  Copy,
  Check
} from 'lucide-react';
import { InfoPopover } from '../common/InfoPopover';

interface MissingInfoCardProps {
  verificationItems: any[];
  onOpenQuestionsModal: () => void;
  onNavigate: (tab: string) => void;
}

export const MissingInfoCard: React.FC<MissingInfoCardProps> = ({
  verificationItems = [],
  onOpenQuestionsModal,
  onNavigate
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pendingItems = verificationItems.filter((v) => v.status === 'PENDING');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (pendingItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              All Critical Data Points Confirmed
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Network cashless status, room cap eligibility, and pre-auth are in active alignment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('verification')}
          className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors shrink-0"
        >
          View Checklist
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
      
      {/* Header with Title, Count & Info Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <FileQuestion size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-amber-950">
                What We Don&apos;t Know Yet & Need to Verify
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white shadow-2xs">
                {pendingItems.length} Unresolved
              </span>
              <InfoPopover
                title="Actionable Verification Guardrails"
                size="xs"
                variant="amber"
                content="CareIQ proactively highlights unconfirmed parameters before admission to protect you from out-of-pocket billing surprises."
                details={[
                  { label: 'Rule', value: 'Never assume full coverage without written pre-auth' },
                  { label: 'Categories', value: 'Pre-auth, Room Caps, Consumables, Network' },
                  { label: 'Next Step', value: 'Ask hospital TPA desk before admission' }
                ]}
              />
            </div>
            <p className="text-[11px] text-amber-800/90 mt-0.5">
              Click the <strong className="font-bold text-amber-950">(i)</strong> on any item to view rationale and suggested questions for the hospital TPA desk.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenQuestionsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <HelpCircle size={14} />
            Generate Questions
          </button>
          <button
            type="button"
            onClick={() => onNavigate('verification')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            Checklist
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Structured, Clean Grid of Action Items with (i) Info Popovers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-amber-200/50">
        {pendingItems.slice(0, 4).map((item, idx) => {
          const itemId = item.id || `item-${idx}`;
          const isCopied = copiedId === itemId;

          return (
            <div 
              key={itemId}
              className="bg-white border border-amber-200/70 hover:border-amber-300 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs shadow-2xs transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <AlertTriangle 
                  size={15} 
                  className={`shrink-0 ${
                    item.priority === 'HIGH' ? 'text-red-500' : 'text-amber-500'
                  }`} 
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate text-xs">
                      {item.title}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                      item.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.priority || 'Action'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block truncate">
                    Category: {item.category || 'General'} • Click (i) for details
                  </span>
                </div>
              </div>

              {/* Dedicated (i) Circle Info Popover on the Item */}
              <div className="shrink-0 flex items-center gap-1">
                <InfoPopover
                  title={item.title}
                  size="xs"
                  variant={item.priority === 'HIGH' ? 'amber' : 'default'}
                  content={
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {item.reason || item.description || 'Verification required before hospital admission.'}
                      </p>
                      {item.suggested_question && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/60 mt-1">
                          <span className="text-[10px] font-bold text-amber-900 block mb-0.5">
                            Suggested Question to Ask TPA Desk:
                          </span>
                          <p className="text-xs text-amber-950 italic">
                            &ldquo;{item.suggested_question}&rdquo;
                          </p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.suggested_question, itemId)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                          >
                            {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            {isCopied ? 'Copied to clipboard' : 'Copy question'}
                          </button>
                        </div>
                      )}
                    </div>
                  }
                  details={[
                    { label: 'Category', value: item.category || 'PREAUTH' },
                    { label: 'Risk Priority', value: item.priority || 'HIGH' },
                    { label: 'Status', value: 'Pending Desk Confirmation' }
                  ]}
                  action={{
                    label: 'Open in Verification Center',
                    onClick: () => onNavigate('verification')
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
