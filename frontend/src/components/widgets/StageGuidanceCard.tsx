/**
 * Stage-by-stage guidance for the current point in an admission.
 *
 * Removed: `patientName = 'Ananya Sharma'` and
 * `procedureName = 'Total Knee Replacement'` as prop defaults. Every caller
 * that did not pass them — which was every caller — sent one demo patient's
 * name and a knee replacement to the guidance engine, so the advice returned
 * was written about someone else's operation. Both are optional now and the
 * request simply omits what we do not know.
 *
 * Also removed: a hardcoded '✨ Gemini 3.5 Flash' badge shown whenever
 * isAiGenerated was true, regardless of which model actually answered. The
 * badge now prints guidance.modelUsed.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  HelpCircle,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Loader } from '../common/Loader';
import { api, ApiError } from '../../services/api';
import { JOURNEY_STAGES, STAGE_LABELS } from '../../lib/journey';
import type {
  EnrichedInsurancePolicy,
  Hospital,
  JourneyStage,
  StageGuidance
} from '../../types/domain';

interface StageGuidanceCardProps {
  stage: JourneyStage;
  policy?: EnrichedInsurancePolicy | null;
  hospital?: Hospital | null;
  /** Omit when unknown. Never substitute another patient's name. */
  patientName?: string;
  procedureName?: string;
  isRoomMismatch?: boolean;
  onSelectStage?: (stage: JourneyStage) => void;
}

export const StageGuidanceCard: React.FC<StageGuidanceCardProps> = ({
  stage: initialStage,
  policy,
  hospital,
  patientName,
  procedureName,
  isRoomMismatch = false,
  onSelectStage
}) => {
  const [activeStage, setActiveStage] = useState<JourneyStage>(initialStage);
  const [guidance, setGuidance] = useState<StageGuidance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setActiveStage(initialStage);
  }, [initialStage]);

  const fetchGuidance = useCallback(async () => {
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
      setError(null);
    } catch (err) {
      setGuidance(null);
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Could not load guidance for this stage.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeStage, policy?.id, hospital?.id, patientName, procedureName, isRoomMismatch]);

  useEffect(() => {
    void fetchGuidance();
  }, [fetchGuidance]);

  const handleCopyQuestions = async () => {
    if (!guidance || guidance.billingDeskQuestions.length === 0) return;
    const text =
      `Questions to ask during ${guidance.stageTitle}:\n\n` +
      guidance.billingDeskQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Your browser blocked clipboard access. Select the questions to copy them.');
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 bg-teal-700 text-white rounded-xl shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {guidance?.stageTitle ?? `${STAGE_LABELS[activeStage] ?? activeStage} guidance`}
            </h3>
            {guidance && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                {guidance.isAiGenerated
                  ? `Written by ${guidance.modelUsed}`
                  : 'Written by the deterministic rules engine'}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void fetchGuidance()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer self-start shrink-0 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-teal-700' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Stage tabs. Labels come from the shared stage vocabulary so the tab
          text and the journey stepper can never drift apart. */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5">
        {JOURNEY_STAGES.map((s, idx) => {
          const isSelected = activeStage === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setActiveStage(s);
                onSelectStage?.(s);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isSelected
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}. {STAGE_LABELS[s]}
            </button>
          );
        })}
      </div>

      {error && !loading && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
          {error}
        </p>
      )}

      {loading && !guidance && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 flex items-center justify-center">
          <Loader size="sm" />
        </div>
      )}

      {guidance && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-teal-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm text-slate-800 leading-relaxed">{guidance.keyGuidance}</p>
                <div className="mt-3 pt-2.5 border-t border-teal-200/60 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-slate-700">
                  <span className="flex items-start gap-1.5">
                    <Clock size={14} className="text-teal-700 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">Timeline:</strong>{' '}
                      {guidance.estimatedTimeline}
                    </span>
                  </span>
                  <span className="flex items-start gap-1.5">
                    <ShieldAlert size={14} className="text-blue-700 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">Insurance:</strong>{' '}
                      {guidance.insuranceCheck}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuidanceList
              title="Do this now"
              icon={<CheckCircle2 size={15} className="text-emerald-700" />}
              items={guidance.proactiveTips}
              wrapper="border-emerald-200 bg-emerald-50/40"
              heading="text-emerald-900"
              dot="bg-emerald-600"
              body="text-emerald-950"
            />
            <GuidanceList
              title="Common traps"
              icon={<AlertTriangle size={15} className="text-rose-700" />}
              items={guidance.criticalPitfalls}
              wrapper="border-rose-200 bg-rose-50/40"
              heading="text-rose-900"
              dot="bg-rose-600"
              body="text-rose-950"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidance.requiredDocuments.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5 mb-3">
                  <FileText size={15} className="text-teal-700" />
                  Documents to have ready
                </h4>
                <ul className="space-y-1.5">
                  {guidance.requiredDocuments.map((doc) => (
                    <li
                      key={doc}
                      className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-700"
                    >
                      <span className="text-teal-700 font-bold leading-none mt-0.5">•</span>
                      <span className="leading-relaxed">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.billingDeskQuestions.length > 0 && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                    <HelpCircle size={15} className="text-blue-700" />
                    Ask the billing desk
                  </h4>
                  <button
                    type="button"
                    onClick={() => void handleCopyQuestions()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:text-blue-950 bg-white px-2 py-0.5 rounded-lg border border-blue-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <ul className="space-y-2">
                  {guidance.billingDeskQuestions.map((q, idx) => (
                    <li
                      key={q}
                      className="p-2.5 bg-white rounded-lg border border-blue-100 text-xs text-slate-800 leading-relaxed"
                    >
                      <strong className="text-blue-800 mr-1.5">Q{idx + 1}:</strong>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface GuidanceListProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  wrapper: string;
  heading: string;
  dot: string;
  body: string;
}

const GuidanceList: React.FC<GuidanceListProps> = ({
  title,
  icon,
  items,
  wrapper,
  heading,
  dot,
  body
}) => {
  if (items.length === 0) return null;
  return (
    <div className={`p-4 rounded-xl border ${wrapper}`}>
      <h4
        className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-3 ${heading}`}
      >
        {icon}
        {title}
      </h4>
      <ul className={`space-y-2 text-xs ${body}`}>
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dot}`} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
