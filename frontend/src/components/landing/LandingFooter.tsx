import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface LandingFooterProps {
  onLaunchApp: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onLaunchApp }) => {
  return (
    <footer className="bg-[#0F172A] text-slate-400 text-xs py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-285 mx-auto">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col (2 spans) */}
          <div className="md:col-span-2 space-y-4">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={onLaunchApp}
            >
              <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs">
                <img src="/logo.svg" alt="CareIQ" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  CareIQ
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hospital & Insurance Decision Intelligence
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empowering patient families and healthcare coordinators to eliminate room rent traps, navigate complex insurance exclusions, and ensure seamless cashless hospital care.
            </p>

            <div className="flex items-center gap-4 text-slate-300 text-xs">
              <span className="flex items-center gap-1">
                <Lock size={12} className="text-emerald-400" />
                ABDM / NDHM Aligned
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-blue-400" />
                IRDAI Health Compliant
              </span>
            </div>
          </div>

          {/* Col 2: Platform Features */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Deterministic Policy RAG</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Hospital Match Engine</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Room Rent Trap Calculator</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Care Trajectory Engine</a></li>
              <li><a href="#case-studies" className="hover:text-white transition-colors">Patient Case Studies</a></li>
            </ul>
          </div>

          {/* Col 3: Healthcare Resources */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#faq" className="hover:text-white transition-colors">Room Rent Deduction Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Cashless Pre-Auth Checklist</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Daycare Procedure Directory</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Ayushman Bharat PM-JAY Code Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">TPA Desk Question Templates</a></li>
            </ul>
          </div>

          {/* Col 4: Quick Launch */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Explore Demo
            </h4>
            <p className="text-xs text-slate-400">
              Try our pre-loaded patient profiles and test policy extraction in real-time.
            </p>
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer w-full text-center shadow-xs"
            >
              Launch CareIQ App
            </button>
          </div>

        </div>

        {/* Disclaimer & Bottom Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="max-w-2xl leading-relaxed text-center md:text-left">
            <strong className="text-slate-400">Disclaimer:</strong> CareIQ is a decision-support platform designed for the Precision Care Challenge 2026. Non-clinical & non-diagnostic. Coverage estimates, room caps, and tariff calculations are indicative based on provided policy schedules.
          </p>
          <div className="text-center md:text-right shrink-0">
            © 2026 CareIQ. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};
