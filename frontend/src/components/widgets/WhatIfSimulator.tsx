/**
 * Room-choice comparison. Every figure on screen comes from POST /cost/what-if,
 * which runs the same coverage engine as the main estimate.
 *
 * What this component no longer does: it used to carry its own ROOM_OPTIONS
 * array — GENERAL ₹1,800, SEMI_PRIVATE ₹3,500, PRIVATE_AC ₹6,500, DELUXE
 * ₹11,000, SUITE ₹22,000 — and send those tariffs to the server as if they were
 * the hospital's. They were invented, identical for a public teaching hospital
 * and a corporate chain, and they overrode the real tariff card in the request
 * body. Rooms now come from the `roomOptions` prop, which is the hospital's own
 * published card, and no tariff is sent at all: the server prices the room it
 * holds on record.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, BedDouble, Info, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { formatINR, formatPerDay, humanizeCode } from '../../lib/format';
import type {
  CostEstimateCore,
  EnrichedInsurancePolicy,
  PublishedRoomTariff,
  RoomCategoryCode,
  WhatIfComparison
} from '../../types/domain';

interface WhatIfSimulatorProps {
  policy: EnrichedInsurancePolicy;
  /** Required. Tariffs and package rates are per hospital; there is no default. */
  hospitalId: string;
  procedureId: string;
  /** The hospital's published tariff card. Empty means nothing to compare. */
  roomOptions: PublishedRoomTariff[];
  /** Omit to let the server use the policy's entitlement at this hospital. */
  currentRoomCategory?: RoomCategoryCode;
  onApplyRoomCategory?: (category: RoomCategoryCode) => void;
}

