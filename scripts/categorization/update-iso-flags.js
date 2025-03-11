/**
 * Update ISO Flags
 * 
 * This script updates the is_iso flags for all listings in the database
 * using our sophisticated pattern detection.
 * 
 * Run this script once to ensure all listings have the correct is_iso flag.
 */

require('dotenv').config({ path: '.env.local' });
const { getAdminClient, TABLES } = require('../src/utils/supabaseClient');
const { isISOPost, extractPrice } = require('../src/utils/listingParser');

async function updateISOFlags() {
  try {
    console.log('🔍 Updating ISO flags for all listings...');
    
    // Get Supabase client
    const supabase = getAdminClient();
    
    // First check if the is_iso column exists
    console.log('\nChecking if is_iso column exists...');
    try {
      const { data: columnInfo, error: columnError } = await supabase
        .rpc('check_column_exists', {
          p_table_name: 'listings',
          p_column_name: 'is_iso'
        });
      
      // If the custom function doesn't exist, try a direct query
      if (columnError) {
        console.log('Could not use RPC function, trying direct query...');
        
        // Try to select a single record with the is_iso column
        const { error: testError } = await supabase
          .from(TABLES.LISTINGS)
          .select('is_iso')
          .limit(1);
        
        if (testError && testError.message.includes('column "is_iso" does not exist')) {
          console.error('❌ The is_iso column does not exist in the database. Please run the SQL script first:');
          console.log('Run this SQL in the Supabase SQL Editor:');
          console.log('  ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_iso BOOLEAN DEFAULT FALSE;');
          console.log('  CREATE INDEX IF NOT EXISTS idx_listings_is_iso ON listings (is_iso);');
          console.log('\nOr run the provided script:');
          console.log('  scripts/add_iso_column.sql');
          return;
        }
      } else if (columnInfo === false) {
        console.error('❌ The is_iso column does not exist in the database. Please run the SQL script first:');
        console.log('Run this SQL in the Supabase SQL Editor:');
        console.log('  ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_iso BOOLEAN DEFAULT FALSE;');
        console.log('  CREATE INDEX IF NOT EXISTS idx_listings_is_iso ON listings (is_iso);');
        console.log('\nOr run the provided script:');
        console.log('  scripts/add_iso_column.sql');
        return;
      }
    } catch (checkError) {
      // Continue anyway, we'll get a clearer error in the next step if the column truly doesn't exist
      console.log('Could not definitively verify column existence, continuing anyway...');
    }
    
    // Get all listings
    console.log('\nFetching all listings...');
    
    const { data: listings, error: fetchError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, text, is_iso, price')
      .order('date_added', { ascending: false });
    
    if (fetchError) {
      if (fetchError.message.includes('column "is_iso" does not exist')) {
        console.error('❌ The is_iso column does not exist in the database. Please run the SQL script first:');
        console.log('Run this SQL in the Supabase SQL Editor:');
        console.log('  ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_iso BOOLEAN DEFAULT FALSE;');
        console.log('  CREATE INDEX IF NOT EXISTS idx_listings_is_iso ON listings (is_iso);');
        console.log('\nOr run the provided script:');
        console.log('  scripts/add_iso_column.sql');
        return;
      } else {
        console.error('❌ Error fetching listings:', fetchError.message);
        return;
      }
    }
    
    console.log(`Found ${listings?.length || 0} listings to check`);
    
    // Skip if no listings
    if (!listings || listings.length === 0) {
      console.log('✅ No listings to process');
      return;
    }
    
    // Process listings in batches
    console.log('\nAnalyzing listings for ISO patterns...');
    
    const stats = {
      total: listings.length,
      updated: 0,
      alreadyCorrect: 0,
      errors: 0,
      noPriceISO: 0,
      patternISO: 0
    };
    
    const batchSize = 50;
    let processingCount = 0;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const updates = [];
      
      for (const listing of batch) {
        processingCount++;
        if (processingCount % 100 === 0 || processingCount === listings.length) {
          console.log(`Processed ${processingCount}/${listings.length} listings`);
        }
        
        // Skip listings with no text
        if (!listing.text) {
          continue;
        }
        
        // Extract price from text if not already in database
        const price = listing.price !== null ? listing.price : extractPrice(listing.text);
        
        // Determine if the listing is ISO using our sophisticated pattern detection
        const shouldBeISO = isISOPost(listing.text, { 
          noPriceAsISO: true, 
          price 
        });
        
        // Track detection method for statistics
        if (shouldBeISO) {
          if (price === null) {
            stats.noPriceISO++;
          } else {
            stats.patternISO++;
          }
        }
        
        // If the current is_iso flag doesn't match what it should be, update it
        if (listing.is_iso !== shouldBeISO) {
          updates.push({
            id: listing.id,
            is_iso: shouldBeISO
          });
        } else {
          stats.alreadyCorrect++;
        }
      }
      
      // Skip empty batches
      if (updates.length === 0) {
        continue;
      }
      
      // Update in batch
      const { error: updateError } = await supabase
        .from(TABLES.LISTINGS)
        .upsert(updates);
      
      if (updateError) {
        console.error(`❌ Error updating batch ${i/batchSize + 1}:`, updateError.message);
        stats.errors += updates.length;
      } else {
        stats.updated += updates.length;
        console.log(`Updated ${updates.length} listings with correct ISO flags (batch ${i/batchSize + 1}/${Math.ceil(listings.length/batchSize)})`);
      }
    }
    
    console.log('\n✅ ISO flag update complete!');
    console.log('\nStatistics:');
    console.log(`- Total listings: ${stats.total}`);
    console.log(`- Updated: ${stats.updated} (${Math.round(stats.updated / stats.total * 100)}%)`);
    console.log(`- Already correct: ${stats.alreadyCorrect} (${Math.round(stats.alreadyCorrect / stats.total * 100)}%)`);
    console.log(`- Errors: ${stats.errors}`);
    
    // Report ISO detection method stats
    if (stats.noPriceISO > 0 || stats.patternISO > 0) {
      const totalISO = stats.noPriceISO + stats.patternISO;
      console.log(`\nISO Detection Methods:`);
      console.log(`- Detected by no price: ${stats.noPriceISO} (${Math.round(stats.noPriceISO / totalISO * 100)}%)`);
      console.log(`- Detected by pattern: ${stats.patternISO} (${Math.round(stats.patternISO / totalISO * 100)}%)`);
    }
    
    // Report ISO stats
    const { data: isoCount, error: isoError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id')
      .eq('is_iso', true);
    
    if (!isoError) {
      console.log(`\nTotal ISO listings: ${isoCount.length} (${Math.round(isoCount.length / stats.total * 100)}% of all listings)`);
    }
    
  } catch (error) {
    console.error('❌ Error updating ISO flags:', error.message);
  }
}

// Run the script
updateISOFlags().catch(console.error).finally(() => process.exit()); 