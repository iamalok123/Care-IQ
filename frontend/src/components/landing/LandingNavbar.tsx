import React, { useState } from 'react';
import { LayoutDashboard, Menu, PlayCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface LandingNavbarProps {
  onLaunchApp: () => void;
  onStartJourney?: () => void;
  onViewDemo?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onLaunchApp,
  onStartJourney,
  onViewDemo
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const { isAuthenticated, loading } = useAuth();

  const handleAction = onStartJourney || onLaunchApp;

  const navLinks = [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
    { id: 'case-studies', label: 'Case Studies', href: '#case-studies' },
    { id: 'faq', label: 'FAQ', href: '#faq' }
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">

      {/* Clean Crystal Glassmorphic Navbar */}
      <motion.header
        initial={{ y: -30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto w-full max-w-260 rounded-full bg-white/85 backdrop-blur-3xl border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] px-4 sm:px-6 py-2 flex items-center justify-between transition-all duration-300 relative overflow-hidden"
      >
        {/* Brand Logo & Name — returns to the top of the page, not into the signup flow */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 cursor-pointer select-none z-10 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="CareIQ — back to top"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 p-1 flex items-center justify-center">
              <img src="/logo.svg" alt="" className="w-full h-full object-contain brightness-0 invert" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-slate-950 flex items-center">
              Care<span className="text-blue-600">IQ</span>
            </span>
          </div>
        </motion.button>

        {/* Desktop Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 z-10">
          {navLinks.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs transition-all duration-200 select-none ${
                  isActive
                    ? 'text-slate-950 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                    : 'text-slate-600 font-semibold hover:text-slate-950 hover:bg-slate-100/50'
                }`}
              >
                {/* Ultra-Translucent Slight Gray Liquid Glass Pill */}
                {isActive && (
                  <motion.span
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-slate-900/8 backdrop-blur-2xl border border-slate-900/10 border-t-white/90 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.04)] -z-10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions — session aware */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          {loading ? (
            /* Held while the stored session is verified, so a stale token can't
               flash "Dashboard" and then swap to "Get Started". */
            <div
              className="h-9 w-28 rounded-full bg-slate-100 border border-slate-200/80 animate-pulse"
              aria-hidden="true"
            />
          ) : isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAction}
              className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-tight bg-slate-950 hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-800 select-none inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onViewDemo}
                aria-label="View demo profiles"
                className="px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-tight bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer select-none inline-flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <PlayCircle size={14} className="text-blue-600" />
                <span className="hidden sm:inline">Demo</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAction}
                className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold tracking-tight bg-slate-950 hover:bg-slate-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-800 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                Get Started
              </motion.button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Slide-down Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto absolute top-18 w-[92%] max-w-100 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 p-5 shadow-2xl flex flex-col gap-3 text-slate-800 text-sm"
          >
            {navLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-xs flex items-center justify-between text-slate-700 hover:text-slate-950"
              >
                <span>{item.label}</span>
              </a>
            ))}

            {!loading && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAction();
                    }}
                    className="w-full py-2.5 rounded-full text-center text-xs font-bold bg-slate-950 text-white shadow-md cursor-pointer hover:bg-slate-900 inline-flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onViewDemo?.();
                      }}
                      className="w-full py-2.5 rounded-full text-center text-xs font-bold bg-white text-slate-800 border border-slate-200 cursor-pointer hover:bg-slate-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle size={14} className="text-blue-600" />
                      Demo
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleAction();
                      }}
                      className="w-full py-2.5 rounded-full text-center text-xs font-bold bg-slate-950 text-white shadow-md cursor-pointer hover:bg-slate-900"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingNavbar;
