import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  BedDouble, 
  CheckCircle2, 
  HeartHandshake, 
  Sparkles, 
  RotateCw,
  FileCheck
} from 'lucide-react';
import { DotPattern } from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';

interface LandingFinalCtaProps {
  onLaunchApp: () => void;
  onStartJourney?: () => void;
}

export const LandingFinalCta: React.FC<LandingFinalCtaProps> = ({
  onLaunchApp,
  onStartJourney
}) => {
  const handleAction = onStartJourney || onLaunchApp;
  const [orbitQuadrant, setOrbitQuadrant] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitQuadrant((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 text-slate-900 border-b border-slate-100">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek Minimal Dark Island Container with DotPattern */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white py-16 sm:py-24 px-6 sm:px-12 border border-slate-800 shadow-2xl text-center">
          
          {/* DotPattern background */}
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1}
            className={cn(
              "mask-[radial-gradient(550px_circle_at_center,white,transparent)]",
              "fill-white/10 pointer-events-none absolute inset-0 h-full w-full"
            )}
          />

          {/* Background ambient lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-20 max-w-215 mx-auto">
            
            {/* Top Tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold mb-6 shadow-xs"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Experience Stress-Free Hospital Stays</span>
            </motion.div>

            {/* Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight max-w-195 mx-auto"
            >
              Ready to Make Confident,<br />Informed Hospital Decisions?
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-sm sm:text-base text-blue-100 max-w-150 mx-auto leading-relaxed"
        >
          Join thousands of caregivers decoding insurance policies, saving lakhs in out-of-pocket room penalties, and fast-tracking cashless hospital approvals.
        </motion.p>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAction}
            className="px-8 py-4 rounded-xl text-sm font-bold bg-[#14161F] text-white hover:bg-slate-900 shadow-2xl hover:shadow-black/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Launch CareIQ Platform Now</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Orbit Micro-Interaction Container (Desktop) */}
        <div className="relative mt-20 hidden md:block h-95 w-95 mx-auto">
          
          {/* Large Dashed Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/35 pointer-events-none" />

          {/* Clockwise Traveling Orbit Bubble */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-orbit-bubble">
              <div className="w-10 h-10 rounded-full bg-white text-[#2545CB] shadow-xl flex items-center justify-center text-sm font-bold border-2 border-blue-200">
                {orbitQuadrant === 0 && <ShieldCheck size={18} className="text-emerald-600" />}
                {orbitQuadrant === 1 && <BedDouble size={18} className="text-blue-600" />}
                {orbitQuadrant === 2 && <RotateCw size={18} className="text-indigo-600 animate-spin" />}
                {orbitQuadrant === 3 && <img src="/logo.svg" alt="CareIQ" className="w-5 h-5 object-contain" />}
              </div>
            </div>
          </div>

          {/* Station Card 1 (Top): Cashless Pre-Auth Approved */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-[14px] p-3.5 shadow-xl text-[#14161F] text-left border border-slate-100 w-52 animate-float-a">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <CheckCircle2 size={13} />
                <span>Cashless Pre-Auth</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">35m</span>
            </div>
            <div className="text-xs font-bold text-[#14161F]">₹3,20,000 Approved</div>
            <div className="text-[9px] text-[#9599A3]">Manipal Hospital • Cardiology</div>
          </div>

          {/* Station Card 2 (Right): Room Rent Trap Shield */}
          <div className="absolute top-1/2 -right-32 -translate-y-1/2 bg-white rounded-[14px] p-3.5 shadow-xl text-[#14161F] text-left border border-slate-100 w-52 animate-float-b">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 mb-1">
              <BedDouble size={13} />
              <span>Room Rent Protected</span>
            </div>
            <div className="text-xs font-black text-emerald-600">0% Deductions</div>
            <div className="text-[9px] text-[#9599A3]">Single Private AC Verified</div>
          </div>

          {/* Station Card 3 (Bottom): 100% Verified Policy Clauses */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-[14px] p-3.5 shadow-xl text-[#14161F] text-center border border-slate-100 w-52 animate-float-c">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-600 mb-0.5">
              <FileCheck size={13} />
              <span>Policy RAG Citations</span>
            </div>
            <div className="text-base font-black text-[#14161F]">540+ Procedures</div>
            <div className="text-[9px] text-[#9599A3]">Verbatim Clause Citations</div>
          </div>

          {/* Station Card 4 (Left): Caregiver WhatsApp Synced */}
          <div className="absolute top-1/2 -left-32 -translate-y-1/2 bg-white rounded-[14px] p-3.5 shadow-xl text-[#14161F] text-left border border-slate-100 w-52 animate-float-d">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mb-0.5">
              <HeartHandshake size={13} />
              <span>Caregiver WhatsApp</span>
            </div>
            <div className="text-xs font-bold text-[#14161F]">Live Trajectory Synced</div>
            <div className="text-[9px] text-[#9599A3]">1-Click Family Updates</div>
          </div>

        </div>

      </div>

    </div>

  </div>
</section>
);
};
