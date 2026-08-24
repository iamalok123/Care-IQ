import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';
import { DemoProfile } from '../types/domain';

function resolveDataDir(): string {
  const candidate1 = path.resolve(__dirname, '../../data');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(__dirname, '../data');
  if (fs.existsSync(candidate2)) return candidate2;
  const candidate3 = path.resolve(process.cwd(), 'backend/data');
  if (fs.existsSync(candidate3)) return candidate3;
  return path.resolve(__dirname, '../../data');
}

const ROOT_DATA_DIR = resolveDataDir();
const CLEANED_DIR = path.join(ROOT_DATA_DIR, 'cleaned');
const SYNTHETIC_DIR = path.join(ROOT_DATA_DIR, 'synthetic');

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export interface SeedResult {
  table: string;
  count: number;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  error?: string;
}

export class Seeder {
  /**
   * Checks if the database is currently empty (e.g. hospitals table has 0 rows).
   */
  public async isDatabaseEmpty(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('hospitals')
        .select('*', { count: 'exact', head: true });
      if (error) return false;
      return (count ?? 0) === 0;
    } catch {
      return false;
    }
  }

  /**
   * Checks if demo profiles are already seeded in the database.
   */
  public async hasDemoProfiles(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('account_type', 'DEMO');
      if (error) return false;
      return (count ?? 0) >= 3;
    } catch {
      return false;
    }
  }

  /**
   * Seeds the 3 curated demo profiles (Ananya, Rajesh, Meera) into Supabase PostgreSQL.
   */
  public async seedDemoProfiles(): Promise<{
    success: boolean;
    results: SeedResult[];
    totalRowsSeeded: number;
  }> {
    const results: SeedResult[] = [];
    let totalRowsSeeded = 0;

    const demoProfilesPath = path.join(ROOT_DATA_DIR, 'demo_profiles.json');
    if (!fs.existsSync(demoProfilesPath)) {
      console.warn(`⚠️  demo_profiles.json not found at ${demoProfilesPath}`);
      return { success: false, results, totalRowsSeeded: 0 };
    }

    const demoProfiles = readJson<DemoProfile[]>(demoProfilesPath);

    const patientsToSeed: any[] = [];
    const policiesToSeed: any[] = [];
    const journeysToSeed: any[] = [];
    const eventsToSeed: any[] = [];
    const verificationItemsToSeed: any[] = [];

    for (const profile of demoProfiles) {
      if (profile.patient) {
        patientsToSeed.push({
          ...profile.patient,
          account_type: 'DEMO'
        });
      }
      if (profile.policy) {
        policiesToSeed.push(profile.policy);
      }
      if (profile.journey) {
        const { events, ...journeyPayload } = profile.journey;
        journeysToSeed.push(journeyPayload);
        if (events && events.length > 0) {
          eventsToSeed.push(...events);
        }
      }
      if (profile.verification_items && profile.verification_items.length > 0) {
        verificationItemsToSeed.push(...profile.verification_items);
      }
    }

    const seedTable = async (
      table: string,
      data: any[],
      onConflict: string = 'id'
    ) => {
      if (data.length === 0) return;
      try {
        const { error } = await supabase.from(table).upsert(data, { onConflict });
        if (error) throw error;
        results.push({ table, count: data.length, status: 'SUCCESS' });
        totalRowsSeeded += data.length;
      } catch (err: any) {
        results.push({ table, count: 0, status: 'FAILED', error: err.message });
        throw new Error(`Failed seeding demo table "${table}": ${err.message}`);
      }
    };

    try {
      if (patientsToSeed.length > 0) {
        await seedTable('patients', patientsToSeed);
      }
      if (policiesToSeed.length > 0) {
        await seedTable('insurance_policies', policiesToSeed);
      }
      if (journeysToSeed.length > 0) {
        await seedTable('care_journeys', journeysToSeed);
      }
      if (eventsToSeed.length > 0) {
        await seedTable('journey_events', eventsToSeed);
      }
      if (verificationItemsToSeed.length > 0) {
        await seedTable('verification_items', verificationItemsToSeed);
      }

      console.log(`✓ Seeded ${demoProfiles.length} demo profiles (${totalRowsSeeded} relational rows) into Supabase.`);
      return {
        success: true,
        results,
        totalRowsSeeded
      };
    } catch (err: any) {
      console.error('❌ Failed to seed demo profiles:', err.message || err);
      return {
        success: false,
        results,
        totalRowsSeeded
      };
    }
  }

  /**
   * Seeds all master datasets and demo profiles into Supabase.
   */
  public async seedAll(options: { force?: boolean } = {}): Promise<{
    success: boolean;
    results: SeedResult[];
    totalRowsSeeded: number;
  }> {
    const results: SeedResult[] = [];
    let totalRowsSeeded = 0;

    const seedTable = async (
      table: string,
      data: any[],
      onConflict: string = 'id'
    ) => {
      try {
        const { error } = await supabase.from(table).upsert(data, { onConflict });
        if (error) throw error;
        results.push({ table, count: data.length, status: 'SUCCESS' });
        totalRowsSeeded += data.length;
      } catch (err: any) {
        results.push({ table, count: 0, status: 'FAILED', error: err.message });
        throw new Error(`Failed seeding table "${table}": ${err.message}`);
      }
    };

    try {
      // 1. Room Categories
      const roomCategories = readJson<any[]>(path.join(CLEANED_DIR, 'room_categories.json'));
      await seedTable('room_categories', roomCategories);

      // 2. Specialties
      const specialties = readJson<any[]>(path.join(CLEANED_DIR, 'specialties.json'));
      await seedTable('specialties', specialties);

      // 3. Clinical Services
      const services = readJson<any[]>(path.join(CLEANED_DIR, 'services.json'));
      await seedTable('services', services);

      // 4. Insurers
      const insurers = readJson<any[]>(path.join(CLEANED_DIR, 'insurers.json'));
      await seedTable('insurers', insurers);

      // 5. Hospitals
      const hospitals = readJson<any[]>(path.join(CLEANED_DIR, 'hospitals.json'));
      await seedTable('hospitals', hospitals);

      // 6. Hospital Specialties
      const hospitalSpecialtiesRaw = readJson<any[]>(path.join(CLEANED_DIR, 'hospital_specialties.json'));
      const hospitalSpecialties = hospitalSpecialtiesRaw.map((hs) => ({
        id: hs.id || `hs-${hs.hospital_id}-${hs.specialty_id}`,
        ...hs
      }));
      await seedTable('hospital_specialties', hospitalSpecialties);

      // 7. Hospital Services
      const hospitalServicesRaw = readJson<any[]>(path.join(CLEANED_DIR, 'hospital_services.json'));
      const hospitalServices = hospitalServicesRaw.map((hs) => ({
        id: hs.id || `hsrv-${hs.hospital_id}-${hs.service_id}`,
        ...hs
      }));
      await seedTable('hospital_services', hospitalServices);

      // 8. Hospital Rooms
      const hospitalRooms = readJson<any[]>(path.join(CLEANED_DIR, 'hospital_rooms.json'));
      await seedTable('hospital_rooms', hospitalRooms);

      // 9. Hospital Networks
      const hospitalNetworks = readJson<any[]>(path.join(CLEANED_DIR, 'hospital_networks.json'));
      await seedTable('hospital_networks', hospitalNetworks);

      // 10. Procedures
      const procedures = readJson<any[]>(path.join(CLEANED_DIR, 'procedures.json'));
      await seedTable('procedures', procedures);

      // 11. Procedure Costs
      const procedureCosts = readJson<any[]>(path.join(CLEANED_DIR, 'procedure_costs.json'));
      await seedTable('procedure_costs', procedureCosts);

      // 12. Cost Components
      const costComponents = readJson<any[]>(path.join(CLEANED_DIR, 'cost_components.json'));
      await seedTable('cost_components', costComponents);

      // 13. Master Cleaned Policies
      const masterPolicies = readJson<any[]>(path.join(CLEANED_DIR, 'policies.json'));
      await seedTable('insurance_policies', masterPolicies);

      // 14. Policy Rules
      const policyRules = readJson<any[]>(path.join(CLEANED_DIR, 'policy_rules.json'));
      await seedTable('policy_rules', policyRules);

      // 15. Policy Exclusions
      const policyExclusions = readJson<any[]>(path.join(CLEANED_DIR, 'policy_exclusions.json'));
      await seedTable('policy_exclusions', policyExclusions);

      // 16. Seed Demo Profiles (DB-first, Zero JSON runtime dependencies)
      const demoResult = await this.seedDemoProfiles();
      results.push(...demoResult.results);
      totalRowsSeeded += demoResult.totalRowsSeeded;

      return {
        success: true,
        results,
        totalRowsSeeded
      };
    } catch (err: any) {
      return {
        success: false,
        results,
        totalRowsSeeded
      };
    }
  }
}

export const seeder = new Seeder();
