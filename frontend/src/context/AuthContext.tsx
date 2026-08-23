import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';
import type { RegisterPayload } from '../services/api';
import type {
  AuthSession,
  AuthUser,
  CareJourney,
  EnrichedInsurancePolicy,
  Patient
} from '../types/domain';

export type { AuthUser };

export interface AuthContextType {
  user: AuthUser | null;
  patient: Patient | null;
  policy: EnrichedInsurancePolicy | null;
  journey: CareJourney | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  loginAsDemo: (demoId: string) => Promise<AuthSession>;
  setPatientProfile: (patient: Patient) => void;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'careiq_token';
const DEMO_KEY = 'careiq_is_demo';

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [policy, setPolicy] = useState<EnrichedInsurancePolicy | null>(null);
  const [journey, setJourney] = useState<CareJourney | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    () => localStorage.getItem(DEMO_KEY) === 'true'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /** Applies a session payload to state. One path for login, register and demo. */
  const applySession = useCallback((res: AuthSession, demo: boolean) => {
    const accessToken = res.session?.access_token;
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
    }
    localStorage.setItem(DEMO_KEY, demo ? 'true' : 'false');
    setIsDemoMode(demo);
    setUser(res.user ?? null);
    setPatient(res.patient ?? null);
    setPolicy(res.policy ?? res.policies?.[0] ?? null);
    setJourney(res.journey ?? null);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEMO_KEY);
    setToken(null);
    setUser(null);
    setPatient(null);
    setPolicy(null);
    setJourney(null);
    setIsDemoMode(false);
  }, []);

  /**
   * Verifies a stored token on mount.
   *
   * A failed verification ends the session. The previous version fell back to
   * silently signing the visitor in as a demo persona, so an expired real
   * account landed on Ananya Sharma's medical record believing it was their own.
   */
  const refreshSession = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user ?? null);
      setPatient(data.patient ?? null);
      setPolicy(data.policy ?? data.policies?.[0] ?? null);
      setJourney(data.journey ?? null);
      setIsDemoMode(Boolean(data.isDemo));
      localStorage.setItem(DEMO_KEY, data.isDemo ? 'true' : 'false');
    } catch (err) {
      console.warn('Stored session could not be verified:', errorMessage(err, 'unknown error'));
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.login({ email, password });
        applySession(res, false);
        return res;
      } catch (err) {
        const msg = errorMessage(err, 'Could not sign in. Check your email and password.');
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.register(payload);
        applySession(res, false);
        return res;
      } catch (err) {
        const msg = errorMessage(err, 'Could not create the account.');
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const loginAsDemo = useCallback(
    async (demoId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.demoLogin(demoId);
        applySession(res, true);
        return res;
      } catch (err) {
        const msg = errorMessage(err, 'Could not load that demo profile.');
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout().catch(() => {
        // A failed server-side sign-out must not keep the client signed in.
      });
    } finally {
      clearSession();
      setError(null);
    }
  }, [clearSession]);

  const setPatientProfile = useCallback((updatedPatient: Patient) => {
    setPatient(updatedPatient);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        policy,
        journey,
        token,
        isAuthenticated: Boolean(token),
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
