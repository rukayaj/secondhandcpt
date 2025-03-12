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
 * Download an image from WAHA API
 * @param {string} url - URL of the image to download from WAHA
 * @param {string} outputPath - Path where the image should be saved
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function downloadImageFromWaha(url, outputPath) {
  try {
    // Fix URL if needed: The media URLs use port 3000 but the API uses 3001
    if (url && url.includes('localhost:3000')) {
      url = url.replace('localhost:3000', 'localhost:3001');
    }
    
    console.log(`Attempting to download image from WAHA: ${url}`);
    
    // Try the original URL first
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000, // 30 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB max size
        headers: {
          'Accept': 'image/*'
        }
      });
      
      // Create directory if it doesn't exist
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Use a promise with proper timeouts for writing
      return await new Promise((resolve, reject) => {
        // Set up a timeout for the entire operation
        const timeoutId = setTimeout(() => {
          console.error('Timeout downloading image - took too long');
          
          // Close the writer if it exists
          if (writer && typeof writer.close === 'function') {
            writer.close();
          }
          
          // Delete any partial file that may have been created
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log(`Deleted partial file after timeout: ${outputPath}`);
            }
          } catch (unlinkError) {
            console.error(`Failed to delete partial file: ${unlinkError.message}`);
          }
          
          resolve(false);
        }, 30000); // 30s timeout for the entire operation

        // Create the writer
        const writer = fs.createWriteStream(outputPath);
        
        // Set up handler for when response data is being piped to the writer
        response.data.on('error', (error) => {
          clearTimeout(timeoutId);
          console.error(`Error in response data stream: ${error.message}`);
          writer.close();
          reject(false);
        });

        // Set up handlers for the writer
        writer.on('finish', () => {
          clearTimeout(timeoutId);
          console.log(`Successfully saved image to ${outputPath}`);
          
          // Verify the file exists and has content
          if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
            resolve(true);
          } else {
            console.error('File was created but is empty or missing');
            reject(false);
          }
        });
        
        writer.on('error', error => {
          clearTimeout(timeoutId);
          console.error(`Error writing file: ${error.message}`);
          reject(false);
        });

        // Pipe the response to the writer
        response.data.pipe(writer);
      });
      
    } catch (originalError) {
      // If the original URL failed with a 404, try to modify the URL
      if (originalError.response && originalError.response.status === 404) {
        console.log('Original URL returned 404, trying alternative URL formats...');
        
        // Extract the parts of the URL to modify
        // URL format is typically: http://localhost:3001/api/files/default/false_{groupId}_{messageId}_{senderId}.jpeg
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const baseUrl = urlParts.slice(0, urlParts.length - 1).join('/');
        
        // Get the parts of the filename
        const filenameParts = filename.split('_');
        if (filenameParts.length >= 4) {
          const groupId = filenameParts[1];
          const messageId = filenameParts[2];
          const senderIdWithExt = filenameParts.slice(3).join('_');
          
          // Check if the message ID is 32 characters (likely a full hash)
          if (messageId.length === 32 && !messageId.startsWith('3A')) {
            // Try with a shortened message ID starting with 3A (20 chars)
            const shortenedMessageId = '3A' + messageId.substring(0, 18);
            const altUrl = `${baseUrl}/false_${groupId}_${shortenedMessageId}_${senderIdWithExt}`;
            
            console.log(`Trying alternative URL format: ${altUrl}`);
            try {
              const response = await axios({
                method: 'GET',
                url: altUrl,
                responseType: 'stream',
                timeout: 30000,
                maxContentLength: 50 * 1024 * 1024,
                headers: {
                  'Accept': 'image/*'
                }
              });
              
              // Create directory if it doesn't exist
              const dir = path.dirname(outputPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              // Use a promise with proper timeouts for writing
              return await new Promise((resolve, reject) => {
                // Set up a timeout for the entire operation
                const timeoutId = setTimeout(() => {
                  console.error('Timeout downloading image with alternative URL - took too long');
                  
                  // Close the writer if it exists
                  if (writer && typeof writer.close === 'function') {
                    writer.close();
                  }
                  
                  // Delete any partial file that may have been created
                  try {
                    if (fs.existsSync(outputPath)) {
                      fs.unlinkSync(outputPath);
                      console.log(`Deleted partial file after timeout: ${outputPath}`);
                    }
                  } catch (unlinkError) {
                    console.error(`Failed to delete partial file: ${unlinkError.message}`);
                  }
                  
                  resolve(false);
                }, 30000); // 30s timeout for the entire operation

                // Create the writer
                const writer = fs.createWriteStream(outputPath);
                
                // Set up handler for when response data is being piped to the writer
                response.data.on('error', (error) => {
                  clearTimeout(timeoutId);
                  console.error(`Error in response data stream (alternative URL): ${error.message}`);
                  writer.close();
                  reject(false);
                });

                // Set up handlers for the writer
                writer.on('finish', () => {
                  clearTimeout(timeoutId);
                  console.log(`Successfully saved image to ${outputPath} using alternative URL`);
                  
                  // Verify the file exists and has content
                  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                    resolve(true);
                  } else {
                    console.error('File was created but is empty or missing');
                    reject(false);
                  }
                });
                
                writer.on('error', error => {
                  clearTimeout(timeoutId);
                  console.error(`Error writing file: ${error.message}`);
                  reject(false);
                });

                // Pipe the response to the writer
                response.data.pipe(writer);
              });
            } catch (altError) {
              console.error(`Alternative URL also failed: ${altError.message}`);
              throw altError; // Re-throw to be caught by outer catch
            }
          }
        }
      }
      
      // If we get here, either the URL wasn't appropriate for modification or the alternative URL also failed
      throw originalError;
    }
  } catch (error) {
    console.error(`Error downloading image from ${url}: ${error.message}`);
    // Additional error details
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    return false;
  }
}

