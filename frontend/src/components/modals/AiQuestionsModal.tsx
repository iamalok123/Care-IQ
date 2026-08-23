/**
 * The questions-to-ask checklist.
 *
 * Two things were wrong here. The response was typed `any` and treated as an
 * object with two arrays, so `nursingAdminQuestions` — a third desk the API has
 * always returned — was silently dropped and never rendered. And the hospital
 * name was required, with the server substituting 'the hospital' when it was
 * missing, so a checklist opened from a screen that did not know the hospital
 * still read as though we did.
 */
import React, { useEffect, useState } from 'react';
import { Building2, Check, Copy, HelpCircle, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { useCareIQ } from '../../context/CareIQContext';
import { resolveJourneyStage } from '../../lib/journey';
import type { QuestionsToAsk } from '../../types/domain';

interface AiQuestionsModalProps {
  /** Null when the caller does not know the hospital. Rendered as unknown. */
  hospitalName: string | null;
  isRoomExceeded?: boolean;
  onClose: () => void;
}

interface Desk {
  key: keyof QuestionsToAsk;
  title: string;
  icon: React.ReactNode;
  accent: string;
}

const DESKS: Desk[] = [
  {
    key: 'billingDeskQuestions',
    title: 'Hospital billing & cashless counter',
    icon: <Building2 size={15} />,
    accent: 'text-teal-800'
  },
  {
    key: 'insuranceCoordinatorQuestions',
    title: 'TPA insurance coordinator',
    icon: <ShieldCheck size={15} />,
    accent: 'text-blue-800'
  },
  {
    key: 'nursingAdminQuestions',
    title: 'Nursing station & admission desk',
    icon: <Stethoscope size={15} />,
    accent: 'text-slate-800'
  }
];

export const AiQuestionsModal: React.FC<AiQuestionsModalProps> = ({
  hospitalName,
  isRoomExceeded,
  onClose
}) => {
  const { activePolicy, journey } = useCareIQ();
  const [questions, setQuestions] = useState<QuestionsToAsk | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const stage = resolveJourneyStage(journey).stage;
  const insurerName = activePolicy?.insurer_name;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // The insurer and the stage are both sent now. They were available all
        // along and never passed, so every desk got the same generic list.
        const data = await api.getQuestions({
          hospital_name: hospitalName ?? undefined,
          insurer_name: insurerName,
          stage: stage ?? undefined,
          is_room_exceeded: isRoomExceeded
        });
        if (cancelled) return;
        setQuestions(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setQuestions(null);
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : 'Could not load the question checklist.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hospitalName, insurerName, stage, isRoomExceeded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Your browser blocked clipboard access. Select the text to copy it manually.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="questions-modal-title"
      >
        <div className="flex justify-between items-start gap-3 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-start gap-3 min-w-0">
            <div className="bg-teal-50 text-teal-700 p-2.5 rounded-xl shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="min-w-0">
              <h3 id="questions-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                Questions to ask
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {hospitalName ? `For ${hospitalName}` : 'Hospital not recorded for this checklist'}
                {insurerName ? ` • ${insurerName}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checklist"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X size={20} />
          </button>
        </div>

        {isRoomExceeded && (
          <p className="mb-4 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
            The room you selected is above your policy entitlement, so the first billing question
            below is the one that matters most.
          </p>
        )}

        {loading && <p className="py-8 text-center text-xs font-semibold text-slate-500">Preparing your checklist…</p>}

        {error && !loading && (
          <p className="py-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {error}
          </p>
        )}

        {questions && !loading && (
          <div className="flex flex-col gap-5">
            {DESKS.map((desk) => {
              const items = questions[desk.key];
              if (!items || items.length === 0) return null;
              return (
                <section key={desk.key}>
                  <h4
                    className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${desk.accent}`}
                  >
                    {desk.icon}
                    {desk.title}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {items.map((q) => (
                      <li
                        key={q}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-start gap-2"
                      >
                        <span className="text-xs text-slate-800 leading-relaxed">{q}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(q)}
                          aria-label={copied === q ? 'Copied' : 'Copy question'}
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          {copied === q ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
