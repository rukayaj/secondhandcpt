#!/usr/bin/env node

/**
 * DEPRECATED: This script is deprecated and will be removed in a future version.
 * Please use scripts/image-handling/waha-image-handler.js instead.
 *
 * Upload WhatsApp images to Supabase storage
 * 
 * This script uploads images from WhatsApp exports to Supabase storage and updates
 * the database entries with the new image URLs.
 */

/**
 * Script to upload images from WhatsApp chat groups to Supabase Storage
 * 
 * Usage:
 * node scripts/upload-whatsapp-images.js
 * 
 * This script:
 * 1. Reads the listings from the database
 * 2. For each listing, checks if it has local image paths
 * 3. Uploads those images to Supabase Storage
 * 4. Updates the listing record with the new image URLs
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

// Base directory for WhatsApp images
const WHATSAPP_GROUPS = [
  {
    name: 'nifty-thrifty-0-1-years',
    path: path.join(__dirname, '../src/data/nifty-thrifty-0-1-years')
  },
  {
    name: 'nifty-thrifty-1-3-years',
    path: path.join(__dirname, '../src/data/nifty-thrifty-1-3-years')
  }
];

/**
 * Upload a file to Supabase Storage
 * @param {string} filePath - Path to the file
 * @param {string} listingId - ID of the listing
 * @returns {Promise<string|null>} - URL of the uploaded file or null if failed
 */
async function uploadFile(filePath, listingId) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    const uniqueFileName = `${listingId}-${Date.now()}${fileExt}`;
    const storagePath = `listings/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(storagePath, fileContent, {
        contentType: `image/${fileExt.substring(1)}`,
        upsert: false
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(storagePath);

    console.log(`Uploaded ${fileName} to ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

/**
 * Process a single listing
 * @param {Object} listing - Listing record
 * @returns {Promise<boolean>} - Whether the listing was updated
 */
async function processListing(listing) {
  try {
    // Skip if no images or already has URLs
    if (!listing.images || listing.images.length === 0) {
      return false;
    }

    // Check if images are already URLs
    const allImagesAreUrls = listing.images.every(img => 
      img.startsWith('http://') || img.startsWith('https://')
    );

    if (allImagesAreUrls) {
      console.log(`Listing ${listing.id} already has URL images. Skipping.`);
      return false;
    }

    // Find and upload local images
    const newImageUrls = [];
    let updated = false;

    for (const imagePath of listing.images) {
      // Skip if already a URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        newImageUrls.push(imagePath);
        continue;
      }

      // Try to find the image in each WhatsApp group folder
      let found = false;
      for (const group of WHATSAPP_GROUPS) {
        const fullPath = path.join(group.path, imagePath);
        
        if (fs.existsSync(fullPath)) {
          const imageUrl = await uploadFile(fullPath, listing.id);
          if (imageUrl) {
            newImageUrls.push(imageUrl);
            updated = true;
            found = true;
          }
          break;
        }
      }

      // If image not found, keep the original path
      if (!found) {
        console.warn(`Image not found: ${imagePath}`);
        newImageUrls.push(imagePath);
      }
    }

    // Update the listing if any images were uploaded
    if (updated) {
      const { error } = await supabase
        .from(TABLES.LISTINGS)
        .update({ images: newImageUrls })
        .eq('id', listing.id);

      if (error) {
        console.error(`Error updating listing ${listing.id}:`, error);
        return false;
      }

      console.log(`Updated listing ${listing.id} with new image URLs`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing listing ${listing.id}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting WhatsApp images upload...');

    // Check if the listing-images bucket exists, create if not
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'listing-images');
    
    if (!bucketExists) {
      console.log('Creating listing-images bucket...');
      const { error: createBucketError } = await supabase.storage.createBucket('listing-images', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        return;
      }
    }

    // Fetch all listings
    const { data: listings, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*');

    if (error) {
      console.error('Error fetching listings:', error);
      return;
    }

    console.log(`Found ${listings.length} listings`);

    // Process each listing
    let updatedCount = 0;
    for (const listing of listings) {
      const updated = await processListing(listing);
      if (updated) {
        updatedCount++;
      }
    }

    console.log(`Finished processing. Updated ${updatedCount} listings.`);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error); 