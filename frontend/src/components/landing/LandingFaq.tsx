import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';

export const LandingFaq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does CareIQ prevent Room Rent proportionate deduction traps?',
      a: 'Most health policies cap room rent to 1% or 2% of the Sum Insured (e.g. ₹5,000/day on a ₹5 Lakh policy). If you choose a ₹9,000 deluxe room, the insurer doesn’t just deduct the extra ₹4,000 room charge—they retroactively deduct 44% from the surgeon fees, OT charges, and ICU bills! CareIQ simulates these room tiers before admission so you know the exact financial impact upfront.'
    },
    {
      q: 'How does the Deterministic Policy RAG guarantee zero hallucinations?',
      a: 'Unlike generic chatbots that guess legal terms, CareIQ indexes your uploaded policy schedule into high-dimensional semantic vector embeddings. Every answer cites the exact verbatim clause, section title, page number, and sub-limit conditions directly from your policy document.'
    },
    {
      q: 'Can CareIQ handle dual-policy claims and government schemes like Ayushman Bharat (PM-JAY)?',
      a: 'Yes! CareIQ natively supports multi-policy coordination (e.g., Corporate Group Insurance + Personal Super Top-up) and Ayushman Bharat PM-JAY package codes (HBP 2.2). It shows how primary and secondary claims should be sequenced to achieve 100% cashless coverage.'
    },
    {
      q: 'What is the 5-Stage Care Journey guidance?',
      a: 'CareIQ guides caregivers across 5 critical milestone stages: 1) Pre-Admission Authorization, 2) Admission Desk Verification, 3) In-Patient Stay & Interim Bills, 4) Discharge Preparation, and 5) Final Settlement Reconciliation. At each stage, CareIQ auto-generates specific, actionable questions for hospital billing desks.'
    },
    {
      q: 'How does the WhatsApp caregiver update feature work?',
      a: 'With one click, CareIQ compiles the patient’s current trajectory milestone, room eligibility, cashless pre-auth status, and next scheduled events into a clear, clean message formatted for WhatsApp or SMS. You can instantly share it with anxious family members without medical jargon.'
    },
    {
      q: 'Is our medical and insurance data private and secure?',
      a: 'Yes. CareIQ is built to comply with NDHM (Ayushman Bharat Digital Mission) standards and HIPAA-grade encryption. Your uploaded documents and personal health identifiers are processed in secure, isolated sandboxes and never shared with third-party brokers or advertisers.'
    }
  ];

  return (
    <section id="faq" className="relative z-30 bg-white py-20 sm:py-28 border-b border-slate-100 scroll-mt-28">
      <div className="max-w-215 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2545CB] text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100"
          >
            <Sparkles size={12} />
            <span>Got Questions?</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-[#14161F] tracking-tight leading-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-600 text-sm sm:text-base"
          >
            Everything you need to know about CareIQ hospital matching, policy analysis, and cashless assistance.
          </motion.p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs' 
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-[#2545CB] text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/70">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
