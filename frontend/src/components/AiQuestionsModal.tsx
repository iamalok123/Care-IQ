import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Copy, Check, ShieldCheck, Building2 } from 'lucide-react';
import { api } from '../services/api';

interface AiQuestionsModalProps {
  hospitalName: string;
  isRoomExceeded?: boolean;
  onClose: () => void;
}

export const AiQuestionsModal: React.FC<AiQuestionsModalProps> = ({
  hospitalName,
  isRoomExceeded,
  onClose
}) => {
  const [questions, setQuestions] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await api.getQuestions({
          hospital_name: hospitalName,
          is_room_exceeded: isRoomExceeded
        });
        setQuestions(data);
      } catch (err) {
        console.error('Failed to fetch AI questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [hospitalName, isRoomExceeded]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 text-teal-700 p-2.5 rounded-xl">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Questions to Ask Hospital & TPA Desk
              </h3>
              <p className="text-xs text-slate-500">
                For {hospitalName} • Non-technical caregiver checklist
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Questions Body */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-xs font-semibold text-slate-500">Generating targeted questions...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Billing Desk */}
            <div>
              <h4 className="text-xs font-bold text-teal-800 mb-2 flex items-center gap-1.5">
                <Building2 size={15} />
                Ask the Hospital Billing & Cashless Counter:
              </h4>
              <div className="flex flex-col gap-2">
                {questions?.billingDeskQuestions?.map((q: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center gap-2 hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-xs text-slate-800 font-medium">
                      • {q}
                    </span>
                    <button
                      onClick={() => handleCopy(q)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                    >
                      {copiedText === q ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Coordinator / TPA */}
            <div>
              <h4 className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1.5">
                <ShieldCheck size={15} />
                Ask the TPA Insurance Coordinator:
              </h4>
              <div className="flex flex-col gap-2">
                {questions?.insuranceCoordinatorQuestions?.map((q: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center gap-2 hover:bg-slate-100/60 transition-colors"
                  >
                    <span className="text-xs text-slate-800 font-medium">
                      • {q}
                    </span>
                    <button
                      onClick={() => handleCopy(q)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                    >
                      {copiedText === q ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
          >
            Close Checklist
          </button>
        </div>

      </div>
    </div>
  );
};
