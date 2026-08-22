import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  Briefcase,
  UserPlus,
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { useCareIQ } from '../../context/CareIQContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar: propOnToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const {
    activePatient,
    handleLoadDemoProfile,
    accountType,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useCareIQ();
  const { user, isDemoMode, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onToggleMobileSidebar =
    propOnToggleMobileSidebar || (() => setIsMobileSidebarOpen(!isMobileSidebarOpen));

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDemo = async (demoId: string) => {
    setIsDropdownOpen(false);
    await handleLoadDemoProfile(demoId);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/get-started');
  };

  const displayName = activePatient?.display_name || user?.email?.split('@')[0] || 'CareIQ User';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const patientAge = activePatient?.age ? `${activePatient.age} yrs` : '';
  const patientGender = activePatient?.gender || '';
  const patientCity = activePatient?.city || '';

  const demoOptions = [
    {
      id: 'demo-01-private-insurance',
      name: 'Ananya Sharma',
      meta: '38F • Star Health ₹5L • Bengaluru',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      badge: 'Private'
    },
    {
      id: 'demo-02-gov-scheme',
      name: 'Rajesh Verma',
      meta: '55M • PM-JAY ₹5L • Mumbai',
      icon: Building2,
      iconColor: 'text-sky-600',
      badge: 'PM-JAY'
    },
    {
      id: 'demo-03-corporate-plan',
      name: 'Meera Iyer',
      meta: '32F • ICICI Lombard ₹7L • Bengaluru',
      icon: Briefcase,
      iconColor: 'text-purple-600',
      badge: 'Corporate'
    }
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between gap-3 max-w-350 mx-auto">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo Link */}
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center p-1.5 shadow-xs text-white">
              <HeartPulse size={18} />
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

        {/* Right Area: Active User Info Pill + Account Toggle + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active User Info Pill */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 pl-1.5 pr-3 py-1 rounded-xl shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {avatarInitial}
            </div>

            <div className="text-left leading-tight hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 max-w-36 truncate">
                  {displayName}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${
                    accountType === 'NEW_USER'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  {accountType === 'NEW_USER' ? 'User' : 'Demo'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {[patientAge, patientGender, patientCity].filter(Boolean).join(' • ')}
              </div>
            </div>
          </div>

          {/* Account Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles size={13} className="text-indigo-600" />
              <span className="hidden md:inline">Switch Profile</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Persona
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Select a curated scenario or create a personalized profile
                  </div>
                </div>

                {/* 3 Curated Demos */}
                <div className="py-1">
                  {demoOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = activePatient?.display_name === opt.name;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectDemo(opt.id)}
                        className={`w-full px-3.5 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          isActive ? 'bg-indigo-50/60' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={14} className={opt.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {opt.name}
                            </span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{opt.meta}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-1" />

                {/* Create Custom Profile Option */}
                <Link
                  to="/get-started"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <UserPlus size={14} className="text-slate-500" />
                  <span>Create Personalized Profile</span>
                </Link>

                {/* Sign In link if in demo mode */}
                {isDemoMode && (
                  <Link
                    to="/auth?tab=login"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User size={14} className="text-slate-500" />
                    <span>Sign In to Account</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Logout / Exit Demo Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={isDemoMode ? 'Exit Demo Mode' : 'Sign Out of CareIQ'}
          >
            <LogOut size={13} className="text-slate-600" />
            <span className="hidden sm:inline">{isDemoMode ? 'Exit Demo' : 'Sign Out'}</span>
          </button>

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
