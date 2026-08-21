import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

export const LandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Ananya Roy',
      role: 'Family Caregiver',
      location: 'Kolkata',
      avatar: '👩‍💼',
      badge: 'Verified Caregiver',
      stars: 5,
      quote: 'CareIQ caught the 1% room cap that our insurer never explained. We avoided a ₹1.2 Lakh retroactive penalty on my mother’s surgery at Apollo!',
      tag: 'Saved ₹1,20,000'
    },
    {
      name: 'Dr. Suresh Murthy',
      role: 'Hospital TPA Desk Head',
      location: 'Bengaluru',
      avatar: '👨‍⚕️',
      badge: 'Hospital Operations',
      stars: 5,
      quote: 'Patients using CareIQ arrive with structured policy clauses and clear pre-auth requirements. It cut our cashless turnaround from 4 hours to 35 minutes.',
      tag: '6x Faster Pre-Auth'
    },
    {
      name: 'Rohan Mehta',
      role: 'Corporate Policyholder',
      location: 'Mumbai',
      avatar: '👨‍💻',
      badge: 'Active Policyholder',
      stars: 5,
      quote: 'The 1-click WhatsApp progress trajectory kept my elderly parents completely at ease while I was in surgery. Zero surprise billing at discharge.',
      tag: '100% Cashless Settle'
    }
  ];

  return (
    <section id="testimonials" className="relative z-30 bg-white py-20 sm:py-28 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100"
          >
            <Sparkles size={12} />
            <span>Proven in Real Hospitals</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Loved by Caregivers &<br />Hospital Billing Desks
          </motion.h2>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-slate-50/70 hover:bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {t.tag}
                  </span>
                </div>

                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.avatar}</span>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm leading-tight">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {t.role} • {t.location}
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {t.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
