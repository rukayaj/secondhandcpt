/**
 * Consolidated image handling module
 * 
 * This module centralizes all image-related operations:
 * - Copying images from WhatsApp exports to public directory
 * - Uploading images to Supabase storage
 * - Checking for missing or duplicate images
 * - Formatting image URLs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { STORAGE_BUCKETS } = require('./supabase.ts');

// Supabase admin client for storage operations
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// WhatsApp group data configuration
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
 * Copy images from WhatsApp export to public directory
 * @param {Object} options - Options for copying
 * @param {boolean} options.verbose - Whether to log detailed information
 * @returns {Promise<Object>} - Statistics about the copy operation
 */
async function copyWhatsAppImages(options = { verbose: false }) {
  const { verbose } = options;
  const stats = {
    totalImages: 0,
    copiedImages: 0,
    skippedImages: 0,
    errors: 0
  };

  try {
    if (verbose) console.log('Starting to copy WhatsApp images...');
    
    // Ensure the public directory exists for each group
    for (const group of WHATSAPP_GROUPS) {
      const publicDirPath = path.join(process.cwd(), 'public/images', group.publicDir);
      
      if (!fs.existsSync(publicDirPath)) {
        if (verbose) console.log(`Creating public directory for ${group.name}: ${publicDirPath}`);
        fs.mkdirSync(publicDirPath, { recursive: true });
      }
    }
    
    // Get all listings with images from the database
    const supabase = getAdminClient();
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    if (verbose) console.log(`Found ${listings.length} listings with images`);
    
    // Process each listing
    for (const listing of listings) {
      const group = WHATSAPP_GROUPS.find(g => g.name === listing.whatsapp_group);
      if (!group) {
        if (verbose) console.warn(`Unknown WhatsApp group: ${listing.whatsapp_group}`);
        continue;
      }
      
      const sourceDir = path.join(process.cwd(), 'src/data', group.dataDir);
      const destDir = path.join(process.cwd(), 'public/images', group.publicDir);
      
      // Skip if source directory doesn't exist
      if (!fs.existsSync(sourceDir)) {
        if (verbose) console.warn(`Source directory does not exist: ${sourceDir}`);
        continue;
      }
      
      // Process each image in the listing
      for (const imageName of listing.images) {
        stats.totalImages++;
        
        const sourcePath = path.join(sourceDir, imageName);
        const destPath = path.join(destDir, imageName);
        
        // Skip if image already exists in destination
        if (fs.existsSync(destPath)) {
          stats.skippedImages++;
          continue;
        }
        
        // Skip if image doesn't exist in source
        if (!fs.existsSync(sourcePath)) {
          if (verbose) console.warn(`Source image does not exist: ${sourcePath}`);
          stats.errors++;
          continue;
        }
        
        try {
          // Copy the image
          fs.copyFileSync(sourcePath, destPath);
          stats.copiedImages++;
          if (verbose) console.log(`Copied: ${imageName}`);
        } catch (err) {
          if (verbose) console.error(`Error copying ${imageName}: ${err.message}`);
          stats.errors++;
        }
      }
    }
    
    if (verbose) {
      console.log('\nImage copy statistics:');
      console.log(`Total images: ${stats.totalImages}`);
      console.log(`Copied: ${stats.copiedImages}`);
      console.log(`Skipped (already exist): ${stats.skippedImages}`);
      console.log(`Errors: ${stats.errors}`);
    }
    
    return stats;
  } catch (error) {
    console.error('Error in copyWhatsAppImages:', error);
    throw error;
  }
}

/**
 * Upload images to Supabase Storage
 * @param {Object} options - Options for uploading
 * @param {boolean} options.verbose - Whether to log detailed information
 * @returns {Promise<Object>} - Statistics about the upload operation
 */
