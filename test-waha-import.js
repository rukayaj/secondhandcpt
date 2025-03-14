/**
 * Test WAHA Import Script
 * 
 * This script tests the import process with fixed image handling
 */
require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Import the fixed functions we need
const {
  downloadImageFromWaha
} = require('./scripts/deployment/imageUtils');

const {
  listingExists,
  addListing
} = require('./src/utils/dbUtils');

// Constants
const WAHA_BASE_URL = 'http://localhost:3001';
const WAHA_SESSION = 'default';
const WAHA_API_PREFIX = '/api';

// Test WAHA URL from user example
const TEST_IMAGE_URL = 'http://localhost:3001/api/files/default/false_27787894429-1623257234@g.us_3A4D9F55669962C9EC0C_27839559423@c.us.jpeg';

// Create temp directory if it doesn't exist
const tmpDir = path.join(process.cwd(), 'tmp', 'test-waha-import');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Generate a hash of an image buffer
 * @param {Buffer} buffer - The image buffer to hash
 * @returns {string} - The hash string
 */
function generateImageHash(buffer) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Upload an image to Supabase storage
 * @param {Buffer|string} imageData - Image buffer or path to image file
 * @param {string} storagePath - Path where to store the image in Supabase
 * @param {boolean} isFilePath - Whether imageData is a file path
 * @returns {Promise<boolean>} - Whether the upload was successful
 */
async function uploadImageToSupabase(imageData, storagePath, isFilePath = false) {
  try {
    let imageBuffer;
    
    if (isFilePath) {
      try {
        imageBuffer = fs.readFileSync(imageData);
      } catch (readError) {
        console.error(`Error reading image file: ${readError.message}`);
        return false;
      }
    } else {
      imageBuffer = imageData;
    }
    
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (error) {
      console.error(`Error uploading image to Supabase: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in uploadImageToSupabase: ${error.message}`);
    return false;
  }
}

/**
 * Process and upload an image from WAHA
 * @param {string} imageUrl - WAHA image URL
 * @param {string} messageId - ID of the WhatsApp message
 * @param {string} groupName - Name of the WhatsApp group
 * @returns {Promise<Object>} - Object with image path and hash
 */
async function processWahaImage(imageUrl, messageId, groupName) {
  console.log(`Processing WAHA image: ${imageUrl}`);
  
  try {
    // Download the image to a temporary file
    const tmpFile = path.join(tmpDir, `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`);
    console.log(`Downloading to temporary file: ${tmpFile}`);
    
    const downloadSuccess = await downloadImageFromWaha(imageUrl, tmpFile);
    
    if (!downloadSuccess) {
      console.error(`Failed to download image from ${imageUrl}`);
      return null;
    }
    
    // Generate a hash for the image
    const imageBuffer = fs.readFileSync(tmpFile);
    const imageHash = generateImageHash(imageBuffer);
    console.log(`Generated image hash: ${imageHash}`);
    
    // Upload to Supabase storage
    const cleanGroupName = groupName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    const timestamp = Date.now();
    const uniqueId = Math.floor(Math.random() * 10000);
    const storageFilename = `listings/${cleanGroupName}_0_${timestamp}_${uniqueId}.jpg`;
    
    console.log(`Uploading to Supabase storage as: ${storageFilename}`);
    const uploadSuccess = await uploadImageToSupabase(tmpFile, storageFilename, true);
    
    // Clean up the temporary file
    try {
      fs.unlinkSync(tmpFile);
    } catch (unlinkError) {
      console.warn(`Warning: Could not delete temp file: ${unlinkError.message}`);
    }
    
    if (!uploadSuccess) {
      console.error('Failed to upload image to Supabase');
      return null;
    }
    
    console.log(`Successfully processed image: ${storageFilename}`);
    return { path: storageFilename, hash: imageHash };
    
  } catch (error) {
    console.error(`Error processing WAHA image: ${error.message}`);
    return null;
  }
}

/**
 * Check if a listing exists in the database
 * @param {Object} listing - Listing to check
 * @returns {Promise<boolean>} - Whether the listing exists
 */
async function checkIfListingExists(listing) {
  console.log('Checking if listing exists in database...');
  
  try {
    // Check for exact text match
    console.log('Checking for exact text match...');
    const textMatch = await listingExists({
      text: listing.text,
      sender: listing.sender
    });
    
    if (textMatch) {
      console.log('Found exact text match ✅');
      return true;
    }
    
    // Check for image hash match
    if (listing.image_hashes && listing.image_hashes.length > 0) {
      console.log('Checking for image hash match...');
      const hashMatch = await listingExists({
        image_hashes: listing.image_hashes
      });
      
      if (hashMatch) {
        console.log('Found image hash match ✅');
        return true;
      }
    }
    
    // Check for title + sender match
    console.log('Checking for title + sender match...');
    const titleSenderMatch = await listingExists({
      title: listing.title,
      sender: listing.sender
    });
    
    if (titleSenderMatch) {
      console.log('Found title + sender match ✅');
      return true;
    }
    
    console.log('No match found ❌');
    return false;
  } catch (error) {
    console.error(`Error checking if listing exists: ${error.message}`);
    return false;
  }
}

/**
 * Import a test listing
 */
async function importTestListing() {
  console.log('Starting test import with fixed image handling...');
  
  try {
    // Create a test listing
    const testListing = {
      title: "TEST - Tommee Tippee bottle steriliser",
      text: "Tommee Tippee bottle steriliser. Been used for a few years but in good condition",
      sender: "27839559423@c.us",
      whatsapp_group: "Nifty Thrifty 0-1 year (1)",
      date: new Date().toISOString(),
      price: "150",
      images: [],
      image_hashes: []
    };
    
    // Process the image from the user example
    console.log(`\nProcessing test image: ${TEST_IMAGE_URL}`);
    const imageResult = await processWahaImage(
      TEST_IMAGE_URL,
      'test-message-id',
      testListing.whatsapp_group
    );
    
    if (imageResult) {
      testListing.images.push(imageResult.path);
      testListing.image_hashes.push(imageResult.hash);
      
      console.log('Image successfully processed:');
      console.log(`- Path: ${imageResult.path}`);
      console.log(`- Hash: ${imageResult.hash}`);
    } else {
      console.error('Failed to process test image');
    }
    
    // Check if this listing already exists
    console.log('\nChecking if listing already exists...');
    
    const exists = await checkIfListingExists(testListing);
    
    if (exists) {
      console.log('Listing already exists, skipping import');
      return;
    }
    
    // Add the listing to the database
    console.log('Adding listing to database...');
    
    const addResult = await addListing(testListing);
    
    if (addResult.success) {
      console.log(`Successfully added listing with ID: ${addResult.id}`);
    } else {
      console.error(`Failed to add listing: ${addResult.error}`);
    }
    
  } catch (error) {
    console.error(`Error in test import: ${error.message}`);
  }
}

// Run the test
importTestListing()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test error:', err.message)); 