import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  HelpCircle,
  Check,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  FileText,
  Share2,
  Printer,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useCareIQ } from '../../context/CareIQContext';

interface VerificationCenterProps {
  verificationItems?: any[];
  onItemResolved?: () => void;
}

export const PRE_ADMISSION_QUESTIONS = [
  {
    num: 1,
    title: 'Initial TPA Pre-Auth Sanction',
    desk: 'Hospital TPA Cashless Desk',
    question: 'Has the initial cashless pre-authorization sanction letter been issued by our insurer/TPA, and what is the sanctioned initial amount?',
    reason: 'Signing admission before cashless pre-auth is approved risks turning the entire hospital stay into an upfront out-of-pocket reimbursement case.'
  },
  {
    num: 2,
    title: 'Room Rent & Proportionate Deduction Rule',
    desk: 'Admission & Bed Allocation Desk',
    question: 'Does the assigned room stay strictly within my policy room eligibility (e.g., Single Private AC) with ZERO proportionate deduction on doctor and OT fees?',
    reason: 'Upgrading even by ₹2,000/day triggers a 30-50% proportionate deduction penalty across surgeon, OT, and nursing charges.'
  },
  {
    num: 3,
    title: 'Written Non-Payable Consumables Estimate',
    desk: 'Inpatient Billing Desk',
    question: 'What is the hospital’s written estimate for non-payable consumables (IRDAI Schedule 1 items like gloves, surgical packs, and hygiene kits)?',
    reason: 'Non-medical consumables are excluded by default. Knowing this in advance prevents unexpected cash demands at discharge.'
  },
  {
    num: 4,
    title: 'Tariff Package & Surgeon Surcharge Check',
    desk: 'Billing & Insurance Coordinator',
    question: 'Are surgeon visits, anesthesia fees, and OT charges billed strictly as per the agreed insurer network tariff package without extra surcharges?',
    reason: 'Prevents excess doctor charges above agreed TPA rates from being passed on to the patient.'
  },
  {
    num: 5,
    title: 'Modern Treatments & Robotic Surgery Sub-Limits',
    desk: 'Surgical Billing Coordinator',
    question: 'Are any robotic surgery, advanced implants, or modern treatment components subject to policy sub-limits, and has prior approval been confirmed?',
    reason: 'Robotic knee replacements and advanced technologies often carry specific sub-limits (e.g., ₹1,50,000) under standard policy clauses.'
  }
];

