import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingTrustBadges } from './LandingTrustBadges';
import { LandingPillars } from './LandingPillars';
import { LandingLiveDilemmas } from './LandingLiveDilemmas';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingFaq } from './LandingFaq';
import { LandingFinalCta } from './LandingFinalCta';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onLaunchApp?: () => void;
  onStartJourney?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLaunchApp: propOnLaunchApp, 
  onStartJourney: propOnStartJourney
}) => {
  const navigate = useNavigate();

  const handleLaunch = propOnLaunchApp || (() => navigate('/dashboard'));
  const handleStart = propOnStartJourney || (() => navigate('/hospital-matcher'));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#2545CB] selection:text-white">
      
      {/* 1. Glassmorphic Navigation Bar */}
      <LandingNavbar 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* 2. Precision Hero with Live Interactive SVG Safari Simulator */}
      <LandingHero 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* 3. Healthcare Ecosystem SVG Trust Badges */}
      <LandingTrustBadges />

      {/* 4. Core Mathematical Decision Pillars with Animated SVGs */}
      <LandingPillars onLaunchApp={handleLaunch} />

      {/* 5. Real-World Dilemmas Showcase (Interactive Persona Playground) */}
      <LandingLiveDilemmas onLaunchApp={handleLaunch} />

      {/* 6. Interactive 3-Step Guided Workflow */}
      <LandingHowItWorks onLaunchApp={handleLaunch} />

      {/* 7. High-Signal FAQ Accordion */}
      <LandingFaq />

      {/* 8. Final High-Energy CTA with Orbiting Milestone Cards */}
      <LandingFinalCta 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* 9. Modern Multi-Column Footer */}
      <LandingFooter onLaunchApp={handleLaunch} />

    </div>
  );
};

export default LandingPage;
