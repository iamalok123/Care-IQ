import { migrator } from '../db/migrator';
import { seeder } from '../db/seeder';
import { dbManager } from '../db/dbManager';

const command = process.argv[2] || 'status';

async function main() {
  console.log('======================================================');
  console.log(`CareIQ Database CLI: [${command.toUpperCase()}]`);
  console.log('======================================================\n');

  switch (command) {
    case 'migrate': {
      console.log('Running database migrations...');
      const result = await migrator.migrate();
      if (result.success) {
        console.log(`\n✓ Migrations completed successfully!`);
        console.log(`Applied (${result.applied.length}):`, result.applied);
        console.log(`Already applied (${result.alreadyApplied.length}):`, result.alreadyApplied);
      } else {
        console.error(`\n❌ Migration failed: ${result.message}`);
        process.exit(1);
      }
      await migrator.close();
      break;
    }

    case 'seed': {
      console.log('Running database seeder...');
      const result = await seeder.seedAll({ force: true });
      if (result.success) {
        console.log(`\n✓ Seeding completed successfully! Total records seeded/upserted: ${result.totalRowsSeeded}`);
        result.results.forEach((r) => {
          console.log(`   - ${r.table}: ${r.count} rows`);
        });
      } else {
        console.error('\n❌ Seeding failed.');
        process.exit(1);
      }
      break;
    }

    case 'status': {
      console.log('Checking database status & table counts...');
      const status = await dbManager.getStatus();
      console.log('Connection Status:', status.connected ? '✓ CONNECTED' : '❌ DISCONNECTED');
      console.log('Tables Available:', status.tablesAvailable ? '✓ YES' : '❌ NO');
      console.log('Message:', status.message);

      if (status.migrations.executed.length > 0 || status.migrations.pending.length > 0) {
        console.log('\nMigrations:');
        console.log('   - Executed:', status.migrations.executed);
        console.log('   - Pending:', status.migrations.pending);
      }

      console.log('\nTable Record Counts:');
      for (const [table, count] of Object.entries(status.tableCounts)) {
        console.log(`   - ${table.padEnd(25)} : ${count} rows`);
      }
      break;
    }

    case 'setup': {
      console.log('1. Running migrations...');
      await migrator.migrate();
      await migrator.close();

      console.log('\n2. Running seeder...');
      const seedRes = await seeder.seedAll({ force: true });
      console.log(`✓ Seeded ${seedRes.totalRowsSeeded} records.`);

      console.log('\n3. Database Status:');
      const status = await dbManager.getStatus();
      console.log('Connection:', status.connected ? '✓ CONNECTED' : '❌ DISCONNECTED');
      for (const [table, count] of Object.entries(status.tableCounts)) {
        console.log(`   - ${table.padEnd(25)} : ${count} rows`);
      }
      break;
    }

    default:
      console.log(`Unknown command "${command}". Available commands: migrate, seed, status, setup`);
  }

  console.log('\n======================================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('CLI Execution Error:', err);
  process.exit(1);
});