export const VerificationCenter: React.FC<VerificationCenterProps> = ({
  verificationItems: propVerificationItems,
  onItemResolved: propOnItemResolved
}) => {
  const context = useCareIQ();
  const verificationItems = propVerificationItems !== undefined ? propVerificationItems : context.verificationItems;
  const onItemResolved = propOnItemResolved || context.refreshVerificationItems;

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItemForGuidance, setSelectedItemForGuidance] = useState<any | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showPreAdmissionModal, setShowPreAdmissionModal] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Filter items based on status, category, and search query
  const filteredItems = verificationItems.filter((item) => {
    if (statusFilter === 'PENDING' && item.status !== 'PENDING') return false;
    if (statusFilter === 'RESOLVED' && item.status !== 'RESOLVED' && item.status !== 'VERIFIED') return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchQuestion = item.question?.toLowerCase().includes(q);
      if (!matchTitle && !matchReason && !matchQuestion) return false;
    }

    return true;
  });

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api.resolveVerificationItem(id);
      await onItemResolved();
    } catch (err) {
      console.error('Failed to resolve item:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleCopyQuestion = (id: string, question: string) => {
    navigator.clipboard.writeText(question);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAllQuestions = () => {
    const text = PRE_ADMISSION_QUESTIONS.map(
      (q) => `Q${q.num}. [${q.title} - ${q.desk}]\n"${q.question}"\nReason: ${q.reason}\n`
    ).join('\n');
    navigator.clipboard.writeText(`🏥 CareIQ — 5 Questions to Ask Before Signing Admission Form:\n\n${text}\nGenerated via CareIQ Decision Support.`);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = PRE_ADMISSION_QUESTIONS.map(
      (q) => `*${q.num}. ${q.title}* (${q.desk})\n_"${q.question}"_\n💡 _Why:_ ${q.reason}\n`
    ).join('\n');
    const fullMessage = encodeURIComponent(`🏥 *CareIQ — Pre-Admission Hospital Checklist*\n_5 Critical Questions Before Signing Admission Form:_\n\n${text}\n_Shared from CareIQ Patient Intelligence_`);
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
  };

  const pendingCount = verificationItems.filter((v) => v.status === 'PENDING').length;
  const resolvedCount = verificationItems.filter((v) => v.status === 'RESOLVED' || v.status === 'VERIFIED').length;

  return (
    <div className="flex flex-col gap-6 max-w-360 mx-auto pb-20 sm:pb-8">
      
      {/* 1. Header & Summary Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck size={12} />
              <span>Verify Before You Rely</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Active Hospital & TPA Guardrail Checklist
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Actionable Verification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Never assume cashless approval or full reimbursement. Confirm these critical checkpoint items directly with hospital admission and TPA insurance desks to prevent surprise deductions.
          </p>
        </div>

        {/* Counter Badges & Pre-Admission Modal Trigger */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreAdmissionModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <FileText size={15} />
            <span>📋 Pre-Admission Checklist</span>
          </button>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-center min-w-20">
            <div className="text-xl font-extrabold text-slate-900">{verificationItems.length}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Items</div>
          </div>
          <div className={`border rounded-2xl px-3.5 py-2 text-center min-w-20 ${
            pendingCount > 0 ? 'bg-rose-50/70 border-rose-200 text-rose-700' : 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
          }`}>
            <div className="text-xl font-extrabold">{pendingCount}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider">Pending Checks</div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar (Status Pills, Category Filter & Search Input) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({verificationItems.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                statusFilter === 'PENDING' ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'RESOLVED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="PREAUTH">Pre-Authorization (PREAUTH)</option>
              <option value="ROOM">Room Eligibility (ROOM)</option>
              <option value="COST">Consumables & Tariffs (COST)</option>
              <option value="DOCUMENT">Discharge & Bills (DOCUMENT)</option>
              <option value="NETWORK">Network Empanelment (NETWORK)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search verification items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Verification Items List */}
      <div className="flex flex-col gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {statusFilter === 'PENDING' && pendingCount === 0
                ? 'All Checkpoints Verified!'
                : 'No Verification Items Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {statusFilter === 'PENDING' && pendingCount === 0
                ? 'All pre-authorization, room rent limits, and non-payable consumable checks have been confirmed with the hospital.'
                : 'No items match your current filter selection. Try changing the category or search keyword.'}
            </p>
            {statusFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isResolved = item.status === 'RESOLVED' || item.status === 'VERIFIED';
            const isHigh = item.priority === 'HIGH';
            const isMedium = item.priority === 'MEDIUM';

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                  isResolved
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : isHigh
                    ? 'border-rose-200 bg-white ring-1 ring-rose-500/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isHigh
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isMedium
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.priority || 'NORMAL'} PRIORITY
                    </span>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>

                    <h2 className={`text-sm sm:text-base font-extrabold ${isResolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {item.title}
                    </h2>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    isResolved
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isResolved ? (
                      <>
                        <Check size={11} className="text-emerald-700" />
                        <span>VERIFIED</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>ACTION REQUIRED</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question to Ask Desk Callout */}
                {item.question && (
                  <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl my-2.5">
                    <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                      <HelpCircle size={13} />
                      <span>Verbatim question to ask hospital TPA / billing counter:</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      "{item.question}"
                    </p>
                  </div>
                )}

                {/* Why It Matters / Rationale */}
                <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
                  <strong className="text-slate-700">Clinical & Insurance Rationale:</strong> {item.reason}
                </p>

                {/* Actions Strip */}
                <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Target: {item.category === 'ROOM' ? 'Admission Desk' : item.category === 'PREAUTH' ? 'TPA Cashless Counter' : 'Billing & OT Desk'}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForGuidance(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    >
                      <HelpCircle size={13} />
                      <span>Verify Guidance</span>
                    </button>

                    {item.question && (
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(item.id, item.question)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedId === item.id ? 'Copied!' : 'Copy Question'}</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleResolve(item.id)}
                        disabled={resolvingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {resolvingId === item.id ? (
                          <Sparkles size={13} className="animate-spin text-white" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        <span>Mark as Verified</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verification Guidance Modal */}
      {selectedItemForGuidance && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Hospital Desk Guidance</h3>
                  <span className="text-[11px] font-bold text-blue-600">CareIQ Decision Support</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForGuidance(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">Checkpoint Subject</span>
                <p className="font-bold text-slate-900">{selectedItemForGuidance.title}</p>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-950">
                <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider block mb-0.5">Why Verification is Critical</span>
                <p className="leading-relaxed">{selectedItemForGuidance.reason}</p>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-800 uppercase text-[10px] tracking-wider block mb-0.5">Recommended Verbatim Script</span>
                <p className="text-slate-900 font-semibold mb-2 leading-relaxed">"{selectedItemForGuidance.question}"</p>
                <div className="text-[11px] text-blue-700 font-bold">
                  Recommended Counter: Hospital TPA Cashless Helpdesk / Inpatient Billing
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyQuestion(selectedItemForGuidance.id, selectedItemForGuidance.question)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                {copiedId === selectedItemForGuidance.id ? 'Copied!' : 'Copy Script'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResolve(selectedItemForGuidance.id);
                  setSelectedItemForGuidance(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                Mark Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Admission "Red Flag" Checklist Modal */}
      {showPreAdmissionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    5 Questions Before Signing the Admission Form
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Essential patient decision-support checklist to prevent surprise discharge deductions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreAdmissionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Questions Scrollable List */}
            <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-3.5 text-xs">
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 text-blue-950 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Golden Rule for Hospital Admission:</strong> Never sign the financial undertaking or consent form until you have asked these 5 questions at the TPA and billing desks.
                </p>
              </div>

              {PRE_ADMISSION_QUESTIONS.map((q) => (
                <div
                  key={q.num}
                  className="bg-slate-50 hover:bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Question {q.num} • {q.desk}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {q.title}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-relaxed mb-2">
                    "{q.question}"
                  </p>

                  <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-white/90 p-2.5 rounded-xl border border-slate-200">
                    <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Why ask this:</strong> {q.reason}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500">
                CareIQ Patient Decision-Support • Powered by AI Policy Engine
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAllQuestions}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedAll ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedAll ? 'Copied Full Checklist!' : 'Copy 5 Questions'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Checklist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
