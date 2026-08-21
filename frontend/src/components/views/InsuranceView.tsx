import React, { useState } from 'react';
import {
  Plus,
  BedDouble,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  IndianRupee,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { ExtractionReviewModal } from '../modals/ExtractionReviewModal';
import { useCareIQ } from '../../context/CareIQContext';

interface InsuranceViewProps {
  policies?: any[];
  activePatient?: any;
  onPolicyAdded?: () => void;
  onOpenChatbot?: () => void;
}

// Insurer Metadata Helper for Rich Branding
const getInsurerMeta = (insurerId: string = '') => {
  const id = insurerId.toLowerCase();
  if (id.includes('star')) {
    return {
      name: 'Star Health and Allied Insurance',
      shortName: 'Star Health',
      theme: 'emerald',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accentColor: 'text-emerald-700',
      logoInitial: '⭐',
      type: 'Standalone Health Insurer'
    };
  } else if (id.includes('hdfc')) {
    return {
      name: 'HDFC ERGO General Insurance',
      shortName: 'HDFC ERGO',
      theme: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      accentColor: 'text-blue-700',
      logoInitial: '🏦',
      type: 'General Insurer'
    };
  } else if (id.includes('niva') || id.includes('bupa') || id.includes('max')) {
    return {
      name: 'Niva Bupa Health Insurance',
      shortName: 'Niva Bupa',
      theme: 'amber',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      accentColor: 'text-amber-700',
      logoInitial: '🛡️',
      type: 'Specialized Health Insurer'
    };
  } else if (id.includes('care')) {
    return {
      name: 'Care Health Insurance',
      shortName: 'Care Health',
      theme: 'teal',
      bgGradient: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
      accentColor: 'text-teal-700',
      logoInitial: '🏥',
      type: 'Standalone Health Insurer'
    };
  } else if (id.includes('niva') || id.includes('bupa') || id.includes('max')) {
    return {
      name: 'Niva Bupa Health Insurance',
      shortName: 'Niva Bupa',
      theme: 'indigo',
      bgGradient: 'from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accentColor: 'text-indigo-700',
      logoInitial: '💙',
      type: 'Standalone Health Insurer'
    };
  } else if (id.includes('pm-jay') || id.includes('ayushman') || id.includes('gov')) {
    return {
      name: 'Ayushman Bharat PM-JAY (Govt. Scheme)',
      shortName: 'PM-JAY Scheme',
      theme: 'emerald',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-600 text-white border-emerald-700',
      accentColor: 'text-emerald-800',
      logoInitial: '🏛️',
      type: 'National Health Scheme (100% Cashless Package)'
    };
  } else {
    return {
      name: 'Health Insurance Provider',
      shortName: 'Insurer',
      theme: 'slate',
      bgGradient: 'from-slate-50 to-slate-100',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      accentColor: 'text-slate-700',
      logoInitial: '📄',
      type: 'Health Insurance Policy'
    };
  }
};

export const InsuranceView: React.FC<InsuranceViewProps> = ({
  policies: propPolicies,
  activePatient: propActivePatient,
  onPolicyAdded: propOnPolicyAdded,
  onOpenChatbot: propOnOpenChatbot
}) => {
  const context = useCareIQ();
  const policies = propPolicies !== undefined ? propPolicies : context.policies;
  const activePatient = propActivePatient !== undefined ? propActivePatient : context.activePatient;
  const onPolicyAdded = propOnPolicyAdded || (() => activePatient && context.loadDataForPatient(activePatient));
  const onOpenChatbot = propOnOpenChatbot || (() => context.setIsChatbotOpen(true));

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(
    policies.length > 0 ? policies[0].id : null
  );
  const [activeTabByPolicy, setActiveTabByPolicy] = useState<{ [key: string]: string }>({});

  // Document Upload & Extraction Review State
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [extractionData, setExtractionData] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedPolicyId, setCopiedPolicyId] = useState<string | null>(null);

  // Form State for Manual Entry
  const [insurerId, setInsurerId] = useState<string>('ins-star-health');
  const [policyName, setPolicyName] = useState<string>('Star Comprehensive Health Insurance');
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [roomEligibility, setRoomEligibility] = useState<string>('PRIVATE_AC');
  const [copay, setCopay] = useState<number>(0);
  const [deductible, setDeductible] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload Document
      const doc = await api.uploadDocument(file, 'POLICY', activePatient?.id);
      setSelectedDoc(doc);

      // 2. Run Deterministic AI Extraction with Citations
      const extractionRes = await api.extractDocument(doc.id);
      setExtractionData(extractionRes);
      setShowReviewModal(true);
    } catch (err: any) {
      setUploadError(err.message || 'Document upload/extraction failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName) return;

    setSubmitting(true);
    try {
      await api.createPolicy({
        patient_id: activePatient?.id,
        insurer_id: insurerId,
        policy_name: policyName,
        policy_type: 'INDIVIDUAL',
        sum_insured: Number(sumInsured),
        remaining_sum_insured: Number(sumInsured),
        room_eligibility: roomEligibility,
        copay_percentage: Number(copay),
        deductible_amount: Number(deductible),
        cashless_supported: true,
        preauthorization_supported: true,
        pre_hospitalization_days: 60,
        post_hospitalization_days: 90
      });
      setShowAddModal(false);
      setPolicyName('');
      onPolicyAdded();
    } catch (err) {
      console.error('Failed to add policy:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPolicyNumber = (policyNumber: string, id: string) => {
    navigator.clipboard.writeText(policyNumber);
    setCopiedPolicyId(id);
    setTimeout(() => setCopiedPolicyId(null), 2000);
  };

  const primaryPolicy = policies[0];
  const totalSumInsured = policies.reduce((acc, p) => acc + (p.sum_insured || 0), 0);
  const totalRemaining = policies.reduce((acc, p) => acc + (p.remaining_sum_insured ?? p.sum_insured ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 🌟 Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Insurance Policies & Coverage Rules
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                {policies.length} Active {policies.length === 1 ? 'Policy' : 'Policies'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Normalized policy constraints & room rent caps for</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {activePatient?.display_name || 'Active Patient'}
              </span>
              {activePatient?.city && (
                <span className="text-slate-400">• {activePatient.city}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Upload Policy PDF Button */}
          <label className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/25 hover:shadow-md hover:shadow-indigo-500/35 transition-all duration-200 cursor-pointer group">
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Extracting Clauses...</span>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-indigo-200 group-hover:scale-110 transition-transform" />
                <span>Upload Policy PDF</span>
                <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                  AI OCR
                </span>
              </>
            )}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Manual Entry Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <Plus size={16} className="text-teal-600" />
            <span>Add Manually</span>
          </button>
        </div>
      </div>

      {/* ⚠️ Upload Error Banner */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-100/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 📊 Top KPI Metric Overview Cards */}
      {policies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Sum Insured */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-teal-600" /> Total Sum Insured
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                100% Available
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              ₹{(totalSumInsured / 100000).toFixed(1)} Lakhs
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Remaining: <strong className="text-emerald-600">₹{(totalRemaining / 100000).toFixed(1)} Lakhs</strong></span>
              <span>1 Policy active</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalRemaining / (totalSumInsured || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Room Entitlement */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-indigo-600" /> Room Entitlement
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Protected
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
              {primaryPolicy?.room_eligibility?.replace(/_/g, ' ') || 'Single Private AC'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              No proportionate deduction on surgeon/OT fees
            </p>
          </div>

          {/* Card 3: Out-of-Pocket Rules */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Co-Pay & Deductible
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                Zero Copay
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700 mt-1">
              {primaryPolicy?.copay_percentage || 0}% Co-Payment
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹{primaryPolicy?.deductible_amount || 0} Deductible • Full Base Bill
            </p>
          </div>

          {/* Card 4: Network & Cashless */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" /> Claim Window
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                Cashless Ready
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {primaryPolicy?.pre_hospitalization_days || 60}d Pre / {primaryPolicy?.post_hospitalization_days || 90}d Post
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Pre-Auth: 48h (Planned) / 24h (Emergency)
            </p>
          </div>
        </div>
      )}

      {/* 📑 Policies List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Active Linked Policies & Detailed Constraints
            </h3>
            <p className="text-xs text-slate-500">
              Verified rules and proportionate deduction limits configured for cost estimation
            </p>
          </div>
        </div>

        {policies.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center shadow-xs">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl w-fit mx-auto mb-3">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No active insurance policy linked</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Upload your policy schedule PDF or add policy details to unlock real-time coverage calculations, room rent caps, and IRDAI non-payable item warnings.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer">
                Upload Policy PDF
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                + Add Manually
              </button>
            </div>
          </div>
        ) : (
          policies.map((p) => {
            const isExpanded = expandedPolicyId === p.id;
            const insurer = getInsurerMeta(p.insurer_id);
            const policyTab = activeTabByPolicy[p.id] || 'rules';

            const remainingPct = Math.round(
              ((p.remaining_sum_insured ?? p.sum_insured) / (p.sum_insured || 1)) * 100
            );

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* 🏷️ Top Header: Insurer Branding, Masked ID & Sum Insured */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-50 to-indigo-50 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      {insurer.logoInitial}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {p.policy_type || 'INDIVIDUAL'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          {p.verification_status || 'VERIFIED REFERENCE'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                          {insurer.type}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {p.policy_name}
                      </h3>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{insurer.name}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">
                          {p.policy_number_masked || 'POL-IND-XXXX-9912'}
                        </span>
                        <button
                          onClick={() => handleCopyPolicyNumber(p.policy_number_masked || 'POL-IND-XXXX-9912', p.id)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                          title="Copy policy number"
                        >
                          {copiedPolicyId === p.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sum Insured Callout */}
                  <div className="bg-linear-to-br from-teal-50/70 to-emerald-50/40 border border-teal-100 rounded-2xl p-3 sm:px-4 text-left md:text-right shrink-0">
                    <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                      Total Sum Insured
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-teal-700 mt-0.5">
                      ₹{(p.sum_insured / 100000).toFixed(1)} Lakhs
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 flex items-center md:justify-end gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Remaining: ₹{((p.remaining_sum_insured ?? p.sum_insured) / 100000).toFixed(1)} Lakhs ({remainingPct}%)
                    </div>
                  </div>
                </div>

                {/* 📐 4-Pillar Limits Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 border border-slate-100 p-4 rounded-2xl mb-4">
                  {/* Room Eligibility */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BedDouble size={14} className="text-indigo-600" />
                      Room Category
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {p.room_eligibility?.replace(/_/g, ' ') || 'Single Private AC'}
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      No Room Cap Penalty
                    </span>
                  </div>

                  {/* Co-Payment */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-teal-600" />
                      Co-Payment
                    </div>
                    <div className={`text-sm font-extrabold ${p.copay_percentage > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {p.copay_percentage || 0}%
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-slate-600">
                      {p.copay_percentage > 0 ? 'Patient pays co-pay' : '100% Insurer Covered'}
                    </span>
                  </div>

                  {/* Deductible */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-blue-600" />
                      Deductible
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{p.deductible_amount || 0}
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-slate-600">
                      {p.deductible_amount > 0 ? `₹${p.deductible_amount} upfront` : 'Nil Deductible'}
                    </span>
                  </div>

                  {/* Pre/Post Hospitalization */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-600" />
                      Pre / Post Window
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {p.pre_hospitalization_days || 60}d / {p.post_hospitalization_days || 90}d
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-slate-600">
                      Pharmacy & Lab bills
                    </span>
                  </div>
                </div>

                {/* ⚡ Bottom Bar & Accordion Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={13} /> Cashless: {p.cashless_supported ? 'Empaneled' : 'Reimbursement'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={13} /> Pre-Auth: {p.preauthorization_supported ? 'Supported' : 'None'}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedPolicyId(isExpanded ? null : p.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? 'Hide Policy Rules & Exclusions' : 'Inspect Rules, Exclusions & TPA Guidelines'}
                  </button>
                </div>

                {/* 📖 Expanded Interactive Policy Drawer */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in duration-200">
                    {/* Navigation Tabs within Card */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto">
                      <button
                        onClick={() => setActiveTabByPolicy({ ...activeTabByPolicy, [p.id]: 'rules' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          policyTab === 'rules'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Enforced Policy Rules
                      </button>
                      <button
                        onClick={() => setActiveTabByPolicy({ ...activeTabByPolicy, [p.id]: 'exclusions' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          policyTab === 'exclusions'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        IRDAI List-1 Consumables
                      </button>
                      <button
                        onClick={() => setActiveTabByPolicy({ ...activeTabByPolicy, [p.id]: 'waiting' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          policyTab === 'waiting'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Waiting Periods & PED
                      </button>
                      <button
                        onClick={() => setActiveTabByPolicy({ ...activeTabByPolicy, [p.id]: 'tpa' })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          policyTab === 'tpa'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Pre-Auth & TPA Desk
                      </button>
                    </div>

                    {/* Tab 1: Enforced Rules Engine */}
                    {policyTab === 'rules' && (
                      <div className="space-y-3">
                        <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                              <BedDouble className="w-4 h-4 text-teal-700" />
                              Room Rent Proportionate Deduction Rule (ROOM_CAP_{p.room_eligibility})
                            </span>
                            <span className="text-[10px] bg-teal-200/70 text-teal-900 font-bold px-2 py-0.5 rounded-md font-mono">
                              RULE_ROOM_PROP_01
                            </span>
                          </div>
                          <p className="text-xs text-teal-900 leading-relaxed">
                            Eligible for <strong>{p.room_eligibility?.replace(/_/g, ' ') || 'Single Private AC'}</strong>. If a higher room tier (e.g. Deluxe, Suite) is selected, proportionate deduction applies to doctor consultation fees, OT charges, surgeon fees, and anesthesia.
                          </p>
                          <div className="mt-2 text-[11px] bg-white/70 p-2.5 rounded-xl border border-teal-200 text-teal-950 font-mono">
                            Proportionate Formula: Deductible Ratio = (Eligible Room Tariff / Chosen Room Tariff) × Associated Charges
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-indigo-700" />
                              ICU & Critical Care Room Eligibility
                            </span>
                            <span className="text-[10px] bg-indigo-200/70 text-indigo-900 font-bold px-2 py-0.5 rounded-md font-mono">
                              RULE_ICU_UNLIMITED
                            </span>
                          </div>
                          <p className="text-xs text-indigo-900 leading-relaxed">
                            Intensive Care Unit (ICU / ICCU / HDU) charges are covered with <strong>No Sub-limit</strong> up to the full Sum Insured of ₹{(p.sum_insured / 100000).toFixed(1)} Lakhs.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: IRDAI List 1 Consumables */}
                    {policyTab === 'exclusions' && (
                      <div className="space-y-3">
                        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-700" />
                              Standard IRDAI List I Exclusions (Non-Payable Consumables)
                            </span>
                            <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-md font-mono">
                              IRDAI_LIST_1
                            </span>
                          </div>
                          <p className="text-xs text-amber-900 leading-relaxed">
                            Unless an explicit Consumables Care rider is attached, the following items are non-reimbursable and must be paid out-of-pocket:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                              <div className="font-bold text-amber-900">Surgical & Nursing Consumables</div>
                              <p className="text-[11px] text-slate-600">• PPE Kits, surgical gloves, shoe covers, face masks</p>
                              <p className="text-[11px] text-slate-600">• Cotton, gauze, syringes, IV cannulas, spirit</p>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                              <div className="font-bold text-amber-900">Hospital Administrative Charges</div>
                              <p className="text-[11px] text-slate-600">• Admission documentation & medical record file charges</p>
                              <p className="text-[11px] text-slate-600">• Hand sanitizers, tissue rolls, attendant meal trays</p>
                            </div>
                          </div>
                          <div className="text-[11px] text-amber-800 font-medium pt-1">
                            💡 <em>Typical out-of-pocket exposure for consumables is estimated at ₹4,000 – ₹12,000 for standard 3-day inpatient stays.</em>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Waiting Periods & PED */}
                    {policyTab === 'waiting' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Initial Waiting</span>
                            <div className="text-sm font-extrabold text-slate-900">30 Days</div>
                            <p className="text-[11px] text-slate-500">Except accidental emergency admissions</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Specific Ailments</span>
                            <div className="text-sm font-extrabold text-slate-900">24 Months</div>
                            <p className="text-[11px] text-slate-500">Cataract, hernia, joint replacements, stones</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Pre-Existing Diseases</span>
                            <div className="text-sm font-extrabold text-emerald-700">Covered (36m passed)</div>
                            <p className="text-[11px] text-slate-500">Hypertension, Type-2 Diabetes fully covered</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Pre-Auth & TPA Desk */}
                    {policyTab === 'tpa' && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                              Cashless Pre-Authorization Protocol
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Instant TPA Integration
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                              <div className="font-bold text-slate-800">Planned Admissions</div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Submit pre-auth request form 48–72 hours prior to scheduled admission with doctor consultation notes and estimated cost breakdown.
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                              <div className="font-bold text-slate-800">Emergency Admissions</div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Hospital insurance desk intimation required within 24 hours of emergency admission for initial cashless approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 🤖 Interactive Policy Clause Chatbot Launcher */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-700 text-white rounded-xl shadow-xs shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white">
                CareIQ Policy Intelligence Copilot
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Grounded Vector RAG
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ask questions about coverage, room rent sublimits, proportionate deductions, and IRDAI non-payables.
            </p>
          </div>
        </div>

        {onOpenChatbot && (
          <button
            type="button"
            onClick={onOpenChatbot}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            Ask Policy Copilot →
          </button>
        )}
      </div>

      {/* 📝 Manual Add / Ingest Policy Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Add / Configure Insurance Policy
                  </h3>
                  <p className="text-xs text-slate-500">
                    Link policy constraints to calculate out-of-pocket costs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Insurance Provider
                </label>
                <select
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-semibold"
                  value={insurerId}
                  onChange={(e) => {
                    setInsurerId(e.target.value);
                    if (e.target.value === 'ins-star-health') setPolicyName('Star Comprehensive Health Insurance');
                    if (e.target.value === 'ins-hdfc-ergo') setPolicyName('HDFC ERGO Optima Restore');
                    if (e.target.value === 'ins-niva-bupa') setPolicyName('Niva Bupa ReAssure 2.0');
                    if (e.target.value === 'ins-care-health') setPolicyName('Care Supreme Health Plan');
                    if (e.target.value === 'sch-pmjay') setPolicyName('Ayushman Bharat PM-JAY Card');
                  }}
                >
                  <option value="ins-star-health">Star Health and Allied Insurance</option>
                  <option value="ins-hdfc-ergo">HDFC ERGO General Insurance</option>
                  <option value="ins-niva-bupa">Niva Bupa Health Insurance</option>
                  <option value="ins-care-health">Care Health Insurance</option>
                  <option value="ins-icici-lombard">ICICI Lombard General Insurance</option>
                  <option value="ins-new-india">New India Assurance Co. Ltd.</option>
                  <option value="sch-pmjay">Ayushman Bharat PM-JAY (Govt Scheme)</option>
                  <option value="sch-arogya-karnataka">Arogya Karnataka (State Scheme)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy Plan Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-medium"
                  placeholder="e.g. Star Health Comprehensive / Optima Restore"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  required
                />
              </div>

              {/* Sum Insured with Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Sum Insured (₹)
                  </label>
                  <div className="flex gap-1">
                    {[300000, 500000, 1000000, 2500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSumInsured(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                          sumInsured === preset
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ₹{preset / 100000}L
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                  value={sumInsured}
                  onChange={(e) => setSumInsured(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Entitlement
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-medium"
                    value={roomEligibility}
                    onChange={(e) => setRoomEligibility(e.target.value)}
                  >
                    <option value="GENERAL">General Ward</option>
                    <option value="SEMI_PRIVATE">Semi-Private / Twin</option>
                    <option value="PRIVATE_AC">Single Private AC</option>
                    <option value="DELUXE">Deluxe Room</option>
                    <option value="ANY_ROOM">Any Room (No Cap)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Co-Payment (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-medium"
                    value={copay}
                    onChange={(e) => setCopay(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deductible Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white transition-all font-medium"
                  value={deductible}
                  onChange={(e) => setDeductible(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Save & Normalize Policy
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 AI Extraction Human Verification Modal */}
      <ExtractionReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        document={selectedDoc}
        extractionData={extractionData}
        onExtractionConfirmed={() => {
          onPolicyAdded();
          setShowReviewModal(false);
        }}
      />

    </div>
  );
};
