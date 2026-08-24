import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase';
import { dataRepository } from '../services/dataRepository';
import { supabaseRepository } from '../services/supabaseRepository';
import { registerSchema, loginSchema, demoLoginSchema } from '../schemas/zodSchemas';
import { enrichPolicies, enrichPolicy } from '../services/enrichmentService';
import {
  Patient,
  InsurancePolicy,
  AccountType,
  PolicyType,
  RoomCategoryCode,
  DataStatus,
  VerificationStatus,
  ConfidenceLevel,
  JourneyStage,
  JourneyStatus,
  EventStatus,
  DemoProfile,
  CareJourney,
  JourneyEvent
} from '../types/domain';

function resolveDemoProfilesPath(): string {
  const local1 = path.resolve(__dirname, '../../data/demo_profiles.json');
  if (fs.existsSync(local1)) return local1;
  const local2 = path.resolve(__dirname, '../data/demo_profiles.json');
  if (fs.existsSync(local2)) return local2;
  const local3 = path.resolve(process.cwd(), 'backend/data/demo_profiles.json');
  if (fs.existsSync(local3)) return local3;
  const local4 = path.resolve(process.cwd(), 'data/demo_profiles.json');
  if (fs.existsSync(local4)) return local4;
  return path.resolve(__dirname, '../../data/demo_profiles.json');
}

export class AuthController {
  private getDemoProfiles(): DemoProfile[] {
    try {
      const demoPath = resolveDemoProfilesPath();
      if (fs.existsSync(demoPath)) {
        const raw = fs.readFileSync(demoPath, 'utf-8');
        return JSON.parse(raw) as DemoProfile[];
      }
    } catch (err) {
      console.warn('Could not read demo_profiles.json directly:', err);
    }
    return [];
  }

  private async getPatientPolicies(patientId: string): Promise<InsurancePolicy[]> {
    let policies = dataRepository.getPoliciesByPatientId(patientId);
    if (isSupabaseConfigured) {
      try {
        const sbPolicies = await supabaseRepository.fetchPolicies(patientId);
        if (sbPolicies && sbPolicies.length > 0) {
          policies = sbPolicies;
          sbPolicies.forEach((p) => dataRepository.addPolicy(p));
        }
      } catch (err) {
        console.warn('Failed to fetch patient policies from Supabase:', err);
      }
    }
    return policies;
  }

