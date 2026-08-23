import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CareIQProvider } from './context/CareIQContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/views/Dashboard';
import { HospitalMatchView } from './components/views/HospitalMatchView';
import { InsuranceView } from './components/views/InsuranceView';
import { CareJourneyView } from './components/views/CareJourneyView';
import { CostBreakdownView } from './components/views/CostBreakdownView';
import { VerificationCenter } from './components/views/VerificationCenter';
import { GetStartedPage } from './components/views/GetStartedPage';
import { DemoPage } from './components/views/DemoPage';
import { AuthPage } from './components/views/AuthPage';
import { OnboardingPage } from './components/views/OnboardingPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/hospital-matcher" element={<HospitalMatchView />} />
        <Route path="/hospitals" element={<Navigate to="/hospital-matcher" replace />} />

        <Route path="/insurance" element={<InsuranceView />} />
        <Route path="/insurance-policies" element={<Navigate to="/insurance" replace />} />

        <Route path="/care-journey" element={<CareJourneyView />} />
        <Route path="/journey" element={<Navigate to="/care-journey" replace />} />

        <Route path="/cost-breakdown" element={<CostBreakdownView />} />
        <Route path="/cost" element={<Navigate to="/cost-breakdown" replace />} />

        <Route path="/verification-center" element={<VerificationCenter />} />
        <Route path="/verification" element={<Navigate to="/verification-center" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CareIQProvider>
          <AppRoutes />
        </CareIQProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
