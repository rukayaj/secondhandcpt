/**
 * WAHA Image Handler
 * 
 * This script handles downloading and processing images from WAHA.
 * It can be used independently or as part of the waha-import.js process.
 * 
 * Usage:
 * node scripts/waha-image-handler.js [options]
 * 
 * Options:
 *   --verbose           Show detailed output
 *   --upload            Upload images to Supabase Storage
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');
const { createClient } = require('@supabase/supabase-js');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

// Import utility modules
const { uploadImagesToSupabase } = require('../src/utils/imageHandler');
const { getAdminClient, STORAGE_BUCKETS } = require('../src/utils/supabaseClient');

// WAHA API Configuration
const WAHA_BASE_URL = 'http://localhost:3001/api'; // Your WAHA API URL
const WAHA_SESSION = 'default'; // Default session name

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--upload', 'Upload images to Supabase Storage')
  .option('--group <name>', 'Process only a specific group')
  .parse(process.argv);

const options = program.opts();

// Directory mapping for each group
const GROUP_DIRECTORIES = {
  'Nifty Thrifty Modern Cloth Nappies': 'src/data/nifty-thrifty-modern-cloth-nappies',
  'Nifty Thrifty 0-1 year (2)': 'src/data/nifty-thrifty-0-1-years',
  'Nifty Thrifty Bumps & Boobs': 'src/data/nifty-thrifty-bumps-and-boobs',
  'Nifty Thrifty 0-1 year (1)': 'src/data/nifty-thrifty-0-1-years',
  'Nifty Thrifty 1-3 years': 'src/data/nifty-thrifty-1-3-years',
  'Nifty Thrifty Kids (3-8 years) 2': 'src/data/nifty-thrifty-kids-3-8-years'
};

/**
 * Main function to run the image processing
 */
async function processImages() {
  try {
    console.log('Starting WAHA image processing...');
    
    // First check if WAHA API is responding
    try {
      await axios.get(`${WAHA_BASE_URL}/sessions`);
      console.log('✅ WAHA API is running.');
    } catch (error) {
      throw new Error('Unable to connect to WAHA API. Make sure WAHA is running at ' + WAHA_BASE_URL);
    }
    
    // Step 1: Check WAHA session status
    console.log('\nStep 1: Checking WAHA session status...');
    const sessionStatus = await checkSessionStatus();
    
    if (!sessionStatus.authenticated) {
      console.error('❌ WAHA session is not authenticated. Please run the import script first to authenticate.');
      
      // Check if it's an existing session that's not authenticated
      if (sessionStatus.exists) {
        console.log('⚠️ Session exists but is not authenticated.');
        console.log('You may need to restart the WAHA Docker container with:');
        console.log('docker stop $(docker ps -q --filter "ancestor=devlikeapro/waha")');
        console.log('And then run the import script again, or use the --restart-waha flag with the update script.');
      }
      
      process.exit(1);
    }
    
    console.log('✅ WAHA session is authenticated.');
    
    // Step 2: Get all listings with media from the database
    console.log('\nStep 2: Getting listings with media...');
    const supabase = getAdminClient();
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    // Filter listings by group if specified
    let filteredListings = listings;
    if (options.group) {
      filteredListings = listings.filter(listing => listing.whatsapp_group === options.group);
      console.log(`Filtered to ${filteredListings.length} listings in group: ${options.group}`);
    }
    
    console.log(`Found ${filteredListings.length} listings with images`);
    
    // Step 3: Download images from WAHA media URLs
    console.log('\nStep 3: Downloading images...');
    const downloadStats = await downloadImages(filteredListings);
    console.log(`Downloaded ${downloadStats.downloaded} images (${downloadStats.skipped} skipped, ${downloadStats.errors} errors)`);
    
    // Step 4: Upload images to Supabase if requested
    if (options.upload) {
      console.log('\nStep 4: Uploading images to Supabase Storage...');
      const uploadStats = await uploadImagesToSupabase({ verbose: options.verbose });
      console.log(`Uploaded ${uploadStats.uploadedImages} images (${uploadStats.skippedImages} already existed, ${uploadStats.errors} errors)`);
    }
    
    console.log('\n===== Image Processing Complete =====');
    
  } catch (error) {
    console.error('Error in image processing:', error);
    process.exit(1);
  }
}

/**
 * Check the status of the WAHA session
 */
