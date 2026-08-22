import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
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
  const [age, setAge] = useState<number | ''>(patient?.age || 35);
  const [gender, setGender] = useState<string>(patient?.gender || 'Female');
  const [city, setCity] = useState<string>(patient?.city || 'Bengaluru');
  const [state, setState] = useState<string>(patient?.state || 'Karnataka');
  const [pincode, setPincode] = useState<string>(patient?.pincode || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(patient?.date_of_birth || '');
  const [bloodGroup, setBloodGroup] = useState<string>(patient?.blood_group || 'O+');

  // Form State: Step 2 (Medical History)
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    patient?.medical_conditions || ['None / Healthy']
  );
  const [medications, setMedications] = useState<string>(
    patient?.current_medications?.join(', ') || ''
  );
  const [allergies, setAllergies] = useState<string>(
    patient?.allergies?.join(', ') || 'None known'
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
  const [policyName, setPolicyName] = useState<string>('Star Health Comprehensive ₹5L');
  const [sumInsured, setSumInsured] = useState<number>(500000);
  const [roomEligibility, setRoomEligibility] = useState<string>('PRIVATE_AC');
  const [copayPercentage, setCopayPercentage] = useState<number>(0);
  const [deductibleAmount, setDeductibleAmount] = useState<number>(0);
  const [cashlessSupported, setCashlessSupported] = useState<boolean>(true);

  // Auto-sync state based on city
  useEffect(() => {
    if (city.toLowerCase() === 'mumbai') {
      setState('Maharashtra');
    } else if (city.toLowerCase() === 'bengaluru' || city.toLowerCase() === 'bangalore') {
      setState('Karnataka');
    }
  }, [city]);

  // Load insurers list
  useEffect(() => {
    async function loadInsurers() {
      try {
        const list = await api.getInsurers();
        setInsurers(list || []);
        if (list && list.length > 0 && !selectedInsurerId) {
          setSelectedInsurerId(list[0].id);
        }
      } catch (err) {
        console.warn('Failed to load insurers list:', err);
      }
    }
    loadInsurers();
  }, []);

  const handleConditionToggle = (condition: string) => {
    if (condition === 'None / Healthy') {
      setSelectedConditions(['None / Healthy']);
      return;
    }

    let next = selectedConditions.filter((c) => c !== 'None / Healthy');
    if (next.includes(condition)) {
      next = next.filter((c) => c !== condition);
    } else {
      next.push(condition);
    }

    if (next.length === 0) {
      next = ['None / Healthy'];
    }
    setSelectedConditions(next);
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!age || Number(age) <= 0 || Number(age) > 120) {
        setError('Please enter a valid age between 1 and 120.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      const patientId = patient?.id || `pat-${Date.now()}`;

      // 1. Update Patient Profile
      const parsedMedications = medications
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      const parsedAllergies = allergies
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const patientPayload = {
        display_name: displayName.trim(),
        age: Number(age),
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
        account_type: 'NEW_USER'
      };

      let updatedPatient;
      try {
        const res = await api.updatePatient(patientId, patientPayload);
        updatedPatient = res.data || res;
      } catch {
        // Fallback create
        const res = await api.createPatient({ id: patientId, ...patientPayload });
        updatedPatient = res.data || res;
      }

      setPatientProfile(updatedPatient);

      // 2. Create Insurance Policy
      const policyPayload = {
        patient_id: patientId,
        insurer_id: selectedInsurerId,
        policy_name: policyName.trim() || 'Health Insurance Plan',
        policy_type:
          insuranceType === 'GOVERNMENT'
            ? 'GOVERNMENT_SCHEME'
            : insuranceType === 'EMPLOYER'
            ? 'GROUP'
            : 'INDIVIDUAL',
        sum_insured: Number(sumInsured) || 500000,
        remaining_sum_insured: Number(sumInsured) || 500000,
        room_eligibility: roomEligibility,
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
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-black">
      {/* Background Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.12),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-cyan-400">
              CareIQ Onboarding
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Skip Setup →
        </button>
      </header>

      {/* Main Form Wizard */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {/* Progress Bar & Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative mb-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 w-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500 z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                        : isCurrent
                        ? 'bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-3" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-cyan-400' : isDone ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl p-6 sm:p-8"
        >
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Step 1 of 4
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Personal Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Helps CareIQ match you with nearby hospitals and determine room category coverage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    City (Supported Markets)
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  >
                    <option value="Bengaluru">Bengaluru (Bangalore)</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Medical History */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Step 2 of 4
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Medical Background</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Used exclusively for pre-existing disease waiting period checks & hospital specialty matching.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Current Medications (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="e.g. Metformin 500mg, Montelukast 10mg"
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Dust Mites, None"
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
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
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Step 3 of 4
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Insurance & Health Cover</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provides exact cashless network hospital matches and out-of-pocket calculations.
                </p>
              </div>

              <div className="space-y-4">
                {/* 3 Insurance Type Cards */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
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
                        className={`p-3 rounded-xl border text-left transition-all ${
                          insuranceType === item.type
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-sm shadow-cyan-500/20'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Insurance Provider / Scheme
                    </label>
                    <select
                      value={selectedInsurerId}
                      onChange={(e) => setSelectedInsurerId(e.target.value)}
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    >
                      {insurers.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Policy Name
                    </label>
                    <input
                      type="text"
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                      placeholder="e.g. Star Comprehensive Health Insurance"
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Sum Insured (₹)
                    </label>
                    <input
                      type="number"
                      min={50000}
                      step={50000}
                      value={sumInsured}
                      onChange={(e) => setSumInsured(Number(e.target.value))}
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Room Category Eligibility
                    </label>
                    <select
                      value={roomEligibility}
                      onChange={(e) => setRoomEligibility(e.target.value)}
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    >
                      <option value="GENERAL">General Ward (No AC)</option>
                      <option value="SEMI_PRIVATE">Semi-Private / Twin Sharing</option>
                      <option value="PRIVATE_AC">Single Private Room (AC)</option>
                      <option value="DELUXE">Deluxe / Super Deluxe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Co-pay Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={copayPercentage}
                      onChange={(e) => setCopayPercentage(Number(e.target.value))}
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Deductible Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={deductibleAmount}
                      onChange={(e) => setDeductibleAmount(Number(e.target.value))}
                      className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Cashless Hospitalization Entitlement</div>
                      <div className="text-[10px] text-slate-400">Policy supports direct TPA/Insurer settlement at network hospitals</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCashlessSupported(!cashlessSupported)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        cashlessSupported ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-md ring-0 transition duration-200 ease-in-out ${
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
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Step 4 of 4
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Review & Confirm Profile</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm your details before launching the CareIQ Intelligence Dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    Patient Profile
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Name</span>
                      <span className="text-white font-medium">{displayName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Age & Gender</span>
                      <span className="text-white font-medium">{age} yrs, {gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Location</span>
                      <span className="text-white font-medium">{city}, {state}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Blood Group</span>
                      <span className="text-white font-medium">{bloodGroup}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    Medical Background
                  </h3>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500">Conditions: </span>
                    {selectedConditions.join(', ')}
                  </div>
                  {medications && (
                    <div className="text-xs text-slate-300 mt-1">
                      <span className="text-slate-500">Medications: </span>
                      {medications}
                    </div>
                  )}
                  {emergencyName && (
                    <div className="text-xs text-slate-300 mt-1">
                      <span className="text-slate-500">Emergency Contact: </span>
                      {emergencyName} ({emergencyPhone})
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    Insurance Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Plan Name</span>
                      <span className="text-white font-medium">{policyName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sum Insured</span>
                      <span className="text-emerald-400 font-bold">₹{Number(sumInsured).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Room Category</span>
                      <span className="text-white font-medium">{roomEligibility.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Co-pay</span>
                      <span className="text-white font-medium">{copayPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Deductible</span>
                      <span className="text-white font-medium">₹{Number(deductibleAmount).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cashless Facility</span>
                      <span className="text-emerald-400 font-medium">Supported</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteOnboarding}
                className="py-2.5 px-6 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving Profile & Matching Hospitals...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete & Go to Dashboard</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        CareIQ AI Decision Support is strictly for decision assistance and educational transparency.
      </footer>
    </div>
  );
};
