import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { dataRepository } from '../services/dataRepository';
import { DemoProfile, Insurer } from '../types/domain';

function resolveDemoProfilesPath(): string {
  const candidate1 = path.resolve(__dirname, '../../../../data/demo_profiles.json');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(__dirname, '../../../data/demo_profiles.json');
  if (fs.existsSync(candidate2)) return candidate2;
  const candidate3 = path.resolve(__dirname, '../../data/demo_profiles.json');
  if (fs.existsSync(candidate3)) return candidate3;
  return path.resolve(process.cwd(), 'data/demo_profiles.json');
}

export class OnboardingController {
  /**
   * GET /api/onboarding/demo-profiles
   * Returns the 3 curated demo profiles with full patient, policy, journey, and verification details.
   */
  public getDemoProfiles(_req: Request, res: Response): void {
    try {
      const demoPath = resolveDemoProfilesPath();
      let demoProfiles: DemoProfile[] = [];

      if (fs.existsSync(demoPath)) {
        const raw = fs.readFileSync(demoPath, 'utf-8');
        demoProfiles = JSON.parse(raw) as DemoProfile[];
      }

      if (!demoProfiles || demoProfiles.length === 0) {
        // Fallback from dataRepository
        const demoPatients = dataRepository.getDemoProfiles();
        demoProfiles = demoPatients.map((p) => {
          const policies = dataRepository.getPoliciesByPatientId(p.id);
          const journeys = dataRepository.getJourneysByPatientId(p.id);
          const verificationItems = dataRepository.getVerificationItems(p.id);
          return {
            id: `demo-${p.id}`,
            name: `${p.display_name} (${p.city})`,
            insurance_type: policies[0]?.policy_type || 'Health Insurance',
            description: `Curated demo persona for ${p.display_name} in ${p.city}`,
            hospital_id: journeys[0]?.hospital_id || 'hosp-manipal-old-airport',
            patient: p,
            policy: policies[0],
            journey: journeys[0] || ({} as any),
            verification_items: verificationItems
          };
        });
      }

      res.json({
        success: true,
        data: demoProfiles,
        meta: { total: demoProfiles.length }
      });
    } catch (err: any) {
      console.error('Error fetching onboarding demo profiles:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'DEMO_PROFILES_FETCH_ERROR',
          message: err?.message || 'Failed to load demo profiles.'
        }
      });
    }
  }

  /**
   * GET /api/onboarding/insurers
   * Returns all available insurance providers and government schemes for registration.
   */
  public getInsurers(_req: Request, res: Response): void {
    try {
      const insurers: Insurer[] = dataRepository.getInsurers();

      res.json({
        success: true,
        data: insurers,
        meta: { total: insurers.length }
      });
    } catch (err: any) {
      console.error('Error fetching insurers:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'INSURERS_FETCH_ERROR',
          message: err?.message || 'Failed to load insurers.'
        }
      });
    }
  }
}

export const onboardingController = new OnboardingController();
