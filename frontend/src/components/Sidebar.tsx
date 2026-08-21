import React from 'react';
import { 
  ShieldCheck,
  Activity, 
  Building2, 
  Sparkles, 
  IndianRupee, 
  AlertCircle,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingVerificationCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingVerificationCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      description: 'Overview & Key Metrics'
    },
    {
      id: 'hospitals',
      label: 'Hospital Matcher',
      icon: Building2,
      description: 'Network & Tariff Comparison'
    },
    {
      id: 'insurance',
      label: 'Insurance & Policies',
      icon: ShieldCheck,
      description: 'Coverage & Pre-auth Rules'
    },
    {
      id: 'journey',
      label: 'Care Journey',
      icon: Sparkles,
      description: 'Admission to Discharge Trajectory'
    },
    {
      id: 'cost',
      label: 'Cost Breakdown',
      icon: IndianRupee,
      description: 'Out-of-pocket Estimates'
    },
    {
      id: 'verification',
      label: 'Verification Center',
      icon: AlertCircle,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
      description: 'Actionable Guardrails'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Classical Fixed Left Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 h-screen w-64 bg-white border-r border-slate-200/90 z-40 flex flex-col justify-between p-4 shadow-xs
          transition-transform duration-300 ease-in-out shrink-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Top Brand Header (Subtle single solid color) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div 
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => {
                  onSelectTab('dashboard');
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <div className="bg-teal-700 text-white p-2 rounded-xl flex items-center justify-center shadow-xs">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900">
                      CareIQ
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      2026
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                    Decision Support Platform
                  </p>
                </div>
              </div>

              {/* Mobile Close Button */}
              {onCloseMobile && (
                <button 
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Section Title */}
            <div className="px-2 mb-2">
              <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Dashboard Menu
              </h2>
            </div>

            {/* Vertical Navigation Options (Subtle solid single color when active) */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group
                      ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-xs font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs leading-tight truncate">
                          {item.label}
                        </div>
                        <div className={`text-[10px] font-normal truncate mt-0.5 ${
                          isActive ? 'text-teal-100' : 'text-slate-400 group-hover:text-slate-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`ml-2 px-1.5 py-0.3 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isActive ? 'bg-white text-teal-800' : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-slate-100 px-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>CareIQ v2026.1</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Active Session
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
