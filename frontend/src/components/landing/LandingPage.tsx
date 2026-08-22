import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingTrustBadges } from './LandingTrustBadges';
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
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#2545CB] selection:text-white">
      
      <LandingNavbar 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      <LandingHero 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      <LandingTrustBadges />

      <LandingFinalCta 
        onLaunchApp={handleLaunch} 
        onStartJourney={handleStart} 
      />

      <LandingFooter onLaunchApp={handleLaunch} />

    </div>
  );
};

export default LandingPage;
