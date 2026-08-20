import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  FileQuestion,  
} from 'lucide-react';

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
  const pendingItems = verificationItems.filter((v) => v.status === 'PENDING');


  if (pendingItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              All Critical Data Points Confirmed
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Network cashless status, room cap eligibility, and pre-auth are in active alignment for this stage.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('verification')}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 cursor-pointer transition-colors shrink-0"
        >
          View Checklist
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <FileQuestion size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-amber-950">
                What We Don't Know Yet & Need to Verify
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-red-500 text-white shadow-2xs">
                {pendingItems.length} Unresolved
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              Never assume full coverage. Verify these critical parameters with the hospital billing and TPA insurance desks.
            </p>
          </div>
        </div>

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

      {/* List of pending items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-amber-200/50">
        {pendingItems.slice(0, 4).map((item, idx) => (
          <div 
            key={item.id || idx}
            className="bg-white/90 border border-amber-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs shadow-2xs"
          >
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-slate-900 truncate">
                  {item.title}
                </span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                  item.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.priority || 'Action'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                {item.reason || item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
