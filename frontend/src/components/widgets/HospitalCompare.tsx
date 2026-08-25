import React from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  MapPin,
  Check
} from 'lucide-react';

interface HospitalCompareProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalA: any;
  hospitalB: any;
  policy: any;
  onSelectHospital: (hospitalId: string) => void;
}

export const HospitalCompare: React.FC<HospitalCompareProps> = ({
  isOpen,
  onClose,
  hospitalA,
  hospitalB,
  policy,
  onSelectHospital
}) => {
  if (!isOpen || !hospitalA || !hospitalB) return null;

  const hospA = hospitalA.hospital || hospitalA;
  const hospB = hospitalB.hospital || hospitalB;

  const scoreA = hospitalA.matchScore ?? 95;
  const scoreB = hospitalB.matchScore ?? 80;

  const isCashlessA = hospitalA.cashlessSupported ?? hospA.cashless_available ?? true;
  const isCashlessB = hospitalB.cashlessSupported ?? hospB.cashless_available ?? false;

  const roomMatchA = hospitalA.roomCategoryMatch ?? true;
  const roomMatchB = hospitalB.roomCategoryMatch ?? false;

  const oopA = hospitalA.costEstimate?.indicativePatientExposure ?? 11000;
  const oopB = hospitalB.costEstimate?.indicativePatientExposure ?? 26500;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-5 bg-linear-to-r from-slate-900 via-indigo-950 to-teal-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl backdrop-blur-xs shrink-0">
              <Building2 size={20} className="text-teal-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight truncate">Side-by-Side Hospital Comparison</h3>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full shrink-0">
                  Policy Fit Matrix
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 truncate">
                Evaluating against <strong className="text-white">{policy?.policy_name || 'Active Policy'}</strong> ({policy?.room_eligibility || 'Private AC'} Entitlement)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close comparison"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          
          {/* Top Score Comparison Banner — Stacked on Mobile, 2-Col on Tablet/Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Hospital A Header Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 border-2 border-teal-300 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-600 text-white shrink-0">
                    Option A
                  </span>
                  <div className="flex items-center gap-1 font-black text-sm sm:text-base text-teal-700 shrink-0">
                    <Sparkles size={14} className="shrink-0" />
                    <span>{scoreA}/100 Fit</span>
                  </div>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{hospA.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{hospA.city}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectHospital(hospA.id);
                  onClose();
                }}
                className="mt-3.5 w-full py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Select & Start Trajectory
              </button>
            </div>

            {/* Hospital B Header Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-300 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                    Option B
                  </span>
                  <div className="flex items-center gap-1 font-black text-sm sm:text-base text-indigo-700 shrink-0">
                    <Sparkles size={14} className="shrink-0" />
                    <span>{scoreB}/100 Fit</span>
                  </div>
                </div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{hospB.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{hospB.city}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectHospital(hospB.id);
                  onClose();
                }}
                className="mt-3.5 w-full py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Select & Start Trajectory
              </button>
            </div>

          </div>

          {/* 📱 MOBILE VIEW: Compact Metric Breakdown Cards (Visible on screens < sm) */}
          <div className="block sm:hidden space-y-2.5 text-xs">
            
            {/* Metric 1: Network & Cashless */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Network & Cashless Status
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] font-bold text-teal-800 block truncate mb-1">Option A</span>
                  {isCashlessA ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <Check size={12} /> Cashless Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                      <AlertTriangle size={12} /> Reimbursement
                    </span>
                  )}
                </div>
                <div className="bg-white p-2 rounded-xl border border-indigo-200/80">
                  <span className="text-[10px] font-bold text-indigo-800 block truncate mb-1">Option B</span>
                  {isCashlessB ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <Check size={12} /> Cashless Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800">
                      <AlertTriangle size={12} /> Reimbursement
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metric 2: Room Category Alignment */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Room Category Alignment
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] font-bold text-teal-800 block truncate mb-1">Option A</span>
                  {roomMatchA ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 leading-tight">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>Single Private AC (No Penalty)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 leading-tight">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Room Penalty Applies</span>
                    </span>
                  )}
                </div>
                <div className="bg-white p-2 rounded-xl border border-indigo-200/80">
                  <span className="text-[10px] font-bold text-indigo-800 block truncate mb-1">Option B</span>
                  {roomMatchB ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 leading-tight">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>Single Private AC (No Penalty)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 leading-tight">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Room Penalty Applies</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metric 3: Estimated Patient Out-of-Pocket */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Estimated Patient Out-of-Pocket
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] font-bold text-teal-800 block truncate mb-0.5">Option A</span>
                  <div className="text-sm font-black text-slate-900">₹{oopA.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400">Consumables & PPE</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-indigo-200/80">
                  <span className="text-[10px] font-bold text-indigo-800 block truncate mb-0.5">Option B</span>
                  <div className="text-sm font-black text-slate-900">₹{oopB.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400">Consumables + Room Gap</span>
                </div>
              </div>
            </div>

            {/* Metric 4: ICU & Critical Care */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Critical Care & 24x7 ICU
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded-xl border border-teal-200/80 text-[11px] text-slate-700 font-semibold">
                  <span className="text-[10px] font-bold text-teal-800 block truncate mb-0.5">Option A</span>
                  ✓ 24x7 Emergency, ICU & Blood Bank
                </div>
                <div className="bg-white p-2 rounded-xl border border-indigo-200/80 text-[11px] text-slate-700 font-semibold">
                  <span className="text-[10px] font-bold text-indigo-800 block truncate mb-0.5">Option B</span>
                  ✓ 24x7 ICU & Emergency Care
                </div>
              </div>
            </div>

            {/* Metric 5: CareIQ Matching Drivers */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                CareIQ Matching Drivers
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-teal-200/80">
                  <span className="text-[10px] font-extrabold text-teal-800 block truncate mb-1">Option A ({hospA.name})</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {hospitalA.reasons?.slice(0, 3).map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{r.replace(/^✓\s*/, '')}</span>
                      </li>
                    )) || <li>✓ High policy compatibility score</li>}
                  </ul>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-200/80">
                  <span className="text-[10px] font-extrabold text-indigo-800 block truncate mb-1">Option B ({hospB.name})</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {hospitalB.reasons?.slice(0, 3).map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{r.replace(/^✓\s*/, '')}</span>
                      </li>
                    )) || <li>✓ Multi-specialty clinical facility</li>}
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* 💻 DESKTOP/TABLET VIEW: Side-by-Side Comparison Table (Visible on screens >= sm) */}
          <div className="hidden sm:block border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                  <th scope="col" className="py-3 px-4 w-1/3">Evaluation Metric</th>
                  <th scope="col" className="py-3 px-4 w-1/3 border-l border-slate-200 text-teal-800">{hospA.name}</th>
                  <th scope="col" className="py-3 px-4 w-1/3 border-l border-slate-200 text-indigo-800">{hospB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* Row 1: Network & Cashless */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-700">Network & Cashless Status</td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    {isCashlessA ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check size={13} /> In-Network Cashless
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle size={13} /> Reimbursement Claim
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    {isCashlessB ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check size={13} /> In-Network Cashless
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle size={13} /> Reimbursement Claim
                      </span>
                    )}
                  </td>
                </tr>

                {/* Row 2: Room Category Alignment */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-700">Room Category Alignment</td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    {roomMatchA ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 size={15} /> Single Private AC Available (No penalty)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                        <AlertTriangle size={15} /> Proportionate Deduction Applies
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    {roomMatchB ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 size={15} /> Single Private AC Available (No penalty)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                        <AlertTriangle size={15} /> Proportionate Deduction Applies
                      </span>
                    )}
                  </td>
                </tr>

                {/* Row 3: Estimated Patient Out-of-Pocket */}
                <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                  <td className="py-3 px-4 font-bold text-slate-700">Estimated Out-of-Pocket (OOP)</td>
                  <td className="py-3 px-4 border-l border-slate-100 font-black text-sm text-slate-900">
                    ₹{oopA.toLocaleString('en-IN')}
                    <span className="text-[11px] text-slate-400 font-normal block">Consumables & PPE</span>
                  </td>
                  <td className="py-3 px-4 border-l border-slate-100 font-black text-sm text-slate-900">
                    ₹{oopB.toLocaleString('en-IN')}
                    <span className="text-[11px] text-slate-400 font-normal block">Consumables + Room Gap</span>
                  </td>
                </tr>

                {/* Row 4: ICU & Critical Care Readiness */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-700">Critical Care & 24x7 ICU</td>
                  <td className="py-3 px-4 border-l border-slate-100 font-semibold text-slate-800">
                    ✓ 24x7 Emergency, ICU & Blood Bank
                  </td>
                  <td className="py-3 px-4 border-l border-slate-100 font-semibold text-slate-800">
                    ✓ 24x7 ICU & Emergency
                  </td>
                </tr>

                {/* Row 5: Positive Driver Highlights */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-700">CareIQ Matching Drivers</td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    <ul className="space-y-1 text-slate-600">
                      {hospitalA.reasons?.slice(0, 3).map((r: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-teal-600 font-bold">•</span> {r.replace(/^✓\s*/, '')}
                        </li>
                      )) || <li>✓ High policy compatibility score</li>}
                    </ul>
                  </td>
                  <td className="py-3 px-4 border-l border-slate-100">
                    <ul className="space-y-1 text-slate-600">
                      {hospitalB.reasons?.slice(0, 3).map((r: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-600 font-bold">•</span> {r.replace(/^✓\s*/, '')}
                        </li>
                      )) || <li>✓ Multi-specialty clinical facility</li>}
                    </ul>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <span className="text-[11px] sm:text-xs text-center sm:text-left">Non-clinical decision support. Estimates are indicative.</span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer text-center"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
