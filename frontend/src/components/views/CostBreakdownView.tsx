import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../../services/api';
import { WhatIfSimulator } from '../widgets/WhatIfSimulator';
import {
  Calculator,
  ArrowLeftRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCareIQ } from '../../context/CareIQContext';
import { formatINR, formatPerDay, humanizeCode } from '../../lib/format';
import type {
  CostEstimate,
  EnrichedInsurancePolicy,
  Hospital,
  HospitalDetail,
  RoomCategoryCode
} from '../../types/domain';

interface CostBreakdownViewProps {
  policy?: EnrichedInsurancePolicy | null;
  hospitals?: Hospital[];
}

/** Plain-language source labels for the estimate's provenance block. */
const PROCEDURE_SOURCE_LABEL: Record<CostEstimate['provenance']['procedure_cost_source'], string> = {
  HOSPITAL_PRICE_LIST: 'This hospital’s own price list',
  PEER_HOSPITAL_PRICE_LIST: 'A comparable hospital’s price list',
  MODELLED_PACKAGE_RATE: 'A modelled package rate, not a quoted price'
};

const COMPONENT_SOURCE_LABEL: Record<CostEstimate['provenance']['components_source'], string> = {
  HOSPITAL_ITEMISED: 'Itemised by the hospital',
  MODELLED_SPLIT: 'Split by a standard billing model'
};

