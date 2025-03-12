#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Required environment variables are missing.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPhoneNumberColumn() {
  console.log('Adding phone_number column to listings table...');
  
  try {
    // Use PostgreSQL query to add the column
    // This uses the RPC feature to execute a raw SQL query
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE listings ADD COLUMN IF NOT EXISTS phone_number TEXT;'
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully added phone_number column to listings table');
    
    // Now update existing records where we can extract the phone number from sender
    console.log('Updating existing records with phone numbers from sender field...');
    
    // First get all listings that have a sender field in the format of a phone number
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, sender')
      .not('sender', 'is', null);
    
    if (listingsError) {
      throw listingsError;
    }
    
    console.log(`Found ${listings.length} listings with sender information`);
    
    // Process listings in batches
    const batchSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const updates = [];
      
      // Process each listing in the batch
      for (const listing of batch) {
        // Skip if no sender info
        if (!listing.sender) continue;
        
        // Extract phone number from sender (format: "XXXXXXXXXXXX@c.us")
        const senderMatch = listing.sender.match(/(\d+)@c\.us$/);
        if (senderMatch && senderMatch[1]) {
          let phoneNumber = senderMatch[1];
          
          // Normalize format for South Africa numbers
          if (phoneNumber.startsWith('27') && phoneNumber.length >= 11) {
            phoneNumber = '0' + phoneNumber.substring(2);
          }
          
          updates.push({
            id: listing.id,
            phone_number: phoneNumber
          });
        }
      }
      
      // Skip if no updates in this batch
      if (updates.length === 0) continue;
      
      // Update the listings with phone_number data
      const { error: updateError } = await supabase
        .from('listings')
        .upsert(updates, { onConflict: 'id' });
      
      if (updateError) {
        console.error(`Error updating batch ${i / batchSize + 1}:`, updateError);
      } else {
        updatedCount += updates.length;
        console.log(`Updated ${updates.length} listings in batch ${i / batchSize + 1}`);
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} listings with phone numbers.`);
    
  } catch (error) {
    console.error('Error in migration:', error);
    process.exit(1);
  }
}

// Run the migration
addPhoneNumberColumn().then(() => {
  console.log('Migration completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 