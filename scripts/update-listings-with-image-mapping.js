#!/usr/bin/env node

/**
 * Script to update listings in the database with image mappings
 * 
 * Usage:
 * node scripts/update-listings-with-image-mapping.js <mapping-file>
 * 
 * Example:
 * node scripts/update-listings-with-image-mapping.js ./scripts/nifty-thrifty-0-1-years-image-mapping.json
 * 
 * This script:
 * 1. Reads the image mapping file
 * 2. Fetches all listings from the database
 * 3. Updates each listing's images with the mapped URLs
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Constants
const TABLES = {
  LISTINGS: 'listings',
};

// Get the mapping file from command line arguments
const mappingFilePath = process.argv[2];

if (!mappingFilePath) {
  console.error('Please provide a mapping file path as an argument');
  console.error('Example: node scripts/update-listings-with-image-mapping.js ./scripts/nifty-thrifty-0-1-years-image-mapping.json');
  process.exit(1);
}

// Check if the file exists
if (!fs.existsSync(mappingFilePath)) {
  console.error(`Mapping file not found: ${mappingFilePath}`);
  process.exit(1);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Starting database update with image mappings from: ${mappingFilePath}`);

    // Read the mapping file
    const mappingData = fs.readFileSync(mappingFilePath, 'utf8');
    const mapping = JSON.parse(mappingData);

    console.log(`Loaded mapping with ${Object.keys(mapping).length} entries`);

    // Fetch all listings
    const { data: listings, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*');

    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }

    console.log(`Found ${listings.length} listings in the database`);

    // Update each listing
    let updatedCount = 0;
    let skippedCount = 0;

    for (const listing of listings) {
      // Skip if no images
      if (!listing.images || listing.images.length === 0) {
        skippedCount++;
        continue;
      }

      // Check if any images need to be updated
      const newImages = listing.images.map(imagePath => {
        // If it's already a URL, keep it
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
          return imagePath;
        }

        // Check if we have a mapping for this image
        return mapping[imagePath] || imagePath;
      });

      // Check if any images were updated
      const hasChanges = JSON.stringify(newImages) !== JSON.stringify(listing.images);

      if (hasChanges) {
        // Update the listing
        const { error: updateError } = await supabase
          .from(TABLES.LISTINGS)
          .update({ images: newImages })
          .eq('id', listing.id);

        if (updateError) {
          console.error(`Error updating listing ${listing.id}:`, updateError);
          continue;
        }

        console.log(`Updated listing ${listing.id} with new image URLs`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Finished processing. Updated ${updatedCount} listings, skipped ${skippedCount} listings.`);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error); 