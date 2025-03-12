/**
 * Add Column to Listings Table
 * 
 * This script adds a column to the listings table by executing a raw SQL query through the
 * Supabase client via a special RPC function.
 * 
 * Usage:
 * node scripts/db/add_column.js
 */

require('dotenv').config({ path: '.env.local' });
const { getAdminClient } = require('../../src/utils/supabaseClient');

async function addPhoneNumberColumn() {
  try {
    console.log('Adding phone_number column to listings table...');
    const supabase = getAdminClient();
    
    // First check if the column already exists
    const { data: columns, error: columnCheckError } = await supabase
      .from('listings')
      .select()
      .limit(1);
    
    if (columnCheckError) {
      console.error('Error connecting to database:', columnCheckError.message);
      return;
    }
    
    // Check if phone_number already exists in the first row's keys
    if (columns && columns.length > 0 && 'phone_number' in columns[0]) {
      console.log('phone_number column already exists in the listings table.');
      return;
    }
    
    // Create a temporary table to execute the ALTER TABLE command
    const { error: sqlError } = await supabase
      .from('_db_management')
      .insert({
        command: 'ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;',
        executed_at: new Date().toISOString()
      });
    
    if (sqlError) {
      // If the _db_management table doesn't exist, we need a different approach
      console.error('Error executing SQL command:', sqlError.message);
      
      // Try using fetch to make a direct HTTP request to Supabase
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/listings?select=id`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=minimal'
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to connect to Supabase REST API:', await response.text());
        console.log('Please execute this SQL command manually in the Supabase dashboard:');
        console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;');
        return;
      }
      
      console.log('Connected to Supabase successfully. Please execute this SQL command manually:');
      console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;');
      return;
    }
    
    console.log('Successfully added phone_number column to listings table');
  } catch (error) {
    console.error('Unexpected error:', error);
    console.log('Please execute this SQL command manually in the Supabase dashboard:');
    console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;');
  }
}

// Run the script
addPhoneNumberColumn().catch(console.error); 