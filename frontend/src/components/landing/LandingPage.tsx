import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingTrustBadges } from './LandingTrustBadges';
import { LandingHowItWorks } from './LandingHowItWorks';
import { LandingFeaturesGrid } from './LandingFeaturesGrid';
import { LandingLiveDilemmas } from './LandingLiveDilemmas';
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

  const handleLaunch = propOnLaunchApp || (() => navigate('/get-started'));
  const handleStart = propOnStartJourney || (() => navigate('/get-started'));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Floating Glassmorphic Top Navbar with /logo.svg */}
      <LandingNavbar 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* Interactive Hero with DotPattern and 3-Tab Live Safari Mockup */}
      <LandingHero 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* Benchmark Healthcare Ecosystem Trust Badges */}
      <LandingTrustBadges />

      {/* 3-Step Interactive Admission to Discharge Trajectory */}
      <LandingHowItWorks 
        onLaunchApp={handleLaunch}
      />

      {/* Rich CSS/SVG Visual Programs: OCR Scanner, Deduction Shield, Network Matcher */}
      <LandingFeaturesGrid />

      {/* Real-World Hospital Dilemma Scenarios (Persona Aligned) */}
      <LandingLiveDilemmas 
        onLaunchApp={handleLaunch}
      />

      {/* Caregiver FAQ Accordion */}
      <LandingFaq />

      {/* High-Impact Final CTA with Orbit Animation */}
      <LandingFinalCta 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      {/* Clean Minimal Footer */}
      <LandingFooter 
        onLaunchApp={handleLaunch} 
      />

    </div>
  );
};

export default LandingPage;
