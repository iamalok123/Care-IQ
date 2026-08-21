import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const LandingTrustBadges: React.FC = () => {
  const partners = [
    { name: 'Manipal Hospitals', category: 'NABH Tier 1 Cashless', color: 'from-blue-600 to-cyan-500', logo: '🏥' },
    { name: 'Apollo Hospitals', category: 'Direct TPA Desk', color: 'from-purple-600 to-indigo-500', logo: '🏛️' },
    { name: 'Fortis Healthcare', category: 'Cashless Network', color: 'from-emerald-600 to-teal-500', logo: '⭐' },
    { name: 'Max Healthcare', category: 'Preferred Partner', color: 'from-amber-600 to-orange-500', logo: '🔬' },
    { name: 'Star Health', category: 'Indexed Clauses', color: 'from-blue-700 to-blue-500', logo: '🛡️' },
    { name: 'HDFC ERGO', category: 'Cashless Pre-Auth', color: 'from-red-600 to-rose-500', logo: '💎' },
    { name: 'Care Insurance', category: 'Daycare Protocols', color: 'from-teal-600 to-emerald-500', logo: '🩺' },
    { name: 'PM-JAY Ayushman', category: 'HBP 2.2 Packages', color: 'from-orange-600 to-amber-500', logo: '🇮🇳' }
  ];

  return (
    <section className="relative z-30 bg-white py-14 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 text-center">
        
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold uppercase tracking-widest mb-6 border border-blue-100"
        >
          <Sparkles size={12} />
          <span>BENCHMARKED ACROSS INDIA'S TOP HEALTHCARE ECOSYSTEM</span>
        </motion.div>

        {/* 8 Glowing Interactive Partner Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 items-stretch">
          {partners.map((partner, idx) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="bg-slate-50/70 hover:bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between text-center cursor-default group relative overflow-hidden"
            >
              {/* Subtle top color accent bar */}
              <div className={`w-full h-1 rounded-full bg-linear-to-r ${partner.color} opacity-70 group-hover:opacity-100 transition-opacity mb-2`} />

              <span className="text-2xl mb-1.5 filter drop-shadow-xs group-hover:scale-110 transition-transform">
                {partner.logo}
              </span>

              <span className="text-xs font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                {partner.name}
              </span>

              <span className="text-[9px] font-bold text-slate-400 mt-1">
                {partner.category}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
