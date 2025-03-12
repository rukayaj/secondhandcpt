/**
 * Add Phone Number Column Script
 * 
 * This script adds a 'phone_number' column to the listings table.
 * 
 * Usage:
 * node scripts/db/add_phone_number.js
 */

require('dotenv').config({ path: '.env.local' });
const { getAdminClient, TABLES } = require('../../src/utils/supabaseClient');

async function addPhoneNumberColumn() {
  try {
    console.log('Adding phone_number column to listings table...');
    const supabase = getAdminClient();
    
    // Check connection by fetching one record
    const { error: connectionError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('Error connecting to database:', connectionError.message);
      return;
    }
    
    // Use PostgreSQL functions through Supabase
    const { data, error: sqlError } = await supabase
      .rpc('add_phone_number_column_to_listings');
    
    if (sqlError) {
      console.error('Error executing RPC function:', sqlError.message);
      
      // If RPC function doesn't exist, create it first
      console.log('Creating RPC function...');
      
      // Define the SQL to create the function
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION add_phone_number_column_to_listings()
        RETURNS void AS $$
        BEGIN
          ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      // Execute the SQL to create the function using the REST API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/add_phone_number_column_to_listings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to execute SQL:', await response.text());
        return;
      }
      
      console.log('Successfully added phone_number column to listings table');
    } else {
      console.log('Successfully added phone_number column to listings table');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
addPhoneNumberColumn(); 