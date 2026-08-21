import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingTrustBadges } from './LandingTrustBadges';
import { LandingPillars } from './LandingPillars';
import { LandingFeaturesGrid } from './LandingFeaturesGrid';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingLiveDilemmas } from './LandingLiveDilemmas';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingPricing } from './LandingPricing';
import { LandingFaq } from './LandingFaq';
import { LandingFinalCta } from './LandingFinalCta';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onLaunchApp: () => void;
  onStartJourney?: () => void;
  onSelectScenario?: (scenarioId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLaunchApp, 
  onStartJourney
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#2545CB] selection:text-white">
      
      {/* 🌟 1. Glassmorphic Navigation Bar */}
      <LandingNavbar 
        onLaunchApp={onLaunchApp} 
        onStartJourney={onStartJourney} 
      />

      {/* 🌟 2. Hero Section with Live Mockup & Seamless Cloud Layer */}
      <LandingHero 
        onLaunchApp={onLaunchApp} 
        onStartJourney={onStartJourney} 
      />

      {/* 🌟 3. Healthcare Provider & Insurer Trust Badges */}
      <LandingTrustBadges />

      {/* 🌟 4. Core Decision Pillars (Pillar cards with animated counter & 360° orbit) */}
      <LandingPillars onLaunchApp={onLaunchApp} />

      {/* 🌟 5. Key Features 2x2 Grid */}
      <LandingFeaturesGrid />

      {/* 🌟 6. Interactive 3-Step "How It Works" Workflow */}
      <LandingHowItWorks onLaunchApp={onLaunchApp} />

      {/* 🌟 7. Real-World Dilemmas Showcase (11 Persona Interactive Playground) */}
      <LandingLiveDilemmas onLaunchApp={onLaunchApp} />

      {/* 🌟 8. Patient & Caregiver Testimonials */}
      <LandingTestimonials />

      {/* 🌟 9. Transparent Pricing Tiers */}
      <LandingPricing onLaunchApp={onLaunchApp} />

      {/* 🌟 10. Comprehensive FAQ Accordion */}
      <LandingFaq />

      {/* 🌟 11. Final High-Energy CTA with Orbiting Milestone Cards */}
      <LandingFinalCta 
        onLaunchApp={onLaunchApp} 
        onStartJourney={onStartJourney} 
      />

      {/* 🌟 12. Modern Multi-Column Footer */}
      <LandingFooter onLaunchApp={onLaunchApp} />

    </div>
  );
};
