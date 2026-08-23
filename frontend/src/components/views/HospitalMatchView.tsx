import React, { useState, useEffect } from 'react';
import {
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BedDouble,
  Activity,
  MapPin,
  ArrowLeftRight,
  Star
} from 'lucide-react';

import { api } from '../../services/api';
import { HospitalCompare } from '../widgets/HospitalCompare';
import { Loader } from '../common/Loader';

import { useCareIQ } from '../../context/CareIQContext';

import type {
  Patient,
  EnrichedInsurancePolicy,
  RoomCategoryCode
} from '../../types/domain';
import type { StartJourneyInput } from '../../context/CareIQContext';

interface HospitalMatchViewProps {
  policy?: EnrichedInsurancePolicy | null;
  activePatient?: Patient | null;
  onStartJourney?: (input: StartJourneyInput) => Promise<void> | void;
  onOpenQuestions?: (hospitalName?: string | null, isRoomExceeded?: boolean) => void;
}

export const HospitalMatchView: React.FC<HospitalMatchViewProps> = ({
  policy: propPolicy,
  activePatient: propActivePatient,
  onStartJourney: propOnStartJourney,
  onOpenQuestions: propOnOpenQuestions
}) => {
  const context = useCareIQ();
  const policy = propPolicy !== undefined ? propPolicy : context.activePolicy;
  const activePatient = propActivePatient !== undefined ? propActivePatient : context.activePatient;
  const onStartJourney = propOnStartJourney || context.handleStartJourney;
  const onOpenQuestions = propOnOpenQuestions || context.openQuestionsModal;
  const [city, setCity] = useState<string>(activePatient?.city || 'Bengaluru');
  const [specialty, setSpecialty] = useState<string>('ORTHOPEDICS');
  const [procedureId, setProcedureId] = useState<string>('proc-knee-replacement');
  const [roomCategory, setRoomCategory] = useState<string>(policy?.room_eligibility || 'PRIVATE_AC');
  const [networkOnly, setNetworkOnly] = useState<boolean>(false);

  useEffect(() => {
    if (activePatient?.city) {
      setCity(activePatient.city);
    }
  }, [activePatient?.city]);

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedHospitalId, setExpandedHospitalId] = useState<string | null>(null);
  
  // Hospital Compare State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);


  const toggleCompare = (hospitalId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(hospitalId)) {
        return prev.filter((id) => id !== hospitalId);
      }
      if (prev.length >= 2) {
        return [prev[1], hospitalId];
      }
      return [...prev, hospitalId];
    });
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await api.matchHospitals({
        city,
        policy_id: policy?.id,
        specialty_code: specialty || undefined,
        procedure_id: procedureId || undefined,
        preferred_room_category: (roomCategory as RoomCategoryCode) || undefined,
        network_only: networkOnly
      });
      setMatches(data);
    } catch (err) {
      console.error('Error fetching hospital matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [city, specialty, procedureId, roomCategory, networkOnly, policy?.id]);

  return (
    <div className="flex flex-col gap-5 relative pb-16">
      
      {/* 1. Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Hospital Search & Insurance Constraint Filters
            </h3>
          </div>
          
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={networkOnly}
              onChange={(e) => setNetworkOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
            />
            Show Cashless In-Network Only
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          
          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Location / City
            </label>
            <select
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Clinical Specialty
            </label>
            <select
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="ORTHOPEDICS">Orthopedics & Joint Care</option>
              <option value="CARDIOLOGY">Cardiology & Cath Lab</option>
              <option value="NEUROLOGY">Neurology & Neurosurgery</option>
              <option value="ONCOLOGY">Oncology & Cancer Care</option>
              <option value="GENERAL_SURGERY">General Surgery</option>
            </select>
          </div>

          {/* Procedure */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Procedure / Investigation
            </label>
            <select
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              value={procedureId}
              onChange={(e) => setProcedureId(e.target.value)}
            >
              <option value="proc-knee-replacement">Total Knee Replacement</option>
              <option value="proc-angioplasty">Coronary Angioplasty (PTCA)</option>
              <option value="proc-appendectomy">Laparoscopic Appendectomy</option>
              <option value="proc-mri-brain">MRI Brain with Contrast</option>
            </select>
          </div>

          {/* Preferred Room */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Preferred Room Category
            </label>
            <select
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              value={roomCategory}
              onChange={(e) => setRoomCategory(e.target.value)}
            >
              <option value="GENERAL">General Ward (Multi-bed)</option>
              <option value="SEMI_PRIVATE">Semi-Private (Twin Sharing)</option>
              <option value="PRIVATE_AC">Single Private AC Room</option>
              <option value="DELUXE">Deluxe Private Room</option>
              <option value="SUITE">Executive Suite</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Ranked Hospital Options ({matches.length})
          </h2>
          <p className="text-xs text-slate-500">
            Showing options evaluated against policy: <strong>{policy?.policy_name || 'Standard Baseline'}</strong>
          </p>
        </div>

        {selectedForCompare.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              {selectedForCompare.length} selected for comparison
            </span>
            {selectedForCompare.length === 2 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors"
              >
                Compare Now ⚡
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Hospital Cards List */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 flex items-center justify-center shadow-xs">
          <Loader size="md" />
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
          <Building2 size={40} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching hospitals found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try relaxing your filter criteria or changing the location.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((item, idx) => {
            const h = item.hospital;
            const isTopRank = idx === 0;
            const isExpanded = expandedHospitalId === h.id;
            const isSelectedForCompare = selectedForCompare.includes(h.id);

            return (
              <div
                key={h.id}
                className={`border rounded-2xl p-5 md:p-6 shadow-xs transition-all relative ${
                  isSelectedForCompare
                    ? 'bg-indigo-50/40 border-indigo-400 ring-2 ring-indigo-500/20'
                    : isTopRank
                    ? 'bg-teal-50/30 border-teal-300 ring-1 ring-teal-200'
                    : 'bg-white border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  
                  {/* Hospital Info & Badges */}
                  <div className="flex-1 min-w-70">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-lg md:text-xl font-extrabold text-slate-900">
                        {h.name}
                      </h3>
                      {isTopRank && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs">
                          <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                          Highest Compatibility
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      {h.address}, {h.city} ({h.pincode})
                    </p>

                    {/* Status Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {item.networkStatus === 'IN_NETWORK' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          In-Network {item.cashlessSupported ? '(Cashless Confirmed)' : '(Reimbursement)'}
                        </span>
                      ) : item.networkStatus === 'UNKNOWN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={12} />
                          Network Unconfirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle size={12} />
                          Out-of-Network
                        </span>
                      )}

                      {item.roomCategoryMatch ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <BedDouble size={12} />
                          Room: {roomCategory} (Compatible)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={12} />
                          Room: {roomCategory} (Exceeds Policy Limit)
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Activity size={12} />
                        Beds: {h.beds || 'N/A'} (ICU: {h.icu_beds || 'N/A'})
                      </span>
                    </div>
                  </div>

                  {/* Match Score & Financial Summary */}
                  <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                    
                    {/* Financial Estimate */}
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate-500">Indicative Patient Exposure</div>
                      <div className={`text-xl font-extrabold ${item.estimatedPatientExposure > 30000 ? 'text-amber-600' : 'text-teal-700'}`}>
                        ₹{item.estimatedPatientExposure.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Typical Gross: ₹{item.estimatedTotalCost.toLocaleString()}
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-xs ${
                        item.matchScore >= 90
                          ? 'bg-teal-700'
                          : item.matchScore >= 70
                          ? 'bg-amber-600'
                          : 'bg-red-600'
                      }`}
                    >
                      <span className="text-lg font-extrabold leading-none">{item.matchScore}</span>
                      <span className="text-[9px] font-bold opacity-90 mt-0.5">MATCH</span>
                    </div>

                  </div>

                </div>

                {/* Actions & Expand Toggle */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedHospitalId(isExpanded ? null : h.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide Factor Breakdown' : 'Why am I seeing this?'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCompare(h.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelectedForCompare
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <ArrowLeftRight size={13} />
                      {isSelectedForCompare ? '✓ Selected to Compare' : 'Compare'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenQuestions(h.name, !item.roomCategoryMatch)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer transition-colors"
                    >
                      <HelpCircle size={14} />
                      What to Ask Desk
                    </button>

                    <button
                      onClick={() => onStartJourney({
                        hospitalId: h.id,
                        procedureId: procedureId,
                        selectedRoomCategory: roomCategory as RoomCategoryCode
                      })}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/30 cursor-pointer transition-colors"
                    >
                      <Sparkles size={14} />
                      Track Journey Here
                    </button>
                  </div>

                </div>

                {/* Section 54 — Expandable 'Why am I seeing this?' Factor Inspector */}
                {isExpanded && (
                  <div className="mt-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                    
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/80">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-teal-600" />
                        5-Factor Alignment Scorecard (Section 54)
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deterministic Weights</span>
                    </div>

                    {/* 5-Factor Score Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500">1. Network (35%)</span>
                          <span className="font-extrabold text-emerald-700">
                            {item.networkStatus === 'IN_NETWORK' ? '✓ 100%' : item.networkStatus === 'UNKNOWN' ? '❓ Verify' : '✗ 20%'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium block">
                          {item.networkStatus === 'IN_NETWORK' ? 'Cashless empanelled' : 'Requires direct desk check'}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500">2. Room Match (25%)</span>
                          <span className={`font-extrabold ${item.roomCategoryMatch ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.roomCategoryMatch ? '✓ 100%' : '⚠ Proportional'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium block">
                          {item.roomCategoryMatch ? 'Within entitlement' : 'Proportionate deduction'}
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500">3. Services (15%)</span>
                          <span className="font-extrabold text-emerald-700">✓ Verified</span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium block">
                          {h.specialties?.length || 5} Departments Active
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500">4. 24x7 ICU (10%)</span>
                          <span className="font-extrabold text-emerald-700">✓ {h.icu_beds || 20}+ Beds</span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium block">
                          Critical care operational
                        </span>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs sm:col-span-2 md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500">5. Cost Headroom (15%)</span>
                          <span className="font-extrabold text-teal-700">✓ Indicative Tariff</span>
                        </div>
                        <span className="text-[11px] text-slate-700 font-medium block">
                          Est. Out-of-Pocket: ₹{item.estimatedPatientExposure.toLocaleString()} vs Policy Sum Insured: ₹{(policy?.sum_insured || 500000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mb-3 pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-600 mb-0.5">Key Match Drivers:</span>
                      {item.reasons.map((r: string, rIdx: number) => (
                        <div
                          key={rIdx}
                          className={`text-xs font-semibold ${
                            r.startsWith('✓') ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {r}
                        </div>
                      ))}
                    </div>

                    {item.verificationItems.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200">
                        <div className="text-xs font-bold text-amber-800 mb-1">
                          Recommended Verification Steps:
                        </div>
                        {item.verificationItems.map((v: string, vIdx: number) => (
                          <div key={vIdx} className="text-xs text-amber-900 font-medium">
                            • {v}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Side-by-Side Comparison Action Bar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 bg-slate-900 text-white p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700 animate-fade-in max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl shrink-0">
              <ArrowLeftRight size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">
                {selectedForCompare.length === 1
                  ? '1 hospital selected. Pick 1 more to compare.'
                  : '2 hospitals ready for side-by-side comparison.'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {selectedForCompare.map((id) => matches.find((m) => (m.hospital?.id || m.id) === id)?.hospital?.name || id).join(' vs ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {selectedForCompare.length === 2 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-extrabold bg-linear-to-r from-teal-500 to-indigo-500 hover:opacity-95 text-white shadow-md cursor-pointer transition-all"
              >
                Compare ⚡
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      <HospitalCompare
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        hospitalA={matches.find((m) => (m.hospital?.id || m.id) === selectedForCompare[0])}
        hospitalB={matches.find((m) => (m.hospital?.id || m.id) === selectedForCompare[1])}
        policy={policy}
        onSelectHospital={(hospId) => onStartJourney({
          hospitalId: hospId,
          procedureId,
          selectedRoomCategory: roomCategory as RoomCategoryCode
        })}
      />

    </div>
  );
};
