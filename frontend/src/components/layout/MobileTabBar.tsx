import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Compass,
  CheckSquare
} from 'lucide-react';
import { useCareIQ } from '../../context/CareIQContext';

export const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const { verificationItems } = useCareIQ();
  const pendingCount = (verificationItems ?? []).filter((v) => v.status === 'PENDING').length;

  const tabs = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/hospital-matcher',
      label: 'Hospitals',
      icon: Building2
    },
    {
      to: '/insurance',
      label: 'Insurance',
      icon: ShieldCheck
    },
    {
      to: '/care-journey',
      label: 'Journey',
      icon: Compass
    },
    {
      to: '/verification-center',
      label: 'Verify',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-teal-600 mt-1" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
