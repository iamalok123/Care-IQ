import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';


interface StageGuidanceCardProps {
  stage: string;
  policy?: any;
  hospital?: any;
  patientName?: string;
  procedureName?: string;
  isRoomMismatch?: boolean;
  onSelectStage?: (stage: string) => void;
}

const STAGES = [
  { key: 'ADMISSION', label: '1. Admission Desk' },
  { key: 'INVESTIGATION', label: '2. Diagnostics' },
  { key: 'PROCEDURE', label: '3. OT & Surgery' },
  { key: 'RECOVERY', label: '4. Inpatient Ward' },
  { key: 'DISCHARGE', label: '5. Final Discharge' }
];

export const StageGuidanceCard: React.FC<StageGuidanceCardProps> = ({
  stage: initialStage,
  policy,
  hospital,
  patientName = 'Ananya Sharma',
  procedureName = 'Total Knee Replacement',
  isRoomMismatch = false,
  onSelectStage
}) => {
  const [activeStage, setActiveStage] = useState<string>(initialStage || 'ADMISSION');
  const [guidance, setGuidance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  useEffect(() => {
    if (initialStage) {
      setActiveStage(initialStage);
    }
  }, [initialStage]);

  const fetchGuidance = async () => {
    setLoading(true);
    try {
      const data = await api.getStageGuidance({
        stage: activeStage,
        policy_id: policy?.id,
        hospital_id: hospital?.id,
        patient_name: patientName,
        procedure_name: procedureName,
        is_room_mismatch: isRoomMismatch
      });
      setGuidance(data);
    } catch (err) {
      console.error('Failed to fetch stage guidance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidance();
  }, [activeStage, policy?.id, hospital?.id, patientName, procedureName, isRoomMismatch]);

  const handleCopyQuestions = () => {
    if (!guidance?.billingDeskQuestions) return;
    const text = `Questions to ask during ${guidance.stageTitle}:\n\n` + 
      guidance.billingDeskQuestions.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  return (
    <div className="bg-white border-2 border-teal-100 rounded-3xl p-5 md:p-7 shadow-sm transition-all">
      
      {/* Header & Stage Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-teal-600 to-indigo-600 text-white rounded-2xl shadow-xs">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                Care Journey Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                {guidance?.isAiGenerated ? '✨ Gemini 3.5 Flash' : '⚡ Deterministic Insurance Rules'}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
              {guidance?.stageTitle || `${activeStage} Insurance Guidance`}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchGuidance}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-center"
          title="Refresh AI Guidance"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-teal-600' : ''} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {STAGES.map((s) => {
          const isSelected = activeStage === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setActiveStage(s.key);
                if (onSelectStage) onSelectStage(s.key);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Guidance Content */}
      {guidance && (
        <div className="space-y-5">
          
          {/* Key Stage Guidance Banner */}
          <div className="p-4.5 rounded-2xl bg-linear-to-r from-teal-50 to-indigo-50/60 border border-teal-200/80 text-slate-900">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-extrabold uppercase text-teal-900 tracking-wider block mb-1">
                  Stage Objective & Policy Protocol
                </span>
                <p className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed">
                  {guidance.keyGuidance}
                </p>
                
                <div className="mt-3 pt-2.5 border-t border-teal-200/60 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5 text-teal-800">
                    <Clock size={14} className="text-teal-600" />
                    <strong>Timeline:</strong> {guidance.estimatedTimeline}
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-900">
                    <ShieldAlert size={14} className="text-indigo-600" />
                    <strong>Rule:</strong> {guidance.insuranceCheck}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Proactive Tips & Critical Pitfalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Proactive Tips */}
            <div className="p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-3">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Proactive Action Checklist
              </h4>
              <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                {guidance.proactiveTips?.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Pitfalls */}
            <div className="p-4.5 rounded-2xl border border-rose-200 bg-rose-50/40">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 mb-3">
                <AlertTriangle size={16} className="text-rose-600" />
                Common Traps & Pitfalls to Avoid
              </h4>
              <ul className="space-y-2 text-xs text-rose-950 font-medium">
                {guidance.criticalPitfalls?.map((pitfall: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Documents & Billing Desk Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Required Documents */}
            <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/60">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-3">
                <FileText size={16} className="text-teal-600" />
                Required Documents for this Stage
              </h4>
              <div className="space-y-1.5">
                {guidance.requiredDocuments?.map((doc: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 font-semibold shadow-2xs">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing / TPA Desk Questions */}
            <div className="p-4.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-indigo-600" />
                    Questions to Ask Hospital Staff
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyQuestions}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedQuestions ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedQuestions ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="space-y-2">
                  {guidance.billingDeskQuestions?.map((q: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed shadow-2xs">
                      <strong className="text-indigo-700 mr-1.5">Q{idx + 1}:</strong>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
