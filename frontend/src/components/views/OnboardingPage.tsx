import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

import type {
  AccountType,
  PolicyType,
  RoomCategoryCode,
  Patient,
  EnrichedInsurancePolicy
} from '../../types/domain';

const COMMON_CONDITIONS = [
  'Hypertension',
  'Type 2 Diabetes',
  'Asthma',
  'Thyroid Disorder',
  'Cardiac Condition',
  'Allergic Rhinitis',
  'Arthritis / Joint Pain',
  'None / Healthy'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, patient, setPatientProfile, refreshSession } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [insurers, setInsurers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State: Step 1 (Personal Details)
  const [displayName, setDisplayName] = useState<string>(patient?.display_name || user?.email?.split('@')[0] || '');
  const [age, setAge] = useState<number | ''>(patient?.age ?? '');
  const [gender, setGender] = useState<string>(patient?.gender || 'Male');
  const [city, setCity] = useState<string>(patient?.city || 'Bengaluru');
  const [state, setState] = useState<string>(patient?.state || 'Karnataka');
  const [pincode, setPincode] = useState<string>(patient?.pincode || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(patient?.date_of_birth || '');
  const [bloodGroup, setBloodGroup] = useState<string>(patient?.blood_group || 'O+');

  // Form State: Step 2 (Medical History)
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    patient?.medical_conditions || []
  );
  const [medications, setMedications] = useState<string>(
    patient?.current_medications?.join(', ') || ''
  );
  const [allergies, setAllergies] = useState<string>(
    patient?.allergies?.join(', ') || ''
  );
  const [emergencyName, setEmergencyName] = useState<string>(
    patient?.emergency_contact_name || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState<string>(
    patient?.emergency_contact_phone || ''
  );

  // Form State: Step 3 (Insurance Details)
  const [insuranceType, setInsuranceType] = useState<'PRIVATE' | 'GOVERNMENT' | 'EMPLOYER'>('PRIVATE');
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>('ins-star-health');
  const [policyName, setPolicyName] = useState<string>('');
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [roomEligibility, setRoomEligibility] = useState<string>('PRIVATE_AC');
  const [copayPercentage, setCopayPercentage] = useState<number>(0);
  const [deductibleAmount, setDeductibleAmount] = useState<number>(0);
  const [cashlessSupported, setCashlessSupported] = useState<boolean>(true);

  // Auto-sync state based on city
  useEffect(() => {
    if (city.toLowerCase() === 'mumbai') {
      setState('Maharashtra');
    } else {
      setState('Karnataka');
    }
  }, [city]);

  // Load insurers list
  useEffect(() => {
    const fetchInsurers = async () => {
      try {
        const res: any = await api.getInsurers();
        if (Array.isArray(res)) {
          setInsurers(res);
        } else if (res?.data && Array.isArray(res.data)) {
          setInsurers(res.data);
        }
      } catch (err) {
        console.error('Failed to load insurers list:', err);
        // Fallback insurers
        setInsurers([
          { id: 'ins-star-health', name: 'Star Health and Allied Insurance' },
          { id: 'ins-hdfc-ergo', name: 'HDFC ERGO General Insurance' },
          { id: 'ins-icici-lombard', name: 'ICICI Lombard General Insurance' },
          { id: 'ins-care-health', name: 'Care Health Insurance' },
          { id: 'ins-niva-bupa', name: 'Niva Bupa Health Insurance' },
          { id: 'sch-pmjay', name: 'Ayushman Bharat PM-JAY' },
          { id: 'sch-ab-ark', name: 'Arogya Karnataka / AB-ARK' }
        ]);
      }
    };
    fetchInsurers();
  }, []);

  const handleConditionToggle = (condition: string) => {
    if (condition === 'None / Healthy') {
      setSelectedConditions(['None / Healthy']);
      return;
    }

    const filtered = selectedConditions.filter((c) => c !== 'None / Healthy');
    if (filtered.includes(condition)) {
      const remaining = filtered.filter((c) => c !== condition);
      setSelectedConditions(remaining.length === 0 ? ['None / Healthy'] : remaining);
    } else {
      setSelectedConditions([...filtered, condition]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!age || age < 1 || age > 120) {
        setError('Please enter a valid age between 1 and 120.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!policyName.trim()) {
        setError('Please enter your health insurance plan or policy name.');
        return;
      }
      if (!sumInsured || sumInsured <= 0) {
        setError('Please enter a valid sum insured amount.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Determine Patient ID and Safety for Demo Profiles
      const isExistingUserPatient = Boolean(
        patient?.id &&
        !patient.id.startsWith('pat-demo-') &&
        patient.account_type === 'NEW_USER'
      );
      const patientId = isExistingUserPatient && patient?.id ? patient.id : `pat-${Date.now()}`;

      // 1. Update/Create Patient Profile
      const parsedMedications = medications
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      const parsedAllergies = allergies
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const patientPayload: Partial<Patient> = {
        id: patientId,
        display_name: displayName.trim(),
        age: Number(age) || 30,
        gender,
        city,
        state,
        pincode: pincode.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        blood_group: bloodGroup,
        medical_conditions: selectedConditions,
        current_medications: parsedMedications,
        allergies: parsedAllergies,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        account_type: 'NEW_USER' as AccountType
      };

      let updatedPatient: Patient;
      if (isExistingUserPatient) {
        try {
          updatedPatient = await api.updatePatient(patientId, patientPayload);
        } catch {
          updatedPatient = await api.createPatient(patientPayload);
        }
      } else {
        updatedPatient = await api.createPatient(patientPayload);
      }

      setPatientProfile(updatedPatient);

      // 2. Create Insurance Policy
      const policyPayload: Partial<EnrichedInsurancePolicy> = {
        id: `pol-${Date.now()}`,
        patient_id: patientId,
        insurer_id: selectedInsurerId,
        policy_name: policyName.trim() || 'Health Insurance Plan',
        policy_type: (
          insuranceType === 'GOVERNMENT'
            ? 'GOVERNMENT_SCHEME'
            : insuranceType === 'EMPLOYER'
            ? 'GROUP'
            : 'INDIVIDUAL'
        ) as PolicyType,
        sum_insured: Number(sumInsured) || 500000,
        remaining_sum_insured: Number(sumInsured) || 500000,
        room_eligibility: (roomEligibility as RoomCategoryCode) || 'PRIVATE_AC',
        copay_percentage: Number(copayPercentage) || 0,
        deductible_amount: Number(deductibleAmount) || 0,
        cashless_supported: cashlessSupported,
        preauthorization_supported: true
      };

      await api.createPolicy(policyPayload);

      // Refresh session state and navigate to dashboard
      await refreshSession();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding completion error:', err);
      setError(err?.message || 'Failed to save health profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Details', icon: User },
    { num: 2, label: 'Medical History', icon: Activity },
    { num: 3, label: 'Insurance Policy', icon: ShieldCheck },
    { num: 4, label: 'Review & Finish', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between relative selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Subtle Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(37,99,235,0.07),transparent)] pointer-events-none" />

      {/* Clean White Top Header */}
      <header className="relative z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs shrink-0 group-hover:bg-teal-900 transition-colors">
            <img src="/logo.svg" alt="CareIQ Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Care<span className="text-blue-600">IQ</span> Onboarding
          </span>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Skip Setup →
        </button>
      </header>

      {/* Main Form Wizard */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {/* Progress Bar & Step Indicators */}
        <div className="mb-8 max-w-2xl mx-auto w-full px-2 sm:px-4">
          <div className="relative">
            {/* Background connecting track: bounded strictly between the first and last circle centers */}
            <div className="absolute top-4.5 left-4.5 right-4.5 h-0.5 bg-slate-200 z-0" />
            
            {/* Active filled connecting track */}
            <div
              className="absolute top-4.5 left-4.5 h-0.5 bg-blue-600 transition-all duration-500 z-0"
              style={{
                width: `calc(${((currentStep - 1) / (steps.length - 1))} * (100% - 36px))`
              }}
            />

            {/* 4 Step Circle and Label Columns */}
            <div className="flex items-start justify-between relative z-10">
              {steps.map((s) => {
                const Icon = s.icon;
                const isDone = currentStep > s.num;
                const isCurrent = currentStep === s.num;

                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isDone
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm ring-4 ring-blue-500/10'
                          : 'bg-white border border-slate-300 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check size={16} strokeWidth={3} /> : <Icon size={15} />}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 text-center transition-colors whitespace-nowrap hidden sm:block ${
                        isCurrent
                          ? 'text-blue-700'
                          : isDone
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wizard Step Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 1 of 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Personal Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps CareIQ match you with nearby hospitals and determine room category coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="38"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City (Supported Markets)
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                  >
                    <option value="Bengaluru">Bengaluru (Bangalore)</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Medical History */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 2 of 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Medical Background</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used exclusively for pre-existing disease waiting period checks & hospital specialty matching.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Pre-existing Conditions (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CONDITIONS.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleConditionToggle(cond)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Medications (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Montelukast 10mg"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Dust Mites, None"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Insurance Details */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 3 of 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Insurance & Health Cover</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provides exact cashless network hospital matches and out-of-pocket calculations.
                </p>
              </div>

              <div className="space-y-4">
                {/* 3 Insurance Type Cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Insurance Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { type: 'PRIVATE', label: 'Private Insurance', desc: 'Star, HDFC, ICICI, etc.' },
                      { type: 'GOVERNMENT', label: 'Government Scheme', desc: 'PM-JAY, Arogya Karnataka' },
                      { type: 'EMPLOYER', label: 'Corporate Group Plan', desc: 'Company health policy' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setInsuranceType(item.type as any);
                          if (item.type === 'GOVERNMENT') {
                            setSelectedInsurerId('sch-pmjay');
                            setPolicyName('Ayushman Bharat PM-JAY');
                            setRoomEligibility('GENERAL');
                          } else if (item.type === 'EMPLOYER') {
                            setSelectedInsurerId('ins-icici-lombard');
                            setPolicyName('Corporate Group Health Mediclaim');
                            setRoomEligibility('DELUXE');
                            setCopayPercentage(10);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          insuranceType === item.type
                            ? 'bg-blue-50 border-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Insurance Provider / Scheme
                    </label>
                    <select
                      value={selectedInsurerId}
                      onChange={(e) => setSelectedInsurerId(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                    >
                      {insurers.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Policy Name
                    </label>
                    <input
                      type="text"
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                      placeholder="e.g. Star Comprehensive Health Insurance"
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Sum Insured (₹)
                    </label>
                    <input
                      type="number"
                      min={50000}
                      step={50000}
                      value={sumInsured}
                      onChange={(e) => setSumInsured(Number(e.target.value))}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Room Category Eligibility
                    </label>
                    <select
                      value={roomEligibility}
                      onChange={(e) => setRoomEligibility(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                    >
                      <option value="GENERAL">General Ward (No AC)</option>
                      <option value="SEMI_PRIVATE">Semi-Private / Twin Sharing</option>
                      <option value="PRIVATE_AC">Single Private Room (AC)</option>
                      <option value="DELUXE">Deluxe / Super Deluxe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Co-pay Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={copayPercentage}
                      onChange={(e) => setCopayPercentage(Number(e.target.value))}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Deductible Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={deductibleAmount}
                      onChange={(e) => setDeductibleAmount(Number(e.target.value))}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Cashless Hospitalization Entitlement</div>
                      <div className="text-[10px] text-slate-500">Policy supports direct TPA/Insurer settlement at network hospitals</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCashlessSupported(!cashlessSupported)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        cashlessSupported ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          cashlessSupported ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Finish */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 4 of 4
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Review & Confirm Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your details before launching the CareIQ Intelligence Dashboard.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    Patient Profile
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Name</span>
                      <span className="text-slate-900 font-semibold">{displayName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Age & Gender</span>
                      <span className="text-slate-900 font-semibold">{age} yrs, {gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location</span>
                      <span className="text-slate-900 font-semibold">{city}, {state}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Blood Group</span>
                      <span className="text-slate-900 font-semibold">{bloodGroup}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    Medical Background
                  </h3>
                  <div className="text-xs text-slate-800">
                    <span className="text-slate-400">Conditions: </span>
                    {selectedConditions.join(', ')}
                  </div>
                  {medications && (
                    <div className="text-xs text-slate-800 mt-1">
                      <span className="text-slate-400">Medications: </span>
                      {medications}
                    </div>
                  )}
                  {emergencyName && (
                    <div className="text-xs text-slate-800 mt-1">
                      <span className="text-slate-400">Emergency Contact: </span>
                      {emergencyName} ({emergencyPhone})
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    Insurance Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Plan Name</span>
                      <span className="text-slate-900 font-semibold">{policyName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sum Insured</span>
                      <span className="text-blue-600 font-bold">₹{Number(sumInsured).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Room Category</span>
                      <span className="text-slate-900 font-semibold">{roomEligibility.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Co-pay</span>
                      <span className="text-slate-900 font-semibold">{copayPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deductible</span>
                      <span className="text-slate-900 font-semibold">₹{Number(deductibleAmount).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cashless Facility</span>
                      <span className="text-emerald-700 font-semibold">Supported</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteOnboarding}
                className="py-2.5 px-6 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Profile & Matching Hospitals...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete & Go to Dashboard</span>
                    <Sparkles size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 py-3.5 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/50">
        CareIQ AI Decision Support is strictly for decision assistance and educational transparency.
      </footer>
    </div>
  );
};
