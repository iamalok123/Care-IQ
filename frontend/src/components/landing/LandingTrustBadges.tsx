import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Landmark, 
  ShieldCheck, 
  Activity, 
  Award, 
  Stethoscope, 
  Layers, 
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const LandingTrustBadges: React.FC = () => {
  const partners = [
    { name: 'Manipal Hospitals', category: 'NABH Tier 1 Cashless', icon: Building2, color: 'from-blue-600 to-cyan-500', textCol: 'text-blue-600', bgCol: 'bg-blue-50' },
    { name: 'Apollo Hospitals', category: 'Direct TPA Desk', icon: Landmark, color: 'from-purple-600 to-indigo-500', textCol: 'text-purple-600', bgCol: 'bg-purple-50' },
    { name: 'Fortis Healthcare', category: 'Cashless Network', icon: Award, color: 'from-emerald-600 to-teal-500', textCol: 'text-emerald-600', bgCol: 'bg-emerald-50' },
    { name: 'Max Healthcare', category: 'Preferred Partner', icon: Activity, color: 'from-amber-600 to-orange-500', textCol: 'text-amber-600', bgCol: 'bg-amber-50' },
    { name: 'Star Health', category: 'Indexed Clauses', icon: ShieldCheck, color: 'from-blue-700 to-blue-500', textCol: 'text-blue-700', bgCol: 'bg-blue-50' },
    { name: 'HDFC ERGO', category: 'Cashless Pre-Auth', icon: Layers, color: 'from-rose-600 to-red-500', textCol: 'text-rose-600', bgCol: 'bg-rose-50' },
    { name: 'Care Insurance', category: 'Daycare Protocols', icon: Stethoscope, color: 'from-teal-600 to-emerald-500', textCol: 'text-teal-600', bgCol: 'bg-teal-50' },
    { name: 'PM-JAY Ayushman', category: 'HBP 2.2 Packages', icon: FileCheck2, color: 'from-orange-600 to-amber-500', textCol: 'text-orange-600', bgCol: 'bg-orange-50' }
  ];

  return (
    <section className="relative z-30 bg-white py-12 sm:py-14 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 text-center">
        
        {/* Header Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/80 text-blue-700 text-[11px] font-extrabold uppercase tracking-widest mb-6 border border-blue-100"
        >
          <Sparkles size={12} />
          <span>Benchmarked Across India's Healthcare Ecosystem</span>
        </motion.div>

        {/* 8 Modern SVG Provider Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5 items-stretch">
          {partners.map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.03 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-slate-50/70 hover:bg-white p-3 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between text-center cursor-default group"
              >
                {/* SVG Icon Tile */}
                <div className={`w-8 h-8 rounded-xl ${partner.bgCol} border border-slate-200/60 ${partner.textCol} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-2xs`}>
                  <Icon size={16} strokeWidth={2.2} />
                </div>

                <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                  {partner.name}
                </span>

                <span className="text-[9px] font-semibold text-slate-400 mt-1 truncate max-w-full">
                  {partner.category}
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default LandingTrustBadges;
