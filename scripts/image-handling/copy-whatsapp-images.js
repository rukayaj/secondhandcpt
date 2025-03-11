/**
 * DEPRECATED: This script is deprecated and will be removed in a future version.
 * Please use scripts/image-handling/waha-image-handler.js instead.
 * 
 * Copy WhatsApp images from source directory to public directory
 * 
 * This script:
 * 1. Fetches listings from the database that have images
 * 2. Copies the images from the source directory to the public directory
 * 3. Keeps track of which images have been copied
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

// WhatsApp group data
const WHATSAPP_GROUPS = [
  {
    name: 'Nifty Thrifty 0-1 year',
    dataDir: 'nifty-thrifty-0-1-years',
    publicDir: 'nifty-thrifty-0-1-years'
  },
  {
    name: 'Nifty Thrifty 1-3 years',
    dataDir: 'nifty-thrifty-1-3-years',
    publicDir: 'nifty-thrifty-1-3-years'
  }
];

/**
 * Copy images from source directory to public directory
 */
async function copyWhatsAppImages() {
  try {
    console.log('Starting to copy WhatsApp images...');
    
    // Ensure the public directory exists
    for (const group of WHATSAPP_GROUPS) {
      const publicDirPath = path.join(__dirname, '../public/images', group.publicDir);
      
      if (!fs.existsSync(publicDirPath)) {
        console.log(`Creating public directory for ${group.name}: ${publicDirPath}`);
        fs.mkdirSync(publicDirPath, { recursive: true });
      }
    }
    
    // Get listings with images
    console.log('\nFetching listings with images from database...');
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .filter('images', 'cs', '{}');
    
    if (fetchError) {
      console.error('Error fetching listings:', fetchError);
      return;
    }
    
    console.log(`Found ${listings.length} listings with images`);
    
    // Count total images
    let totalImages = 0;
    listings.forEach(listing => {
      if (listing.images && Array.isArray(listing.images)) {
        totalImages += listing.images.length;
      }
    });
    
    console.log(`Total images to process: ${totalImages}`);
    
    // Track image stats
    const stats = {
      found: 0,
      notFound: 0,
      copied: 0,
      alreadyExists: 0,
      errors: 0
    };
    
    const missingImages = [];
    
    // Process each listing
    for (const listing of listings) {
      const group = WHATSAPP_GROUPS.find(g => g.name === listing.whatsapp_group);
      if (!group) {
        console.warn(`Unknown WhatsApp group: ${listing.whatsapp_group}`);
        continue;
      }
      
      // Process each image in the listing
      if (listing.images && Array.isArray(listing.images)) {
        for (const imageName of listing.images) {
          const sourcePath = path.join(__dirname, '../src/data', group.dataDir, imageName);
          const destPath = path.join(__dirname, '../public/images', group.publicDir, imageName);
          
          // Check if source image exists
          if (fs.existsSync(sourcePath)) {
            stats.found++;
            
            // Check if destination already exists
            if (fs.existsSync(destPath)) {
              stats.alreadyExists++;
            } else {
              try {
                // Copy the image
                fs.copyFileSync(sourcePath, destPath);
                stats.copied++;
              } catch (error) {
                console.error(`Error copying ${imageName}:`, error.message);
                stats.errors++;
              }
            }
          } else {
            stats.notFound++;
            missingImages.push({
              listingId: listing.id,
              imageName,
              sourcePath
            });
          }
        }
      }
      
      // Log progress every 100 listings
      if ((stats.found + stats.notFound) % 100 === 0) {
        console.log(`Processed ${stats.found + stats.notFound}/${totalImages} images`);
      }
    }
    
    // Print summary
    console.log('\n===== Image Copy Summary =====');
    console.log(`Images found: ${stats.found}/${totalImages}`);
    console.log(`Images not found: ${stats.notFound}/${totalImages}`);
    console.log(`Images copied: ${stats.copied}`);
    console.log(`Images already exist: ${stats.alreadyExists}`);
    console.log(`Errors: ${stats.errors}`);
    
    // Print missing images info
    if (missingImages.length > 0) {
      console.log(`\n${missingImages.length} missing images:`);
      
      // Group by listing ID for cleaner output
      const byListing = {};
      missingImages.forEach(item => {
        if (!byListing[item.listingId]) {
          byListing[item.listingId] = [];
        }
        byListing[item.listingId].push(item.imageName);
      });
      
      Object.entries(byListing).forEach(([listingId, images]) => {
        console.log(`- Listing ${listingId}: ${images.join(', ')}`);
      });
    }
    
    console.log('\nImage copy process complete!');
    
  } catch (error) {
    console.error('Error in copyWhatsAppImages:', error);
  }
}

// Run the function
copyWhatsAppImages(); 