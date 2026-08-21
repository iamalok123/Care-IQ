import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CareIQProvider } from './context/CareIQContext';
import { AppLayout } from './components/layout';
import { LandingPage } from './components/landing';
import { 
  Dashboard, 
  HospitalMatchView, 
  InsuranceView, 
  CareJourneyView, 
  CostBreakdownView, 
  VerificationCenter 
} from './components/views';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

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
      <CareIQProvider>
        <AppRoutes />
      </CareIQProvider>
    </BrowserRouter>
  );
}

export default App;
