import React, { useState } from 'react';
import { 
  PlayCircle, 
  X, 
  Search, 
  Sparkles, 
  ShieldCheck,
  Building2,
  Stethoscope
} from 'lucide-react';

export interface ScenarioDefinition {
  id: string;
  name: string;
  personaName: string;
  ageGender: string;
  city: string;
  insurer: string;
  sumInsured: string;
  hospital: string;
  procedure: string;
  category: 'ALL' | 'CASHLESS' | 'ROOM_TRAP' | 'GOV_SCHEME' | 'EMERGENCY' | 'MULTI_POLICY' | 'UNCERTAINTY';
  categoryLabel: string;
  dilemma: string;
  outcome: string;
  keyBadge: string;
  badgeColor: string;
}

export const SCENARIOS_CATALOG: ScenarioDefinition[] = [
  {
    id: 'sc-01',
    name: 'Scenario 01 — Ananya Sharma',
    personaName: 'Ananya Sharma',
    ageGender: '42F',
    city: 'Bengaluru',
    insurer: 'Star Health Comprehensive',
    sumInsured: '₹5,00,000',
    hospital: 'Manipal Hospital (Old Airport Rd)',
    procedure: 'Total Knee Replacement',
    category: 'CASHLESS',
    categoryLabel: 'In-Network Cashless',
    dilemma: 'Planning elective knee replacement. Needs cashless admission, compatible room category, and zero doctor fee penalties.',
    outcome: '100% Cashless Match (Score 100/100). Private AC room cap aligned. Expected out-of-pocket: ₹14,000 (standard consumables only).',
    keyBadge: '100% Cashless Match',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'sc-02',
    name: 'Scenario 02 — Rahul Mehta',
    personaName: 'Rahul Mehta',
    ageGender: '48M',
    city: 'Bengaluru',
    insurer: 'HDFC ERGO Optima Secure',
    sumInsured: '₹4,00,000',
    hospital: 'Apollo Hospital (Bannerghatta)',
    procedure: 'Angioplasty (PTCA Stent)',
    category: 'ROOM_TRAP',
    categoryLabel: 'Room Rent Penalty',
    dilemma: 'Policy caps room rent to Semi-Private (₹3,000/day). Patient requests Single Deluxe AC Room (₹6,000/day).',
    outcome: 'Flags severe Proportionate Deduction Trap. 50% penalty on surgeon and OT fees increases out-of-pocket from ₹14,000 to ₹73,000.',
    keyBadge: '50% Proportionate Penalty Trap',
    badgeColor: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    id: 'sc-03',
    name: 'Scenario 03 — Rajesh Kumar',
    personaName: 'Rajesh Kumar',
    ageGender: '52M',
    city: 'Bengaluru',
    insurer: 'Care Health Care Advantage',
    sumInsured: '₹7,00,000',
    hospital: 'Fortis Hospital (Cunningham Rd)',
    procedure: 'Inguinal Hernia Repair',
    category: 'UNCERTAINTY',
    categoryLabel: 'Uncertain Network',
    dilemma: 'Hospital cashless network status is unconfirmed in reference tables.',
    outcome: 'Preserves UNKNOWN status (Principle: "Uncertainty is not falsehood") and generates 3 copyable questions for the hospital TPA desk.',
    keyBadge: 'Explicit UNKNOWN Handling',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc-04',
    name: 'Scenario 04 — Priya Patel',
    personaName: 'Priya Patel',
    ageGender: '35F',
    city: 'Bengaluru',
    insurer: 'Niva Bupa Health Companion',
    sumInsured: '₹10,00,000',
    hospital: 'Aster CMI Hospital (Hebbal)',
    procedure: 'Laparoscopic Cholecystectomy',
    category: 'EMERGENCY',
    categoryLabel: 'Emergency Pre-Auth',
    dilemma: 'Emergency acute gallstone admission with pre-authorization pending at hospital TPA desk.',
    outcome: 'Triggers emergency cashless protocol, 24-hour pre-auth submission checklist, and diagnostic bill retention alerts.',
    keyBadge: '24h Pre-Auth Checklist',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'sc-05',
    name: 'Scenario 05 — Vikram Singh',
    personaName: 'Vikram Singh',
    ageGender: '61M',
    city: 'Bengaluru',
    insurer: 'ICICI Lombard Health Care',
    sumInsured: '₹15,00,000',
    hospital: 'Sakra World Hospital',
    procedure: 'Robotic Prostatectomy',
    category: 'ROOM_TRAP',
    categoryLabel: 'Sublimits & Consumables',
    dilemma: 'Robotic procedure with sub-limit clauses and high surgical consumable costs.',
    outcome: 'Breaks down non-payable consumables (₹28,000 for robotic accessories & PPE) and checks policy sub-limit ceiling.',
    keyBadge: 'Consumable Bill Breakdown',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'sc-06',
    name: 'Scenario 06 — Meera Iyer',
    personaName: 'Meera Iyer',
    ageGender: '29F',
    city: 'Bengaluru',
    insurer: 'Custom Policy Document',
    sumInsured: 'Configurable',
    hospital: 'Any City Hospital',
    procedure: 'Configurable Procedure',
    category: 'UNCERTAINTY',
    categoryLabel: 'Document Ingestion',
    dilemma: 'New user uploading an unindexed policy PDF/image to extract insurance parameters.',
    outcome: 'Demonstrates multi-format OCR extraction, cryptographic SHA-256 checksums, and human-in-the-loop review modal.',
    keyBadge: 'SHA-256 Document Upload',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc-07',
    name: 'Scenario 07 — Arjun Reddy',
    personaName: 'Arjun Reddy',
    ageGender: '55M',
    city: 'Bengaluru',
    insurer: 'Corporate Cover (₹3L) + Top-Up (₹10L)',
    sumInsured: '₹13,00,000 (Combined)',
    hospital: 'Narayana Health (Mazumdar Shaw)',
    procedure: 'CABG Coronary Bypass',
    category: 'MULTI_POLICY',
    categoryLabel: 'Multi-Policy Top-Up',
    dilemma: 'High-cost cardiac surgery exceeding base corporate cover threshold.',
    outcome: 'Calculates primary policy exhaustion and coordinates secondary super top-up deductible crossover submission.',
    keyBadge: 'Top-Up Deductible Coordination',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'sc-08',
    name: 'Scenario 08 — Ramesh Kumar',
    personaName: 'Ramesh Kumar',
    ageGender: '60M',
    city: 'Bengaluru',
    insurer: 'Ayushman Bharat PM-JAY',
    sumInsured: '₹5,00,000',
    hospital: 'Bowring & Lady Curzon Hospital',
    procedure: 'Cataract Surgery',
    category: 'GOV_SCHEME',
    categoryLabel: 'Government PM-JAY',
    dilemma: 'Low-income PM-JAY beneficiary seeking 100% cashless surgery at empanelled hospital.',
    outcome: 'Validates statutory PM-JAY package rate with ₹0 out-of-pocket expense (100% Free / Cashless guarantee).',
    keyBadge: '100% Cashless Govt Scheme',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'sc-09',
    name: 'Scenario 09 — Sunita Rao',
    personaName: 'Sunita Rao',
    ageGender: '45F',
    city: 'Bengaluru',
    insurer: 'National Insurance Parivar',
    sumInsured: '₹3,00,000',
    hospital: 'Manipal Hospital North',
    procedure: 'Total Laparoscopic Hysterectomy',
    category: 'UNCERTAINTY',
    categoryLabel: 'OCR Ambiguity Review',
    dilemma: 'Low OCR confidence extraction on physical policy schedule clause terms.',
    outcome: 'Displays side-by-side extraction review modal with confidence flags before committing rules to patient context.',
    keyBadge: 'Side-by-Side OCR Review',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  {
    id: 'sc-10',
    name: 'Scenario 10 — Kavita Nair',
    personaName: 'Kavita Nair',
    ageGender: '38F',
    city: 'Bengaluru',
    insurer: 'Star Health Comprehensive',
    sumInsured: '₹5,00,000',
    hospital: 'Non-Empanelled Day Care Clinic',
    procedure: 'Knee Arthroscopy',
    category: 'CASHLESS',
    categoryLabel: 'Out-of-Network Transfer',
    dilemma: 'Planning admission at non-empanelled clinic with reimbursement delay risks.',
    outcome: 'Flags reimbursement risk and recommends 3 nearby in-network cashless alternative hospitals with room cap alignment.',
    keyBadge: '3 In-Network Alternatives',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'sc-11',
    name: 'Scenario 11 — Full Demo Tour',
    personaName: 'Full Demo Tour',
    ageGender: '42F',
    city: 'Bengaluru',
    insurer: 'Star Health Comprehensive',
    sumInsured: '₹5,00,000',
    hospital: 'Manipal Hospital (Old Airport Rd)',
    procedure: 'Total Knee Replacement',
    category: 'ALL',
    categoryLabel: 'Complete Walkthrough',
    dilemma: 'Full end-to-end presentation and evaluation walkthrough.',
    outcome: 'Seamless closed-loop journey across Hospital Matcher, Cost Simulator, Journey Timeline, Verification, and Policy RAG.',
    keyBadge: 'Complete Feature Tour',
    badgeColor: 'bg-linear-to-r from-teal-100 to-indigo-100 text-indigo-900 border-indigo-200'
  }
];

interface ScenarioReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const ScenarioReferenceModal: React.FC<ScenarioReferenceModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All Scenarios (11)' },
    { id: 'CASHLESS', label: 'Cashless Empanelment' },
    { id: 'ROOM_TRAP', label: 'Room Rent Deductions' },
    { id: 'GOV_SCHEME', label: 'Govt PM-JAY' },
    { id: 'EMERGENCY', label: 'Emergency Pre-Auth' },
    { id: 'MULTI_POLICY', label: 'Top-Up & Multi-Policy' },
    { id: 'UNCERTAINTY', label: 'Uncertainty & OCR' }
  ];

  const filteredScenarios = SCENARIOS_CATALOG.filter((sc) => {
    const matchesCategory = selectedCategory === 'ALL' || sc.category === selectedCategory;
    const matchesSearch = 
      sc.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.insurer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.procedure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.dilemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.outcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  CareIQ Scenario Reference Matrix
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500 text-slate-950 uppercase tracking-wide">
                  11 Scenarios
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Explore synthetic test personas representing real-world insurance and admission dilemmas across India.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          {/* Search Box */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by persona, insurer, clinical procedure, hospital, or dilemma..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 shadow-2xs font-medium"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[58vh] space-y-3.5">
          {filteredScenarios.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching scenarios found for &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredScenarios.map((sc) => (
              <div
                key={sc.id}
                className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
              >
                {/* Top Row: Scenario ID + Persona + Tags */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                      {sc.id.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sc.personaName} ({sc.ageGender}, {sc.city})
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sc.badgeColor}`}>
                      {sc.keyBadge}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-2 px-3 bg-slate-50/80 rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                    <span className="text-slate-500 font-medium">Policy:</span>
                    <span className="font-bold text-slate-800 truncate">{sc.insurer} ({sc.sumInsured})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-600 shrink-0" />
                    <span className="text-slate-500 font-medium">Hospital:</span>
                    <span className="font-bold text-slate-800 truncate">{sc.hospital}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-purple-600 shrink-0" />
                    <span className="text-slate-500 font-medium">Procedure:</span>
                    <span className="font-bold text-slate-800 truncate">{sc.procedure}</span>
                  </div>
                </div>

                {/* Bottom Row: Dilemma & Outcome + Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-600 font-normal">
                      <strong className="text-slate-800 font-bold">Dilemma: </strong>
                      {sc.dilemma}
                    </p>
                    <p className="text-teal-800 font-medium">
                      <strong className="text-teal-950 font-bold">CareIQ Outcome: </strong>
                      {sc.outcome}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectScenario(sc.id);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/30 transition-all cursor-pointer shrink-0 self-end sm:self-center"
                  >
                    <PlayCircle size={14} />
                    Load Scenario
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Click &quot;Load Scenario&quot; to test real-time policy extraction, scoring & RAG responses.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
