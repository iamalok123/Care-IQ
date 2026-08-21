import fs from 'fs';
import path from 'path';
import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

/**
 * Resolves PostgreSQL connection configuration for Supabase.
 */
export function getPostgresPoolConfig(): PoolConfig | null {
  const directUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (directUrl && directUrl.startsWith('postgres')) {
    return {
      connectionString: directUrl,
      ssl: { rejectUnauthorized: false }
    };
  }

  // Derive from Supabase URL & Password if available
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const dbPassword = process.env.DB_PASSWORD_SUPABASE || process.env.SUPABASE_DB_PASSWORD || '';

  if (supabaseUrl && dbPassword) {
    try {
      const parsedUrl = new URL(supabaseUrl);
      const projectRef = parsedUrl.hostname.split('.')[0];
      const host = `db.${projectRef}.supabase.co`;

      return {
        host,
        port: 5432,
        user: 'postgres',
        password: dbPassword.replace(/^["']|["']$/g, ''),
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      };
    } catch {
      // Fall through if URL parsing fails
    }
  }

  return null;
}

export class Migrator {
  private pool: Pool | null = null;

  private getPool(): Pool {
    if (!this.pool) {
      const config = getPostgresPoolConfig();
      if (!config) {
        throw new Error(
          'PostgreSQL connection not configured. Please set DATABASE_URL or DB_PASSWORD_SUPABASE in .env'
        );
      }
      this.pool = new Pool(config);
    }
    return this.pool;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Runs all pending migration scripts in order.
   */
  public async migrate(): Promise<{
    success: boolean;
    applied: string[];
    alreadyApplied: string[];
    message: string;
  }> {
    const config = getPostgresPoolConfig();
    if (!config) {
      return {
        success: false,
        applied: [],
        alreadyApplied: [],
        message: 'No PostgreSQL connection string available for DDL migrations.'
      };
    }

    const pool = this.getPool();
    const client = await pool.connect();

    const applied: string[] = [];
    const alreadyApplied: string[] = [];

    try {
      // Ensure migrations table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS public._migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          batch INTEGER NOT NULL DEFAULT 1,
          executed_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Fetch already executed migrations
      const { rows } = await client.query<{ name: string }>(
        'SELECT name FROM public._migrations ORDER BY id ASC'
      );
      const executedSet = new Set(rows.map((r) => r.name));

      // Read migration files
      if (!fs.existsSync(MIGRATIONS_DIR)) {
        return {
          success: true,
          applied: [],
          alreadyApplied: Array.from(executedSet),
          message: 'No migrations directory found.'
        };
      }

      const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      // Determine next batch number
      const batchRes = await client.query<{ max_batch: number }>(
        'SELECT COALESCE(MAX(batch), 0) + 1 AS max_batch FROM public._migrations'
      );
      const nextBatch = batchRes.rows[0]?.max_batch || 1;

      for (const file of files) {
        if (executedSet.has(file)) {
          alreadyApplied.push(file);
          continue;
        }

        console.log(`⏳ Executing migration: ${file}...`);
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Execute in transaction
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO public._migrations (name, batch) VALUES ($1, $2)',
            [file, nextBatch]
          );
          await client.query('COMMIT');
          applied.push(file);
          console.log(`✓ Applied migration: ${file}`);
        } catch (migrationErr: any) {
          await client.query('ROLLBACK');
          throw new Error(`Failed executing migration "${file}": ${migrationErr.message}`);
        }
      }

      return {
        success: true,
        applied,
        alreadyApplied,
        message:
          applied.length > 0
            ? `Successfully applied ${applied.length} migration(s).`
            : 'Database schema is already up to date.'
      };
    } catch (err: any) {
      return {
        success: false,
        applied,
        alreadyApplied,
        message: err.message || String(err)
      };
    } finally {
      client.release();
    }
  }

  /**
   * Returns current migration status.
   */
  public async getStatus(): Promise<{
    configured: boolean;
    executedMigrations: string[];
    pendingMigrations: string[];
  }> {
    const config = getPostgresPoolConfig();
    if (!config) {
      return { configured: false, executedMigrations: [], pendingMigrations: [] };
    }

    try {
      const pool = this.getPool();
      const client = await pool.connect();
      try {
        const { rows } = await client.query<{ name: string }>(
          'SELECT name FROM public._migrations ORDER BY id ASC'
        );
        const executed = rows.map((r) => r.name);
        const executedSet = new Set(executed);

        const allFiles = fs.existsSync(MIGRATIONS_DIR)
          ? fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
          : [];

        const pending = allFiles.filter((f) => !executedSet.has(f));

        return {
          configured: true,
          executedMigrations: executed,
          pendingMigrations: pending
        };
      } finally {
        client.release();
      }
    } catch {
      return { configured: false, executedMigrations: [], pendingMigrations: [] };
    }
  }
}

export const migrator = new Migrator();
