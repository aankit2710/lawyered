import { AppDataSource } from './data-source';

async function runMigrations() {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations();
  console.log(`Ran ${migrations.length} migration(s).`);
  await AppDataSource.destroy();
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
