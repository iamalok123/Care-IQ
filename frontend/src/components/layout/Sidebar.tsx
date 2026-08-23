import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Building2,
  ShieldCheck,
  Sparkles,
  Clock,
  IndianRupee,
  X,
  ChevronDown,
  LogOut,
  User,
  UserPlus,
  Briefcase,
  Check
} from 'lucide-react';
import { useCareIQ } from '../../context/CareIQContext';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activePatient,
    handleLoadDemoProfile,
    accountType,
    pendingCount: contextPendingCount,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useCareIQ();

  const { user, isAuthenticated, isDemoMode, logout } = useAuth();

  const [isSwitchProfileOpen, setIsSwitchProfileOpen] = useState(false);
  const switchMenuRef = useRef<HTMLDivElement>(null);

  const pendingCount = propPendingCount !== undefined ? propPendingCount : contextPendingCount;
  const isOpen = propIsOpenMobile !== undefined ? propIsOpenMobile : isMobileSidebarOpen;
  const handleClose = propOnCloseMobile || (() => setIsMobileSidebarOpen(false));

  const isAuthorizedUser = Boolean(isAuthenticated && !isDemoMode && accountType === 'NEW_USER');

  // Close switch profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switchMenuRef.current && !switchMenuRef.current.contains(event.target as Node)) {
        setIsSwitchProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDemo = async (demoId: string) => {
    setIsSwitchProfileOpen(false);
    await handleLoadDemoProfile(demoId);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/get-started');
  };

  const displayName = activePatient?.display_name || user?.email?.split('@')[0] || 'CareIQ User';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const patientAge = activePatient?.age ? `${activePatient.age} yrs` : '';
  const patientGender = activePatient?.gender || '';
  const patientCity = activePatient?.city || '';
  const userSubtitle =
    [patientAge, patientGender, patientCity].filter(Boolean).join(' • ') ||
    user?.email ||
    (isAuthorizedUser ? 'Verified Patient' : 'Interactive Demo');

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

  const navSections = [
    {
      title: 'MENU',
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

      {/* Modern Clean White Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 h-screen w-64 bg-white border-r border-slate-200/90 z-40 flex flex-col justify-between p-3.5 shadow-xs
          transition-transform duration-300 ease-in-out shrink-0 select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between overflow-hidden">
          {/* Scrollable Top & Navigation Area */}
          <div className="overflow-y-auto flex-1 pr-1 pb-3 scrollbar-thin">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
              <Link
                to="/dashboard"
                onClick={handleClose}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center p-1.5 shadow-xs shrink-0 group-hover:bg-teal-900 transition-colors">
                  <img src="/logo.svg" alt="CareIQ Logo" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                    Care<span className="text-blue-600">IQ</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block leading-none mt-0.5">
                    Decision Platform
                  </span>
                </div>
              </Link>

              {/* Mobile Drawer Close Button */}
              <button
                onClick={handleClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grouped Section Navigation */}
            <div className="space-y-4">
              {navSections.map((section) => (
                <div key={section.title}>
                  {/* Category Title */}
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase px-3 mb-1.5">
                    {section.title}
                  </h3>

                  {/* Section Navigation Items */}
                  <nav className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.to ||
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
                            w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer group relative
                            ${
                              isActive
                                ? 'bg-slate-950 text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              size={17}
                              strokeWidth={2}
                              className={`shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                              }`}
                            />
                            <span className="text-[13px] leading-tight truncate">
                              {item.label}
                            </span>
                          </div>

                          {/* Verification Count Badge */}
                          {item.badge !== undefined && (
                            <span
                              className={`ml-2 w-4.5 h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                                isActive ? 'bg-rose-500 text-white' : 'bg-rose-600 text-white'
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

          {/* ========================================================================= */}
          {/* CLEAN LIGHT-THEME USER ACCOUNT WIDGET                                     */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 relative shrink-0" ref={switchMenuRef}>
            {/* Popover Persona Switcher (Only in Demo Mode) */}
            <AnimatePresence>
              {!isAuthorizedUser && isSwitchProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 text-slate-900 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-blue-600" />
                      Switch Demo Persona
                    </span>
                    <button
                      onClick={() => setIsSwitchProfileOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5 scrollbar-thin">
                    {demoOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = activePatient?.display_name === opt.name;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectDemo(opt.id)}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-start gap-2 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon size={13} className={opt.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[12px] font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                                {opt.name}
                              </span>
                              {isActive && <Check size={12} className="text-blue-600 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{opt.meta}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Create custom account option */}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <Link
                      to="/get-started?tab=register"
                      onClick={() => {
                        setIsSwitchProfileOpen(false);
                        handleClose();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl text-left flex items-center gap-2 text-[11px] font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <UserPlus size={13} className="text-blue-600" />
                      <span>+ Create Custom Account</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clean Light-Themed Account Card */}
            <div className="bg-slate-50/90 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs transition-colors">
              {/* User Profile Header Row */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {avatarInitial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {displayName}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border shrink-0 ${
                        isAuthorizedUser
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isAuthorizedUser ? 'USER' : 'DEMO'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {userSubtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="pt-2 mt-2 border-t border-slate-200/70 space-y-0.5">
                {isAuthorizedUser ? (
                  /* ========================================================= */
                  /* 1. AUTHORIZED USER: Clean & Minimal (Only Sign Out)       */
                  /* ========================================================= */
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={13} className="text-rose-600 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  /* ========================================================= */
                  /* 2. DEMO USER: Switch Persona, Sign In, Exit Demo          */
                  /* ========================================================= */
                  <>
                    {/* Switch Demo Persona */}
                    <button
                      type="button"
                      onClick={() => setIsSwitchProfileOpen(!isSwitchProfileOpen)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-blue-600 group-hover:rotate-12 transition-transform shrink-0" />
                        <span>Switch Persona</span>
                      </div>
                      <ChevronDown
                        size={12}
                        className={`text-slate-400 transition-transform duration-150 ${isSwitchProfileOpen ? 'rotate-180 text-blue-600' : ''}`}
                      />
                    </button>

                    {/* Sign In to Real Account */}
                    <Link
                      to="/get-started?tab=login"
                      onClick={handleClose}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                      <User size={13} className="text-slate-600 shrink-0" />
                      <span>Sign In to Account</span>
                    </Link>

                    {/* Exit Demo Mode */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={13} className="text-rose-600 shrink-0" />
                      <span>Exit Demo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
