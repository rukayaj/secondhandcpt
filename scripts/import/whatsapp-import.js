#!/usr/bin/env node

/**
 * DEPRECATED: This script is deprecated and will be removed in a future version.
 * Please use scripts/import/waha-import.js instead.
 * 
 * WhatsApp Import Script
 * 
 * This script handles the entire process of importing WhatsApp listings:
 * 1. Extracts listings from WhatsApp chat exports
 * 2. Processes and categorizes the listings
 * 3. Adds new listings to the database
 * 4. Copies images from source to public directory
 * 5. Uploads images to Supabase Storage (optional)
 * 
 * Usage:
 * node scripts/whatsapp-import.js [options]
 * 
 * Options:
 *   --help, -h          Show help
 *   --verbose, -v       Show detailed output
 *   --upload-images     Upload images to Supabase Storage
 *   --check-images      Check for missing images in Supabase Storage
 *   --categorize-llm    Use LLM to improve categorization of "Other" listings
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Import utility modules
const { extractListings, processListing } = require('../src/utils/listingParser');
const { processListing: categorizeListings } = require('../src/utils/categoryUtils');
const { listingExists, addListing } = require('../src/utils/dbUtils');
const { 
  WHATSAPP_GROUPS, 
  copyWhatsAppImages, 
  uploadImagesToSupabase, 
  checkMissingImages 
} = require('../src/utils/imageHandler');

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--upload-images', 'Upload images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--categorize-llm', 'Use LLM to improve categorization of "Other" listings')
  .parse(process.argv);

const options = program.opts();

/**
 * Main function to run the import process
 */
async function importWhatsAppListings() {
  try {
    console.log('Starting WhatsApp import process...');
    
    // Step 1: Extract and process listings from WhatsApp exports
    console.log('\nStep 1: Extracting listings from WhatsApp exports...');
    const allListings = await extractAllListings(options.verbose);
    console.log(`Found ${allListings.length} total listings`);
    
    // Step 2: Add new listings to the database
    console.log('\nStep 2: Adding new listings to the database...');
    const addedListings = await addNewListings(allListings, options.verbose);
    console.log(`Added ${addedListings.length} new listings to the database`);
    
    // Step 3: Copy images from source to public directory
    console.log('\nStep 3: Copying images from source to public directory...');
    const copyStats = await copyWhatsAppImages({ verbose: options.verbose });
    console.log(`Copied ${copyStats.copiedImages} images (${copyStats.skippedImages} already existed, ${copyStats.errors} errors)`);
    
    // Step 4: Upload images to Supabase Storage (if requested)
    if (options.uploadImages) {
      console.log('\nStep 4: Uploading images to Supabase Storage...');
      const uploadStats = await uploadImagesToSupabase({ verbose: options.verbose });
      console.log(`Uploaded ${uploadStats.uploadedImages} images (${uploadStats.skippedImages} already existed, ${uploadStats.errors} errors)`);
    }
    
    // Step 5: Check for missing images in Supabase Storage (if requested)
    if (options.checkImages) {
      console.log('\nStep 5: Checking for missing images in Supabase Storage...');
      const missingImages = await checkMissingImages({ verbose: options.verbose });
      console.log(`Found ${missingImages.length} missing images`);
      
      if (missingImages.length > 0 && options.verbose) {
        console.log('\nMissing images:');
        missingImages.forEach(({ listingId, imageName }) => {
          console.log(`- Listing ${listingId}: ${imageName}`);
        });
      }
    }
    
    // Step 6: Use LLM to improve categorization (if requested)
    if (options.categorizeLlm) {
      console.log('\nStep 6: Using LLM to improve categorization...');
      console.log('This feature is not yet implemented');
      // TODO: Implement LLM categorization
    }
    
    console.log('\n===== WhatsApp Import Process Complete =====');
    
  } catch (error) {
    console.error('Error in import process:', error);
    process.exit(1);
  }
}

/**
 * Extract listings from all WhatsApp group exports
 * 
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Array of all extracted listings
 */
async function extractAllListings(verbose) {
  const allListings = [];
  
  for (const group of WHATSAPP_GROUPS) {
    if (verbose) console.log(`\nProcessing ${group.name}...`);
    
    const chatFilePath = path.join(process.cwd(), 'src/data', group.dataDir, `WhatsApp Chat with ${group.name}.txt`);
    
    // Skip if the chat file doesn't exist
    if (!fs.existsSync(chatFilePath)) {
      if (verbose) console.warn(`Chat file not found: ${chatFilePath}`);
      continue;
    }
    
    // Read the chat file
    const chatContent = fs.readFileSync(chatFilePath, 'utf8');
    
    // Extract listings from the chat content
    const extractedListings = extractListings(chatContent, group.name);
    if (verbose) console.log(`Extracted ${extractedListings.length} listings from ${group.name}`);
    
    // Process each listing to extract additional information
    const processedListings = extractedListings.map(listing => {
      // First process to extract price, condition, collection areas, etc.
      const withDetails = processListing(listing);
      
      // Then categorize the listing
      return categorizeListings(withDetails);
    });
    
    allListings.push(...processedListings);
  }
  
  return allListings;
}

/**
 * Add new listings to the database
 * 
 * @param {Array} listings - Array of listings to add
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Array of added listings
 */
async function addNewListings(listings, verbose) {
  const addedListings = [];
  
  for (const listing of listings) {
    try {
      // Check if the listing already exists
      const exists = await listingExists(listing);
      
      if (!exists) {
        // Add the listing to the database
        const addedListing = await addListing(listing);
        addedListings.push(addedListing);
        
        if (verbose) {
          console.log(`Added: ${listing.date} - ${listing.text.substring(0, 50)}...`);
        }
      } else if (verbose) {
        console.log(`Skipped (already exists): ${listing.date} - ${listing.text.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`Error adding listing: ${error.message}`);
    }
  }
  
  return addedListings;
}

// Run the import process
importWhatsAppListings(); 