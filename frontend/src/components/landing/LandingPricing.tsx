import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface LandingPricingProps {
  onLaunchApp: () => void;
}

export const LandingPricing: React.FC<LandingPricingProps> = ({ onLaunchApp }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      name: 'Family Caregiver',
      badge: 'Free Forever',
      price: '₹0',
      period: 'forever',
      description: 'Essential decision support for patient families managing a planned admission.',
      features: [
        '1 Active Patient Profile',
        'Instant Policy OCR & Vector RAG',
        'Room Rent Proportionate Trap Check',
        '5-Stage Hospital Care Timeline',
        '1-Click WhatsApp Family Updates',
        'All 11 Pre-loaded Scenarios'
      ],
      ctaText: 'Start Free Journey',
      isPopular: false
    },
    {
      name: 'Care Plus (Family)',
      badge: 'Most Popular',
      price: billingCycle === 'annual' ? '₹319' : '₹399',
      period: 'per month',
      description: 'Comprehensive protection for families with senior parents or multi-policy coverage.',
      features: [
        'Up to 5 Family Members',
        'Dual-Policy Sequencing (Gov + Private)',
        'Interactive What-If Room Rent Simulator',
        'Tailored TPA Billing Desk Questions',
        'PED Waiting Period Verification',
        'Priority PDF Reports & WhatsApp Broadcast'
      ],
      ctaText: 'Get Care Plus',
      isPopular: true
    },
    {
      name: 'Hospital Desk & TPA',
      badge: 'For Healthcare Teams',
      price: billingCycle === 'annual' ? '₹1,199' : '₹1,499',
      period: 'per desk / month',
      description: 'Empowers hospital billing desks to fast-track cashless pre-auth and avoid disputes.',
      features: [
        'Unlimited Patient Tracking',
        'Direct TPA Tariff Benchmark Matrix',
        'Discharge Turnaround Optimizer',
        'Dispute Prevention Letter Generator',
        'REST API & Webhook Connectors'
      ],
      ctaText: 'Contact Hospital Sales',
      isPopular: false
    }
  ];

  return (
    <section id="pricing" className="relative z-30 bg-slate-50/70 py-20 sm:py-28 border-b border-slate-100 overflow-hidden">
      <div className="max-w-285 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-175 mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Sparkles size={12} />
            <span>Transparent Pricing</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Free for Families in Need.<br />Powerful for Power Users.
          </motion.h2>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-300 text-slate-950">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-slate-900 text-white shadow-2xl border-2 border-blue-500 relative md:-translate-y-2'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-xl'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
                  ★ MOST POPULAR CHOICE
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-black ${plan.isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    plan.isPopular ? 'bg-white/20 text-cyan-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="my-5">
                  <span className={`text-4xl font-black ${plan.isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ml-1.5 ${plan.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    / {plan.period}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed mb-6 font-medium ${plan.isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100/20">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs font-semibold">
                      <Check size={14} className={`shrink-0 mt-0.5 ${
                        plan.isPopular ? 'text-cyan-400' : 'text-blue-600'
                      }`} />
                      <span className={plan.isPopular ? 'text-slate-200' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={onLaunchApp}
                  className={`w-full py-3.5 rounded-full font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    plan.isPopular
                      ? 'bg-linear-to-r from-blue-500 to-cyan-400 text-slate-950 hover:brightness-110'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
