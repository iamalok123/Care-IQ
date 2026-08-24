import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  PlayCircle,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PROFILES } from '../../lib/demoProfiles';
import { Spinner } from '../common/Spinner';

/**
 * A rejected fetch() carries browser-specific jargon — "Failed to fetch",
 * "NetworkError…", "Load failed" — which tells a visitor nothing about what to do.
 * Anything else arriving here came from the API's own error payload, so it is
 * written for a reader already and passes through untouched.
 */
const NETWORK_JARGON = /failed to fetch|networkerror|load failed|network request failed/i;

function readableFailure(err: unknown): string {
  const raw = err instanceof Error ? err.message.trim() : '';
  if (!raw || NETWORK_JARGON.test(raw)) {
    return 'We could not reach the CareIQ server. Check your connection, then try again.';
  }
  return raw;
}

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemo, isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ id: string; message: string } | null>(null);

  const busy = loadingId !== null;

  const handleSelect = async (demoId: string) => {
    if (busy) return;
    setFailure(null);
    setLoadingId(demoId);
    try {
      await loginAsDemo(demoId);
      navigate('/dashboard');
    } catch (err) {
      setLoadingId(null);
      setFailure({ id: demoId, message: readableFailure(err) });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Soft top wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-100 bg-[radial-gradient(ellipse_70%_60%_at_50%_-15%,rgba(37,99,235,0.09),transparent)]" />

      {/* Header — mirrors the /get-started chrome so the flow reads as one piece */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shrink-0 group-hover:bg-teal-900 transition-colors">
            <img src="/logo.svg" alt="" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Care<span className="text-blue-600">IQ</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors inline-flex items-center gap-1.5"
            >
              <LayoutDashboard size={13} />
              Go to dashboard
            </Link>
          ) : (
            <Link
              to="/auth?tab=login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <PlayCircle size={12} />
            Guest preview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pick a demo profile
          </h1>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Each one loads a complete patient, policy and care journey, so you can see how the
            coverage rules play out on a real bill. No account needed.
          </p>
        </motion.div>

        {/* Failure notice — a silent console error on the main demo entry point reads as a dead button */}
        {failure && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="max-w-2xl mx-auto w-full mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle size={16} className="text-red-600 shrink-0 sm:mt-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-900">Could not load that profile</p>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{failure.message}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Retries the profile that failed, so the visitor need not find the card again */}
              <button
                type="button"
                onClick={() => handleSelect(failure.id)}
                className="px-2.5 py-1 rounded-lg bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-[11px] font-bold text-red-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <RotateCw size={11} />
                Try again
              </button>
              <button
                type="button"
                onClick={() => setFailure(null)}
                className="text-[11px] font-bold text-red-700 hover:text-red-900 underline underline-offset-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 rounded"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Three profile cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {DEMO_PROFILES.map((profile, index) => {
            const Icon = profile.icon;
            const isLoading = loadingId === profile.id;
            const isDimmed = busy && !isLoading;

            return (
              <motion.div
                key={profile.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.1 + index * 0.07,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={reduceMotion || busy ? undefined : { y: -3 }}
                onClick={() => handleSelect(profile.id)}
                className={`group relative overflow-hidden flex flex-col rounded-2xl border bg-white p-5 transition-all duration-200 ${isDimmed
                    ? 'opacity-40 pointer-events-none border-slate-200'
                    : `cursor-pointer border-slate-200/90 shadow-xs hover:shadow-lg ${profile.accentBorder}`
                  } focus-within:ring-2 focus-within:outline-none ${profile.accentRing}`}
              >
                {/* Indeterminate load bar */}
                {isLoading && (
                  <span className="absolute inset-x-0 top-0 h-0.75 overflow-hidden bg-slate-100">
                    {reduceMotion ? (
                      <span className="block h-full w-full bg-slate-900" />
                    ) : (
                      <motion.span
                        className="block h-full w-1/3 bg-slate-900"
                        animate={{ x: ['-100%', '400%'] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </span>
                )}

                {/* Track */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <Icon size={18} className={profile.accentText} />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${profile.accentChip}`}
                  >
                    {profile.track}
                  </span>
                </div>

                {/* Patient */}
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  {profile.name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{profile.patientMeta}</p>

                {/* Policy facts — label/value rows line up across all three cards so they can be compared */}
                <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
                  {[
                    { label: 'Cover', value: profile.cover },
                    { label: 'Room', value: profile.room },
                    { label: 'Co-pay', value: profile.coPay },
                    { label: 'Hospital', value: profile.hospital }
                  ].map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3 py-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                        {row.label}
                      </dt>
                      <dd className="text-[11px] font-semibold text-slate-800 text-right">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* What this profile demonstrates */}
                <p className="text-[11px] text-slate-500 leading-relaxed mt-3.5 flex-1">
                  {profile.mechanic}
                </p>

                {/* The real focusable control. Enter fires a click that bubbles to the card handler. */}
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Load the ${profile.name} demo profile`}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-950 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors group-hover:bg-slate-800 disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-0.5">
                      <Spinner size="sm" className="text-white" />
                      <span>Loading persona...</span>
                    </div>
                  ) : (
                    <>
                      <span>Load data</span>
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* The other track */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.4, duration: 0.4 }}
          className="text-center text-xs text-slate-500 mt-10"
        >
          Want to use your own policy instead?{' '}
          <Link
            to="/auth?tab=register"
            className="font-bold text-slate-900 hover:text-blue-600 underline underline-offset-2 decoration-slate-300 transition-colors"
          >
            Create an account
          </Link>
        </motion.p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/50 py-3.5 px-6 text-center text-xs text-slate-500">
        CareIQ Indian Hospital &amp; Insurance Decision Support Platform
      </footer>
    </div>
  );
};

export default DemoPage;