  /**
   * POST /api/auth/register
   * Creates Supabase Auth user, stores patient profile and optional insurance policy in DB.
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
          }
        });
        return;
      }

      const { email, password, patient: patientInput, policy: policyInput } = parsed.data;

      let authUserId = `usr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      let authSession: any = null;
      let userMetadata: any = { display_name: patientInput.display_name };

      // 1. Supabase Auth registration
      if (isSupabaseConfigured) {
        let authUser: any = null;

        // Try admin user creation first (bypasses email rate limits and auto-confirms email)
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            display_name: patientInput.display_name
          }
        });

        if (adminError) {
          // If admin creation fails (e.g. key permissions), try standard signUp
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: patientInput.display_name
              }
            }
          });

          if (authError) {
            res.status(400).json({
              success: false,
              error: {
                code: 'AUTH_REGISTRATION_FAILED',
                message: authError.message || adminError.message || 'Failed to create user with Supabase Auth.'
              }
            });
            return;
          }

          authUser = authData.user;
          authSession = authData.session;
        } else {
          authUser = adminData.user;
          // Sign in to generate valid access token session for client
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (signInData?.session) {
            authSession = signInData.session;
          }
        }

        if (authUser) {
          authUserId = authUser.id;
          userMetadata = authUser.user_metadata || userMetadata;
        }
      }

      // 2. Create Patient Profile
      const patientId = `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newPatient: Patient = {
        id: patientId,
        user_id: authUserId,
        auth_user_id: authUserId,
        email: email,
        account_type: AccountType.NEW_USER,
        display_name: patientInput.display_name,
        age: patientInput.age,
        date_of_birth: patientInput.date_of_birth,
        age_band: patientInput.age
          ? patientInput.age < 18
            ? '0-17'
            : patientInput.age <= 35
            ? '18-35'
            : patientInput.age <= 60
            ? '36-60'
            : '60+'
          : undefined,
        gender: patientInput.gender,
        blood_group: patientInput.blood_group,
        medical_conditions: patientInput.medical_conditions || [],
        current_medications: patientInput.current_medications || [],
        allergies: patientInput.allergies || [],
        emergency_contact_name: patientInput.emergency_contact_name,
        emergency_contact_phone: patientInput.emergency_contact_phone,
        city: patientInput.city,
        state: patientInput.state,
        pincode: patientInput.pincode,
        preferred_language: patientInput.preferred_language || 'English',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        await supabaseRepository.insertPatient(newPatient);
      }
      dataRepository.addPatient(newPatient);

      // 3. Optional: Create Insurance Policy
      let newPolicy: InsurancePolicy | undefined;
      if (policyInput && policyInput.insurer_id) {
        const policyId = `pol-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newPolicy = {
          id: policyId,
          patient_id: patientId,
          insurer_id: policyInput.insurer_id,
          policy_name: policyInput.policy_name,
          policy_type: policyInput.policy_type || PolicyType.INDIVIDUAL,
          policy_number_masked: policyInput.policy_number_masked || `POL-IND-••••-${Date.now().toString().slice(-4)}`,
          sum_insured: policyInput.sum_insured,
          remaining_sum_insured: policyInput.remaining_sum_insured ?? policyInput.sum_insured,
          room_eligibility: policyInput.room_eligibility || RoomCategoryCode.PRIVATE_AC,
          copay_percentage: policyInput.copay_percentage ?? 0,
          deductible_amount: policyInput.deductible_amount ?? 0,
          cashless_supported: policyInput.cashless_supported ?? true,
          preauthorization_supported: policyInput.preauthorization_supported ?? true,
          pre_hospitalization_days: policyInput.pre_hospitalization_days ?? 30,
          post_hospitalization_days: policyInput.post_hospitalization_days ?? 60,
          policy_start_date: policyInput.policy_start_date,
          policy_end_date: policyInput.policy_end_date,
          data_status: DataStatus.USER_PROVIDED,
          verification_status: VerificationStatus.VERIFIED,
          confidence: ConfidenceLevel.HIGH,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (isSupabaseConfigured) {
          await supabaseRepository.insertPolicy(newPolicy);
        }
        dataRepository.addPolicy(newPolicy);
      }

      // 4. Initialize onboarding Journey
      const journeyId = `jrn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      const matchingHospital = dataRepository.getHospitals().find(
        (h) => h.city.toLowerCase() === newPatient.city.toLowerCase()
      ) || dataRepository.getHospitals()[0];

      const newJourney: CareJourney & { events: JourneyEvent[] } = {
        id: journeyId,
        patient_id: patientId,
        hospital_id: matchingHospital?.id || 'hosp-manipal-old-airport',
        policy_id: newPolicy?.id,
        current_stage: JourneyStage.ADMISSION,
        journey_status: JourneyStatus.ACTIVE,
        started_at: now,
        updated_at: now,
        events: [
          {
            id: `ev-${Date.now()}-01`,
            journey_id: journeyId,
            stage: JourneyStage.ADMISSION,
            event_type: 'ONBOARDING_REGISTERED',
            title: 'Account & Patient Profile Created',
            description: `Patient ${newPatient.display_name} registered in ${newPatient.city}, ${newPatient.state}. Baseline medical and policy data established.`,
            status: EventStatus.COMPLETED,
            occurred_at: now,
            insurance_relevance: 'Enables real-time room eligibility matching, cashless network discovery, and cost forecasting.',
            requires_verification: false,
            created_at: now
          }
        ]
      };

      if (isSupabaseConfigured) {
        await supabaseRepository.insertJourney(newJourney);
      }
      dataRepository.addJourney(newJourney);

      res.status(201).json({
        success: true,
        message: 'Account and patient profile registered successfully.',
        data: {
          user: {
            id: authUserId,
            email: email,
            user_metadata: userMetadata
          },
          session: authSession,
          patient: newPatient,
          policy: newPolicy ? enrichPolicy(newPolicy) : null,
          journey: newJourney
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: err?.message || 'Failed to complete registration.'
        }
      });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates user with Supabase Auth using email and password.
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map((i) => i.message).join(', ')
          }
        });
        return;
      }

      const { email, password } = parsed.data;

      if (!isSupabaseConfigured) {
        // Fallback for offline development
        const fallbackPatient = dataRepository.getPatientByEmail(email) || dataRepository.getPatients()[0];
        if (!fallbackPatient) {
          res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
          });
          return;
        }

        const policies = enrichPolicies(dataRepository.getPoliciesByPatientId(fallbackPatient.id));
        const journeys = dataRepository.getJourneysByPatientId(fallbackPatient.id);

        res.json({
          success: true,
          message: 'Logged in successfully (offline fallback mode).',
          data: {
            user: { id: fallbackPatient.user_id, email },
            session: {
              access_token: `mock-token-${fallbackPatient.id}`,
              token_type: 'bearer',
              expires_in: 86400,
              user: { id: fallbackPatient.user_id, email }
            },
            patient: fallbackPatient,
            policy: policies[0] || null,
            journey: journeys[0] || null
          }
        });
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData?.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: authError?.message || 'Invalid email or password.'
          }
        });
        return;
      }

      const authUser = authData.user;

      // Locate associated Patient profile
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

      const rawPolicies = patient ? await this.getPatientPolicies(patient.id) : [];
      const policies = enrichPolicies(rawPolicies);
      const journeys = patient ? dataRepository.getJourneysByPatientId(patient.id) : [];

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user: authUser,
          session: authData.session,
          patient: patient || null,
          policy: policies[0] || null,
          journey: journeys[0] || null
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: err?.message || 'An error occurred during login.'
        }
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logs out user and invalidates Supabase session.
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (isSupabaseConfigured && authHeader) {
        await supabase.auth.signOut().catch((e) => console.warn('Supabase signOut notice:', e));
      }

      res.json({
        success: true,
        message: 'Logged out successfully.'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: err?.message || 'Failed to logout.'
        }
      });
    }
  }

  /**
   * GET /api/auth/me
   * Retrieves profile, policy, and active journey for authenticated user or guest.
   */
  public async getMe(req: Request, res: Response): Promise<void> {
    try {
      // 1. Check req.user if middleware already populated it
      if (req.user) {
        let patient = req.user.patient;
        if (!patient && req.user.auth_user_id) {
          patient =
            dataRepository.getPatientByAuthUserId(req.user.auth_user_id) ||
            (req.user.email ? dataRepository.getPatientByEmail(req.user.email) : undefined);
        }

        const rawPolicies = patient ? await this.getPatientPolicies(patient.id) : [];
        const policies = enrichPolicies(rawPolicies);
        const journeys = patient ? dataRepository.getJourneysByPatientId(patient.id) : [];
        const verificationItems = patient ? dataRepository.getVerificationItems(patient.id) : [];

        res.json({
          success: true,
          data: {
            user: {
              id: req.user.auth_user_id || req.user.id,
              email: req.user.email,
              account_type: req.user.account_type
            },
            patient: patient || null,
            policy: policies[0] || null,
            policies,
            journey: journeys[0] || null,
            verification_items: verificationItems,
            isDemo: req.user.account_type === 'DEMO'
          }
        });
        return;
      }

      // 2. If no req.user, check Authorization header directly
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

      if (!token) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No authorization session token provided.'
          }
        });
        return;
      }

      if (token.startsWith('demo-token-') || token === 'demo') {
        const demoProfiles = this.getDemoProfiles();
        const cleanToken = token.replace(/^demo-token-/, '').toLowerCase();
        const demoProfile =
          demoProfiles.find((dp) => {
            return (
              dp.patient.id.toLowerCase() === cleanToken ||
              dp.patient.id.toLowerCase().includes(cleanToken) ||
              dp.patient.user_id.toLowerCase() === cleanToken ||
              dp.patient.display_name.toLowerCase().includes(cleanToken)
            );
          }) || demoProfiles[0];
        if (!demoProfile) {
          res.status(404).json({
            success: false,
            error: { code: 'DEMO_PROFILE_NOT_FOUND', message: 'No demo profile could be restored.' }
          });
          return;
        }
        res.json({
          success: true,
          data: {
            user: {
              id: demoProfile.patient.user_id,
              email: 'ananya.sharma@demo.careiq.internal',
              account_type: 'DEMO'
            },
            patient: demoProfile.patient,
            policy: enrichPolicy(demoProfile.policy),
            policies: enrichPolicies([demoProfile.policy]),
            journey: demoProfile.journey,
            verification_items: demoProfile.verification_items || [],
            isDemo: true
          }
        });
        return;
      }

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

        const rawPolicies = patient ? await this.getPatientPolicies(patient.id) : [];
        const policies = enrichPolicies(rawPolicies);
        const journeys = patient ? dataRepository.getJourneysByPatientId(patient.id) : [];
        const verificationItems = patient ? dataRepository.getVerificationItems(patient.id) : [];

        res.json({
          success: true,
          data: {
            user: authUser,
            patient: patient || null,
            policy: policies[0] || null,
            policies,
            journey: journeys[0] || null,
            verification_items: verificationItems,
            isDemo: patient?.account_type === 'DEMO'
          }
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unable to verify session.' }
      });
    } catch (err: any) {
      console.error('getMe error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_FETCH_FAILED',
          message: err?.message || 'Failed to fetch current user profile.'
        }
      });
    }
  }

  /**
   * POST /api/auth/demo-login
   * Loads a curated demo profile without authentication credentials (guest mode).
   */
  public async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      const parsed = demoLoginSchema.safeParse(req.body);
      const queryId = (parsed.success ? parsed.data.demo_id || parsed.data.profile_id : req.body.demo_id || req.body.profile_id || req.body.id) || '';

      const demoProfiles = this.getDemoProfiles();

      let targetProfile: DemoProfile | undefined;

      if (queryId) {
        const cleanQuery = queryId.toLowerCase().trim();
        targetProfile = demoProfiles.find((dp) => {
          return (
            dp.id.toLowerCase() === cleanQuery ||
            dp.id.toLowerCase().includes(cleanQuery) ||
            dp.patient.id.toLowerCase() === cleanQuery ||
            dp.patient.id.toLowerCase().includes(cleanQuery) ||
            dp.patient.display_name.toLowerCase().includes(cleanQuery)
          );
        });

        if (!targetProfile) {
          res.status(404).json({
            success: false,
            error: { code: 'DEMO_PROFILE_NOT_FOUND', message: `Demo profile '${queryId}' not found.` }
          });
          return;
        }
      } else {
        targetProfile = demoProfiles[0];
      }

      if (!targetProfile) {
        // Fallback from dataRepository
        const repoDemos = dataRepository.getDemoProfiles();
        const fallbackPatient = repoDemos[0] || dataRepository.getPatients()[0];
        if (!fallbackPatient) {
          res.status(404).json({
            success: false,
            error: { code: 'DEMO_PROFILES_NOT_FOUND', message: 'No demo profiles available.' }
          });
          return;
        }

        const policies = enrichPolicies(dataRepository.getPoliciesByPatientId(fallbackPatient.id));
        const journeys = dataRepository.getJourneysByPatientId(fallbackPatient.id);
        const verificationItems = dataRepository.getVerificationItems(fallbackPatient.id);

        res.json({
          success: true,
          message: `Loaded demo profile: ${fallbackPatient.display_name}`,
          data: {
            user: {
              id: fallbackPatient.user_id,
              email: `${fallbackPatient.display_name.toLowerCase().replace(/\s+/g, '.')}@demo.careiq.internal`,
              role: 'demo_user',
              account_type: 'DEMO'
            },
            session: {
              access_token: `demo-token-${fallbackPatient.id}`,
              token_type: 'bearer',
              expires_in: 86400,
              user: {
                id: fallbackPatient.user_id,
                email: `${fallbackPatient.display_name.toLowerCase().replace(/\s+/g, '.')}@demo.careiq.internal`
              }
            },
            patient: fallbackPatient,
            policy: policies[0] || null,
            journey: journeys[0] || null,
            verification_items: verificationItems,
            isDemo: true
          }
        });
        return;
      }

      // Ensure demo records are registered in in-memory repository
      dataRepository.addPatient(targetProfile.patient);
      if (targetProfile.policy) dataRepository.addPolicy(targetProfile.policy);
      if (targetProfile.journey) dataRepository.addJourney(targetProfile.journey);
      if (targetProfile.verification_items) {
        for (const item of targetProfile.verification_items) {
          dataRepository.addVerificationItem(item);
        }
      }

      const email = `${targetProfile.patient.display_name.toLowerCase().replace(/\s+/g, '.')}@demo.careiq.internal`;

      res.json({
        success: true,
        message: `Loaded demo profile: ${targetProfile.patient.display_name} (${targetProfile.insurance_type})`,
        data: {
          user: {
            id: targetProfile.patient.user_id,
            email: email,
            role: 'demo_user',
            account_type: 'DEMO'
          },
          session: {
            access_token: `demo-token-${targetProfile.patient.id}`,
            token_type: 'bearer',
            expires_in: 86400,
            user: {
              id: targetProfile.patient.user_id,
              email: email
            }
          },
          patient: targetProfile.patient,
          policy: enrichPolicy(targetProfile.policy),
          policies: targetProfile.policy ? enrichPolicies([targetProfile.policy]) : [],
          journey: targetProfile.journey,
          verification_items: targetProfile.verification_items || [],
          isDemo: true
        }
      });
    } catch (err: any) {
      console.error('Demo login error:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'DEMO_LOGIN_FAILED',
          message: err?.message || 'Failed to load demo profile.'
        }
      });
    }
  }
}

export const authController = new AuthController();
