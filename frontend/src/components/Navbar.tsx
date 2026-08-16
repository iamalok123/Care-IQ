import React from 'react';
import { ShieldCheck, UserCheck, PlayCircle, AlertCircle, Sparkles, Building2, Activity, IndianRupee } from 'lucide-react';

interface NavbarProps {
  patients: any[];
  activePatient: any;
  onSelectPatient: (patient: any) => void;
  scenarios: any[];
  onLoadScenario: (scenarioId: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingVerificationCount: number;
  loadingScenario?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  scenarios,
  onLoadScenario,
  activeTab,
  onSelectTab,
  pendingVerificationCount,
  loadingScenario
}) => {
  return (
    <header className="sticky top-3 z-50 mx-3 md:mx-6 my-3 p-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Mission Tagline */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onSelectTab('dashboard')}
        >
          <div className="bg-linear-to-br from-teal-600 to-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-teal-700 to-indigo-800 bg-clip-text text-transparent">
                CareIQ
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                Precision Care 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Insurance-aware hospital care decision support
            </p>
          </div>
        </div>

        {/* Global Controls: Demo Loader & Patient Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Persona Demo Loader */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <PlayCircle size={16} className="text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-600">Demo Persona:</span>
            <select
              disabled={loadingScenario}
              onChange={(e) => {
                if (e.target.value) onLoadScenario(e.target.value);
              }}
              defaultValue=""
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer max-w-40 truncate"
            >
              <option value="" disabled>Select Scenario...</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name.split('—')[1] || sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-teal-50/80 border border-teal-200 px-3 py-1.5 rounded-xl shadow-xs">
            <UserCheck size={16} className="text-teal-700 shrink-0" />
            <span className="text-xs font-bold text-teal-800">Patient:</span>
            <select
              value={activePatient?.id || ''}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) onSelectPatient(found);
              }}
              className="bg-transparent text-xs font-bold text-teal-800 outline-hidden cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.city})
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <nav className="flex items-center gap-2 mt-3.5 pt-3 border-t border-slate-100 overflow-x-auto pb-0.5">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'hospitals', label: 'Hospital Matcher', icon: Building2 },
          { id: 'insurance', label: 'Insurance & Policies', icon: ShieldCheck },
          { id: 'journey', label: 'Care Journey', icon: Sparkles },
          { id: 'cost', label: 'Cost Breakdown', icon: IndianRupee },
          {
            id: 'verification',
            label: 'Verification Center',
            icon: AlertCircle,
            badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined
          }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-red-100 text-red-700' : 'bg-red-500 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
