/**
 * WAHA Image Utilities
 * 
 * Utility functions for downloading and processing images from WAHA API
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// WAHA configuration from environment or default
const WAHA_BASE_URL = process.env.WAHA_BASE_URL || 'http://localhost:3001';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';

/**
 * Download an image from WAHA API
 * 
 * @param {string} mediaUrl - The WAHA media URL
 * @param {string} outputPath - Where to save the downloaded image
 * @returns {Promise<string>} - The path to the downloaded image
 */
async function downloadImageFromWaha(mediaUrl, outputPath) {
  try {
    // Create the directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Extract messageId from the URL if it's a full URL
    let messageId = mediaUrl;
    if (mediaUrl.includes('/')) {
      const parts = mediaUrl.split('/');
      messageId = parts[parts.length - 1];
    }
    
    // If it's already a messageId, use it directly
    const url = `${WAHA_BASE_URL}/api/messages/${WAHA_SESSION}/${messageId}/download`;
    
    // Download the image
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    // Save the image to the output path
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image from WAHA: ${error.message}`);
    throw error;
  }
}

/**
 * Upload an image to Supabase Storage
 * 
 * @param {string} filePath - Path to the local image file
 * @param {string} storagePath - Path in Supabase Storage
 * @returns {Promise<string>} - The URL of the uploaded image
 */
async function uploadImageToSupabase(filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Error uploading to Supabase: ${error.message}`);
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(storagePath);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading image to Supabase: ${error.message}`);
    throw error;
  }
}

/**
 * Check if an image exists in Supabase Storage
 * 
 * @param {string} storagePath - Path in Supabase Storage
 * @returns {Promise<boolean>} - Whether the image exists
 */
async function checkImageExists(storagePath) {
  try {
    // Use the list method to check if the file exists
    const { data, error } = await supabase.storage
      .from('listing-images')
      .list(path.dirname(storagePath), {
        limit: 1,
        offset: 0,
        search: path.basename(storagePath)
      });
    
    if (error) {
      throw new Error(`Error checking image in Supabase: ${error.message}`);
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking image in Supabase: ${error.message}`);
    return false;
  }
}

/**
 * Check for missing images for a listing
 * 
 * @param {Object} listing - The listing object with images array
 * @returns {Promise<Array>} - Array of missing images
 */
async function checkMissingSupabaseImages(listing) {
  const missingImages = [];
  
  if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
    return missingImages;
  }
  
  for (const imagePath of listing.images) {
    const exists = await checkImageExists(imagePath);
    
    if (!exists) {
      missingImages.push({
        listingId: listing.id,
        whatsappGroup: listing.whatsapp_group,
        imagePath
      });
    }
  }
  
  return missingImages;
}

module.exports = {
  downloadImageFromWaha,
  uploadImageToSupabase,
  checkImageExists,
  checkMissingSupabaseImages
}; 