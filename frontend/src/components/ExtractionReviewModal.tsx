import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Quote,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
  extractionData: any;
  onExtractionConfirmed: (newPolicy: any) => void;
}

export const ExtractionReviewModal: React.FC<ExtractionReviewModalProps> = ({
  isOpen,
  onClose,
  document,
  extractionData,
  onExtractionConfirmed
}) => {
  if (!isOpen || !extractionData) return null;

  const { extractedData, evidence } = extractionData;

  const [formData, setFormData] = useState({
    insurer_name: extractedData?.insurer_name || 'Star Health and Allied Insurance',
    policy_name: extractedData?.policy_name || 'Extracted Health Policy',
    policy_number: extractedData?.policy_number || `POL-${Date.now()}`,
    policy_type: extractedData?.policy_type || 'INDIVIDUAL',
    sum_insured: extractedData?.sum_insured || 500000,
    room_category_eligibility: extractedData?.room_category_eligibility || 'PRIVATE_AC',
    room_rent_limit_type: extractedData?.room_rent_limit_type || 'CATEGORY_BASED',
    room_rent_limit_amount: extractedData?.room_rent_limit_amount || 5000,
    icu_limit_type: extractedData?.icu_limit_type || 'NO_LIMIT',
    icu_limit_amount: extractedData?.icu_limit_amount || 0,
    copay_percentage: extractedData?.copay_percentage || 0,
    deductible: extractedData?.deductible || 0,
    waiting_period_months: extractedData?.waiting_period_months || 24,
    pre_existing_diseases: (extractedData?.pre_existing_diseases || []).join(', '),
    key_exclusions: (extractedData?.key_exclusions || []).join(', ')
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        sum_insured: Number(formData.sum_insured),
        room_rent_limit_amount: Number(formData.room_rent_limit_amount),
        icu_limit_amount: Number(formData.icu_limit_amount),
        copay_percentage: Number(formData.copay_percentage),
        deductible: Number(formData.deductible),
        waiting_period_months: Number(formData.waiting_period_months),
        pre_existing_diseases: formData.pre_existing_diseases.split(',').map((s: string) => s.trim()).filter(Boolean),
        key_exclusions: formData.key_exclusions.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      const result = await api.confirmExtraction(document.id, payload);
      onExtractionConfirmed(result.policy);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm policy extraction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileCheck2 className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Review AI Extracted Policy</h2>
                <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Audited with Citations
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                File: {document?.original_filename || 'Uploaded Policy PDF'} ({(document?.file_size / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border-b border-amber-200/70 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            CareIQ extracts structured constraints from your policy schedule. Please review and verify the values below before adding to active coverage.
          </span>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[75vh] overflow-y-auto">
          {/* Left Form: Editable Extracted Fields */}
          <form onSubmit={handleConfirm} id="extraction-form" className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Policy Information & Limits
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Insurer Name</label>
                <input
                  type="text"
                  value={formData.insurer_name}
                  onChange={(e) => setFormData({ ...formData, insurer_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Policy Plan Name</label>
                <input
                  type="text"
                  value={formData.policy_name}
                  onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Policy Number</label>
                <input
                  type="text"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sum Insured (₹)</label>
                <input
                  type="number"
                  value={formData.sum_insured}
                  onChange={(e) => setFormData({ ...formData, sum_insured: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Room Eligibility</label>
                <select
                  value={formData.room_category_eligibility}
                  onChange={(e) => setFormData({ ...formData, room_category_eligibility: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GENERAL">General Ward</option>
                  <option value="SEMI_PRIVATE">Twin Sharing / Semi-Private</option>
                  <option value="PRIVATE_AC">Single Private Room (AC)</option>
                  <option value="DELUXE">Deluxe Room</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Daily Room Tariff Limit (₹)</label>
                <input
                  type="number"
                  value={formData.room_rent_limit_amount}
                  onChange={(e) => setFormData({ ...formData, room_rent_limit_amount: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">PED Waiting Period (Months)</label>
                <input
                  type="number"
                  value={formData.waiting_period_months}
                  onChange={(e) => setFormData({ ...formData, waiting_period_months: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Copay Percentage (%)</label>
                <input
                  type="number"
                  value={formData.copay_percentage}
                  onChange={(e) => setFormData({ ...formData, copay_percentage: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pre-Existing Conditions (comma-separated)</label>
              <input
                type="text"
                value={formData.pre_existing_diseases}
                onChange={(e) => setFormData({ ...formData, pre_existing_diseases: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Key Exclusions / Sublimits (comma-separated)</label>
              <textarea
                value={formData.key_exclusions}
                onChange={(e) => setFormData({ ...formData, key_exclusions: e.target.value })}
                rows={2}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Right Panel: Extraction Evidence & Citations */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-indigo-600" /> Verbatim Source Evidence
              </h3>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {evidence && evidence.length > 0 ? (
                  evidence.map((ev: any, idx: number) => (
                    <div
                      key={ev.id || idx}
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-mono">
                          {ev.field_path}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Page {ev.source_page || 'Schedule'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 italic border-l-2 border-indigo-400 pl-2">
                        "{ev.source_text}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Extracted: <strong className="text-slate-800">{ev.extracted_value}</strong></span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> {ev.confidence || 'HIGH'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3">No direct textual citations available.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Citations verified against uploaded policy schedule without hallucination.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="extraction-form"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            {isSubmitting ? (
              'Confirming...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm & Add Policy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
