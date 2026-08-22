import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WhatIfSimulator } from '../widgets/WhatIfSimulator';
import {
  Calculator,
  ArrowLeftRight,
  ShieldCheck,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCareIQ } from '../../context/CareIQContext';

interface CostBreakdownViewProps {
  policy?: any;
  hospitals?: any[];
}

export const CostBreakdownView: React.FC<CostBreakdownViewProps> = ({
  policy: propPolicy,
  hospitals: propHospitals
}) => {
  const navigate = useNavigate();
  const context = useCareIQ();
  const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
  const hospitals = propHospitals !== undefined ? propHospitals : context.hospitals;

  // Determine initial dynamic hospital based on active patient / journey
  const defaultHospitalId =
    context.journey?.hospital_id ||
    context.activePatient?.hospital_id ||
    (context.activePatient?.city === 'Mumbai' ? 'hosp-kem-mumbai' : hospitals[0]?.id) ||
    'hosp-manipal-old-airport';

  // Determine initial procedure based on active patient diagnosis
  const defaultProcedureId =
    context.activePatient?.diagnosis?.toLowerCase().includes('cataract')
      ? 'proc-cataract'
      : context.activePatient?.diagnosis?.toLowerCase().includes('angio') || context.activePatient?.diagnosis?.toLowerCase().includes('cardiac')
      ? 'proc-angioplasty'
      : context.activePatient?.diagnosis?.toLowerCase().includes('append') || context.activePatient?.diagnosis?.toLowerCase().includes('laparoscop')
      ? 'proc-appendectomy'
      : 'proc-knee-replacement';

  const [hospitalId, setHospitalId] = useState<string>(defaultHospitalId);
  const [procedureId, setProcedureId] = useState<string>(defaultProcedureId);
  const [roomCategory, setRoomCategory] = useState<string>(policy?.room_eligibility || 'PRIVATE_AC');
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeViewMode, setActiveViewMode] = useState<'breakdown' | 'whatif'>('breakdown');

  // Reactively sync when active patient or policy changes
  useEffect(() => {
    if (context.journey?.hospital_id) {
      setHospitalId(context.journey.hospital_id);
    } else if (context.activePatient?.city === 'Mumbai') {
      setHospitalId('hosp-kem-mumbai');
    }

    if (context.activePatient?.diagnosis) {
      const diag = context.activePatient.diagnosis.toLowerCase();
      if (diag.includes('cataract')) setProcedureId('proc-cataract');
      else if (diag.includes('angio') || diag.includes('cardiac')) setProcedureId('proc-angioplasty');
      else if (diag.includes('append') || diag.includes('laparoscop')) setProcedureId('proc-appendectomy');
    }

    if (policy?.room_eligibility) {
      setRoomCategory(policy.room_eligibility);
    }
  }, [context.activePatient?.id, policy?.id]);

  const fetchEstimate = async () => {
    if (!policy) return;
    setLoading(true);
    try {
      const data = await api.calculateCostEstimate({
        policy_id: policy.id,
        hospital_id: hospitalId,
        procedure_id: procedureId,
        preferred_room_category: roomCategory
      });
      setEstimate(data);
    } catch (err) {
      console.error('Failed to calculate estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [hospitalId, procedureId, roomCategory, policy?.id]);

  // Selected hospital metadata
  const selectedHospital = hospitals.find((h) => h.id === hospitalId) || hospitals[0];

  // Government Scheme detection (e.g. Ayushman Bharat PM-JAY)
  const isGovScheme =
    policy?.scheme_type === 'GOV_PMJAY' ||
    policy?.policy_name?.toLowerCase().includes('pm-jay') ||
    policy?.policy_name?.toLowerCase().includes('ayushman') ||
    policy?.insurer_name?.toLowerCase().includes('ayushman');

  return (
    <div className="flex flex-col gap-6 max-w-360 mx-auto pb-6">
      
      {/* View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Cost & Tariff Breakdown
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              {loading ? (
                <>
                  <Sparkles size={10} className="animate-spin text-blue-600" />
                  <span>Calculating...</span>
                </>
              ) : (
                <span>Live Engine</span>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent surgical tariffs, non-payable item separation & what-if room category penalties
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveViewMode('breakdown')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'breakdown'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={14} />
            <span>Itemized Tariffs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('whatif')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'whatif'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight size={14} />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* No Policy Empty State */}
      {!policy && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Insurance Policy Linked</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Link your health insurance policy or government scheme in Onboarding to calculate exact out-of-pocket exposure and deductible deductions.
          </p>
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Add Health Policy</span>
          </button>
        </div>
      )}

      {/* 1. What-If Simulator View */}
      {policy && activeViewMode === 'whatif' && (
        <WhatIfSimulator
          policy={policy}
          hospitalId={hospitalId}
          procedureId={procedureId}
          onApplyRoomCategory={(newCat) => {
            setRoomCategory(newCat);
            setActiveViewMode('breakdown');
          }}
        />
      )}

      {/* 2. Standard Itemized Breakdown View */}
      {policy && activeViewMode === 'breakdown' && (
        <>
          {/* Selector Controls */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Select Procedure & Hospital Parameters
                </h2>
                <p className="text-xs text-slate-500">
                  Forecasts update dynamically based on hospital tier and policy terms
                </p>
              </div>

              {isGovScheme && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  PM-JAY 100% Cashless Package
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Hospital Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Network Hospital
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city}) — {h.tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Procedure Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Surgical Procedure / Treatment
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors"
                  value={procedureId}
                  onChange={(e) => setProcedureId(e.target.value)}
                >
                  <option value="proc-knee-replacement">Total Knee Replacement (Unilateral)</option>
                  <option value="proc-angioplasty">Coronary Angioplasty (PTCA)</option>
                  <option value="proc-appendectomy">Laparoscopic Appendectomy</option>
                  <option value="proc-cataract">Phacoemulsification Cataract Surgery</option>
                  <option value="proc-lap-chole">Laparoscopic Cholecystectomy</option>
                  <option value="proc-hernia">Laparoscopic Inguinal Hernia Repair</option>
                  <option value="proc-mri-brain">MRI Brain with Contrast</option>
                </select>
              </div>

              {/* Room Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Room Category
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors"
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                >
                  <option value="GENERAL">General Ward (₹1,800/day)</option>
                  <option value="SEMI_PRIVATE">Semi-Private / Twin (₹3,500/day)</option>
                  <option value="PRIVATE_AC">Single Private Room AC (₹6,500/day)</option>
                  <option value="DELUXE">Deluxe Private Room (₹11,000/day)</option>
                  <option value="SUITE">Executive Suite (₹22,000/day)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Overview 4 Metric Cards */}
          {estimate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">Typical Gross Cost</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  ₹{estimate.typicalGrossCost?.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  {selectedHospital?.name} ({selectedHospital?.city})
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-emerald-800">Covered by Insurance</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  ₹{estimate.estimatedCoveredAmount?.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium mt-1">
                  Admissible cashless claim limit
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-amber-800">Non-Payable Consumables</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  ₹{estimate.potentialNonCoveredAmount?.toLocaleString()}
                </div>
                <span className="text-[11px] text-amber-700 mt-1">
                  PPE kits, admission file fees, gloves
                </span>
              </div>

              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-rose-800">Estimated Out-of-Pocket</span>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">
                  ₹{estimate.indicativePatientExposure?.toLocaleString()}
                </div>
                <span className="text-[11px] text-rose-700 font-semibold mt-1">
                  Net patient liability at discharge
                </span>
              </div>
            </div>
          )}

          {/* Itemized Components Table */}
          {estimate?.costComponents && estimate.costComponents.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Itemized Component Breakdown
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {estimate.costComponents.length} standard bill heads
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                      <th className="py-2.5 px-3 rounded-l-lg">Component</th>
                      <th className="py-2.5 px-3">Billing Head</th>
                      <th className="py-2.5 px-3 text-right">Estimated Amount</th>
                      <th className="py-2.5 px-3 text-center rounded-r-lg">Coverage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {estimate.costComponents.map((comp: any, idx: number) => (
                      <tr key={comp.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {comp.component_name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {comp.component_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ₹{comp.estimated_amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {comp.coverage_candidate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ Eligible Candidate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ⚠ Excluded Consumable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700">Decision-Support Notice:</strong> {estimate.disclaimer}
              </div>
            </div>
          )}

          {/* What-If Simulator Entry Banner */}
          <div className="bg-linear-to-r from-indigo-50 to-teal-50 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Simulate Room Upgrade Penalties (Proportionate Deductions)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  See how upgrading from Single AC to Deluxe Room impacts surgeon and OT charges before admission.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveViewMode('whatif')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Launch What-If Simulator →
            </button>
          </div>
        </>
      )}

    </div>
  );
};
