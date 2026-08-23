/**
 * Direct-SQL inspector used to verify schema + data truth without a browser.
 * Run: npx tsx src/scripts/inspectDb.ts "<sql>"
 *      npx tsx src/scripts/inspectDb.ts --file <path-to-sql>
 */
import fs from 'fs';
import { Pool } from 'pg';
import { getPostgresPoolConfig } from '../db/migrator';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let sql: string;

  if (args[0] === '--file') {
    sql = fs.readFileSync(args[1], 'utf-8');
  } else {
    sql = args.join(' ');
  }

  if (!sql.trim()) {
    console.error('No SQL supplied.');
    process.exit(1);
  }

  const config = getPostgresPoolConfig();
  if (!config) {
    console.error('No PostgreSQL connection configured.');
    process.exit(1);
  }

  const pool = new Pool(config);
  try {
    // Split on ";;" so multiple independent result sets can be printed
    const statements = sql
      .split(';;')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      const res = await pool.query(statement);
      if (Array.isArray(res)) {
        res.forEach((r) => console.table(r.rows));
      } else {
        console.log(`\n--- ${res.rowCount} row(s) ---`);
        console.table(res.rows);
      }
    }
  } catch (err) {
    console.error('QUERY FAILED:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