/** The four money lines, so both cards render from one definition. */
const LINES: Array<{
  key: keyof Pick<
    CostEstimateCore,
    | 'typicalGrossCost'
    | 'estimatedCoveredAmount'
    | 'potentialNonCoveredAmount'
    | 'estimatedCopayAmount'
  >;
  label: string;
  tone: string;
}> = [
  { key: 'typicalGrossCost', label: 'Gross hospital bill', tone: 'text-slate-900' },
  { key: 'estimatedCoveredAmount', label: 'Paid by insurer', tone: 'text-teal-700' },
  { key: 'potentialNonCoveredAmount', label: 'Not covered', tone: 'text-amber-800' },
  { key: 'estimatedCopayAmount', label: 'Your co-pay', tone: 'text-slate-800' }
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  policy,
  hospitalId,
  procedureId,
  roomOptions,
  currentRoomCategory,
  onApplyRoomCategory
}) => {
  // Null means "no explicit choice yet" — the server then compares against the
  // next room this hospital publishes above the current one, which is the only
  // alternative it can price. The old default of 'DELUXE' asked four of nine
  // hospitals about a room they do not have.
  const [alternativeRoom, setAlternativeRoom] = useState<RoomCategoryCode | null>(null);
  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // A new hospital or procedure invalidates the chosen alternative: the room may
  // not exist on the new tariff card.
  useEffect(() => {
    setAlternativeRoom(null);
  }, [hospitalId, procedureId]);

  const runComparison = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.calculateWhatIf({
        policy_id: policy.id,
        hospital_id: hospitalId,
        procedure_id: procedureId,
        current_room_category: currentRoomCategory,
        alternative_room_category: alternativeRoom ?? undefined
      });
      setComparison(res);
      setError(null);
    } catch (err) {
      // Surfaced, not logged to a console nobody reads. NO_ALTERNATIVE_ROOM and
      // ROOM_TARIFF_NOT_ON_RECORD are both answers a reader needs to see.
      setComparison(null);
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Could not compare room categories.'
      );
    } finally {
      setLoading(false);
    }
  }, [policy.id, hospitalId, procedureId, currentRoomCategory, alternativeRoom]);

  useEffect(() => {
    void runComparison();
  }, [runComparison]);

  const delta = comparison?.delta;
  const oopDelta = delta?.oopDelta ?? 0;
  const isIncrease = oopDelta > 0;
  const isDecrease = oopDelta < 0;

  // Which card the strip highlights. Before an explicit choice this is whatever
  // the server picked, so the strip and the comparison never disagree.
  const highlightedAlt = alternativeRoom ?? comparison?.alternativeRoom.code ?? null;
  const currentCode = comparison?.currentRoom.code ?? currentRoomCategory ?? null;

  const roomName = (code: RoomCategoryCode) =>
    roomOptions.find((r) => r.code === code)?.name ?? humanizeCode(code);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0">
          <ArrowLeftRight size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            Compare room categories
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading
              ? 'Recalculating…'
              : `Priced against ${policy.insurer_name}'s terms on ${policy.policy_name}.`}
          </p>
        </div>
      </div>

      {/* Room strip — the hospital's own card, nothing more. */}
      {roomOptions.length === 0 ? (
        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
          This hospital has no published room tariffs on record, so room categories cannot be
          compared here.
        </p>
      ) : (
        <div className="mb-5">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
            Pick a room to compare — your entitlement is {humanizeCode(policy.room_eligibility)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {roomOptions.map((room) => {
              const isAlt = highlightedAlt === room.code;
              const isCurrent = currentCode === room.code;
              const isEntitlement = policy.room_eligibility === room.code;
              return (
                <button
                  key={room.code}
                  type="button"
                  onClick={() => setAlternativeRoom(room.code)}
                  aria-pressed={isAlt}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isAlt
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500/25'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {room.name}
                  </span>
                  <span className="block text-xs text-slate-600 mt-0.5">
                    {formatPerDay(room.tariff_per_day)}
                  </span>
                  {(isCurrent || isEntitlement) && (
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {isCurrent ? 'Selected' : 'Your entitlement'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
          <p>{error}</p>
        </div>
      )}

      {comparison && delta && (
        <>
          {/* The verdict, in the server's own words. */}
          <div
            className={`p-4 rounded-xl mb-4 border ${
              isIncrease
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : isDecrease
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 text-white ${
                    isIncrease ? 'bg-rose-600' : isDecrease ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}
                >
                  {isIncrease ? (
                    <TrendingUp size={18} />
                  ) : isDecrease ? (
                    <TrendingDown size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">
                      {isIncrease && `You pay ${formatINR(oopDelta)} more`}
                      {isDecrease && `You pay ${formatINR(Math.abs(oopDelta))} less`}
                      {!isIncrease && !isDecrease && 'No change to what you pay'}
                    </span>
                    {delta.percentageOopChange !== 0 && (
                      <span className="text-xs font-semibold opacity-80">
                        {delta.percentageOopChange > 0 ? '+' : ''}
                        {delta.percentageOopChange}%
                      </span>
                    )}
                    {delta.penaltyApplies && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wide">
                        {delta.penaltyPercent}% proportionate deduction
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {comparison.explanation}
                  </p>
                </div>
              </div>

              {onApplyRoomCategory &&
                comparison.alternativeRoom.code !== comparison.currentRoom.code && (
                  <button
                    type="button"
                    onClick={() => onApplyRoomCategory(comparison.alternativeRoom.code)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Use {roomName(comparison.alternativeRoom.code)}
                  </button>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <EstimateCard
              icon={<BedDouble size={16} className="text-teal-700" />}
              heading="Currently selected"
              title={roomName(comparison.currentRoom.code)}
              tariff={comparison.currentRoom.tariff}
              eligible={comparison.currentRoom.eligible}
              estimate={comparison.currentEstimate}
              highlight={false}
            />
            <EstimateCard
              icon={<Sparkles size={16} className="text-blue-700" />}
              heading="If you choose instead"
              title={roomName(comparison.alternativeRoom.code)}
              tariff={comparison.alternativeRoom.tariff}
              eligible={comparison.alternativeRoom.eligible}
              estimate={comparison.alternativeEstimate}
              highlight={isIncrease}
            />
          </div>

          {comparison.provenance.notes.length > 0 && (
            <ul className="mb-4 space-y-1">
              {comparison.provenance.notes.map((note) => (
                <li key={note} className="text-[11px] text-slate-500 leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900">Why a room upgrade costs more than the room. </span>
            If you take a room above your policy limit, most Indian insurers do not simply bill you
            the difference. They reduce their share of the surgeon, theatre and nursing charges in
            the ratio{' '}
            <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono">
              eligible tariff ÷ selected tariff
            </code>
            . Check the wording in your own policy schedule before deciding.
          </p>
        </div>
      </div>
    </div>
  );
};

interface EstimateCardProps {
  icon: React.ReactNode;
  heading: string;
  title: string;
  tariff: number;
  /** From the server's rules engine, not a guess about the room's rank. */
  eligible: boolean;
  estimate: CostEstimateCore;
  highlight: boolean;
}

const EstimateCard: React.FC<EstimateCardProps> = ({
  icon,
  heading,
  title,
  tariff,
  eligible,
  estimate,
  highlight
}) => (
  <div
    className={`border rounded-xl p-4 sm:p-5 bg-white ${
      highlight ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
    }`}
  >
    <div className="flex items-center justify-between gap-2 mb-3">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {icon}
        {heading}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          eligible
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}
      >
        {eligible ? 'Within your room limit' : 'Above your room limit'}
      </span>
    </div>

    <h4 className="text-base font-bold text-slate-900">{title}</h4>
    <p className="text-xs text-slate-500 mb-4">{formatPerDay(tariff)}</p>

    <dl className="space-y-0.5 text-xs">
      {LINES.map((line) => (
        <div
          key={line.key}
          className="flex items-baseline justify-between gap-3 py-1.5 border-b border-slate-100"
        >
          <dt className="text-slate-500">{line.label}</dt>
          <dd className={`font-bold tabular-nums ${line.tone}`}>{formatINR(estimate[line.key])}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-3 mt-2 py-2 px-3 rounded-xl bg-slate-50">
        <dt className="text-sm font-bold text-slate-800">You pay</dt>
        <dd className="text-sm font-bold text-slate-900 tabular-nums">
          {formatINR(estimate.indicativePatientExposure)}
        </dd>
      </div>
    </dl>
  </div>
);
