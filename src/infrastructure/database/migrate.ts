import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool } from './connection';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const db = await getPool();
    
    // Read and execute the migration file
    const migrationPath = join(__dirname, 'migrations', '001_create_rooms_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    
    console.log('✅ Migrations completed successfully');
    
    // Test the table was created
    const result = await db.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'rooms'");
    if (result.rows.length > 0) {
      console.log('✅ Rooms table exists');
    } else {
      console.log('❌ Rooms table was not created');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };