#!/usr/bin/env node

/**
 * Script to upload all images from a specific WhatsApp chat group to Supabase Storage
 * 
 * Usage:
 * node scripts/upload-whatsapp-group-images.js <group-name>
 * 
 * Example:
 * node scripts/upload-whatsapp-group-images.js nifty-thrifty-0-1-years
 * 
 * This script:
 * 1. Scans the specified WhatsApp group folder for images
 * 2. Uploads each image to Supabase Storage
 * 3. Outputs a mapping of local paths to Supabase URLs
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get the group name from command line arguments
const groupName = process.argv[2];

if (!groupName) {
  console.error('Please provide a WhatsApp group name as an argument');
  console.error('Example: node scripts/upload-whatsapp-group-images.js nifty-thrifty-0-1-years');
  process.exit(1);
}

// Base directory for WhatsApp images
const groupPath = path.join(__dirname, '../src/data', groupName);

// Check if the directory exists
if (!fs.existsSync(groupPath)) {
  console.error(`Directory not found: ${groupPath}`);
  process.exit(1);
}

// Image file extensions to look for
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Upload a file to Supabase Storage
 * @param {string} filePath - Path to the file
 * @returns {Promise<string|null>} - URL of the uploaded file or null if failed
 */
async function uploadFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName);
    const uniqueFileName = `${groupName}-${uuidv4()}${fileExt}`;
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
 * Find all image files in a directory recursively
 * @param {string} dir - Directory to scan
 * @returns {string[]} - Array of image file paths
 */
function findImageFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDir(dir);
  return files;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Starting image upload for WhatsApp group: ${groupName}`);

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

    // Find all image files
    const imageFiles = findImageFiles(groupPath);
    console.log(`Found ${imageFiles.length} images in ${groupPath}`);

    // Create a mapping file to store local path to Supabase URL mapping
    const mappingFile = path.join(__dirname, `${groupName}-image-mapping.json`);
    const mapping = {};

    // Upload each image
    let successCount = 0;
    for (const [index, filePath] of imageFiles.entries()) {
      console.log(`Processing image ${index + 1}/${imageFiles.length}: ${filePath}`);
      
      const url = await uploadFile(filePath);
      if (url) {
        // Store the relative path as key
        const relativePath = path.relative(groupPath, filePath);
        mapping[relativePath] = url;
        successCount++;
      }
    }

    // Write the mapping to a file
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));

    console.log(`Finished processing. Uploaded ${successCount}/${imageFiles.length} images.`);
    console.log(`Image mapping saved to ${mappingFile}`);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(console.error); 