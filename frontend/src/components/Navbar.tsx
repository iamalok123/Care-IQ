import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  PlayCircle, 
  Menu, 
  Compass, 
  Sparkles
} from 'lucide-react';
import { InfoPopover } from './InfoPopover';

interface NavbarProps {
  patients: any[];
  activePatient: any;
  onSelectPatient: (patient: any) => void;
  scenarios: any[];
  onLoadScenario: (scenarioId: string) => void;
  onSelectTab: (tab: string) => void;
  loadingScenario?: boolean;
  onToggleMobileSidebar?: () => void;
  onOpenOnboarding?: () => void;
  onOpenScenarioGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  scenarios,
  onLoadScenario,
  onSelectTab,
  loadingScenario,
  onToggleMobileSidebar,
  onOpenOnboarding,
  onOpenScenarioGuide
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 max-w-350 mx-auto">
        
        {/* Mobile / Desktop Brand & Subtitle */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            {/* Mobile sidebar toggle button */}
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 sm:border-0"
                aria-label="Toggle navigation menu"
              >
                <Menu size={18} />
              </button>
            )}

            {/* Mobile Brand View */}
            <div
              className="flex items-center gap-2 cursor-pointer lg:hidden"
              onClick={() => onSelectTab('dashboard')}
            >
              <div className="bg-linear-to-br from-teal-600 to-indigo-600 text-white p-1.5 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="text-base font-black tracking-tight text-slate-800">
                CareIQ
              </span>
            </div>

            {/* Desktop Title & Subtitle (Clean without unnecessary (i) button) */}
            <div className="hidden lg:block">
              <h1 className="text-sm font-black text-slate-900 tracking-tight">
                Hospital & Insurance Decision Support
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Precision Care Challenge 2026 • Non-clinical decision assistance
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Tour, Scenario Matrix Guide, Demo Loader, Patient Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          
          {/* Welcome Guide Trigger */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Open Welcome Guide & Tour"
            >
              <Compass size={14} className="text-indigo-600" />
              <span>Tour Guide</span>
            </button>
          )}

          {/* Scenario Reference Matrix Modal Trigger */}
          {onOpenScenarioGuide && (
            <button
              type="button"
              onClick={onOpenScenarioGuide}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Open 11 Scenarios Comparative Reference Guide"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Scenario Guide</span>
              <span className="sm:hidden">Scenarios</span>
            </button>
          )}

          {/* Persona Demo Loader */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs text-xs flex-1 sm:flex-none">
            <PlayCircle size={15} className="text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-600 hidden md:inline shrink-0">Demo Persona:</span>
            <select
              disabled={loadingScenario}
              onChange={(e) => {
                if (e.target.value) onLoadScenario(e.target.value);
              }}
              defaultValue=""
              className="bg-transparent font-semibold text-slate-800 outline-hidden cursor-pointer w-full sm:max-w-44 truncate text-xs"
            >
              <option value="" disabled>Select Scenario...</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name.split('—')[1] || sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selector Container with Isolated (i) Info Button */}
          <div className="flex items-center gap-1 bg-teal-50/90 border border-teal-200 pl-2.5 pr-1.5 py-1 rounded-xl shadow-2xs text-xs flex-1 sm:flex-none">
            <UserCheck size={15} className="text-teal-700 shrink-0" />
            <span className="font-bold text-teal-800 hidden md:inline shrink-0">Patient:</span>
            
            <select
              value={activePatient?.id || ''}
              onChange={(e) => {
                const found = patients.find((p) => p.id === e.target.value);
                if (found) onSelectPatient(found);
              }}
              className="bg-transparent font-bold text-teal-900 outline-hidden cursor-pointer w-full sm:max-w-40 truncate text-xs pr-1"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.city})
                </option>
              ))}
            </select>

            {/* Dedicated, isolated InfoPopover for Patient Details */}
            {activePatient && (
              <div className="shrink-0 pl-0.5" onClick={(e) => e.stopPropagation()}>
                <InfoPopover
                  title={`${activePatient.display_name} — Details`}
                  size="xs"
                  variant="teal"
                  align="right"
                  content="Active synthetic patient context loaded into CareIQ decision engines."
                  details={[
                    { label: 'Age & Gender', value: `${activePatient.age || 42} / ${activePatient.gender || 'Female'}` },
                    { label: 'Location', value: activePatient.city || 'Bengaluru' },
                    { label: 'Admission Type', value: activePatient.admission_type || 'Elective Planned' },
                    { label: 'Active Diagnosis', value: activePatient.diagnosis || 'Clinical Diagnosis' }
                  ]}
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
