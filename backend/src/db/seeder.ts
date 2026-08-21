import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';

const ROOT_DATA_DIR = path.resolve(__dirname, '../../../../data');
const CLEANED_DIR = path.join(ROOT_DATA_DIR, 'cleaned');
const SYNTHETIC_DIR = path.join(ROOT_DATA_DIR, 'synthetic');
const SCENARIOS_DIR = path.join(ROOT_DATA_DIR, 'scenarios');

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
   * Seeds all master datasets and scenario matrices into Supabase.
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

      // 13. Patients
      const patients = readJson<any[]>(path.join(SYNTHETIC_DIR, 'patients.json'));
      await seedTable('patients', patients);

      // 14. Insurance Policies
      const masterPolicies = readJson<any[]>(path.join(CLEANED_DIR, 'policies.json'));
      const syntheticPolicies = readJson<any[]>(path.join(SYNTHETIC_DIR, 'policies.json'));
      await seedTable('insurance_policies', [...masterPolicies, ...syntheticPolicies]);

      // 15. Policy Rules
      const policyRules = readJson<any[]>(path.join(CLEANED_DIR, 'policy_rules.json'));
      await seedTable('policy_rules', policyRules);

      // 16. Policy Exclusions
      const policyExclusions = readJson<any[]>(path.join(CLEANED_DIR, 'policy_exclusions.json'));
      await seedTable('policy_exclusions', policyExclusions);

      // 17. Care Journeys & Events
      const journeys = readJson<any[]>(path.join(SYNTHETIC_DIR, 'journeys.json'));
      for (const jrn of journeys) {
        const { events, ...jrnPayload } = jrn;
        await seedTable('care_journeys', [jrnPayload]);
        if (events && events.length > 0) {
          await seedTable('journey_events', events);
        }
      }

      // 18. Verification Items
      const verificationItems = readJson<any[]>(path.join(SYNTHETIC_DIR, 'verification_items.json'));
      await seedTable('verification_items', verificationItems);

      // 19. Scenarios
      if (fs.existsSync(SCENARIOS_DIR)) {
        const scenarioFiles = fs.readdirSync(SCENARIOS_DIR).filter((f) => f.endsWith('.json'));
        const scenarios = scenarioFiles.map((file) => {
          const data = readJson<any>(path.join(SCENARIOS_DIR, file));
          return {
            id: data.id,
            name: data.name || data.id,
            patient_id: data.patientId || null,
            hospital_id: data.hospitalId || null,
            policy_id: data.policyId || null,
            procedure_id: data.procedureId || null,
            room_category: data.roomCategory || null,
            raw_json: data
          };
        });
        await seedTable('scenarios', scenarios);
      }

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
