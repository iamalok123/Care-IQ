import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  HelpCircle,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface VerificationCenterProps {
  verificationItems: any[];
  onItemResolved: () => void;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({
  verificationItems,
  onItemResolved
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = verificationItems.filter((item) => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    return true;
  });

  const handleResolve = async (id: string) => {
    try {
      await api.resolveVerificationItem(id);
      onItemResolved();
    } catch (err) {
      console.error('Failed to resolve item:', err);
    }
  };

  const handleCopyQuestion = (id: string, question: string) => {
    navigator.clipboard.writeText(question);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingCount = verificationItems.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Header & Summary Banner */}
      <div className="bg-linear-to-br from-white to-amber-50/50 border border-amber-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                Verify Before You Rely
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Active Guardrail Checklist
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Actionable Hospital & Insurance Verification Items
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Never assume cashless approval or tariff coverage. Verify these critical items with hospital and TPA desks.
            </p>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-extrabold ${pendingCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {pendingCount}
            </div>
            <div className="text-[10px] font-bold text-slate-500 tracking-wider">PENDING CHECKS</div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-amber-200/50">
          {['ALL', 'PREAUTH', 'ROOM', 'COST', 'DOCUMENT', 'NETWORK'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Verification Checklist Items */}
      <div className="flex flex-col gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              All verification items in this category are resolved
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You're all set for this care journey stage.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isResolved = item.status === 'RESOLVED';

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-5 shadow-xs transition-all ${
                  isResolved
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : item.priority === 'HIGH'
                    ? 'bg-amber-50/40 border-amber-200/90'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : item.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.priority} PRIORITY
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <h4 className={`text-sm md:text-base font-extrabold ${isResolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {item.title}
                    </h4>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isResolved ? '✓ RESOLVED' : 'PENDING ACTION'}
                  </span>
                </div>

                {/* Question to Ask */}
                <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl my-2.5">
                  <div className="text-[11px] font-bold text-teal-700 flex items-center gap-1 mb-1">
                    <HelpCircle size={13} />
                    Question to ask the hospital / TPA insurance desk:
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    "{item.question}"
                  </p>
                </div>

                {/* Reason / Rationale */}
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  <strong className="text-slate-700">Why it matters:</strong> {item.reason}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-end items-center gap-2 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => handleCopyQuestion(item.id, item.question)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedId === item.id ? 'Copied to Clipboard!' : 'Copy Question for Desk'}
                  </button>

                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 size={14} />
                      Mark as Verified
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
