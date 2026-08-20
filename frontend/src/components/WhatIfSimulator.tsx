import React, { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ShieldAlert,
  ArrowLeftRight
} from 'lucide-react';
import { api } from '../services/api';

interface WhatIfSimulatorProps {
  policy: any;
  hospitalId?: string;
  procedureId?: string;
  onApplyRoomCategory?: (category: string) => void;
}

const ROOM_OPTIONS = [
  { code: 'GENERAL', name: 'General Ward', tariff: 1800, badge: 'Standard' },
  { code: 'SEMI_PRIVATE', name: 'Semi-Private (Twin)', tariff: 3500, badge: 'Twin Sharing' },
  { code: 'PRIVATE_AC', name: 'Single Private AC', tariff: 6500, badge: 'Single Room' },
  { code: 'DELUXE', name: 'Deluxe Private', tariff: 11000, badge: 'Premium Single' },
  { code: 'SUITE', name: 'Executive Suite', tariff: 22000, badge: 'Luxury Suite' }
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  policy,
  hospitalId = 'hosp-manipal-old-airport',
  procedureId = 'proc-knee-replacement',
  onApplyRoomCategory
}) => {
  const defaultCurrent = policy?.room_eligibility || 'PRIVATE_AC';
  const [currentRoom, setCurrentRoom] = useState<string>(defaultCurrent);
  const [alternativeRoom, setAlternativeRoom] = useState<string>('DELUXE');
  const [simData, setSimData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);



  useEffect(() => {
    if (policy?.room_eligibility) {
      setCurrentRoom(policy.room_eligibility);
    }
  }, [policy?.room_eligibility]);

  const runSimulation = async () => {
    if (!policy) return;
    setLoading(true);
    try {
      const curObj = ROOM_OPTIONS.find((r) => r.code === currentRoom);
      const altObj = ROOM_OPTIONS.find((r) => r.code === alternativeRoom);

      const res = await api.calculateWhatIf({
        policy_id: policy.id,
        hospital_id: hospitalId,
        procedure_id: procedureId,
        current_room_category: currentRoom,
        alternative_room_category: alternativeRoom,
        current_tariff: curObj?.tariff,
        alternative_tariff: altObj?.tariff
      });
      setSimData(res);
    } catch (err) {
      console.error('Failed to run what-if simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [currentRoom, alternativeRoom, policy?.id, hospitalId, procedureId]);

  const delta = simData?.delta;
  const isIncrease = delta?.oopDelta > 0;
  const isDecrease = delta?.oopDelta < 0;

  return (
    <div className="bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-7 shadow-sm transition-all">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-indigo-600 to-teal-600 text-white rounded-2xl shadow-xs">
            <ArrowLeftRight size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                Decision Support Simulator
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                {loading ? (
                  <>
                    <Sparkles size={10} className="animate-spin text-indigo-600" />
                    Calculating...
                  </>
                ) : (
                  'Real-Time Proportionate Penalty Engine'
                )}
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
              What-If Room Upgrade & Downgrade Simulator
            </h3>

          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setAlternativeRoom('DELUXE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              alternativeRoom === 'DELUXE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Upgrade Deluxe
          </button>
          <button
            type="button"
            onClick={() => setAlternativeRoom('SUITE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              alternativeRoom === 'SUITE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Luxury Suite
          </button>
          <button
            type="button"
            onClick={() => setAlternativeRoom('SEMI_PRIVATE')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              alternativeRoom === 'SEMI_PRIVATE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semi-Private
          </button>
        </div>
      </div>

      {/* Interactive Room Category Selector Strip */}
      <div className="mb-6">
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
          Compare Alternative Room Against Your Policy Entitlement ({policy?.room_eligibility || 'Private AC'}):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ROOM_OPTIONS.map((room) => {
            const isCurrent = currentRoom === room.code;
            const isSelectedAlt = alternativeRoom === room.code;
            const isEligible = policy?.room_eligibility === room.code || room.code === 'GENERAL' || room.code === 'SEMI_PRIVATE' || room.code === policy?.room_eligibility;

            return (
              <button
                key={room.code}
                type="button"
                onClick={() => setAlternativeRoom(room.code)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelectedAlt
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {room.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-600">
                    ₹{room.tariff.toLocaleString()}<span className="text-[10px] font-normal text-slate-400">/day</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${isEligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isEligible ? '✓ Eligible' : '⚠ Cap Exceeded'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Impact & Differential Banner */}
      {simData && (
        <div className={`p-4 rounded-2xl mb-6 border transition-all ${
          isIncrease
            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
            : isDecrease
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                isIncrease ? 'bg-rose-500 text-white' : isDecrease ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-white'
              }`}>
                {isIncrease ? <TrendingUp size={20} /> : isDecrease ? <TrendingDown size={20} /> : <Info size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black">
                    {isIncrease && `Out-of-Pocket Cost Increases by +₹${delta?.oopDelta.toLocaleString()} (${delta?.percentageOopChange > 0 ? `+${delta?.percentageOopChange}%` : ''})`}
                    {isDecrease && `Out-of-Pocket Cost Decreases by -₹${Math.abs(delta?.oopDelta).toLocaleString()}`}
                    {!isIncrease && !isDecrease && 'No Financial Penalty Detected'}
                  </span>
                  {delta?.penaltyApplies && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase">
                      {delta.penaltyPercent}% Proportionate Deduction
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {simData.explanation}
                </p>
              </div>
            </div>

            {onApplyRoomCategory && alternativeRoom !== currentRoom && (
              <button
                type="button"
                onClick={() => onApplyRoomCategory(alternativeRoom)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer self-end sm:self-center"
              >
                Apply this Room
              </button>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      {simData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          
          {/* Card Left: Current / Baseline Room */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BedDouble size={18} className="text-teal-600" />
                <span className="text-xs font-extrabold uppercase text-slate-500">
                  Current / Policy Entitlement
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓ 100% Policy Cap Fit
              </span>
            </div>

            <h4 className="text-lg font-black text-slate-900 mb-1">
              {ROOM_OPTIONS.find((r) => r.code === currentRoom)?.name || currentRoom}
            </h4>
            <div className="text-xs text-slate-500 mb-4">
              Tariff: <strong>₹{simData.currentRoom.tariff.toLocaleString()} / day</strong>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gross Procedure Cost</span>
                <span className="font-bold text-slate-900">
                  ₹{simData.currentEstimate.typicalGrossCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-teal-700 font-medium">Covered by Insurer</span>
                <span className="font-extrabold text-teal-700">
                  ₹{simData.currentEstimate.estimatedCoveredAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-amber-700">Non-Covered Consumables</span>
                <span className="font-bold text-amber-800">
                  ₹{simData.currentEstimate.potentialNonCoveredAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 pt-2 text-sm bg-slate-50 rounded-xl px-3 font-extrabold">
                <span className="text-slate-800">Net Out-of-Pocket</span>
                <span className="text-slate-900">
                  ₹{simData.currentEstimate.indicativePatientExposure.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card Right: Alternative Simulated Room */}
          <div className={`border rounded-2xl p-5 bg-white shadow-2xs ${
            delta?.penaltyApplies ? 'border-rose-300 ring-1 ring-rose-200' : 'border-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                <span className="text-xs font-extrabold uppercase text-indigo-700">
                  Simulated Alternative
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                simData.alternativeRoom.eligible
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {simData.alternativeRoom.eligible ? '✓ Fully Eligible' : '⚠ Exceeds Policy Entitlement'}
              </span>
            </div>

            <h4 className="text-lg font-black text-slate-900 mb-1">
              {ROOM_OPTIONS.find((r) => r.code === alternativeRoom)?.name || alternativeRoom}
            </h4>
            <div className="text-xs text-slate-500 mb-4">
              Tariff: <strong>₹{simData.alternativeRoom.tariff.toLocaleString()} / day</strong>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gross Procedure Cost</span>
                <span className="font-bold text-slate-900">
                  ₹{simData.alternativeEstimate.typicalGrossCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-teal-700 font-medium">Covered by Insurer</span>
                <span className="font-extrabold text-teal-700">
                  ₹{simData.alternativeEstimate.estimatedCoveredAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-amber-700">Non-Covered Consumables</span>
                <span className="font-bold text-amber-800">
                  ₹{simData.alternativeEstimate.potentialNonCoveredAmount.toLocaleString()}
                </span>
              </div>

              <div className={`flex justify-between py-2 pt-2 text-sm rounded-xl px-3 font-extrabold ${
                isIncrease ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
              }`}>
                <span>Net Out-of-Pocket</span>
                <span>
                  ₹{simData.alternativeEstimate.indicativePatientExposure.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Educational Notice on Proportionate Deduction Trap */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-950 block">
                The Proportionate Deduction Clause Explained:
              </span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                In India, when you choose a room category above your policy limit (e.g. Deluxe instead of Single Private AC), insurers do <strong>not</strong> just bill you the room difference. Under standard IRDAI policy terms, they proportionally reduce coverage across <strong>surgeon fees, OT charges, and nursing fees</strong> by the ratio: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-900">Eligible Tariff / Selected Tariff</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