/**
 * Upload an image to Supabase storage
 * @param {string} filePath - Path to the local file
 * @param {string} bucketPath - Path within the bucket where the file should be stored
 * @param {boolean} useDirectPath - If true, use the bucketPath directly without appending the filename
 * @returns {Promise<string|null>} Public URL of the uploaded image or null if failed
 */
async function uploadImageToSupabase(filePath, bucketPath, useDirectPath = false) {
  try {
    const supabase = getAdminClient();
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    
    // Normalize the bucket path to avoid duplication of "listings/"
    let normalizedPath = bucketPath;
    if (useDirectPath) {
      // Use the path directly as provided
      normalizedPath = bucketPath;
    } else {
      // Check if we need to join the bucketPath with the filename
      if (bucketPath.endsWith('/') || bucketPath.endsWith('\\')) {
        normalizedPath = `${bucketPath}${fileName}`;
      } else {
        normalizedPath = `${bucketPath}/${fileName}`;
      }
    }
    
    // Ensure we don't have double "listings/" prefix
    if (normalizedPath.includes('listings/listings/')) {
      normalizedPath = normalizedPath.replace('listings/listings/', 'listings/');
    }
    
    // Upload the file with normalized path
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(normalizedPath, fileContent, {
        contentType: 'image/jpeg', // Assuming JPEG, adjust if needed
        upsert: true // Use upsert to overwrite if file exists, preventing duplicates
      });
    
    if (error) {
      if (error.message.includes('duplicate')) {
        // Get the public URL for existing image
        const { data: urlData } = await supabase.storage
          .from('listing-images')
          .getPublicUrl(normalizedPath);
          
        return urlData?.publicUrl || null;
      }
      
      console.error('Error uploading image to Supabase:', error.message);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('listing-images')
      .getPublicUrl(normalizedPath);
    
    console.log(`Successfully uploaded image to path: ${normalizedPath}`);
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
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
  WHATSAPP_GROUPS,
  getGroupByName,
  ensureDirectoriesExist,
  downloadImage,
  downloadImageFromWaha,
  uploadImageToSupabase,
  checkMissingSupabaseImages
}; 