async function uploadImagesToSupabase(options = { verbose: false }) {
  const { verbose } = options;
  const stats = {
    totalImages: 0,
    uploadedImages: 0,
    skippedImages: 0,
    errors: 0
  };

  try {
    if (verbose) console.log('Starting to upload images to Supabase...');
    
    const supabase = getAdminClient();
    
    // Get all listings with images from the database
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    if (verbose) console.log(`Found ${listings.length} listings with images`);
    
    // Process each listing
    for (const listing of listings) {
      const group = WHATSAPP_GROUPS.find(g => g.name === listing.whatsapp_group);
      if (!group) {
        if (verbose) console.warn(`Unknown WhatsApp group: ${listing.whatsapp_group}`);
        continue;
      }
      
      const publicDir = path.join(process.cwd(), 'public/images', group.publicDir);
      
      // Process each image in the listing
      for (const imageName of listing.images) {
        stats.totalImages++;
        
        const imagePath = path.join(publicDir, imageName);
        const storagePath = `listings/${group.dataDir}/${imageName}`;
        
        // Skip if image doesn't exist locally
        if (!fs.existsSync(imagePath)) {
          if (verbose) console.warn(`Local image does not exist: ${imagePath}`);
          stats.errors++;
          continue;
        }
        
        try {
          // Check if image already exists in Supabase
          const { data: existingFile } = await supabase.storage
            .from(STORAGE_BUCKETS.LISTING_IMAGES)
            .getPublicUrl(storagePath);
          
          if (existingFile) {
            stats.skippedImages++;
            if (verbose) console.log(`Skipped (already exists): ${imageName}`);
            continue;
          }
          
          // Upload the image
          const fileContent = fs.readFileSync(imagePath);
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKETS.LISTING_IMAGES)
            .upload(storagePath, fileContent, {
              contentType: 'image/jpeg', // Assuming all images are JPEGs
              upsert: false
            });
          
          if (uploadError) {
            if (verbose) console.error(`Error uploading ${imageName}: ${uploadError.message}`);
            stats.errors++;
          } else {
            stats.uploadedImages++;
            if (verbose) console.log(`Uploaded: ${imageName}`);
          }
        } catch (err) {
          if (verbose) console.error(`Error processing ${imageName}: ${err.message}`);
          stats.errors++;
        }
      }
    }
    
    if (verbose) {
      console.log('\nImage upload statistics:');
      console.log(`Total images: ${stats.totalImages}`);
      console.log(`Uploaded: ${stats.uploadedImages}`);
      console.log(`Skipped (already exist): ${stats.skippedImages}`);
      console.log(`Errors: ${stats.errors}`);
    }
    
    return stats;
  } catch (error) {
    console.error('Error in uploadImagesToSupabase:', error);
    throw error;
  }
}

/**
 * Check for missing images in Supabase Storage
 * @param {Object} options - Options for checking
 * @param {boolean} options.verbose - Whether to log detailed information
 * @returns {Promise<Array>} - List of listings with missing images
 */
async function checkMissingImages(options = { verbose: false }) {
  const { verbose } = options;
  const missingImages = [];

  try {
    if (verbose) console.log('Checking for missing images in Supabase...');
    
    const supabase = getAdminClient();
    
    // Get all listings with images from the database
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    if (verbose) console.log(`Found ${listings.length} listings with images`);
    
    // Process each listing
    for (const listing of listings) {
      const group = WHATSAPP_GROUPS.find(g => g.name === listing.whatsapp_group);
      if (!group) continue;
      
      // Process each image in the listing
      for (const imageName of listing.images) {
        const storagePath = `listings/${group.dataDir}/${imageName}`;
        
        // Check if image exists in Supabase
        const { data, error: checkError } = await supabase.storage
          .from(STORAGE_BUCKETS.LISTING_IMAGES)
          .download(storagePath);
        
        if (checkError || !data) {
          missingImages.push({
            listingId: listing.id,
            imageName,
            storagePath
          });
          
          if (verbose) console.log(`Missing image: ${storagePath}`);
        }
      }
    }
    
    if (verbose) {
      console.log(`\nFound ${missingImages.length} missing images`);
    }
    
    return missingImages;
  } catch (error) {
    console.error('Error in checkMissingImages:', error);
    throw error;
  }
}

/**
 * Get a properly formatted image URL
 * @param {string} imagePath - The image path or URL
 * @returns {string} - A properly formatted URL for use with next/image
 */
function getFormattedImageUrl(imagePath) {
  // Check if the image path is a valid URL or starts with a slash
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's a relative path without a leading slash, add one
  if (imagePath && !imagePath.startsWith('/')) {
    return `/${imagePath}`;
  }
  
  // If it's a test image, use a placeholder
  if (imagePath.includes('test-image')) {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=No%20Image`;
  }
  
  return imagePath;
}

module.exports = {
  copyWhatsAppImages,
  uploadImagesToSupabase,
  checkMissingImages,
  getFormattedImageUrl,
  WHATSAPP_GROUPS
}; 