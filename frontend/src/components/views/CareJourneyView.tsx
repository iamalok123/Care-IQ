import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { StageGuidanceCard } from '../widgets/StageGuidanceCard';

import { useCareIQ } from '../../context/CareIQContext';

import type {
  CareJourney,
  EnrichedInsurancePolicy,
  Hospital,
  JourneyStage
} from '../../types/domain';
import { JOURNEY_STAGES, resolveJourneyStage } from '../../lib/journey';

interface CareJourneyViewProps {
  journey?: CareJourney | null;
  hospital?: Hospital | null;
  policy?: EnrichedInsurancePolicy | null;
  onEventAdded?: () => void;
}

export const CareJourneyView: React.FC<CareJourneyViewProps> = ({
  journey: propJourney,
  hospital: propHospital,
  policy: propPolicy,
  onEventAdded: propOnEventAdded
}) => {
  const context = useCareIQ();
  const journey = propJourney !== undefined ? propJourney : context.journey;
  const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
  const hospital = propHospital !== undefined 
    ? propHospital 
    : context.hospitals.find((h) => h.id === journey?.hospital_id);
  const onEventAdded = propOnEventAdded || (() => context.activePatient && context.loadDataForPatient(context.activePatient));
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [stage, setStage] = useState<JourneyStage>('PROCEDURE');
  const [eventType, setEventType] = useState<string>('SURGICAL_PROCEDURE');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const stages: JourneyStage[] = [...JOURNEY_STAGES];
  const resolved = resolveJourneyStage(journey);
  const currentStage: JourneyStage = resolved.stage || 'ADMISSION';
  const stageIndex = resolved.index >= 0 ? resolved.index : 0;
  const [focusedStage, setFocusedStage] = useState<JourneyStage>(currentStage);

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
              Facility: <strong>{hospital?.name || 'No hospital selected'}</strong> • Policy: <strong>{policy?.policy_name || 'No policy linked'}</strong>
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
          {(journey?.events ?? []).map((evt: any, idx: number) => {
            const isLatest = idx === (journey?.events?.length ?? 0) - 1;

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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
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
                  onChange={(e) => setStage(e.target.value as JourneyStage)}
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






































// // Other UI (Dont remove it its for another ui version i have kept)
// import React, { useState } from 'react';
// import {
//   Sparkles,
//   Plus,
//   CheckCircle2,
//   Clock,
//   Building2,
//   ShieldCheck,
//   User,
//   AlertTriangle,
//   FileText,
//   HelpCircle,
//   Copy,
//   Check,
//   X
// } from 'lucide-react';
// import { api } from '../../services/api';
// import { useCareIQ } from '../../context/CareIQContext';

// interface CareJourneyViewProps {
//   journey?: any;
//   hospital?: any;
//   policy?: any;
//   onEventAdded?: () => void;
// }

// export const CareJourneyView: React.FC<CareJourneyViewProps> = ({
//   journey: propJourney,
//   hospital: propHospital,
//   policy: propPolicy,
//   onEventAdded: propOnEventAdded
// }) => {
//   const context = useCareIQ();
//   const journey = propJourney !== undefined ? propJourney : context.journey;
//   const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
//   const patient = context.activePatient;
//   const hospital = propHospital !== undefined
//     ? propHospital
//     : context.hospitals.find((h) => h.id === journey?.hospital_id) || context.hospitals[0];

//   const onEventAdded = propOnEventAdded || (() => context.activePatient && context.loadDataForPatient(context.activePatient));

//   const [showAddModal, setShowAddModal] = useState<boolean>(false);
//   const [stageFilter, setStageFilter] = useState<string>('ALL');
//   const [activeGuidanceTab, setActiveGuidanceTab] = useState<'ACTIONS' | 'QUESTIONS' | 'DOCS'>('ACTIONS');
//   const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

//   // Modal form state
//   const [modalStage, setModalStage] = useState<string>('PROCEDURE');
//   const [modalEventType, setModalEventType] = useState<string>('SURGICAL_PROCEDURE');
//   const [modalTitle, setModalTitle] = useState<string>('');
//   const [modalDescription, setModalDescription] = useState<string>('');
//   const [submitting, setSubmitting] = useState<boolean>(false);

//   const stages = ['ADMISSION', 'INVESTIGATION', 'PROCEDURE', 'RECOVERY', 'DISCHARGE'];
//   const currentStage = journey?.current_stage || 'PROCEDURE';
//   const stageIndex = stages.indexOf(currentStage) >= 0 ? stages.indexOf(currentStage) : 2;
//   const [focusedStage, setFocusedStage] = useState<string>(currentStage);

//   // Dynamic values
//   const patientName = patient?.display_name || 'Active Patient';
//   const hospitalName = hospital?.name || 'Empaneled Network Hospital';
//   const policyName = policy?.policy_name || 'Comprehensive Health Plan';

//   // Government Scheme detection
//   const isGovScheme =
//     policy?.scheme_type === 'GOV_PMJAY' ||
//     policy?.policy_name?.toLowerCase().includes('pm-jay') ||
//     policy?.policy_name?.toLowerCase().includes('ayushman');

//   // Stage Guidance Knowledge Base (Dynamic & Contextual)
//   const stageGuidanceMap: Record<string, {
//     title: string;
//     objective: string;
//     timeline: string;
//     rule: string;
//     proactiveTips: string[];
//     criticalPitfalls: string[];
//     documents: string[];
//     deskQuestions: string[];
//   }> = {
//     ADMISSION: {
//       title: 'Stage 1: Admission Desk & Pre-Authorization',
//       objective: 'Submit cashless pre-authorization form, lock room category to eligible tariff, and obtain initial sanction.',
//       timeline: '2 – 4 Hours from arrival',
//       rule: 'Room category must strictly match policy schedule (e.g. Single Private AC) to avoid proportionate deductions.',
//       proactiveTips: [
//         'Present physical TPA Health Card and government Photo ID at the cashless insurance desk.',
//         'Request hospital admission staff to confirm room rent tariff is strictly within your policy limit.',
//         'Obtain signed copy of initial pre-auth request form with exact estimated procedure cost.'
//       ],
//       criticalPitfalls: [
//         'Signing open-ended upgrade waivers for Deluxe or Suite rooms without knowing proportionate deduction penalty.',
//         'Not checking whether the primary treating surgeon is on the empanelled network registry.'
//       ],
//       documents: [
//         'Health Insurance E-Card & Policy Schedule',
//         'Doctor Admission Advice & Prescription',
//         'Pre-Operative Investigation Reports',
//         'Patient Government Photo ID (Aadhaar / PAN)'
//       ],
//       deskQuestions: [
//         'Is my admitted room category 100% compliant with my policy sub-limit?',
//         'What is the initial pre-authorization amount sanctioned by the TPA?',
//         'Will any surgical consumables or medical consumables be billed as non-payable?'
//       ]
//     },
//     INVESTIGATION: {
//       title: 'Stage 2: Pre-Operative Investigations & Diagnostics',
//       objective: 'Complete blood panels, radiology scans, and cardiac clearance required before surgical procedure.',
//       timeline: '4 – 8 Hours pre-surgery',
//       rule: 'All pre-operative inpatient diagnostics are payable under main hospitalization or 30-day pre-hospitalization benefits.',
//       proactiveTips: [
//         'Ensure all pathology and radiology tests are linked directly to your IP (Inpatient) number.',
//         'Retain itemized investigation slips and lab receipts for record verification.',
//         'Confirm surgeon and anaesthetist fitness clearance certificates are attached to IP file.'
//       ],
//       criticalPitfalls: [
//         'Paying out-of-pocket for routine inpatient diagnostics without adding them to the central hospital cashless bill.',
//         'Undergoing duplicate diagnostic tests if recent outpatient reports were already valid.'
//       ],
//       documents: [
//         'Complete Blood Count (CBC) & Coagulation Profile',
//         'Chest X-Ray & 12-Lead ECG Report',
//         'Cardiologist & Anaesthetist PAC Clearance Notes'
//       ],
//       deskQuestions: [
//         'Are these pre-op tests included in the cashless hospitalization pre-authorization package?',
//         'Do I need to pay any upfront deposit for specialized radiology or MRI scans?'
//       ]
//     },
//     PROCEDURE: {
//       title: 'Stage 3: Operation Theatre & Surgical Procedure',
//       objective: 'Verify surgical implant serial codes, OT consumable kits, and surgeon fee tariffs against agreed TPA schedule.',
//       timeline: 'Day of Surgery (2 – 5 Hours in OT/PACU)',
//       rule: 'Implants (stents, knee prostheses, intraocular lenses) are subject to NPPA price caps or policy specific sub-limits.',
//       proactiveTips: [
//         'Verify that implant stickers and barcode serial numbers are pasted into your hospital clinical chart.',
//         'Check that OT surgical consumable packs are billed as per agreed network empanelment rates.',
//         'Instruct hospital TPA coordinator to file for interim pre-authorization enhancement if needed.'
//       ],
//       criticalPitfalls: [
//         'Unchecked billing of non-medical disposables (gloves, PPEs, drape sheets) without itemized scrutiny.',
//         'Exceeding maximum sum insured sub-limits for specialized prosthetic implants.'
//       ],
//       documents: [
//         'OT Notes & Surgeon Operative Report',
//         'Implant Invoice & Barcode Sticker Chart',
//         'Anaesthesia Record & Recovery Chart'
//       ],
//       deskQuestions: [
//         'Has the hospital filed for pre-authorization cost enhancement for the surgery?',
//         'What is the exact brand and NPPA ceiling price for the implanted medical device?',
//         'What portion of OT disposables is classified as non-payable?'
//       ]
//     },
//     RECOVERY: {
//       title: 'Stage 4: Inpatient Ward Recovery & Medication',
//       objective: 'Monitor daily room tariffs, nursing charges, inpatient pharmacy dispensing, and doctor consultation visits.',
//       timeline: '1 – 4 Days Inpatient Stay',
//       rule: 'Daily room nursing and resident medical officer (RMO) fees are tied to room eligibility tariff rules.',
//       proactiveTips: [
//         'Review the daily interim bill sheet provided by the nursing station every morning.',
//         'Ensure prescribed medications are dispensed directly from the in-hospital cashless pharmacy.',
//         'Confirm with attending doctor expected discharge date 24 hours in advance.'
//       ],
//       criticalPitfalls: [
//         'Accumulating pharmacy charges for branded high-cost supplements that have generic hospital equivalents.',
//         'Delayed discharge request initiation leading to additional half-day room rent billing.'
//       ],
//       documents: [
//         'Daily Nursing Observation Chart',
//         'Inpatient Pharmacy Dispensation Ledger',
//         'Consulting Specialist Daily Progress Notes'
//       ],
//       deskQuestions: [
//         'Can I review the itemized interim ledger of running charges today?',
//         'Are all medications being billed through the cashless TPA desk?'
//       ]
//     },
//     DISCHARGE: {
//       title: 'Stage 5: Final Settlement, Billing & Discharge',
//       objective: 'Obtain final TPA cashless approval, audit itemized non-payables, and secure discharge summary for post-hospitalization claims.',
//       timeline: '3 – 6 Hours on Discharge Day',
//       rule: 'Preserve original pharmacy bills, discharge summary, and payment receipts for 60-day post-hospitalization claim window.',
//       proactiveTips: [
//         'Initiate discharge summary drafting early in the morning so TPA desk can transmit final bill by 11:00 AM.',
//         'Scrutinize itemized non-payable deductions at the billing counter before swiping for copay.',
//         'Request duplicate certified copies of discharge summary and diagnostic reports for tax and future claim records.'
//       ],
//       criticalPitfalls: [
//         'Leaving hospital without original itemized final bill and payment receipt.',
//         'Missing the 60-day deadline to claim post-discharge follow-up consultations and pharmacy bills.'
//       ],
//       documents: [
//         'Final Discharge Summary signed by Chief Surgeon',
//         'Itemized Final Hospital Bill with Breakdowns',
//         'TPA Final Cashless Sanction Letter',
//         'Payment Receipt for Non-Payable Consumables'
//       ],
//       deskQuestions: [
//         'What is the final cashless amount approved versus total hospital bill?',
//         'Can I have an itemized receipt explaining every rupee of out-of-pocket non-payables?',
//         'What documents do I need to submit for post-hospitalization 60-day claim reimbursement?'
//       ]
//     }
//   };

//   const activeGuidance = stageGuidanceMap[focusedStage] || stageGuidanceMap['PROCEDURE'];

//   // Handle Event Logging
//   const handleAddEvent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!journey || !modalTitle) return;

//     setSubmitting(true);
//     try {
//       await api.addJourneyEvent(journey.id, {
//         stage: modalStage,
//         event_type: modalEventType,
//         title: modalTitle,
//         description: modalDescription,
//         status: 'COMPLETED',
//         insurance_relevance: `Event logged in ${modalStage} stage. Contextual policy checks applied.`,
//         requires_verification: true
//       });
//       setShowAddModal(false);
//       setModalTitle('');
//       setModalDescription('');
//       onEventAdded();
//     } catch (err) {
//       console.error('Failed to add journey event:', err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleCopyQuestions = () => {
//     if (!activeGuidance?.deskQuestions) return;
//     const text = `CareIQ — Questions for ${activeGuidance.title}:\n\n` +
//       activeGuidance.deskQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
//     navigator.clipboard.writeText(text);
//     setCopiedQuestions(true);
//     setTimeout(() => setCopiedQuestions(false), 2500);
//   };

//   const filteredEvents = (journey?.events || []).filter((evt: any) => {
//     if (stageFilter === 'ALL') return true;
//     return evt.stage === stageFilter;
//   });

//   if (!journey) {
//     return (
//       <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs max-w-2xl mx-auto my-12">
//         <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl w-fit mx-auto mb-3">
//           <Sparkles size={36} />
//         </div>
//         <h3 className="text-lg font-bold text-slate-900">No active care trajectory found</h3>
//         <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
//           Start your care journey by selecting an in-network hospital from the hospital matcher or launching a persona scenario.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-360 mx-auto pb-12 animate-fade-in">

//       {/* 🌟 1. Executive Care Journey Header & Stepper Card */}
//       <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">

//         {/* Top Identity & Action Row */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">

//           {/* Patient Context */}
//           <div className="flex items-center gap-3.5">
//             <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-teal-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20 shrink-0">
//               <User size={22} className="text-white" />
//             </div>
//             <div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase tracking-wider">
//                   Care Trajectory Engine
//                 </span>
//                 <span className="text-xs font-semibold text-slate-500">
//                   {patientName}
//                 </span>
//               </div>
//               <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
//                 Hospital Care Journey & Policy Milestones
//               </h1>
//               <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1 flex-wrap">
//                 <span className="text-slate-800 font-semibold flex items-center gap-1">
//                   <Building2 size={13} className="text-teal-600" />
//                   {hospitalName}
//                 </span>
//                 <span>•</span>
//                 <span className="text-slate-700 flex items-center gap-1">
//                   <ShieldCheck size={13} className="text-indigo-600" />
//                   {policyName}
//                 </span>
//                 <span>•</span>
//                 <span className="text-teal-700 font-bold">
//                   {isGovScheme ? 'PM-JAY Cashless Package' : 'Empaneled TPA Cashless'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Action Trigger Button */}
//           <div className="flex items-center gap-2.5 shrink-0">
//             <button
//               type="button"
//               onClick={() => setShowAddModal(true)}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
//             >
//               <Plus size={16} />
//               <span>Log Journey Event</span>
//             </button>
//           </div>

//         </div>

//         {/* 5-Stage Interactive Progress Stepper */}
//         <div className="mt-6">
//           <div className="flex items-center justify-between mb-3 px-1">
//             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
//               Interactive Care Trajectory Map (Click stage to view protocol)
//             </span>
//             <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
//               Active Stage: {currentStage}
//             </span>
//           </div>

//           <div className="flex items-center justify-between relative mt-2 pt-2">
//             <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 z-1 rounded-full" />
//             <div
//               className="absolute top-5 left-6 h-1 bg-teal-600 z-2 transition-all duration-500 rounded-full"
//               style={{ width: `${Math.max(0, (stageIndex / (stages.length - 1)) * 92)}%` }}
//             />

//             {stages.map((stageName, idx) => {
//               const isCompleted = idx < stageIndex;
//               const isCurrent = idx === stageIndex;
//               const isFocused = focusedStage === stageName;

//               return (
//                 <button
//                   key={stageName}
//                   type="button"
//                   onClick={() => setFocusedStage(stageName)}
//                   className="flex flex-col items-center relative z-3 cursor-pointer group transition-all"
//                   title={`Click to view ${stageName} guidance`}
//                 >
//                   <div
//                     className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isFocused
//                         ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 scale-110 shadow-md'
//                         : isCurrent
//                           ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 scale-105 shadow-sm'
//                           : isCompleted
//                             ? 'bg-teal-600 text-white'
//                             : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-400'
//                       }`}
//                   >
//                     {isCompleted ? <CheckCircle2 size={19} /> : idx + 1}
//                   </div>
//                   <span
//                     className={`text-xs mt-2 capitalize transition-colors ${isFocused
//                         ? 'font-black text-indigo-700 underline underline-offset-4'
//                         : isCurrent
//                           ? 'font-extrabold text-slate-900'
//                           : 'font-medium text-slate-500 group-hover:text-slate-800'
//                       }`}
//                   >
//                     {stageName.toLowerCase()}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//       </div>

//       {/* 🌟 2. Two-Column Structured Responsive Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

//         {/* Left Column (7 Cols): Visual Timeline Feed & Delta Summary */}
//         <div className="lg:col-span-7 space-y-5">

//           {/* Section 53 Real-Time Differential Banner */}
//           <div className="bg-linear-to-r from-indigo-50/80 via-white to-teal-50/60 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-2">
//                 <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
//                   <Sparkles size={15} />
//                 </span>
//                 <div>
//                   <h3 className="text-xs sm:text-sm font-bold text-slate-900">
//                     Real-Time Policy & Exposure Signals
//                   </h3>
//                   <p className="text-[11px] text-slate-500">
//                     Calculated against latest clinical updates and hospital tariff items.
//                   </p>
//                 </div>
//               </div>
//               <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
//                 Live Differential
//               </span>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//               <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Stage</span>
//                 <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
//                   <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-black">
//                     {currentStage}
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pre-Auth Status</span>
//                 <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
//                   <Clock size={12} />
//                   <span>Initial Sanctioned</span>
//                 </div>
//               </div>

//               <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Est. Non-Payable</span>
//                 <div className="text-xs font-black text-slate-900 flex items-center justify-between">
//                   <span>₹14,000</span>
//                   <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Standard</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Event Stream & Timeline Header */}
//           <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">

//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
//               <div>
//                 <h3 className="text-base font-bold text-slate-900 tracking-tight">
//                   Journey Event Timeline ({filteredEvents.length})
//                 </h3>
//                 <p className="text-xs text-slate-400 font-medium mt-0.5">
//                   Verified clinical steps with grounded insurance coverage impact.
//                 </p>
//               </div>

//               {/* Filter Pills */}
//               <div className="flex items-center gap-1.5 flex-wrap">
//                 <button
//                   type="button"
//                   onClick={() => setStageFilter('ALL')}
//                   className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${stageFilter === 'ALL'
//                       ? 'bg-teal-700 text-white shadow-2xs'
//                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
//                     }`}
//                 >
//                   All
//                 </button>
//                 {stages.map((st) => (
//                   <button
//                     key={st}
//                     type="button"
//                     onClick={() => setStageFilter(st)}
//                     className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${stageFilter === st
//                         ? 'bg-teal-700 text-white shadow-2xs'
//                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
//                       }`}
//                   >
//                     {st.toLowerCase()}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Vertical Connected Timeline Feed */}
//             {filteredEvents.length === 0 ? (
//               <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl">
//                 <Clock size={28} className="text-slate-400 mx-auto mb-2" />
//                 <h4 className="text-xs font-bold text-slate-800">No events recorded for this stage yet</h4>
//                 <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
//                   Log clinical activities, diagnostic tests, or admission notes as they occur.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setModalStage(stageFilter !== 'ALL' ? stageFilter : 'PROCEDURE');
//                     setShowAddModal(true);
//                   }}
//                   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-2xs cursor-pointer"
//                 >
//                   <Plus size={13} />
//                   <span>Log Event for {stageFilter}</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-200/80">
//                 {filteredEvents.map((evt: any, idx: number) => {
//                   const isLatest = idx === filteredEvents.length - 1;

//                   return (
//                     <div key={evt.id} className="relative group">

//                       {/* Timeline Node Icon */}
//                       <span className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${isLatest ? 'bg-teal-600 ring-2 ring-teal-400/40' : 'bg-teal-500'
//                         }`}>
//                         <span className="w-1.5 h-1.5 rounded-full bg-white" />
//                       </span>

//                       {/* Event Card */}
//                       <div className={`border rounded-2xl p-4.5 sm:p-5 transition-all shadow-xs ${isLatest
//                           ? 'bg-teal-50/40 border-teal-200/90 hover:border-teal-300'
//                           : 'bg-white border-slate-200/80 hover:border-slate-300'
//                         }`}>

//                         {/* Event Card Header */}
//                         <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
//                               {evt.stage}
//                             </span>
//                             <h4 className="text-sm sm:text-base font-bold text-slate-900">
//                               {evt.title}
//                             </h4>
//                           </div>

//                           <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
//                             <Clock size={11} />
//                             {evt.occurred_at
//                               ? new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//                               : '10:15 AM'}
//                           </span>
//                         </div>

//                         {/* Description */}
//                         <p className="text-xs text-slate-600 leading-relaxed mb-3">
//                           {evt.description}
//                         </p>

//                         {/* Insurance Relevance Callout */}
//                         {evt.insurance_relevance && (
//                           <div className="p-3 bg-white/90 border border-teal-200/70 rounded-xl shadow-2xs">
//                             <div className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5 mb-0.5">
//                               <Sparkles size={12} className="text-teal-600 shrink-0" />
//                               <span>Policy & Cashless Coverage Implication</span>
//                             </div>
//                             <p className="text-[11px] text-slate-600 leading-relaxed">
//                               {evt.insurance_relevance}
//                             </p>
//                           </div>
//                         )}

//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//           </div>

//         </div>

//         {/* Right Column (5 Cols): Stage Intelligence & Guidance Cockpit */}
//         <div className="lg:col-span-5 space-y-5">

//           {/* Active Stage Guidance Panel */}
//           <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">

//             {/* Header */}
//             <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-2">
//               <div>
//                 <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">
//                   Stage Intelligence Cockpit
//                 </span>
//                 <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
//                   {activeGuidance.title}
//                 </h3>
//               </div>
//               <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
//                 Protocol Active
//               </span>
//             </div>

//             {/* Objective Banner */}
//             <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs space-y-2">
//               <p className="text-slate-700 font-medium leading-relaxed">
//                 {activeGuidance.objective}
//               </p>
//               <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
//                 <span className="flex items-center gap-1 font-semibold text-teal-800">
//                   <Clock size={12} /> {activeGuidance.timeline}
//                 </span>
//               </div>
//             </div>

//             {/* Navigation Tabs for Right Cockpit */}
//             <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs">
//               <button
//                 type="button"
//                 onClick={() => setActiveGuidanceTab('ACTIONS')}
//                 className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${activeGuidanceTab === 'ACTIONS'
//                     ? 'bg-white text-slate-900 shadow-2xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                   }`}
//               >
//                 Actions & Traps
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActiveGuidanceTab('QUESTIONS')}
//                 className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${activeGuidanceTab === 'QUESTIONS'
//                     ? 'bg-white text-slate-900 shadow-2xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                   }`}
//               >
//                 Ask Staff
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setActiveGuidanceTab('DOCS')}
//                 className={`py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${activeGuidanceTab === 'DOCS'
//                     ? 'bg-white text-slate-900 shadow-2xs'
//                     : 'text-slate-600 hover:text-slate-900'
//                   }`}
//               >
//                 Documents
//               </button>
//             </div>

//             {/* Tab 1: Proactive Actions & Common Traps */}
//             {activeGuidanceTab === 'ACTIONS' && (
//               <div className="space-y-3 animate-fade-in">
//                 {/* Actions */}
//                 <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
//                   <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
//                     <CheckCircle2 size={14} className="text-emerald-600" />
//                     Proactive Action Checklist
//                   </h4>
//                   <ul className="space-y-1.5 text-xs text-emerald-950">
//                     {activeGuidance.proactiveTips.map((tip, idx) => (
//                       <li key={idx} className="flex items-start gap-1.5">
//                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
//                         <span className="leading-relaxed">{tip}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 {/* Pitfalls */}
//                 <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-2xl space-y-2">
//                   <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
//                     <AlertTriangle size={14} className="text-rose-600" />
//                     Traps & Pitfalls to Avoid
//                   </h4>
//                   <ul className="space-y-1.5 text-xs text-rose-950">
//                     {activeGuidance.criticalPitfalls.map((pitfall, idx) => (
//                       <li key={idx} className="flex items-start gap-1.5">
//                         <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
//                         <span className="leading-relaxed">{pitfall}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             )}

//             {/* Tab 2: Billing & Desk Questions */}
//             {activeGuidanceTab === 'QUESTIONS' && (
//               <div className="space-y-2.5 animate-fade-in">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-bold text-slate-700">Recommended Questions</span>
//                   <button
//                     type="button"
//                     onClick={handleCopyQuestions}
//                     className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
//                   >
//                     {copiedQuestions ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
//                     <span>{copiedQuestions ? 'Copied' : 'Copy All'}</span>
//                   </button>
//                 </div>

//                 <div className="space-y-2">
//                   {activeGuidance.deskQuestions.map((q, idx) => (
//                     <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-800 leading-relaxed shadow-2xs">
//                       <strong className="text-indigo-700 mr-1">Q{idx + 1}:</strong>
//                       {q}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Tab 3: Required Stage Documents */}
//             {activeGuidanceTab === 'DOCS' && (
//               <div className="space-y-2 animate-fade-in">
//                 <span className="text-xs font-bold text-slate-700 block mb-1">
//                   Required Records & Certificates
//                 </span>
//                 <div className="space-y-1.5">
//                   {activeGuidance.documents.map((doc, idx) => (
//                     <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-800 font-medium">
//                       <FileText size={14} className="text-teal-600 shrink-0" />
//                       <span>{doc}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           </div>

//           {/* Quick Help Card */}
//           <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm space-y-3">
//             <div className="flex items-center gap-2.5">
//               <div className="p-2 bg-white/15 rounded-xl">
//                 <HelpCircle size={18} className="text-teal-300" />
//               </div>
//               <div>
//                 <h4 className="text-xs font-bold">Unsure about a medical bill item?</h4>
//                 <p className="text-[11px] text-slate-300 mt-0.5">
//                   Ask our AI Copilot about room penalties or non-payable items anytime.
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => context.setIsChatbotOpen(true)}
//               className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
//             >
//               Open Policy AI Copilot →
//             </button>
//           </div>

//         </div>

//       </div>

//       {/* 🌟 3. Log Event Modal */}
//       {showAddModal && (
//         <div
//           className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
//           onClick={() => setShowAddModal(false)}
//         >
//           <div
//             className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-fade-in"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
//               <div className="flex items-center gap-2">
//                 <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
//                   <Plus size={18} />
//                 </div>
//                 <h3 className="text-lg font-black text-slate-900">
//                   Log Care Journey Event
//                 </h3>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowAddModal(false)}
//                 className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <form onSubmit={handleAddEvent} className="flex flex-col gap-3.5">

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   Journey Stage
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
//                   value={modalStage}
//                   onChange={(e) => setModalStage(e.target.value)}
//                 >
//                   <option value="ADMISSION">Stage 1: Admission Desk</option>
//                   <option value="INVESTIGATION">Stage 2: Diagnostic Investigation / Lab</option>
//                   <option value="PROCEDURE">Stage 3: Procedure / Operation Theatre</option>
//                   <option value="RECOVERY">Stage 4: Post-Op Recovery / Inpatient Ward</option>
//                   <option value="DISCHARGE">Stage 5: Discharge & Billing Desk</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   Event Type
//                 </label>
//                 <select
//                   className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
//                   value={modalEventType}
//                   onChange={(e) => setModalEventType(e.target.value)}
//                 >
//                   <option value="SURGICAL_PROCEDURE">Surgical / Medical Procedure</option>
//                   <option value="ROOM_CHANGE">Room Category Change / Upgrade</option>
//                   <option value="DIAGNOSTIC_TEST">Diagnostic Lab / Imaging</option>
//                   <option value="PREAUTH_UPDATE">Preauthorization Status Update</option>
//                   <option value="DISCHARGE_SUMMARY">Discharge File / Billing</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   Event Title
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
//                   placeholder="e.g. Unilateral Knee Arthroplasty (Surgery Completed)"
//                   value={modalTitle}
//                   onChange={(e) => setModalTitle(e.target.value)}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-700 mb-1">
//                   Event Details / Notes
//                 </label>
//                 <textarea
//                   className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
//                   rows={3}
//                   placeholder="Describe what occurred (e.g. Patient transferred from OT 3 to PACU; implant verified)..."
//                   value={modalDescription}
//                   onChange={(e) => setModalDescription(e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
//                 >
//                   {submitting ? 'Recording...' : 'Record Event & Apply Checks'}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default CareJourneyView;