async function checkSessionStatus() {
  try {
    const response = await axios.get(`${WAHA_BASE_URL}/sessions/${WAHA_SESSION}`);
    // Check if session is working and connected
    if (response.data && response.data.status === 'WORKING' && 
        response.data.engine && response.data.engine.state === 'CONNECTED') {
      return { authenticated: true, exists: true };
    } else {
      return { 
        authenticated: false, 
        exists: true,
        message: 'Session exists but is not authenticated'
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Session doesn't exist
      return { authenticated: false, exists: false };
    } else if (error.response && error.response.status === 422) {
      // Session exists but might not be authenticated
      return { 
        authenticated: false, 
        exists: true,
        message: error.response.data.message || 'Session exists but status unknown'
      };
    }
    throw error;
  }
}

/**
 * Download images from WAHA media URLs
 * 
 * @param {Array} listings - Array of listings with images
 * @returns {Promise<Object>} - Statistics about the download operation
 */
async function downloadImages(listings) {
  const stats = {
    downloaded: 0,
    skipped: 0,
    errors: 0
  };
  
  if (listings.length === 0) {
    console.log('No listings with images to process.');
    return stats;
  }

  // Create Supabase client for uploading
  const supabase = getAdminClient();
  
  // Process each listing
  for (const listing of listings) {
    const groupName = listing.whatsapp_group;
    const groupDir = GROUP_DIRECTORIES[groupName];
    
    if (!groupDir) {
      console.warn(`Unknown group directory for ${groupName}. Skipping.`);
      continue;
    }
    
    // Ensure the directory exists
    const destDir = path.join(process.cwd(), groupDir);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Process each image in the listing
    if (!listing.images || listing.images.length === 0) {
      if (options.verbose) {
        console.log(`Listing ${listing.id} has no images array or empty images array.`);
      }
      continue;
    }
    
    for (const imageUrl of listing.images) {
      try {
        // Skip if not a valid URL
        if (!imageUrl || typeof imageUrl !== 'string') {
          stats.skipped++;
          continue;
        }
        
        // Handle Supabase URLs - if it's already a Supabase URL, skip it
        if (imageUrl.includes('supabase') || imageUrl.includes('storage.googleapis.com')) {
          stats.skipped++;
          if (options.verbose) {
            console.log(`Skipped (already in Supabase): ${imageUrl}`);
          }
          continue;
        }
        
        // Skip if not a valid URL format
        if (!imageUrl.includes('/api/') && !imageUrl.startsWith('http')) {
          stats.skipped++;
          if (options.verbose) {
            console.log(`Skipped (not a valid URL): ${imageUrl}`);
          }
          continue;
        }
        
        // Format the URL correctly if it's a WAHA API URL
        let formattedUrl = imageUrl;
        if (imageUrl.includes('/api/') && !imageUrl.startsWith('http')) {
          formattedUrl = `http://localhost:3001${imageUrl}`;
          if (options.verbose) {
            console.log(`Formatted WAHA API URL: ${formattedUrl}`);
          }
        }
        
        // Extract filename from URL or create a unique one
        let filename = path.basename(formattedUrl.split('?')[0]); // Remove query parameters
        if (!filename || filename.length < 5) {
          // Generate a filename if none is found
          filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
        }
        
        const destPath = path.join(destDir, filename);
        const storagePath = `listings/${path.basename(groupDir)}/${filename}`;
        
        // Check if already in Supabase storage
        try {
          const { data: storageData } = await supabase.storage
            .from(STORAGE_BUCKETS.LISTING_IMAGES)
            .download(storagePath);
            
          if (storageData) {
            stats.skipped++;
            if (options.verbose) {
              console.log(`Skipped (already in Supabase): ${filename}`);
            }
            continue;
          }
        } catch (err) {
          // Not in storage yet, continue with download
          if (options.verbose) {
            console.log(`Not found in Supabase storage, will download: ${filename}`);
          }
        }
        
        // Download the image to memory first
        let imageBuffer;
        try {
          if (options.verbose) {
            console.log(`Downloading image: ${formattedUrl}`);
          }
          
          const response = await axios({
            method: 'GET',
            url: formattedUrl,
            responseType: 'arraybuffer'
          });
          
          imageBuffer = Buffer.from(response.data);
        } catch (error) {
          console.error(`Error downloading image: ${error.message}`);
          stats.errors++;
          continue;
        }
        
        // Save the image locally if needed
        try {
          fs.writeFileSync(destPath, imageBuffer);
          if (options.verbose) {
            console.log(`Saved locally: ${filename}`);
          }
        } catch (err) {
          console.error(`Error saving local file: ${err.message}`);
          // Continue to try uploading to Supabase
        }
        
        // Upload directly to Supabase
        try {
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKETS.LISTING_IMAGES)
            .upload(storagePath, imageBuffer, {
              contentType: 'image/jpeg',
              upsert: false
            });
            
          if (uploadError) {
            console.error(`Error uploading to Supabase: ${uploadError.message}`);
            stats.errors++;
          } else {
            stats.downloaded++;
            if (options.verbose) {
              console.log(`Uploaded to Supabase: ${storagePath}`);
            }
            
            // Update the listing to use the Supabase URL
            try {
              const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKETS.LISTING_IMAGES)
                .getPublicUrl(storagePath);
                
              if (urlData && urlData.publicUrl) {
                // Update the listing in the database
                const { error: updateError } = await supabase
                  .from('listings')
                  .update({
                    images: listing.images.map(img => 
                      img === imageUrl ? urlData.publicUrl : img
                    )
                  })
                  .eq('id', listing.id);
                  
                if (updateError) {
                  console.error(`Error updating listing: ${updateError.message}`);
                } else if (options.verbose) {
                  console.log(`Updated listing ${listing.id} with Supabase URL`);
                }
              }
            } catch (urlErr) {
              console.error(`Error getting public URL: ${urlErr.message}`);
            }
          }
        } catch (err) {
          console.error(`Error in Supabase upload process: ${err.message}`);
          stats.errors++;
        }
      } catch (error) {
        stats.errors++;
        console.error(`Error processing image (listing ${listing.id}): ${error.message}`);
      }
    }
  }
  
  return stats;
}

// Create necessary directories if they don't exist
function createDirectories() {
  Object.values(GROUP_DIRECTORIES).forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Also ensure the public image directories exist
  Object.values(GROUP_DIRECTORIES).forEach(dir => {
    const sourceDir = dir;
    const publicDir = `public/images/${path.basename(dir)}`;
    const fullPath = path.join(process.cwd(), publicDir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating public directory: ${publicDir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// Run the script
createDirectories();
processImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 