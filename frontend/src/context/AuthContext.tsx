import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  account_type?: 'DEMO' | 'NEW_USER';
}

export interface AuthContextType {
  user: AuthUser | null;
  patient: any | null;
  policy: any | null;
  journey: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => Promise<void>;
  loginAsDemo: (demoId?: string) => Promise<any>;
  setPatientProfile: (patient: any) => void;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [policy, setPolicy] = useState<any | null>(null);
  const [journey, setJourney] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('careiq_token'));
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => localStorage.getItem('careiq_is_demo') === 'true');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Verify stored session on initial mount
  const refreshSession = async () => {
    const storedToken = localStorage.getItem('careiq_token');
    const storedIsDemo = localStorage.getItem('careiq_is_demo') === 'true';

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data) {
        setUser(data.user || null);
        setPatient(data.patient || null);
        setPolicy(data.policy || (data.policies && data.policies[0]) || null);
        setJourney(data.journey || null);
        setIsDemoMode(data.isDemo || storedIsDemo);
      }
    } catch (err: any) {
      console.warn('Session verification notice:', err?.message || err);
      if (storedIsDemo) {
        // Recover default demo session
        try {
          const demoRes = await api.demoLogin();
          if (demoRes) {
            setUser(demoRes.user);
            setPatient(demoRes.patient);
            setPolicy(demoRes.policy);
            setJourney(demoRes.journey);
            setIsDemoMode(true);
          }
        } catch {
          localStorage.removeItem('careiq_token');
          localStorage.removeItem('careiq_is_demo');
          setToken(null);
          setIsDemoMode(false);
        }
      } else {
        localStorage.removeItem('careiq_token');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      const accessToken = res.session?.access_token || `session-${res.user?.id || Date.now()}`;
      
      localStorage.setItem('careiq_token', accessToken);
      localStorage.setItem('careiq_is_demo', 'false');
      
      setToken(accessToken);
      setIsDemoMode(false);
      setUser(res.user);
      setPatient(res.patient);
      setPolicy(res.policy);
      setJourney(res.journey);

      return res;
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(payload);
      const accessToken = res.session?.access_token || `session-${res.user?.id || Date.now()}`;
      
      localStorage.setItem('careiq_token', accessToken);
      localStorage.setItem('careiq_is_demo', 'false');
      
      setToken(accessToken);
      setIsDemoMode(false);
      setUser(res.user);
      setPatient(res.patient);
      setPolicy(res.policy);
      setJourney(res.journey);

      return res;
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (demoId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin(demoId);
      const accessToken = res.session?.access_token || `demo-token-${res.patient?.id || 'demo'}`;
      
      localStorage.setItem('careiq_token', accessToken);
      localStorage.setItem('careiq_is_demo', 'true');
      
      setToken(accessToken);
      setIsDemoMode(true);
      setUser(res.user);
      setPatient(res.patient);
      setPolicy(res.policy);
      setJourney(res.journey);

      return res;
    } catch (err: any) {
      const msg = err.message || 'Failed to load demo profile.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('careiq_token');
      localStorage.removeItem('careiq_is_demo');
      setToken(null);
      setUser(null);
      setPatient(null);
      setPolicy(null);
      setJourney(null);
      setIsDemoMode(false);
      setError(null);
    }
  };

  const setPatientProfile = (updatedPatient: any) => {
    setPatient(updatedPatient);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        policy,
        journey,
        token,
        isAuthenticated: Boolean(token || isDemoMode),
        isDemoMode,
        loading,
        error,
        login,
        register,
        logout,
        loginAsDemo,
        setPatientProfile,
        clearError,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
