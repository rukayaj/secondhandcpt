#!/usr/bin/env node

/**
 * Update Phone Numbers Script
 * 
 * This script updates existing listings with phone numbers extracted from their text.
 * It's a one-time migration script to populate the phone_number field for existing listings.
 * 
 * Usage:
 * node scripts/maintenance/update-phone-numbers.js [options]
 * 
 * Options:
 *   --help, -h          Show help
 *   --verbose, -v       Show detailed output
 *   --dry-run           Don't actually update the database
 *   --limit=<n>         Maximum number of listings to process (default: all)
 */

require('dotenv').config({ path: '.env.local' });
const { program } = require('commander');
const { getAdminClient, TABLES } = require('../../src/utils/supabaseClient');
const { extractPhoneNumber } = require('../../src/utils/listingParser');

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--dry-run', 'Don\'t actually update the database')
  .option('--limit <n>', 'Maximum number of listings to process', parseInt)
  .parse(process.argv);

const options = program.opts();

/**
 * Main function to update phone numbers
 */
async function updatePhoneNumbers() {
  try {
    const supabase = getAdminClient();
    
    // Get all listings from the database
    console.log('Fetching listings from the database...');
    
    let query = supabase
      .from(TABLES.LISTINGS)
      .select('id, text, phone_number')
      .is('phone_number', null);
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data: listings, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    console.log(`Found ${listings.length} listings without phone numbers`);
    
    // Process listings in batches to avoid overwhelming the database
    const batchSize = 100;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const updates = [];
      
      for (const listing of batch) {
        const phoneNumber = extractPhoneNumber(listing.text);
        
        if (phoneNumber) {
          updates.push({
            id: listing.id,
            phone_number: phoneNumber
          });
          
          if (options.verbose) {
            console.log(`Listing ${listing.id}: Found phone number ${phoneNumber}`);
          }
        } else {
          skippedCount++;
          
          if (options.verbose) {
            console.log(`Listing ${listing.id}: No phone number found`);
          }
        }
      }
      
      if (updates.length > 0 && !options.dryRun) {
        // Update the database
        const { error: updateError } = await supabase
          .from(TABLES.LISTINGS)
          .upsert(updates);
        
        if (updateError) {
          throw new Error(`Error updating listings: ${updateError.message}`);
        }
        
        updatedCount += updates.length;
        console.log(`Updated ${updates.length} listings (${updatedCount} total)`);
      } else if (updates.length > 0) {
        // Dry run - don't actually update
        updatedCount += updates.length;
        console.log(`Would update ${updates.length} listings (${updatedCount} total)`);
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Total listings processed: ${listings.length}`);
    console.log(`- Listings updated with phone numbers: ${updatedCount}`);
    console.log(`- Listings without phone numbers: ${skippedCount}`);
    
    if (options.dryRun) {
      console.log('\nThis was a dry run. No changes were made to the database.');
      console.log('Run without --dry-run to actually update the database.');
    }
  } catch (error) {
    console.error('Error updating phone numbers:', error);
    process.exit(1);
  }
}

// Run the script
updatePhoneNumbers(); 