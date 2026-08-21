import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck,
  Activity, 
  Building2, 
  Sparkles, 
  IndianRupee, 
  AlertCircle,
  X
} from 'lucide-react';
import { useCareIQ } from '../../context/CareIQContext';

interface SidebarProps {
  pendingVerificationCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingVerificationCount: propPendingCount,
  isOpenMobile: propIsOpenMobile,
  onCloseMobile: propOnCloseMobile
}) => {
  const { 
    pendingCount: contextPendingCount, 
    isMobileSidebarOpen, 
    setIsMobileSidebarOpen 
  } = useCareIQ();

  const pendingCount = propPendingCount !== undefined ? propPendingCount : contextPendingCount;
  const isOpen = propIsOpenMobile !== undefined ? propIsOpenMobile : isMobileSidebarOpen;
  const handleClose = propOnCloseMobile || (() => setIsMobileSidebarOpen(false));

  const location = useLocation();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: Activity
    },
    {
      to: '/hospital-matcher',
      label: 'Hospital Matcher',
      icon: Building2
    },
    {
      to: '/insurance',
      label: 'Insurance & Policies',
      icon: ShieldCheck
    },
    {
      to: '/care-journey',
      label: 'Care Journey',
      icon: Sparkles
    },
    {
      to: '/cost-breakdown',
      label: 'Cost Breakdown',
      icon: IndianRupee
    },
    {
      to: '/verification-center',
      label: 'Verification Center',
      icon: AlertCircle,
      badge: pendingCount > 0 ? pendingCount : undefined
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Classical Fixed Left Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 h-screen w-64 bg-white border-r border-slate-200/90 z-40 flex flex-col justify-between p-4 shadow-xs
          transition-transform duration-300 ease-in-out shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div>
            {/* Top Brand Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
              <Link 
                to="/dashboard"
                onClick={handleClose}
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-teal-900 flex items-center justify-center p-2 shadow-xs shrink-0 transition-colors">
                  <img src="/logo.svg" alt="CareIQ Logo" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900">
                      CareIQ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                    Decision Support Platform
                  </p>
                </div>
              </Link>

              {/* Mobile Close Button */}
              <button 
                onClick={handleClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vertical Navigation Options */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to || 
                  (item.to === '/hospital-matcher' && location.pathname === '/hospitals') ||
                  (item.to === '/care-journey' && location.pathname === '/journey') ||
                  (item.to === '/cost-breakdown' && location.pathname === '/cost') ||
                  (item.to === '/verification-center' && location.pathname === '/verification') ||
                  (item.to === '/insurance' && location.pathname === '/insurance-policies');
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleClose}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group
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
                      <span className="text-xs leading-tight truncate">
                        {item.label}
                      </span>
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
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 mt-4 border-t border-slate-100 px-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>CareIQ</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Active Session
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
