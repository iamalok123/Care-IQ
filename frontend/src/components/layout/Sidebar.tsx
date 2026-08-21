import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid,
  Building2, 
  ShieldCheck,
  Sparkles, 
  Clock, 
  IndianRupee,
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

  const navSections = [
    {
      title: 'GENERAL',
      items: [
        {
          to: '/dashboard',
          label: 'Dashboard',
          icon: LayoutGrid
        }
      ]
    },
    {
      title: 'CARE & NETWORK',
      items: [
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
          to: '/verification-center',
          label: 'Verification Center',
          icon: Clock,
          badge: pendingCount > 0 ? pendingCount : undefined
        }
      ]
    },
    {
      title: 'TOOLS & MATH',
      items: [
        {
          to: '/cost-breakdown',
          label: 'Cost Breakdown',
          icon: IndianRupee
        }
      ]
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
          fixed top-0 left-0 bottom-0 h-screen w-64 bg-white border-r border-slate-200/90 z-40 flex flex-col justify-between p-5 shadow-xs
          transition-transform duration-300 ease-in-out shrink-0 select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          <div>
            {/* Top Brand Header (Clean brand logo without 3-lines menu on desktop) */}
            <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-100">
              <Link 
                to="/dashboard"
                onClick={handleClose}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center p-2 shadow-xs shrink-0 group-hover:bg-teal-900 transition-colors">
                  <img src="/logo.svg" alt="CareIQ Logo" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                    CareIQ
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
                    Decision Platform
                  </span>
                </div>
              </Link>

              {/* Mobile Drawer Close Button (Only visible on mobile when drawer is open) */}
              <button 
                onClick={handleClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grouped Section Navigation with increased vertical spacing */}
            <div className="space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  {/* Category Title */}
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-3 mb-2.5">
                    {section.title}
                  </h3>

                  {/* Section Navigation Items with generous vertical gap */}
                  <nav className="space-y-2">
                    {section.items.map((item) => {
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
                            w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer
                            ${
                              isActive
                                ? 'bg-[#18181B] text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon 
                              size={18} 
                              strokeWidth={1.9}
                              className={`shrink-0 ${
                                isActive 
                                  ? 'text-white' 
                                  : 'text-slate-500'
                              }`} 
                            />
                            <span className="text-[13.5px] leading-tight truncate">
                              {item.label}
                            </span>
                          </div>

                          {/* Red Circular Badge (like the reference image) */}
                          {item.badge !== undefined && (
                            <span
                              className={`ml-2 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                                isActive 
                                  ? 'bg-rose-500 text-white' 
                                  : 'bg-[#E11D48] text-white'
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
              ))}
            </div>
          </div>

          {/* Clean Minimalist Sidebar Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 px-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span className="font-semibold text-slate-500">CareIQ</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Session
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
