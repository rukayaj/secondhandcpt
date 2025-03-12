#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filename) {
  try {
    // Read the SQL file
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Running migration: ${filename}`);
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error running migration ${filename}:`, error);
      return false;
    }
    
    console.log(`Migration ${filename} completed successfully`);
    return true;
  } catch (err) {
    console.error(`Error processing migration ${filename}:`, err);
    return false;
  }
}

async function main() {
  // Get the migration file from command line arguments
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('Error: Please specify a migration file');
    console.log('Usage: node run-migration.js <migration-file.sql>');
    process.exit(1);
  }
  
  // Run the migration
  const success = await runMigration(migrationFile);
  
  if (success) {
    console.log('Migration completed successfully');
    process.exit(0);
  } else {
    console.error('Migration failed');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 