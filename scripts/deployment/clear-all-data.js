/**
 * Clear All Data Script
 * 
 * This script clears all listings from the database and removes all images from the S3 bucket.
 * Use with caution as this will delete ALL data!
 * 
 * Usage:
 * node scripts/db/clear-all-data.js
 * 
 * Options:
 *   --confirm   Confirm that you want to delete all data (required)
 *   --verbose   Show detailed output
 */

// Import path for better directory handling
const path = require('path');

// Load environment variables from both root and local directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const { program } = require('commander');
const { getAdminClient } = require('../../src/utils/supabase');
const TABLES = { LISTINGS: 'listings' };

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--confirm', 'Confirm that you want to delete all data (required)')
  .parse(process.argv);

const options = program.opts();

// Ensure the confirm flag is set
if (!options.confirm) {
  console.error('ERROR: You must use the --confirm flag to proceed with deleting all data');
  console.error('This operation will DELETE ALL DATA from your database and S3 bucket');
  console.error('Example: node scripts/db/clear-all-data.js --confirm');
  process.exit(1);
}

/**
 * Clear all listings from the database
 */
async function clearDatabase() {
  try {
    console.log('Clearing all listings from the database...');
    const supabase = getAdminClient();
    
    // Get count before deletion for verification
    const { count, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error(`Error getting listing count: ${countError.message}`);
      return;
    }
    
    console.log(`Found ${count} listings to delete`);
    
    // Delete all listings - use an unconditional delete instead of comparing with ID
    const { error: deleteError } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000'); // Use a valid UUID comparison that will match all rows
    
    if (deleteError) {
      console.error(`Error deleting listings: ${deleteError.message}`);
      return;
    }
    
    console.log(`Successfully deleted all listings from the database`);
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
  }
}

/**
 * Clear all images from the S3 bucket
 */
async function clearS3Bucket() {
  try {
    console.log('Clearing all images from the S3 bucket...');
    const supabase = getAdminClient();
    
    // List all files in the storage bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from('listing-images')
      .list('listings', {
        limit: 1000, // Set a high limit
        offset: 0,
      });
    
    if (listError) {
      console.error(`Error listing files: ${listError.message}`);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('No images found in the S3 bucket');
      return;
    }
    
    console.log(`Found ${files.length} images to delete`);
    
    // Get all file paths
    const filePaths = files.map(file => `listings/${file.name}`);
    
    // Delete files in batches of 100 to avoid rate limiting
    const batchSize = 100;
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      
      console.log(`Deleting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(filePaths.length/batchSize)}...`);
      
      const { error: deleteError } = await supabase
        .storage
        .from('listing-images')
        .remove(batch);
      
      if (deleteError) {
        console.error(`Error deleting batch: ${deleteError.message}`);
      }
    }
    
    console.log(`Successfully deleted all images from the S3 bucket`);
  } catch (error) {
    console.error(`Error clearing S3 bucket: ${error.message}`);
  }
}

/**
 * Clear all data from the database and S3 bucket
 */
async function clearAllData() {
  console.log('=== STARTING DATA CLEAR OPERATION ===');
  console.log('WARNING: This will delete ALL data from your database and S3 bucket');
  console.log('');
  
  try {
    // Clear the database
    await clearDatabase();
    
    // Clear the S3 bucket
    await clearS3Bucket();
    
    console.log('');
    console.log('=== DATA CLEAR OPERATION COMPLETE ===');
    console.log('All listings and images have been deleted');
  } catch (error) {
    console.error(`Error in clearAllData: ${error.message}`);
  }
}

// Run the script
clearAllData(); 