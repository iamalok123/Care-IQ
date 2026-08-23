import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { useCareIQ } from '../../context/CareIQContext';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar: propOnToggleMobileSidebar }) => {
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, activePolicy } = useCareIQ();
  const onToggleMobileSidebar =
    propOnToggleMobileSidebar || (() => setIsMobileSidebarOpen(!isMobileSidebarOpen));

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between gap-3 max-w-350 mx-auto">
        {/* Left: Brand Logo (mobile) & Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo Link */}
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs shrink-0 group-hover:bg-teal-900 transition-colors">
              <img src="/logo.svg" alt="CareIQ" className="w-full h-full object-contain brightness-0 invert" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">CareIQ</span>
          </Link>

          {/* Desktop Title & Subtitle */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 tracking-tight">
                CareIQ Decision Support
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Hospital & Insurance Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Precision cashless matching, cost exposure estimation & policy clause citations
            </p>
          </div>
        </div>

        {/* Right Area: Status badges & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Policy Pill / Quick Status */}
          {activePolicy && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span className="truncate max-w-48">{activePolicy.policy_name}</span>
            </div>
          )}

          {/* Real-time Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-600">Engine Active</span>
          </div>

          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
            aria-label="Open navigation menu"
          >
            <Menu size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
