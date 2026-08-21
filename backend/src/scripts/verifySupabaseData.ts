import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { supabase, checkSupabaseConnection } from '../config/supabase';
import { supabaseRepository } from '../services/supabaseRepository';
import { matchingEngine } from '../services/matchingEngine';
import { costEngine } from '../services/costEngine';
import { rulesEngine } from '../services/rulesEngine';
import { RoomCategoryCode } from '../types/domain';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ROOT_DATA_DIR = path.resolve(__dirname, '../../../data');
const CLEANED_DIR = path.join(ROOT_DATA_DIR, 'cleaned');
const SYNTHETIC_DIR = path.join(ROOT_DATA_DIR, 'synthetic');

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function verifySupabase() {
  console.log('====================================================');
  console.log('🔍 CareIQ — Supabase Database Verification Suite');
  console.log('====================================================\n');

  const connection = await checkSupabaseConnection();
  if (!connection.connected) {
    console.error('❌ Supabase connection failed:', connection.message);
    process.exit(1);
  }

  if (!connection.tablesAvailable) {
    console.error('❌ Tables not yet created in Supabase database.');
    console.error('👉 Please execute "backend/src/db/schema.sql" in your Supabase SQL Editor first.\n');
    process.exit(1);
  }

  console.log('✓ Supabase connection verified.\n');
  console.log('--- Step 1: Checking Record Counts vs Local Master Files ---');

  const tablesToCheck = [
    { table: 'room_categories', file: path.join(CLEANED_DIR, 'room_categories.json') },
    { table: 'specialties', file: path.join(CLEANED_DIR, 'specialties.json') },
    { table: 'services', file: path.join(CLEANED_DIR, 'services.json') },
    { table: 'insurers', file: path.join(CLEANED_DIR, 'insurers.json') },
    { table: 'hospitals', file: path.join(CLEANED_DIR, 'hospitals.json') },
    { table: 'hospital_specialties', file: path.join(CLEANED_DIR, 'hospital_specialties.json') },
    { table: 'hospital_services', file: path.join(CLEANED_DIR, 'hospital_services.json') },
    { table: 'hospital_rooms', file: path.join(CLEANED_DIR, 'hospital_rooms.json') },
    { table: 'hospital_networks', file: path.join(CLEANED_DIR, 'hospital_networks.json') },
    { table: 'procedures', file: path.join(CLEANED_DIR, 'procedures.json') },
    { table: 'procedure_costs', file: path.join(CLEANED_DIR, 'procedure_costs.json') },
    { table: 'cost_components', file: path.join(CLEANED_DIR, 'cost_components.json') },
    { table: 'patients', file: path.join(SYNTHETIC_DIR, 'patients.json') },
    { table: 'policy_rules', file: path.join(CLEANED_DIR, 'policy_rules.json') },
    { table: 'policy_exclusions', file: path.join(CLEANED_DIR, 'policy_exclusions.json') },
    { table: 'care_journeys', file: path.join(SYNTHETIC_DIR, 'journeys.json') },
    { table: 'verification_items', file: path.join(SYNTHETIC_DIR, 'verification_items.json') }
  ];

  let allCountsMatched = true;

  for (const item of tablesToCheck) {
    const localData = readJson<any[]>(item.file);
    const { count, error } = await supabase.from(item.table).select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ Table "${item.table}": Query error (${error.message})`);
      allCountsMatched = false;
      continue;
    }

    const match = count === localData.length;
    if (!match) allCountsMatched = false;
    const status = match ? '✓ PASS' : '⚠ COUNT MISMATCH';
    console.log(`[${status}] Table "${item.table}": Supabase = ${count} | Local JSON = ${localData.length}`);
  }

  // Combined Policies Check
  const masterPolicies = readJson<any[]>(path.join(CLEANED_DIR, 'policies.json'));
  const syntheticPolicies = readJson<any[]>(path.join(SYNTHETIC_DIR, 'policies.json'));
  const totalLocalPolicies = masterPolicies.length + syntheticPolicies.length;
  const { count: polCount } = await supabase.from('insurance_policies').select('*', { count: 'exact', head: true });
  const polMatch = polCount === totalLocalPolicies;
  if (!polMatch) allCountsMatched = false;
  console.log(`[${polMatch ? '✓ PASS' : '⚠ COUNT MISMATCH'}] Table "insurance_policies": Supabase = ${polCount} | Local JSON = ${totalLocalPolicies}`);

  console.log('\n--- Step 2: Testing Live Queries & Domain Calculation via Supabase ---');

  // Test Fetching Hospitals
  const hospitals = await supabaseRepository.fetchHospitals();
  console.log(`✓ Fetched ${hospitals.length} hospitals from Supabase.`);

  // Test Fetching Ananya Policy
  const ananyaPolicy = await supabaseRepository.fetchPolicyById('pol-syn-ananya');
  if (!ananyaPolicy) {
    throw new Error('Could not find pol-syn-ananya in Supabase.');
  }
  console.log(`✓ Fetched policy: "${ananyaPolicy.policy_name}" (Sum Insured: ₹${ananyaPolicy.sum_insured.toLocaleString()})`);

  // Test Procedure & Components
  const procCost = await supabase
    .from('procedure_costs')
    .select('*')
    .eq('hospital_id', 'hosp-manipal-old-airport')
    .eq('procedure_id', 'proc-knee-replacement')
    .single();

  const { data: components } = await supabase
    .from('cost_components')
    .select('*')
    .eq('procedure_cost_id', procCost.data.id);

  console.log(`✓ Fetched procedure cost & ${components?.length} components from Supabase.`);

  // Test Cost Engine on Supabase Data
  const estimate = costEngine.calculateEstimate(
    ananyaPolicy,
    procCost.data,
    components || [],
    RoomCategoryCode.PRIVATE_AC,
    6500,
    6500
  );
  console.log(`✓ Calculated Cost Estimate from Supabase records:`);
  console.log(`   - Typical Gross Cost: ₹${estimate.typicalGrossCost.toLocaleString()}`);
  console.log(`   - Insurer Covered: ₹${estimate.estimatedCoveredAmount.toLocaleString()}`);
  console.log(`   - Indicative Patient Exposure: ₹${estimate.indicativePatientExposure.toLocaleString()}`);

  console.log('\n====================================================');
  if (allCountsMatched) {
    console.log('🎉 ALL SUPABASE DATABASE VERIFICATION TESTS PASSED (100%)!');
  } else {
    console.log('⚠️  Some record counts differ. Run "npm run seed:supabase" to synchronize.');
  }
  console.log('====================================================\n');
}

verifySupabase();
