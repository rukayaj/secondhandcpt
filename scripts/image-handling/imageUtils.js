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
 * Make sure all required directories exist
 */
function ensureDirectoriesExist() {
  // Create data directories if they don't exist
  WHATSAPP_GROUPS.forEach(group => {
    const dataDir = path.join(process.cwd(), 'src/data', group.dataDir);
    if (!fs.existsSync(dataDir)) {
      console.log(`Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const publicDir = path.join(process.cwd(), 'public/images', group.publicDir);
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating public directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }
  });
}

/**
 * Download an image from a URL
 * @param {string} url - URL of the image to download
 * @param {string} outputPath - Path where the image should be saved
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function downloadImage(url, outputPath) {
  try {
    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      return true; // Already downloaded
    }

    // Download the image
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the file
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    // Return a promise that resolves when the file is written
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', error => {
        console.error(`Error writing file: ${error.message}`);
        reject(false);
      });
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}: ${error.message}`);
    return false;
  }
}

/**
 * Upload an image to Supabase Storage
 * @param {string} filePath - Path to the image file
 * @param {string} bucketPath - Path within the Supabase bucket
 * @returns {Promise<string|null>} Public URL of the uploaded image or null if failed
 */
async function uploadImageToSupabase(filePath, bucketPath) {
  try {
    const supabase = getAdminClient();
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`${bucketPath}/${fileName}`, fileContent, {
        contentType: 'image/jpeg', // Assuming JPEG, adjust if needed
        upsert: false
      });
    
    if (error) {
      if (error.message.includes('duplicate')) {
        // Get the public URL for existing image
        const { data: urlData } = await supabase.storage
          .from('images')
          .getPublicUrl(`${bucketPath}/${fileName}`);
          
        return urlData.publicUrl;
      }
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(`${bucketPath}/${fileName}`);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading image to Supabase: ${error.message}`);
    return null;
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
        .from('images')
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
  WHATSAPP_GROUPS,
  getGroupByName,
  ensureDirectoriesExist,
  downloadImage,
  uploadImageToSupabase,
  checkMissingSupabaseImages
}; 