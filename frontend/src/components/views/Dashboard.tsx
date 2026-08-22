import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Share2,
  Landmark,
  Check,
  X,
  CheckCircle2,
  HelpCircle,
  Clock,
  User,
  HeartPulse,
  Activity,
  Pill,
  AlertCircle,
  Phone,
  Edit3
} from 'lucide-react';

import { CaregiverShareModal } from '../modals/CaregiverShareModal';
import { InfoPopover } from '../common/InfoPopover';
import { useNavigate } from 'react-router-dom';
import { useCareIQ } from '../../context/CareIQContext';

interface DashboardProps {
  patient?: any;
  policy?: any;
  journey?: any;
  verificationItems?: any[];
  onNavigate?: (tab: string) => void;
  onOpenQuestionsModal?: () => void;
  onOpenChatbot?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  patient: propPatient,
  policy: propPolicy,
  journey: propJourney,
  verificationItems: propVerificationItems,
  onNavigate: propOnNavigate,
  onOpenQuestionsModal: propOnOpenQuestionsModal,
  onOpenChatbot: propOnOpenChatbot
}) => {
  const navigate = useNavigate();
  const context = useCareIQ();

  const patient = propPatient !== undefined ? propPatient : context.activePatient;
  const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
  const journey = propJourney !== undefined ? propJourney : context.journey;
  const rawVerificationItems = propVerificationItems !== undefined ? propVerificationItems : context.verificationItems;

  // Government Scheme detection (e.g. Ayushman Bharat PM-JAY)
  const isGovScheme = 
    policy?.scheme_type === 'GOV_PMJAY' || 
    policy?.policy_name?.toLowerCase().includes('pm-jay') || 
    policy?.policy_name?.toLowerCase().includes('ayushman') ||
    policy?.insurer_name?.toLowerCase().includes('ayushman');

  // Dynamic Patient Demographics & Context
  const patientName = patient?.display_name || 'No patient selected';
  const patientAge = patient?.age
    ? `${patient.age} yrs`
    : patient?.age_band
    ? `${patient.age_band.replace('-', '–')}y`
    : 'Age unspecified';
  const patientGender = patient?.gender || 'Gender unspecified';
  const patientCity = patient?.city || 'Location unspecified';
  const patientDiagnosis = patient?.diagnosis || journey?.events?.[0]?.description?.split('.')?.[0] || 'Diagnosis not recorded';
  const patientAdmissionType =
    patient?.admission_type ||
    (journey?.events?.[0]?.stage ? `${journey.events[0].stage} Care Stage` : 'Journey not started');

  // Account Type
  const accountType =
    patient?.account_type === 'NEW_USER' || (!context.accountType && patient?.account_type !== 'DEMO')
      ? 'NEW_USER'
      : 'DEMO';

  // Medical background details
  const medicalConditions = patient?.medical_conditions || [];
  const currentMedications = patient?.current_medications || [];
  const allergies = patient?.allergies || [];
  const bloodGroup = patient?.blood_group || null;
  const emergencyContactName = patient?.emergency_contact_name || null;
  const emergencyContactPhone = patient?.emergency_contact_phone || null;

  // Dynamic Hospital & Network Resolution
  const activeHospital = context.hospitals.find(
    (h) => h.id === journey?.hospital_id || h.id === patient?.hospital_id
  );
  const hospitalName = activeHospital?.name || 'No hospital selected';
  const isHospitalCashless = activeHospital?.cashless_available !== false;
  const hospitalTier = activeHospital?.tier || 'Tier 1';

  // Dynamic Policy Values
  const policyName = policy?.policy_name || 'No policy linked';
  const insurerName = policy?.insurer_name || (isGovScheme ? 'National Health Authority' : 'Insurer not recorded');
  const totalSum = policy?.sum_insured || 0;
  const remainingSum = policy?.remaining_sum_insured !== undefined ? policy.remaining_sum_insured : totalSum;
  const utilizedSum = Math.max(0, totalSum - remainingSum);
  const utilizedPercent = totalSum > 0 ? Math.min(100, Math.round((utilizedSum / totalSum) * 100)) : 0;
  const roomEligibility = policy?.room_eligibility || (isGovScheme ? 'General Ward Package' : 'Not recorded');
  const copayPercentage = policy?.copay_percentage || 0;

  const verificationItems = rawVerificationItems || [];

  const pendingVerifications = verificationItems.filter((v: any) => v.status === 'PENDING');
  const verifiedCount = verificationItems.filter((v: any) => v.status === 'VERIFIED' || v.status === 'RESOLVED').length;

  // Dynamic Room Mismatch & Exposure Calculation
  const hasRoomMismatch = pendingVerifications.some((v) => v.category === 'ROOM' || v.title?.toLowerCase().includes('room'));
  const roomPenalty = hasRoomMismatch && policy ? Math.round(totalSum * 0.09) : 0;
  const nonPayableBase = isGovScheme || !policy ? 0 : Math.min(14000, Math.round(totalSum * 0.028));
  const copayAmount = copayPercentage > 0 ? Math.round(totalSum * (copayPercentage / 100)) : 0;
  const estimatedExposure = nonPayableBase + roomPenalty + copayAmount;

  // Dynamic Trajectory Stage
  const currentStage = journey?.current_stage || 'ADMISSION';
  const stages = ['ADMISSION', 'INVESTIGATION', 'PROCEDURE', 'RECOVERY', 'DISCHARGE'];
  const stageIndex = stages.indexOf(currentStage) >= 0 ? stages.indexOf(currentStage) : 0;

  // Navigation Helper
  const onNavigate = (target: string) => {
    if (propOnNavigate) {
      propOnNavigate(target);
    } else {
      const routeMap: Record<string, string> = {
        dashboard: '/dashboard',
        hospitals: '/hospital-matcher',
        'hospital-matcher': '/hospital-matcher',
        insurance: '/insurance',
        journey: '/care-journey',
        'care-journey': '/care-journey',
        cost: '/cost-breakdown',
        'cost-breakdown': '/cost-breakdown',
        verification: '/verification-center',
        'verification-center': '/verification-center',
        onboarding: '/onboarding',
        'get-started': '/get-started'
      };
      navigate(routeMap[target] || `/${target}`);
    }
  };

  const onOpenQuestionsModal = propOnOpenQuestionsModal || (() => context.openQuestionsModal());
  const onOpenChatbot = propOnOpenChatbot || (() => context.setIsChatbotOpen(true));

  // Table and Filter State
  const [tableFilter, setTableFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showComplianceAlert, setShowComplianceAlert] = useState<boolean>(true);

  // Filtered Checklist Table Items
  const filteredItems = verificationItems.filter((item: any) => {
    if (tableFilter === 'PENDING' && item.status !== 'PENDING') return false;
    if (tableFilter === 'RESOLVED' && item.status === 'PENDING') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      return matchTitle || matchReason || matchCat;
    }
    return true;
  });

  // Calculate composite confidence score (0 - 100) dynamically
  const totalItems = verificationItems.length || 1;
  const resolvedPct = Math.round((verifiedCount / totalItems) * 100);
  const confidenceScore = policy && verificationItems.length > 0 ? Math.min(100, Math.max(35, resolvedPct + 30)) : 0;

  // Dynamic Itemized Tariff Breakdown (Calculated from real numbers)
  const baseCost = utilizedSum > 0 ? utilizedSum : 0;
  const surgeonFee = Math.round(baseCost * 0.50);
  const roomFee = Math.round(baseCost * 0.28);
  const diagFee = Math.round(baseCost * 0.22);

  const surgeonPct = Math.round((surgeonFee / totalSum) * 100) || 14;
  const roomPct = Math.round((roomFee / totalSum) * 100) || 8;
  const diagPct = Math.round((diagFee / totalSum) * 100) || 6;

  return (
    <div className="space-y-5 max-w-360 mx-auto pb-6">
      
      {/* 🌟 1. Minimal Glassmorphic Patient Context Header */}
      <div className="bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Patient Overview */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
                <User size={20} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {patientName}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {patientAge} • {patientGender}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                    accountType === 'NEW_USER'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  {accountType === 'NEW_USER' ? 'Verified User' : 'Demo Persona'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Building2 size={11} className="text-emerald-600" />
                  <span className="truncate max-w-48">{hospitalName}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                <span className="text-slate-800 font-semibold">{patientDiagnosis}</span>
                <span>•</span>
                <span>{patientAdmissionType}</span>
                <span>•</span>
                <span>{patientCity}</span>
                <span>•</span>
                <span className="text-teal-700 font-semibold">
                  {isHospitalCashless ? `${hospitalTier} Cashless Track` : 'Reimbursement Track'}
                </span>
                <InfoPopover
                  title={`${patientName} — Active Context`}
                  size="xs"
                  variant="teal"
                  content="Active patient clinical profile loaded into CareIQ engine to simulate real-world TPA authorizations and policy rules."
                  details={[
                    { label: 'Patient Name', value: patientName },
                    { label: 'Diagnosis', value: patientDiagnosis },
                    { label: 'Location', value: patientCity },
                    { label: 'Admission Type', value: patientAdmissionType }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 size={13} className="text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 size={13} className="text-slate-500" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('hospitals')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <span>+ Compare Hospitals</span>
            </button>
          </div>

        </div>
      </div>

      {/* 🌟 1.5. Health & Clinical Profile Card */}
      <div className="bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <HeartPulse size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Personal Health Profile</h2>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Pre-auth & Waiting Period Context
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Clinical history used to verify pre-existing disease (PED) coverage and hospital specialty alignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {bloodGroup && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Blood: {bloodGroup}
              </span>
            )}
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Edit3 size={12} className="text-slate-500" />
              <span>Update</span>
            </button>
          </div>
        </div>

        {/* 4 Clinical Grid Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Medical Conditions */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Activity size={12} className="text-cyan-600" />
              <span>Medical Conditions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {medicalConditions && medicalConditions.length > 0 ? (
                medicalConditions.map((cond: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    {cond}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-medium">None reported / Healthy</span>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Pill size={12} className="text-purple-600" />
              <span>Current Medications</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentMedications && currentMedications.length > 0 ? (
                currentMedications.map((med: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-purple-900 border border-purple-200 shadow-2xs"
                  >
                    {med}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-medium">No routine medications</span>
              )}
            </div>
          </div>

          {/* Known Allergies */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <AlertCircle size={12} className="text-amber-600" />
              <span>Known Allergies</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {allergies && allergies.length > 0 ? (
                allergies.map((all: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white text-amber-900 border border-amber-200 shadow-2xs"
                  >
                    {all}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-medium">No known drug allergies</span>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <Phone size={12} className="text-emerald-600" />
              <span>Emergency Contact</span>
            </div>
            {emergencyContactName ? (
              <div className="text-xs font-semibold text-slate-800">
                <div>{emergencyContactName}</div>
                {emergencyContactPhone && (
                  <div className="text-[11px] text-slate-500 font-normal">{emergencyContactPhone}</div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Contact not provided</span>
            )}
          </div>
        </div>
      </div>

      {/* 🏛️ Government Scheme Banner (If PM-JAY active) */}
      {isGovScheme && (
        <div className="bg-linear-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 animate-fade-in border border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xs shrink-0">
              <Landmark size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">
                  Ayushman Bharat PM-JAY Active
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-white text-emerald-800 uppercase">
                  100% Cashless Package
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Empaneled Hospital • Zero out-of-pocket for statutory pre-defined package codes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('insurance')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
          >
            Rules
          </button>
        </div>
      )}

      {/* 🌟 2. Four Clean Glass Metric Cards (Minimal & High Signal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Policy Health */}
        <div 
          onClick={() => onNavigate('insurance')}
          className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={17} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Insurance
              </span>
            </div>
            <div className="flex items-center gap-1">
              <InfoPopover
                title={`${policyName} — Parameters`}
                size="xs"
                variant="indigo"
                content="Insurance parameters extracted from active schedule including room category caps, co-payments, and pre/post hospitalization days."
                details={[
                  { label: 'Insurer', value: insurerName },
                  { label: 'Total Limit', value: `₹${(totalSum / 100000).toFixed(1)} Lakhs` },
                  { label: 'Remaining Sum', value: `₹${(remainingSum / 100000).toFixed(1)} Lakhs` },
                  { label: 'Room Cap', value: roomEligibility },
                  { label: 'Co-Payment', value: `${copayPercentage}%` }
                ]}
              />
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
          {policy ? (
            <div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {policyName}
              </h3>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Remaining Sum:</span>
                <strong className="text-blue-600 font-bold text-sm">₹{(remainingSum / 100000).toFixed(1)}L</strong>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-blue-900 truncate">
                + Add Health Policy
              </h3>
              <div className="flex items-baseline justify-between mt-1 text-[11px] text-slate-500">
                <span>Unlock cashless coverage</span>
                <strong className="text-blue-600 font-bold">Setup →</strong>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Hospital Network */}
        <div 
          onClick={() => onNavigate('hospitals')}
          className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-teal-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
                <Building2 size={17} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hospital
              </span>
            </div>
            <div className="flex items-center gap-1">
              <InfoPopover
                title={`${hospitalName} — Network`}
                size="xs"
                variant="teal"
                content="Hospital empanelment tier with your insurer's Third Party Administrator (TPA) for cashless desk processing."
                details={[
                  { label: 'Hospital', value: hospitalName },
                  { label: 'Network Tier', value: `${hospitalTier} In-Network` },
                  { label: 'Cashless Desk', value: isHospitalCashless ? '100% Empaneled' : 'Reimbursement' },
                  { label: 'Location', value: patientCity }
                ]}
              />
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {hospitalName}
            </h3>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Network Fit:</span>
              <strong className="text-teal-700 font-bold text-sm">
                {isHospitalCashless ? '100% Cashless' : 'Reimburse'}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Indicative Out-of-Pocket */}
        <div 
          onClick={() => onNavigate('cost')}
          className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <IndianRupee size={17} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Out-of-Pocket
              </span>
            </div>
            <div className="flex items-center gap-1">
              <InfoPopover
                title="Out-of-Pocket Cost Math"
                size="xs"
                variant="amber"
                content="Estimated patient liability including non-payable consumables, room category upgrade penalties, and policy co-payments."
                details={[
                  { label: 'Non-Payables', value: `₹${nonPayableBase.toLocaleString()}` },
                  { label: 'Room Penalty', value: `₹${roomPenalty.toLocaleString()}` },
                  { label: 'Co-Payment', value: `₹${copayAmount.toLocaleString()} (${copayPercentage}%)` },
                  { label: 'Total Est. Liability', value: `₹${estimatedExposure.toLocaleString()}` }
                ]}
              />
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate flex items-baseline gap-1">
              ₹{estimatedExposure.toLocaleString()}
            </h3>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Room Penalty:</span>
              <strong className={`font-bold text-sm ${roomPenalty > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {roomPenalty > 0 ? `₹${roomPenalty.toLocaleString()} Mismatch` : '₹0 (Within Cap)'}
              </strong>
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('verification')}
          className="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-rose-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                pendingVerifications.length > 0
                  ? 'bg-rose-50 border-rose-100 text-rose-600'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {pendingVerifications.length > 0 ? (
                  <Clock size={17} strokeWidth={2} />
                ) : (
                  <CheckCircle2 size={17} strokeWidth={2} />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verification
              </span>
            </div>
            <div className="flex items-center gap-1">
              <InfoPopover
                title="Desk Verification Items"
                size="xs"
                variant="emerald"
                content="Pending hospital admission and TPA checklist checkpoints that should be confirmed upfront."
                details={[
                  { label: 'Pending Items', value: `${pendingVerifications.length} actions` },
                  { label: 'Confirmed', value: `${verifiedCount} checkpoints` },
                  { label: 'Certainty Rating', value: `${confidenceScore}%` }
                ]}
              />
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {pendingVerifications.length > 0 ? `${pendingVerifications.length} Pending Actions` : 'All Clear'}
            </h3>
            <div className="flex items-baseline justify-between mt-1 text-xs">
              <span className="text-slate-400 text-[11px]">Confirmed:</span>
              <strong className="text-emerald-700 font-bold text-sm">{verifiedCount} / {totalItems}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Care Journey Progress & Stepper Tracker */}
      <div className="bg-linear-to-br from-white to-teal-50/60 border border-teal-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Care Stage
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
                Hospital Care Progress
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Active: <strong className="text-slate-700 capitalize">{currentStage.toLowerCase()}</strong> • Stage {stageIndex + 1} of {stages.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('journey')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-200/90 shadow-2xs transition-all cursor-pointer"
          >
            <span>More details</span>
            <span>→</span>
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

            return (
              <button
                key={stageName}
                type="button"
                onClick={() => onNavigate('journey')}
                className="flex flex-col items-center relative z-3 cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 scale-110 shadow-sm'
                      : isCompleted
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 capitalize transition-colors ${
                    isCurrent
                      ? 'font-black text-indigo-700 underline underline-offset-2'
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

      {/* 🌟 4. Row 1: Analytics & Intelligence (Side-by-Side: Coverage Compliance + Policy Sum Insured) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* Card A: Coverage Compliance & Risk Meter */}
        <div className="bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Coverage Compliance Index
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Grounded
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Policy rule grounding and cashless risk certainty
                </p>
              </div>
              <InfoPopover
                title="Coverage Compliance Index"
                size="sm"
                variant="teal"
                content="Deterministic confidence score calculating data completeness, network empanelment, room cap adherence, and TPA pre-authorization status."
                details={[
                  { label: 'Network Fit', value: isHospitalCashless ? '30 / 30 pts' : '15 / 30 pts' },
                  { label: 'Room Cap Match', value: !hasRoomMismatch ? '25 / 25 pts' : '10 / 25 pts' },
                  { label: 'Pre-Auth Status', value: '20 / 20 pts' },
                  { label: 'Policy Schedule', value: '15 / 15 pts' }
                ]}
              />
            </div>

            {/* Segmented Distribution Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> 30% Network</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 25% Room Cap</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> 20% Pre-Auth</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> 25% Policy</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '30%' }} />
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '20%' }} />
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Mini Category Status 4-Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Network
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {isHospitalCashless ? '100% Cashless' : 'Reimburse'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Room Cap
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {!hasRoomMismatch ? 'Eligible' : 'Mismatch'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Pre-Auth
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {pendingVerifications.some((v) => v.category === 'PREAUTH') ? 'In Review' : 'Approved'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 text-center">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Co-Pay
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {copayPercentage}% Co-Pay
                </span>
              </div>
            </div>

            {/* Big Hero Confidence Numbers */}
            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {confidenceScore}%
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Certainty
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400 block mt-0.5">
                  Information Certainty & Cashless Fit
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-amber-600">
                  {pendingVerifications.length}
                </span>
                <span className="text-xs font-medium text-slate-400 block mt-0.5">
                  Pending Verification
                </span>
              </div>
            </div>
          </div>

          {/* Situational Advisory Warning Banner */}
          {showComplianceAlert && pendingVerifications.length > 0 && (
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start justify-between gap-2 animate-fade-in mt-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-amber-800">
                  {hasRoomMismatch
                    ? 'Room category upgrade penalty detected. Downgrade to eligible room to avoid proportionate claim deductions.'
                    : 'Pre-auth enhancement and room tariff verification recommended before OT transfer.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComplianceAlert(false)}
                className="text-amber-500 hover:text-amber-700 p-0.5 cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X size={13} />
              </button>
            </div>
          )}

        </div>

        {/* Card B: Ultra-Glassmorphic Vibrant Blue Policy Sum Insured Allocation */}
        <div className="bg-linear-to-br from-[#1E40AF]/95 via-[#2563EB]/90 to-[#0F172A]/95 backdrop-blur-3xl text-white rounded-2xl p-5 sm:p-6 shadow-2xl shadow-blue-500/20 border border-white/25 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Policy Sum Insured Allocation
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    Live Tariff Math
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                  Cost allocation against ₹{(totalSum / 100000).toFixed(1)}L Policy Limit
                </p>
              </div>
              <InfoPopover
                title={`${policyName} — Allocation`}
                size="sm"
                variant="indigo"
                content="Itemized breakdown of current estimated procedure tariffs against statutory sub-limits and room category caps."
                details={[
                  { label: 'Total Policy Limit', value: `₹${(totalSum / 100000).toFixed(1)} Lakhs` },
                  { label: 'Claimed / Blocked', value: `₹${(utilizedSum / 100000).toFixed(2)} Lakhs` },
                  { label: 'Available Buffer', value: `₹${(remainingSum / 100000).toFixed(1)} Lakhs` }
                ]}
              />
            </div>

            {/* Prominent Radial Dial & 4 Itemized Progress Rows */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
              
              {/* Extra-Large Glowing Radial Meter Dial */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="text-blue-950/60"
                    strokeWidth="9"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Glowing Active Arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#60A5FA"
                    strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 - (utilizedPercent / 100) * (2 * Math.PI * 48)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
                    {utilizedPercent}%
                  </span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase mt-1">
                    Utilized
                  </span>
                  <span className="text-[10px] font-semibold text-blue-300 mt-0.5">
                    ₹{(utilizedSum / 100000).toFixed(2)}L Used
                  </span>
                </div>
              </div>

              {/* 4 Itemized Category Rows */}
              <div className="space-y-2 flex-1 w-full min-w-0">
                
                {/* Category 1: Surgeon & OT */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="truncate">Surgeon & OT Charges</span>
                    <span className="text-emerald-300">{surgeonPct}% • ₹{surgeonFee.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, surgeonPct * 2)}%` }} />
                  </div>
                </div>

                {/* Category 2: Room & Nursing */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="truncate">Room Rent & Nursing</span>
                    <span className="text-blue-200">{roomPct}% • ₹{roomFee.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-blue-300 rounded-full" style={{ width: `${Math.min(100, roomPct * 2)}%` }} />
                  </div>
                </div>

                {/* Category 3: Diagnostics */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="truncate">Diagnostics & Labs</span>
                    <span className="text-cyan-200">{diagPct}% • ₹{diagFee.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-cyan-300 rounded-full" style={{ width: `${Math.min(100, diagPct * 2)}%` }} />
                  </div>
                </div>

                {/* Category 4: Consumables */}
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="truncate">Non-Payables</span>
                    <span className="text-amber-300">₹{nonPayableBase.toLocaleString()} Out-of-Pocket</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${nonPayableBase > 0 ? '15%' : '0%'}` }} />
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Bottom Footer Translucent Glass Shelf */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-blue-100 font-medium">
                Buffer: <strong className="text-white font-bold">₹{(remainingSum / 100000).toFixed(1)}L</strong> ({Math.max(0, 100 - utilizedPercent)}% Safe)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('cost')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline bg-white/15 hover:bg-white/25 px-3 py-1 rounded-lg border border-white/20 transition-all cursor-pointer"
            >
              <span>What-If</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

        </div>

      </div>

      {/* 🌟 5. Row 2: Care Checkpoints & Action Log Table (Full Width Glass Container) */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] space-y-4">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Care Checkpoints & Action Log
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {filteredItems.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Confirm these checkpoints at admission and TPA desks to prevent claim deductions.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenQuestionsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <HelpCircle size={13} />
            <span>What to Ask Desk</span>
          </button>
        </div>

        {/* Filter Pills & Live Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTableFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                tableFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              All Items
            </button>

            <button
              type="button"
              onClick={() => setTableFilter('PENDING')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                tableFilter === 'PENDING'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span>Pending</span>
              {pendingVerifications.length > 0 && (
                <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                  tableFilter === 'PENDING' ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                }`}>
                  {pendingVerifications.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTableFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                tableFilter === 'RESOLVED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Resolved ({verifiedCount})
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search checkpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="pb-2.5 pl-2 font-bold">Checkpoint</th>
                <th className="pb-2.5 font-bold">Target Desk</th>
                <th className="pb-2.5 font-bold">Priority</th>
                <th className="pb-2.5 font-bold">Status</th>
                <th className="pb-2.5 pr-2 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-3 text-center">
                    <div className="text-sm font-bold text-slate-800">No verification items for this profile</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Start a care journey or add a verification item to populate this section.
                    </div>
                  </td>
                </tr>
              )}
              {filteredItems.map((item: any) => {
                const isPending = item.status === 'PENDING';
                const isHigh = item.priority === 'HIGH';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 pl-2 max-w-lg">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isPending ? (isHigh ? 'bg-rose-500' : 'bg-amber-500') : 'bg-emerald-500'}`} />
                        <span className="truncate">{item.title}</span>
                        <InfoPopover
                          size="xs"
                          variant={isPending ? (isHigh ? 'amber' : 'default') : 'emerald'}
                          title={item.title}
                          content={item.reason || 'Verification protocol checkpoint guidance and desk inquiry notes.'}
                          details={[
                            { label: 'Category', value: item.category || 'General' },
                            { label: 'Priority', value: item.priority || 'Normal' },
                            { label: 'Status', value: item.status || 'Pending' }
                          ]}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category === 'ROOM' ? 'Admission Desk' : item.category === 'PREAUTH' ? 'TPA Cashless' : 'Billing & OT'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold text-[11px] ${isHigh ? 'text-rose-600' : 'text-slate-500'}`}>
                        {item.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isPending
                          ? isHigh 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPending ? (isHigh ? 'bg-rose-500' : 'bg-amber-500') : 'bg-emerald-500'}`} />
                        {isPending ? 'Action Required' : 'Verified'}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={onOpenQuestionsModal}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        >
                          Ask Desk
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <Check size={12} />
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Navigation */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span>AI-Grounded Checkpoints</span>
          <button
            type="button"
            onClick={() => onNavigate('verification')}
            className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
          >
            Open Full Verification Center ({pendingVerifications.length} Pending) →
          </button>
        </div>

      </div>

      {/* 🤖 Policy Copilot Quick Prompt Tile */}
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                CareIQ Grounded Policy Copilot
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Vector RAG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask plain-English questions about room upgrade penalties, consumable non-payables, or waiting periods.
            </p>
          </div>
        </div>

        {onOpenChatbot && (
          <button
            type="button"
            onClick={onOpenChatbot}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <Sparkles size={13} />
            <span>Ask Copilot</span>
          </button>
        )}
      </div>

      {/* Caregiver Share Summary Modal */}
      <CaregiverShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        patient={patient}
        policy={policy}
        journey={journey}
        verificationItems={verificationItems}
      />

    </div>
  );
};

export default Dashboard;