export const CostBreakdownView: React.FC<CostBreakdownViewProps> = ({
  policy: propPolicy,
  hospitals: propHospitals
}) => {
  const navigate = useNavigate();
  const context = useCareIQ();
  const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
  const hospitals = propHospitals !== undefined ? propHospitals : context.hospitals;

  /**
   * The journey's hospital, or none. There is no fallback to a named hospital
   * and no city-based guess: this view previously defaulted to Manipal Old
   * Airport Road, so a patient with no journey saw a costing for a hospital
   * they had never chosen, in a city they may not live in.
   */
  const [hospitalId, setHospitalId] = useState<string>(() => context.journey?.hospital_id ?? '');
  const [procedureId, setProcedureId] = useState<string>(() => context.journey?.procedure_id ?? '');
  const [roomCategory, setRoomCategory] = useState<RoomCategoryCode | ''>(
    () => context.journey?.selected_room_category ?? ''
  );

  const [hospitalDetail, setHospitalDetail] = useState<HospitalDetail | null>(null);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'breakdown' | 'whatif'>('breakdown');

  // Follow the journey when it changes. Nothing is invented when it is absent.
  useEffect(() => {
    setHospitalId(context.journey?.hospital_id ?? '');
    setProcedureId(context.journey?.procedure_id ?? '');
    setRoomCategory(context.journey?.selected_room_category ?? '');
  }, [
    context.journey?.id,
    context.journey?.hospital_id,
    context.journey?.procedure_id,
    context.journey?.selected_room_category
  ]);

  /**
   * The selected hospital's own tariff card and priced procedures. This is what
   * fills the dropdowns, replacing a hardcoded list of seven procedure ids and
   * five room tariffs (₹1,800 / ₹3,500 / ₹6,500 / ₹11,000 / ₹22,000 per day)
   * that were the same for every hospital in the country.
   */
  useEffect(() => {
    if (!hospitalId) {
      setHospitalDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detail = await api.getHospitalById(hospitalId, policy?.insurer_id);
        if (!cancelled) setHospitalDetail(detail);
      } catch {
        if (!cancelled) setHospitalDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hospitalId, policy?.insurer_id]);

  // Default the room to what the policy entitles, but only if the hospital
  // actually publishes that category.
  useEffect(() => {
    if (roomCategory || !hospitalDetail || !policy?.room_eligibility) return;
    const entitled = hospitalDetail.rooms.find((r) => r.code === policy.room_eligibility);
    if (entitled) setRoomCategory(entitled.code);
  }, [hospitalDetail, policy?.room_eligibility, roomCategory]);

  const fetchEstimate = useCallback(async () => {
    // All three ids are required. Previously two of them were guessed, so the
    // view always produced a number — just not one about this patient.
    if (!policy?.id || !hospitalId || !procedureId) {
      setEstimate(null);
      setEstimateError(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.calculateCostEstimate({
        policy_id: policy.id,
        hospital_id: hospitalId,
        procedure_id: procedureId,
        ...(roomCategory ? { preferred_room_category: roomCategory } : {})
      });
      setEstimate(data);
      setEstimateError(null);
    } catch (err) {
      // A failed estimate clears the old one. Leaving the previous figures on
      // screen under new selectors is how the wrong number gets believed.
      setEstimate(null);
      setEstimateError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Could not calculate this estimate.'
      );
    } finally {
      setLoading(false);
    }
  }, [policy?.id, hospitalId, procedureId, roomCategory]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  const selectedHospital =
    hospitalDetail ?? hospitals.find((h) => h.id === hospitalId) ?? null;

  // Supplied by the backend from public.insurers. The old check compared
  // scheme_type against 'GOV_PMJAY', a value the enum has never contained, and
  // then sniffed the policy name for 'ayushman' when that failed.
  const isGovScheme = policy?.is_government_scheme === true;

  const roomOptions = hospitalDetail?.rooms ?? [];
  const procedureOptions = hospitalDetail?.procedures ?? [];
  const selectorsReady = Boolean(hospitalId && procedureId && policy?.id);

  return (
    <div className="flex flex-col gap-6 max-w-360 mx-auto pb-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Cost &amp; tariff breakdown
            </h1>
            {loading && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                <Sparkles size={10} className="animate-spin text-blue-600" />
                <span>Calculating</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Room tariffs and procedure prices as this hospital publishes them, with the
            deductions your policy applies.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveViewMode('breakdown')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              activeViewMode === 'breakdown'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={14} />
            <span>Itemised tariffs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('whatif')}
            disabled={!selectorsReady}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              activeViewMode === 'whatif'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight size={14} />
            <span>What-if simulator</span>
          </button>
        </div>
      </div>

      {!policy && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No policy linked</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Add your policy or government scheme to see what it covers and what you would pay.
          </p>
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusCircle size={15} />
            <span>Add policy</span>
          </button>
        </div>
      )}

      {policy && activeViewMode === 'whatif' && selectorsReady && (
        <WhatIfSimulator
          policy={policy}
          hospitalId={hospitalId}
          procedureId={procedureId}
          roomOptions={roomOptions}
          currentRoomCategory={roomCategory || undefined}
          onApplyRoomCategory={(newCat) => {
            setRoomCategory(newCat);
            setActiveViewMode('breakdown');
          }}
        />
      )}

      {policy && activeViewMode === 'breakdown' && (
        <>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Hospital, procedure and room
                </h2>
                <p className="text-xs text-slate-500">
                  Options come from each hospital&rsquo;s published tariff card.
                </p>
              </div>

              {isGovScheme && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  Government scheme
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label
                  htmlFor="cost-hospital"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Hospital
                </label>
                <select
                  id="cost-hospital"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors"
                  value={hospitalId}
                  onChange={(e) => {
                    setHospitalId(e.target.value);
                    // A new hospital has its own tariff card and its own priced
                    // procedures. Carrying the old selections over would price
                    // a procedure this hospital may not perform.
                    setProcedureId('');
                    setRoomCategory('');
                  }}
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="cost-procedure"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Procedure
                </label>
                <select
                  id="cost-procedure"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  value={procedureId}
                  disabled={!hospitalId || procedureOptions.length === 0}
                  onChange={(e) => setProcedureId(e.target.value)}
                >
                  <option value="">
                    {!hospitalId
                      ? 'Select a hospital first'
                      : procedureOptions.length === 0
                        ? 'No published prices for this hospital'
                        : 'Select a procedure'}
                  </option>
                  {procedureOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cost-room" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Room category
                </label>
                <select
                  id="cost-room"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  value={roomCategory}
                  disabled={!hospitalId || roomOptions.length === 0}
                  onChange={(e) => setRoomCategory(e.target.value as RoomCategoryCode)}
                >
                  <option value="">
                    {!hospitalId
                      ? 'Select a hospital first'
                      : roomOptions.length === 0
                        ? 'No tariff card on record'
                        : 'Select a room category'}
                  </option>
                  {roomOptions.map((r) => (
                    <option key={r.room_category_id} value={r.code}>
                      {r.name} — {formatPerDay(r.tariff_per_day)}
                    </option>
                  ))}
                </select>
                {policy.room_eligibility && roomOptions.length > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Your policy entitles you to {humanizeCode(policy.room_eligibility)}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {!selectorsReady && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <Calculator size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Choose a hospital and procedure</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                We do not estimate against a hospital you have not selected. Pick both and the
                figures below are calculated from that hospital&rsquo;s own prices.
              </p>
            </div>
          )}

          {estimateError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-rose-900">No estimate for this combination</div>
                <p className="text-rose-700 mt-0.5">{estimateError}</p>
              </div>
            </div>
          )}

          {estimate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">Total hospital bill</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatINR(estimate.typicalGrossCost)}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  {selectedHospital ? `${selectedHospital.name}, ${selectedHospital.city}` : ''}
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-emerald-800">Insurance should cover</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {formatINR(estimate.estimatedCoveredAmount)}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium mt-1">
                  Subject to the hospital&rsquo;s pre-authorisation
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-amber-800">Not covered</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {formatINR(estimate.potentialNonCoveredAmount)}
                </div>
                <span className="text-[11px] text-amber-700 mt-1">
                  {/* Named from the components themselves, not a fixed caption
                      that claimed gloves and PPE kits every time. */}
                  {estimate.costComponents
                    .filter((c) => !c.coverage_candidate)
                    .map((c) => c.component_name)
                    .slice(0, 3)
                    .join(', ') || 'Itemised in the table below'}
                </span>
              </div>

              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-bold text-rose-800">You would pay</span>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">
                  {formatINR(estimate.indicativePatientExposure)}
                </div>
                <span className="text-[11px] text-rose-700 font-semibold mt-1">
                  Co-pay {formatINR(estimate.estimatedCopayAmount)} + excess{' '}
                  {formatINR(estimate.estimatedDeductibleAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Where these numbers came from. Rendered, not hidden — a modelled
              package rate and a quoted hospital price should not look alike. */}
          {estimate && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Info size={15} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-900">Where these figures come from</h3>
                {estimate.provenance.is_estimated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Estimated
                  </span>
                )}
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <dt className="font-bold text-slate-500">Procedure price</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {PROCEDURE_SOURCE_LABEL[estimate.provenance.procedure_cost_source]}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Bill heads</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {COMPONENT_SOURCE_LABEL[estimate.provenance.components_source]}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Room tariff</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {formatPerDay(estimate.context.selected_room_tariff)} selected, policy allows{' '}
                    {formatPerDay(estimate.context.eligible_room_tariff)}
                  </dd>
                </div>
              </dl>
              {estimate.provenance.notes.length > 0 && (
                <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  {estimate.provenance.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {estimate && estimate.costComponents.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Bill heads</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {estimate.costComponents.length}{' '}
                  {estimate.costComponents.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Table on desktop, card stack on mobile. A four-column table
                  inside a 375px viewport scrolls sideways and hides the amount,
                  which is the one column that matters. */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                      <th scope="col" className="py-2.5 px-3 rounded-l-lg">Component</th>
                      <th scope="col" className="py-2.5 px-3">Code</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Amount</th>
                      <th scope="col" className="py-2.5 px-3 text-center rounded-r-lg">Covered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {estimate.costComponents.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {comp.component_name}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {comp.component_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatINR(comp.estimated_amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {comp.coverage_candidate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Claimable
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              You pay
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden space-y-2">
                {estimate.costComponents.map((comp) => (
                  <li
                    key={comp.id}
                    className="border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">
                        {comp.component_name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {comp.component_code}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-bold border ${
                          comp.coverage_candidate
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {comp.coverage_candidate ? 'Claimable' : 'You pay'}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 shrink-0">
                      {formatINR(comp.estimated_amount)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed">
                {estimate.disclaimer}
              </div>
            </div>
          )}

          {selectorsReady && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Compare room categories before you admit
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Choosing a room above your entitlement reduces what the insurer pays on the
                    whole bill, not just the room. See the difference in rupees.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveViewMode('whatif')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Open the simulator
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};
