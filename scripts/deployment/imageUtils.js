/**
 * Image Utilities
 * 
 * This module provides common functions for image processing that can be
 * shared across multiple scripts.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { writeFile } = require('fs/promises');
const crypto = require('crypto');

/**
 * Get a Supabase client with admin privileges
 * @returns {Object} Supabase client
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * WhatsApp group data for mapping between names and directories
 */
const WHATSAPP_GROUPS = [
  {
    name: 'Nifty Thrifty 0-1 year',
    dataDir: 'nifty-thrifty-0-1-years',
    publicDir: 'nifty-thrifty-0-1-years',
    bucketPath: 'nifty-thrifty-0-1-years',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-0-1-years')
  },
  {
    name: 'Nifty Thrifty 0-1 year (2)',
    dataDir: 'nifty-thrifty-0-1-years',
    publicDir: 'nifty-thrifty-0-1-years',
    bucketPath: 'nifty-thrifty-0-1-years',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-0-1-years')
  },
  {
    name: 'Nifty Thrifty 1-3 years',
    dataDir: 'nifty-thrifty-1-3-years',
    publicDir: 'nifty-thrifty-1-3-years',
    bucketPath: 'nifty-thrifty-1-3-years',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-1-3-years')
  },
  {
    name: 'Nifty Thrifty Bumps & Boobs',
    dataDir: 'nifty-thrifty-bumps-and-boobs',
    publicDir: 'nifty-thrifty-bumps-and-boobs',
    bucketPath: 'nifty-thrifty-bumps-and-boobs',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-bumps-and-boobs')
  },
  {
    name: 'Nifty Thrifty Modern Cloth Nappies',
    dataDir: 'nifty-thrifty-modern-cloth-nappies',
    publicDir: 'nifty-thrifty-modern-cloth-nappies',
    bucketPath: 'nifty-thrifty-modern-cloth-nappies',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-modern-cloth-nappies')
  },
  {
    name: 'Nifty Thrifty Kids (3-8 years) 2',
    dataDir: 'nifty-thrifty-kids-3-8-years',
    publicDir: 'nifty-thrifty-kids-3-8-years',
    bucketPath: 'nifty-thrifty-kids-3-8-years',
    path: path.join(process.cwd(), 'src/data/nifty-thrifty-kids-3-8-years')
  }
];

/**
 * Get the group data for a specific WhatsApp group name
 * @param {string} groupName - Name of the WhatsApp group
 * @returns {Object|null} Group data object or null if not found
 */
function getGroupByName(groupName) {
  return WHATSAPP_GROUPS.find(group => group.name === groupName) || null;
}

/**
 * Download an image from WAHA API
 * @param {string} imageUrl - The URL of the image to download from WAHA
 * @param {string} outputPath - Optional path to save the image to
 * @returns {Promise<Buffer|boolean>} - The image buffer or false if download failed
 */
async function downloadImageFromWaha(imageUrl, outputPath) {
  try {
    // Use axios to download the image
    const axios = require('axios');
    
    // Handle both localhost URLs (for development) and production URLs
    const finalUrl = imageUrl.replace('localhost:3000', 'localhost:3001');
    
    console.log(`Downloading image from WAHA: ${finalUrl}`);
    
    const response = await axios.get(finalUrl, { 
      responseType: 'arraybuffer',
      timeout: 15000 // 15 second timeout
    });
    
    if (response.status !== 200) {
      console.error(`Failed to download image, status: ${response.status}`);
      return null;
    }
    
    const imageBuffer = Buffer.from(response.data);
    
    // If outputPath is provided, save the file
    if (outputPath) {
      const { writeFile } = require('fs/promises');
      await writeFile(outputPath, imageBuffer);
      console.log(`Image downloaded and saved to: ${outputPath}`);
    }
    
    return imageBuffer;
  } catch (error) {
    console.error(`Error downloading image from WAHA: ${error.message}`);
    return null;
  }
}

/**
 * Upload an image to Supabase storage
 * @param {Buffer|string} imageData - Image buffer or path to image file
 * @param {string} storagePath - Path where to store the image in Supabase
 * @param {boolean} isFilePath - Whether imageData is a file path (default: false)
 * @returns {Promise<boolean>} - Whether the upload was successful
 */
async function uploadImageToSupabase(imageData, storagePath, isFilePath = false) {
  try {
    // Ensure we have the required parameters
    if (!imageData) {
      console.error('No image data provided for upload');
      return false;
    }
    
    if (!storagePath) {
      console.error('No storage path provided for upload');
      return false;
    }
    
    let imageBuffer;
    
    // If imageData is a file path, read the file
    if (isFilePath) {
      try {
        imageBuffer = fs.readFileSync(imageData);
        console.log(`Read image from file path: ${imageData} (${imageBuffer.length} bytes)`);
      } catch (readError) {
        console.error(`Error reading image file: ${readError.message}`);
        return false;
      }
    } else {
      // Ensure imageData is a Buffer
      if (!(imageData instanceof Buffer)) {
        console.error('Invalid image data: not a Buffer');
        return false;
      }
      imageBuffer = imageData;
      console.log(`Using provided image buffer (${imageBuffer.length} bytes)`);
    }
    
    // Get Supabase client
    const supabase = getAdminClient();
    
    // Generate a hash for the image for duplicate detection
    const imageHash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    console.log(`Generated image hash: ${imageHash}`);
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image to Supabase: ${error.message}`);
      return false;
    }
    
    console.log(`Successfully uploaded image to Supabase: ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`Error in uploadImageToSupabase: ${error.message}`);
    return false;
  }
}

/**
 * Check if a listing's images exist in Supabase Storage
 * @param {Object} listing - Listing object with images array
 * @returns {Promise<Array>} Array of missing images
 */
async function checkMissingSupabaseImages(listing) {
  try {
    const supabase = getAdminClient();
    const missingImages = [];
    
    if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
      return missingImages;
    }
    
    // Get the group data
    const group = getGroupByName(listing.whatsapp_group);
    if (!group) {
      console.warn(`Unknown WhatsApp group: ${listing.whatsapp_group}`);
      return listing.images.map(img => ({
        listingId: listing.id,
        imageName: img,
        reason: 'unknown_group'
      }));
    }
    
    for (const imageName of listing.images) {
      // Skip if already a URL
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        continue;
      }

      // Check if image exists in Supabase
      const { data, error } = await supabase.storage
        .from('listing-images')
        .list(`${group.bucketPath}`, {
          search: imageName
        });
      
      if (error || !data || data.length === 0) {
        missingImages.push({
          listingId: listing.id,
          imageName,
          reason: 'not_in_supabase'
        });
      }
    }
    
    return missingImages;
  } catch (error) {
    console.error(`Error checking missing images: ${error.message}`);
    return [];
  }
}

module.exports = {
  getAdminClient,
  getGroupByName,
  downloadImageFromWaha,
  uploadImageToSupabase,
  checkMissingSupabaseImages
}; 