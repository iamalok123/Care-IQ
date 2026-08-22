import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { dataRepository } from '../services/dataRepository';
import { supabaseRepository } from '../services/supabaseRepository';
import { Patient, AccountType } from '../types/domain';

export interface AuthUser {
  id: string;
  auth_user_id?: string;
  email?: string;
  account_type: 'DEMO' | 'NEW_USER';
  patient?: Patient;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Helper to extract Bearer token from authorization header.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }
  return null;
}

/**
 * Resolves a demo token (e.g. "demo-token-pat-demo-ananya" or "demo-ananya")
 * into a valid demo user payload.
 */
function resolveDemoUser(token: string): AuthUser | null {
  const demoProfiles = dataRepository.getDemoProfiles();
  const cleanToken = token.replace(/^demo-token-/, '').toLowerCase();

  const matchedPatient = demoProfiles.find((p) => {
    const idMatch = p.id.toLowerCase() === cleanToken || p.id.toLowerCase().includes(cleanToken);
    const userMatch = p.user_id.toLowerCase() === cleanToken || p.user_id.toLowerCase().includes(cleanToken);
    const nameMatch = p.display_name.toLowerCase().includes(cleanToken);
    return idMatch || userMatch || nameMatch;
  });

  if (matchedPatient) {
    return {
      id: matchedPatient.id,
      auth_user_id: matchedPatient.user_id,
      email: matchedPatient.email || `${matchedPatient.display_name.toLowerCase().replace(/\s+/g, '.')}@demo.careiq.internal`,
      account_type: 'DEMO',
      patient: matchedPatient
    };
  }

  // If token is generic demo token
  if (cleanToken === 'demo' || cleanToken === 'guest') {
    const fallback = demoProfiles[0] || dataRepository.getPatients()[0];
    if (fallback) {
      return {
        id: fallback.id,
        auth_user_id: fallback.user_id,
        email: fallback.email || 'ananya.sharma@demo.careiq.internal',
        account_type: 'DEMO',
        patient: fallback
      };
    }
  }

  return null;
}

/**
 * Optional Auth Middleware:
 * Inspects Bearer token if present and attaches req.user.
 * Proceeds without error if token is omitted or guest mode.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next();
    }

    // 1. Check for Demo token
    if (token.startsWith('demo-token-') || token.startsWith('demo-') || token === 'demo' || token === 'guest') {
      const demoUser = resolveDemoUser(token);
      if (demoUser) {
        req.user = demoUser;
      }
      return next();
    }

    // 2. Validate Supabase Auth token
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        const authUser = data.user;
        let patient =
          dataRepository.getPatientByAuthUserId(authUser.id) ||
          (authUser.email ? dataRepository.getPatientByEmail(authUser.email) : undefined);

        if (!patient) {
          patient =
            (await supabaseRepository.fetchPatientByAuthUserId(authUser.id)) ||
            (authUser.email ? await supabaseRepository.fetchPatientByEmail(authUser.email) : null) ||
            undefined;
          if (patient) {
            dataRepository.addPatient(patient);
          }
        }

        req.user = {
          id: patient?.id || authUser.id,
          auth_user_id: authUser.id,
          email: authUser.email,
          account_type: (patient?.account_type as any) || 'NEW_USER',
          patient
        };
      }
    }
  } catch (err) {
    console.warn('Optional auth token parsing notice:', err);
  }
  return next();
}

/**
 * Required Auth Middleware:
 * Enforces valid Supabase Auth session token or demo token.
 * Returns 401 Unauthorized if missing or invalid.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please provide a valid Bearer token in the Authorization header.'
        }
      });
      return;
    }

    // 1. Check for Demo token
    if (token.startsWith('demo-token-') || token.startsWith('demo-') || token === 'demo' || token === 'guest') {
      const demoUser = resolveDemoUser(token);
      if (demoUser) {
        req.user = demoUser;
        return next();
      }
    }

    // 2. Validate with Supabase
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: error?.message || 'Invalid or expired session token.'
          }
        });
        return;
      }

      const authUser = data.user;
      let patient =
        dataRepository.getPatientByAuthUserId(authUser.id) ||
        (authUser.email ? dataRepository.getPatientByEmail(authUser.email) : undefined);

      if (!patient) {
        patient =
          (await supabaseRepository.fetchPatientByAuthUserId(authUser.id)) ||
          (authUser.email ? await supabaseRepository.fetchPatientByEmail(authUser.email) : null) ||
          undefined;
        if (patient) {
          dataRepository.addPatient(patient);
        }
      }

      req.user = {
        id: patient?.id || authUser.id,
        auth_user_id: authUser.id,
        email: authUser.email,
        account_type: (patient?.account_type as any) || 'NEW_USER',
        patient
      };

      return next();
    } else {
      // Supabase not configured in this environment, fallback user attachment
      req.user = {
        id: 'usr-offline-guest',
        email: 'guest@careiq.internal',
        account_type: 'NEW_USER'
      };
      return next();
    }
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_VERIFICATION_FAILED',
        message: err?.message || 'Failed to authenticate user.'
      }
    });
  }
}
