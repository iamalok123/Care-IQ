import React, { useState } from 'react';
import {
  Plus,
  BedDouble,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

interface InsuranceViewProps {
  policies: any[];
  activePatient: any;
  onPolicyAdded: () => void;
}

export const InsuranceView: React.FC<InsuranceViewProps> = ({
  policies,
  activePatient,
  onPolicyAdded
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);

  // Form State for Manual Entry
  const [insurerId, setInsurerId] = useState<string>('ins-star-health');
  const [policyName, setPolicyName] = useState<string>('');
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [roomEligibility, setRoomEligibility] = useState<string>('PRIVATE_AC');
  const [copay, setCopay] = useState<number>(0);
  const [deductible, setDeductible] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName) return;

    setSubmitting(true);
    try {
      await api.createPolicy({
        patient_id: activePatient?.id,
        insurer_id: insurerId,
        policy_name: policyName,
        policy_type: 'INDIVIDUAL',
        sum_insured: Number(sumInsured),
        remaining_sum_insured: Number(sumInsured),
        room_eligibility: roomEligibility,
        copay_percentage: Number(copay),
        deductible_amount: Number(deductible),
        cashless_supported: true,
        preauthorization_supported: true,
        pre_hospitalization_days: 60,
        post_hospitalization_days: 90
      });
      setShowAddModal(false);
      setPolicyName('');
      onPolicyAdded();
    } catch (err) {
      console.error('Failed to add policy:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Header & Add Policy Button */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Insurance Policies & Coverage Rules
          </h2>
          <p className="text-xs text-slate-500">
            Normalized policy constraints for <strong>{activePatient?.display_name || 'Patient'}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs shadow-teal-600/30 transition-all cursor-pointer"
        >
          <Plus size={16} />
          Add / Upload Policy
        </button>
      </div>

      {/* Policies List */}
      <div className="flex flex-col gap-4">
        {policies.map((p) => {
          const isExpanded = expandedPolicyId === p.id;

          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
              
              {/* Top Row: Policy Name, Masked ID & Provenance */}
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                      {p.policy_type || 'INDIVIDUAL'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} />
                      {p.verification_status || 'VERIFIED REFERENCE'}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900">
                    {p.policy_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Policy No: {p.policy_number_masked || 'CONF-XXXX-9901'} • Insurer: {p.insurer_id}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500">Total Sum Insured</span>
                  <div className="text-xl font-extrabold text-teal-600">
                    ₹{(p.sum_insured / 100000).toFixed(1)} Lakhs
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">
                    Remaining: ₹{( (p.remaining_sum_insured ?? p.sum_insured) / 100000 ).toFixed(1)} Lakhs
                  </div>
                </div>
              </div>

              {/* Core Limits Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4">
                
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <BedDouble size={14} className="text-teal-600" />
                    Room Entitlement
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {p.room_eligibility || 'Private AC'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Co-Payment</div>
                  <div className={`text-sm font-extrabold mt-0.5 ${p.copay_percentage > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {p.copay_percentage || 0}%
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Deductible</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    ₹{p.deductible_amount || 0}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Pre/Post Hospitalization</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {p.pre_hospitalization_days || 60}d / {p.post_hospitalization_days || 90}d
                  </div>
                </div>

              </div>

              {/* Toggle Details Button */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Cashless: {p.cashless_supported ? '✓ Supported' : '✗ Reimbursement'} • Pre-Auth: {p.preauthorization_supported ? '✓ Enabled' : 'None'}
                </span>

                <button
                  onClick={() => setExpandedPolicyId(isExpanded ? null : p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? 'Hide Policy Rules' : 'View Rules & Exclusions'}
                </button>
              </div>

              {/* Expandable Rules Section */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">
                    Enforced Policy Rule Engine:
                  </h4>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="p-3 bg-teal-50/80 rounded-xl border-l-4 border-teal-600">
                      <div className="text-xs font-bold text-teal-900">
                        Room Rent Proportionate Deduction Rule (ROOM_CAP_{p.room_eligibility})
                      </div>
                      <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                        If room category higher than {p.room_eligibility} is chosen, proportional deduction applies to doctor fees, OT charges, and surgical items.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-xl border-l-4 border-amber-500">
                      <div className="text-xs font-bold text-amber-900">
                        Standard IRDAI List I Exclusions (Non-Payable Items)
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Surgical PPE kits, gloves, admission file charges, syringes, and sanitizers are non-reimbursable consumables.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Manual Add Policy Modal */}
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
              Add / Ingest Insurance Policy
            </h3>

            <form onSubmit={handleAddPolicy} className="flex flex-col gap-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Insurance Provider
                </label>
                <select
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  value={insurerId}
                  onChange={(e) => setInsurerId(e.target.value)}
                >
                  <option value="ins-star-health">Star Health and Allied Insurance</option>
                  <option value="ins-hdfc-ergo">HDFC ERGO General Insurance</option>
                  <option value="ins-niva-bupa">Niva Bupa Health Insurance</option>
                  <option value="ins-care-health">Care Health Insurance</option>
                  <option value="ins-new-india">New India Assurance</option>
                  <option value="sch-pmjay">Ayushman Bharat PM-JAY</option>
                  <option value="sch-arogya-karnataka">Arogya Karnataka</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Policy Plan Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                  placeholder="e.g. Star Health Comprehensive / Optima Restore"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sum Insured (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                    value={sumInsured}
                    onChange={(e) => setSumInsured(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Entitlement
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                    value={roomEligibility}
                    onChange={(e) => setRoomEligibility(e.target.value)}
                  >
                    <option value="GENERAL">General Ward</option>
                    <option value="SEMI_PRIVATE">Semi-Private</option>
                    <option value="PRIVATE_AC">Single Private AC</option>
                    <option value="DELUXE">Deluxe Room</option>
                    <option value="ANY_ROOM">Any Room (No Cap)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Co-Payment (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                    value={copay}
                    onChange={(e) => setCopay(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deductible (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-teal-500 focus:bg-white"
                    value={deductible}
                    onChange={(e) => setDeductible(Number(e.target.value))}
                    min={0}
                  />
                </div>
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
                  {submitting ? 'Saving Policy...' : 'Save & Normalize Policy'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
