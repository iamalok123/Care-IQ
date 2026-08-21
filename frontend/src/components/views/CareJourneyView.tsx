import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { StageGuidanceCard } from '../widgets/StageGuidanceCard';

interface CareJourneyViewProps {
  journey: any;
  hospital: any;
  policy: any;
  onEventAdded: () => void;
}

export const CareJourneyView: React.FC<CareJourneyViewProps> = ({
  journey,
  hospital,
  policy,
  onEventAdded
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [stage, setStage] = useState<string>('PROCEDURE');
  const [eventType, setEventType] = useState<string>('SURGICAL_PROCEDURE');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const stages = ['ADMISSION', 'INVESTIGATION', 'PROCEDURE', 'RECOVERY', 'DISCHARGE'];
  const currentStage = journey?.current_stage || 'PROCEDURE';
  const stageIndex = stages.indexOf(currentStage) >= 0 ? stages.indexOf(currentStage) : 2;
  const [focusedStage, setFocusedStage] = useState<string>(currentStage);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journey || !title) return;

    setSubmitting(true);
    try {
      await api.addJourneyEvent(journey.id, {
        stage,
        event_type: eventType,
        title,
        description,
        status: 'COMPLETED',
        insurance_relevance: `Logged event in ${stage} stage. Contextual policy checks applied.`,
        requires_verification: true
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      onEventAdded();
    } catch (err) {
      console.error('Failed to add journey event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!journey) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-xs">
        <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl w-fit mx-auto mb-3">
          <Sparkles size={36} />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">No active care trajectory found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Start your care journey by selecting an in-network hospital from the matcher or launching a demo scenario.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      
      {/* 1. Header & Quick Details */}
      <div className="bg-linear-to-br from-white to-teal-50/60 border border-teal-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 mb-1.5">
              Dynamic Care Journey Tracker
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Hospital Care Progress & Real-Time Policy Signals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Facility: <strong>{hospital?.name || 'Manipal Hospital, Old Airport Road'}</strong> • Policy: <strong>{policy?.policy_name || 'Star Comprehensive'}</strong>
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/30 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Log New Journey Event
          </button>
        </div>

        {/* Multi-Stage Step Progress Bar */}
        <div className="flex items-center justify-between relative mt-4 pt-2">
          <div className="absolute top-5 left-5 right-5 h-1 bg-slate-200 z-1" />
          <div
            className="absolute top-5 left-5 h-1 bg-teal-600 z-2 transition-all duration-300"
            style={{ width: `${Math.max(0, (stageIndex / (stages.length - 1)) * 100)}%` }}
          />

          {stages.map((stageName, idx) => {
            const isCompleted = idx < stageIndex;
            const isCurrent = idx === stageIndex;
            const isFocused = focusedStage === stageName;

            return (
              <button
                key={stageName}
                type="button"
                onClick={() => setFocusedStage(stageName)}
                className="flex flex-col items-center relative z-3 cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isFocused
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110 shadow-sm'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                      ? 'bg-white border-2 border-teal-600 text-teal-600 ring-4 ring-teal-500/20'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 capitalize transition-colors ${
                    isFocused
                      ? 'font-black text-indigo-700 underline underline-offset-2'
                      : isCurrent
                      ? 'font-bold text-slate-900'
                      : 'font-medium text-slate-500 group-hover:text-slate-700'
                  }`}
                >
                  {stageName.toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Context-Aware Stage Guidance Card */}
      <StageGuidanceCard
        stage={focusedStage}
        policy={policy}
        hospital={hospital}
        onSelectStage={(newStage) => setFocusedStage(newStage)}
      />

      {/* Section 53 — 'What Changed Since Your Last Update?' Timeline Comparison Card */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs bg-linear-to-r from-indigo-50/50 via-white to-teal-50/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What Changed Since Your Last Update?</h3>
              <p className="text-[11px] text-slate-500">Real-time delta in insurance exposure and pre-authorization requirements.</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200">
            Section 53 Differential
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Care Stage Transition</span>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="text-slate-400">Admission</span>
              <span>→</span>
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-extrabold">{currentStage}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pre-Authorization Status</span>
            <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              <Clock size={12} /> Pending TPA Desk Action
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Exposure Delta</span>
            <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
              <span>Indicative: ₹14,000</span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">+ Consumables</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Timeline Event Feed */}
      <div>

        <h3 className="text-base md:text-lg font-extrabold text-slate-900 mb-3 px-1">
          Journey Event Timeline & Insurance Guidance
        </h3>

        <div className="flex flex-col gap-3.5">
          {journey?.events?.map((evt: any, idx: number) => {
            const isLatest = idx === journey.events.length - 1;

            return (
              <div
                key={evt.id}
                className={`border rounded-2xl p-5 shadow-xs transition-all ${
                  isLatest
                    ? 'bg-teal-50/50 border-l-4 border-l-teal-600 border-teal-200'
                    : 'bg-white border-l-4 border-l-slate-300 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      {evt.stage}
                    </span>
                    <h4 className="text-sm md:text-base font-extrabold text-slate-900">
                      {evt.title}
                    </h4>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                    {new Date(evt.occurred_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {evt.description}
                </p>

                {/* Insurance Relevance Box */}
                {evt.insurance_relevance && (
                  <div className="p-3 bg-white border border-slate-200/80 rounded-xl">
                    <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5 mb-0.5">
                      <Sparkles size={13} className="text-teal-600" />
                      Insurance & Coverage Implication
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evt.insurance_relevance}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Event Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">
              Log Care Journey Event
            </h3>

            <form onSubmit={handleAddEvent} className="flex flex-col gap-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Journey Stage
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="ADMISSION">Admission Desk</option>
                  <option value="INVESTIGATION">Diagnostic Investigation / Lab</option>
                  <option value="PROCEDURE">Procedure / Operation Theatre</option>
                  <option value="RECOVERY">Post-Op Recovery / Inpatient Ward</option>
                  <option value="DISCHARGE">Discharge & Billing Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Type
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="SURGICAL_PROCEDURE">Surgical / Medical Procedure</option>
                  <option value="ROOM_CHANGE">Room Category Change / Upgrade</option>
                  <option value="DIAGNOSTIC_TEST">Diagnostic Lab / Imaging</option>
                  <option value="PREAUTH_UPDATE">Preauthorization Status Update</option>
                  <option value="DISCHARGE_SUMMARY">Discharge File / Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  placeholder="e.g. Deluxe Room Upgrade Opted / Surgery Completed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Details / Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  rows={3}
                  placeholder="Describe what occurred (e.g. Doctor scheduled knee surgery in OT 3; additional consumables estimate given)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Record Event & Apply Checks'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
