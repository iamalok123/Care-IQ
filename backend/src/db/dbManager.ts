import { migrator } from './migrator';
import { seeder } from './seeder';
import { checkSupabaseConnection, isSupabaseConfigured } from '../config/supabase';
import { dataRepository } from '../services/dataRepository';
import { supabase } from '../config/supabase';

export interface DatabaseStatus {
  provider: string;
  configured: boolean;
  connected: boolean;
  tablesAvailable: boolean;
  migrations: {
    executed: string[];
    pending: string[];
  };
  tableCounts: Record<string, number>;
  message: string;
}

export class DbManager {
  private isInitialized: boolean = false;

  /**
   * Production-grade startup initialization:
   * 1. Validates connection.
   * 2. Automatically executes pending migrations if direct PostgreSQL connection is available.
   * 3. Checks if master tables are empty; if so, automatically seeds all datasets!
   * 4. Synchronizes in-memory repository cache with the database.
   */
  public async initializeOnStartup(): Promise<void> {
    if (this.isInitialized) return;

    console.log('\n======================================================');
    console.log('🔄 CareIQ — Database Startup & Auto-Migration Engine');
    console.log('======================================================');

    if (!isSupabaseConfigured) {
      console.warn('⚠️  Supabase not configured in .env. Running in local JSON fallback mode.');
      this.isInitialized = true;
      return;
    }

    const check = await checkSupabaseConnection();
    if (!check.connected) {
      console.warn(`⚠️  Database connection unreachable: ${check.message}. Running in local fallback mode.`);
      this.isInitialized = true;
      return;
    }

    // Step 1: Run pending migrations if PostgreSQL pool is configured
    try {
      const migrationRes = await migrator.migrate();
      if (migrationRes.success && migrationRes.applied.length > 0) {
        console.log(`✓ Auto-applied ${migrationRes.applied.length} new migration(s) on startup.`);
      }
    } catch (migErr: any) {
      console.warn('⚠️  Migration runner skipped or already managed externally:', migErr?.message || migErr);
    }

    // Step 2: Check if database is empty & auto-seed if needed
    try {
      const isEmpty = await seeder.isDatabaseEmpty();
      if (isEmpty) {
        console.log('🌱 Empty database detected on startup. Executing automated baseline seeding...');
        const seedRes = await seeder.seedAll();
        if (seedRes.success) {
          console.log(`✓ Auto-seeded ${seedRes.totalRowsSeeded} master records into database!`);
        } else {
          console.warn('⚠️  Auto-seeding encountered issues:', seedRes.results.filter((r) => r.status === 'FAILED'));
        }
      } else {
        const hasDemo = await seeder.hasDemoProfiles();
        if (!hasDemo) {
          console.log('🌱 Demo profiles missing in database. Seeding 3 curated demo profiles...');
          const demoRes = await seeder.seedDemoProfiles();
          if (demoRes.success) {
            console.log(`✓ Auto-seeded ${demoRes.totalRowsSeeded} demo records into database!`);
          }
        }
      }
    } catch (seedErr: any) {
      console.warn('⚠️  Auto-seed check error:', seedErr?.message || seedErr);
    }

    // Step 3: Synchronize in-memory repository cache
    try {
      await dataRepository.syncFromSupabase();
    } catch (syncErr: any) {
      console.warn('⚠️  Data repository sync error:', syncErr?.message || syncErr);
    }

    this.isInitialized = true;
    console.log('======================================================\n');
  }

  /**
   * Retrieves full database status and record counts.
   */
  public async getStatus(): Promise<DatabaseStatus> {
    const check = await checkSupabaseConnection();
    const migrationStatus = await migrator.getStatus();

    const tableCounts: Record<string, number> = {};
    const tables = [
      'room_categories',
      'specialties',
      'services',
      'insurers',
      'hospitals',
      'hospital_specialties',
      'hospital_services',
      'hospital_rooms',
      'hospital_networks',
      'procedures',
      'procedure_costs',
      'cost_components',
      'patients',
      'insurance_policies',
      'policy_rules',
      'policy_exclusions',
      'care_journeys',
      'journey_events',
      'verification_items'
    ];

    if (check.tablesAvailable) {
      await Promise.all(
        tables.map(async (t) => {
          try {
            const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
            tableCounts[t] = count ?? 0;
          } catch {
            tableCounts[t] = 0;
          }
        })
      );
    }

    return {
      provider: 'Supabase PostgreSQL',
      configured: isSupabaseConfigured,
      connected: check.connected,
      tablesAvailable: check.tablesAvailable,
      migrations: {
        executed: migrationStatus.executedMigrations,
        pending: migrationStatus.pendingMigrations
      },
      tableCounts,
      message: check.message
    };
  }
}

export const dbManager = new DbManager();
