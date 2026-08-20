import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WhatIfSimulator } from './WhatIfSimulator';
import { Calculator, ArrowLeftRight } from 'lucide-react';

interface CostBreakdownViewProps {
  policy: any;
  hospitals: any[];
}

export const CostBreakdownView: React.FC<CostBreakdownViewProps> = ({
  policy,
  hospitals
}) => {
  const [hospitalId, setHospitalId] = useState<string>('hosp-manipal-old-airport');
  const [procedureId, setProcedureId] = useState<string>('proc-knee-replacement');
  const [roomCategory, setRoomCategory] = useState<string>(policy?.room_eligibility || 'PRIVATE_AC');
  const [estimate, setEstimate] = useState<any>(null);
  const [activeViewMode, setActiveViewMode] = useState<'breakdown' | 'whatif'>('breakdown');

  const fetchEstimate = async () => {
    if (!policy) return;
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
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [hospitalId, procedureId, roomCategory, policy?.id]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Financial & Cost Intelligence Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent surgical tariffs, non-payable item separation & what-if upgrade penalties
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
            Itemized Tariffs
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
            What-If Simulator
          </button>
        </div>
      </div>

      {/* 1. What-If Simulator View */}
      {activeViewMode === 'whatif' && (
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
      {activeViewMode === 'breakdown' && (
        <>
          {/* Selector Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Indicative Procedure Cost & Out-of-Pocket Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Hospital
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white cursor-pointer"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Procedure / Surgery
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white cursor-pointer"
                  value={procedureId}
                  onChange={(e) => setProcedureId(e.target.value)}
                >
                  <option value="proc-knee-replacement">Total Knee Replacement (Unilateral)</option>
                  <option value="proc-angioplasty">Coronary Angioplasty (PTCA)</option>
                  <option value="proc-appendectomy">Laparoscopic Appendectomy</option>
                  <option value="proc-mri-brain">MRI Brain with Contrast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Room Category
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white cursor-pointer"
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value)}
                >
                  <option value="GENERAL">General Ward (₹1,800/day)</option>
                  <option value="SEMI_PRIVATE">Semi-Private (₹3,500/day)</option>
                  <option value="PRIVATE_AC">Single Private AC (₹6,500/day)</option>
                  <option value="DELUXE">Deluxe Room (₹11,000/day)</option>
                  <option value="SUITE">Executive Suite (₹22,000/day)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Financial Overview Cards */}
          {estimate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-500">Typical Gross Cost</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  ₹{estimate.typicalGrossCost?.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400">Hospital tariff band</span>
              </div>

              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 shadow-xs">
                <span className="text-xs font-semibold text-teal-800">Covered by Insurance</span>
                <div className="text-2xl font-extrabold text-teal-600 mt-1">
                  ₹{estimate.estimatedCoveredAmount?.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Admissible cashless claim</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
                <span className="text-xs font-semibold text-amber-800">Non-Covered Consumables</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  ₹{estimate.potentialNonCoveredAmount?.toLocaleString()}
                </div>
                <span className="text-[11px] text-amber-700">PPE, surgical kits, file fees</span>
              </div>

              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-xs">
                <span className="text-xs font-bold text-rose-800">Estimated Patient Out-of-Pocket</span>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">
                  ₹{estimate.indicativePatientExposure?.toLocaleString()}
                </div>
                <span className="text-[11px] text-rose-700 font-semibold">Net patient responsibility</span>
              </div>

            </div>
          )}

          {/* Itemized Components Table */}
          {estimate?.costComponents && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
              <h4 className="text-base font-extrabold text-slate-900 mb-3">
                Itemized Component Breakdown
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Component</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Estimated Amount</th>
                      <th className="py-2.5 px-3 text-center">Coverage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {estimate.costComponents.map((comp: any) => (
                      <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {comp.component_name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {comp.component_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ₹{comp.estimated_amount.toLocaleString()}
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

          {/* Embedded What-If Quick Entry Callout */}
          <div className="bg-linear-to-r from-indigo-50 to-teal-50 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Want to explore room upgrade or downgrade financial impacts?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Simulate proportionate deductions on doctor and OT charges before choosing a room category.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveViewMode('whatif')}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Launch What-If Simulator →
            </button>
          </div>
        </>
      )}

    </div>
  );
};

