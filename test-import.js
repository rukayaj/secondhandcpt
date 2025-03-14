/**
 * Test script for importing a few listings, including duplicates
 * 
 * This script provides a controlled environment to test:
 * 1. Image hash generation during import
 * 2. Duplicate detection
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define our own image utilities to avoid dependency issues
/**
 * Generate a hash of an image buffer for duplicate detection
 * @param {Buffer} buffer - The image buffer to hash
 * @returns {string} - The hash string
 */
function generateImageHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Upload an image to Supabase storage
 * @param {string} filePath - Path to the local file
 * @param {string} storagePath - Path within the storage bucket
 * @param {boolean} isFilePath - Whether imageData is a file path
 * @returns {Promise<boolean>} - Whether the upload was successful
 */
async function uploadImageToSupabase(filePath, storagePath, isFilePath = false) {
  try {
    if (!filePath) {
      console.error('No file path provided for upload');
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
        imageBuffer = fs.readFileSync(filePath);
        console.log(`Read image from file path: ${filePath} (${imageBuffer.length} bytes)`);
      } catch (readError) {
        console.error(`Error reading image file: ${readError.message}`);
        return false;
      }
    } else {
      // Ensure imageData is a Buffer
      if (!(filePath instanceof Buffer)) {
        console.error('Invalid image data: not a Buffer');
        return false;
      }
      imageBuffer = filePath;
    }
    
    // Generate hash for duplicate detection
    const imageHash = generateImageHash(imageBuffer);
    console.log(`Generated image hash: ${imageHash}`);
    
    // Upload to Supabase storage
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
    
    console.log(`Successfully uploaded image to Supabase: ${storagePath}`);
    return true;
  } catch (error) {
    console.error(`Error in uploadImageToSupabase: ${error.message}`);
    return false;
  }
}

// Test data - two copies of the same listing posted in different groups
const testListings = [
  {
    title: "TEST - Stars and moon multi coloured mini night light",
    text: "Brand new stars and moon multi coloured mini night light. Automatically rotates. Collection in Ottery or via Pudo. X posted. PLEASE PM FOR VIDEO",
    whatsappGroup: "Nifty Thrifty 0-1 year (1)",
    sender: "27652050920@c.us",
    imageUrls: ["https://kxtnbvcecvdsptvenxyz.supabase.co/storage/v1/object/public/listing-images/listings/Nifty_Thrifty_0-1_year_1_0_1741882106140_1704.jpg"],
    price: "120",
    date: new Date().toISOString()
  },
  {
    title: "TEST - Stars and moon multi coloured mini night light",
    text: "Brand new stars and moon multi coloured mini night light. Automatically rotates. X posted. PLEASE PM FOR VIDEO",
    whatsappGroup: "Nifty Thrifty 1-3 years",
    sender: "27652050920@c.us",
    imageUrls: ["https://kxtnbvcecvdsptvenxyz.supabase.co/storage/v1/object/public/listing-images/listings/Nifty_Thrifty_1-3_years_0_1741882108309_2582.jpg"],
    price: "120",
    date: new Date().toISOString()
  }
];

/**
 * Process images for a listing
 * @param {Object} listing - The listing to process images for
 * @returns {Promise<{images: string[], image_hashes: string[]}>} - Processed images and hashes
 */
async function processListingImages(listing) {
  console.log(`Processing images for listing: ${listing.title}`);
  
  const images = [];
  const hashes = [];
  
  if (!listing.imageUrls || !Array.isArray(listing.imageUrls) || listing.imageUrls.length === 0) {
    console.log('No image URLs to process');
    return { images, hashes };
  }
  
  // Create a temp directory for downloading images
  const tmpDir = path.join(process.cwd(), 'tmp', 'test-import');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  for (let i = 0; i < listing.imageUrls.length; i++) {
    const imageUrl = listing.imageUrls[i];
    console.log(`\nProcessing image ${i+1}/${listing.imageUrls.length}: ${imageUrl}`);
    
    try {
      // Download the image
      const localPath = path.join(tmpDir, `image_${Date.now()}_${i}.jpg`);
      console.log(`Downloading image to ${localPath}`);
      
      try {
        // Use axios to download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        
        // Save locally
        fs.writeFileSync(localPath, imageBuffer);
        console.log(`Successfully downloaded image (${imageBuffer.length} bytes)`);
        
        // Generate hash
        const hash = generateImageHash(imageBuffer);
        console.log(`Generated image hash: ${hash}`);
        
        // Create a path for Supabase storage
        const cleanGroupName = listing.whatsappGroup.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
        const imagePath = `listings/${cleanGroupName}_${i}_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
        
        // Upload to Supabase
        console.log(`Uploading image to Supabase storage: ${imagePath}`);
        const uploadResult = await uploadImageToSupabase(localPath, imagePath, true);
        
        if (uploadResult) {
          console.log('Upload successful');
          images.push(imagePath);
          hashes.push(hash); // Add the hash
        } else {
          console.error('Upload failed');
        }
        
        // Clean up the local file
        fs.unlinkSync(localPath);
        
      } catch (downloadError) {
        console.error(`Error downloading/processing image: ${downloadError.message}`);
      }
      
    } catch (error) {
      console.error(`Error processing image ${i+1}: ${error.message}`);
    }
  }
  
  console.log(`\nProcessed ${images.length} images with ${hashes.length} hashes`);
  return { images, hashes };
}

/**
 * Check if a listing already exists in the database
 * @param {Object} listing - The listing to check
 * @returns {Promise<boolean>} - Whether the listing already exists
 */
async function listingExists(listing) {
  console.log(`\nChecking if listing exists: ${listing.title}`);
  
  try {
    // 1. Check for exact text match
    if (listing.text && listing.sender) {
      console.log('Checking for exact text match...');
      
      const { data: textMatches, error: textError } = await supabase
        .from('listings')
        .select('id, title, text')
        .eq('sender', listing.sender)
        .eq('text', listing.text)
        .limit(1);
        
      if (textError) {
        console.error(`Error in text match check: ${textError.message}`);
      } else if (textMatches && textMatches.length > 0) {
        console.log('Found existing listing with identical text:');
        console.log(`- ID: ${textMatches[0].id}`);
        console.log(`- Title: ${textMatches[0].title}`);
        return true;
      } else {
        console.log('No exact text match found');
      }
    }
    
    // 2. Check for image hash match
    if (listing.image_hashes && Array.isArray(listing.image_hashes) && listing.image_hashes.length > 0) {
      console.log(`Checking for image hash match (${listing.image_hashes.length} hashes)...`);
      
      // Use the contains operator for PostgreSQL array overlap
      const { data: hashMatches, error: hashError } = await supabase
        .from('listings')
        .select('id, title, image_hashes')
        .contains('image_hashes', listing.image_hashes)
        .limit(5);
        
      if (hashError) {
        console.error(`Error in hash match check: ${hashError.message}`);
      } else if (hashMatches && hashMatches.length > 0) {
        // Check each match for actual hash overlap
        for (const existingListing of hashMatches) {
          if (!existingListing.image_hashes || !Array.isArray(existingListing.image_hashes)) {
            continue;
          }
          
          // Find matching hashes
          const matches = listing.image_hashes.filter(hash => 
            existingListing.image_hashes.includes(hash)
          );
          
          if (matches.length > 0) {
            console.log('Found existing listing with matching image hash:');
            console.log(`- ID: ${existingListing.id}`);
            console.log(`- Title: ${existingListing.title}`);
            console.log(`- Matching hash: ${matches[0]}`);
            return true;
          }
        }
        console.log('No actual hash matches found despite "contains" query results');
      } else {
        console.log('No image hash matches found');
      }
    } else {
      console.log('No image hashes to check');
    }
    
    // 3. Check for title + sender match
    if (listing.title && listing.sender) {
      console.log('Checking for title + sender match...');
      
      const { data: titleMatches, error: titleError } = await supabase
        .from('listings')
        .select('id, title')
        .eq('sender', listing.sender)
        .eq('title', listing.title)
        .limit(1);
        
      if (titleError) {
        console.error(`Error in title match check: ${titleError.message}`);
      } else if (titleMatches && titleMatches.length > 0) {
        console.log('Found existing listing with identical title from same sender:');
        console.log(`- ID: ${titleMatches[0].id}`);
        console.log(`- Title: ${titleMatches[0].title}`);
        return true;
      } else {
        console.log('No title + sender match found');
      }
    }
    
    // No duplicates found
    console.log('No duplicates found - this is a new listing');
    return false;
    
  } catch (error) {
    console.error(`Error checking if listing exists: ${error.message}`);
    return false;
  }
}

/**
 * Import a single test listing
 * @param {Object} listing - The listing to import
 * @returns {Promise<boolean>} - Whether the import was successful
 */
async function importTestListing(listing) {
  console.log(`\n=== Importing test listing: ${listing.title} ===`);
  
  try {
    // Process images and get hashes
    const { images, hashes } = await processListingImages(listing);
    
    // Add images and hashes to the listing
    listing.images = images;
    listing.image_hashes = hashes;
    
    // Check if this listing already exists
    const exists = await listingExists(listing);
    
    if (exists) {
      console.log('Skipping duplicate listing');
      return false;
    }
    
    // Get the database schema to check available columns
    console.log('Checking database schema before inserting...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('listings')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error(`Error checking table schema: ${tableError.message}`);
    } else {
      console.log('Listings table columns available for insert:');
      if (tableInfo && tableInfo.length > 0) {
        const sampleRow = tableInfo[0];
        console.log(Object.keys(sampleRow).join(', '));
      } else {
        console.log('No sample rows found to determine schema');
      }
    }
    
    // Insert the listing
    console.log('Inserting new listing into database...');
    
    // Build insert object dynamically to avoid column mismatches
    const insertObj = {
      title: listing.title,
      text: listing.text,
      price: listing.price,
      whatsapp_group: listing.whatsappGroup,
      sender: listing.sender,
      images: listing.images,
      image_hashes: listing.image_hashes,
      date: listing.date
    };
    
    // Add optional fields based on schema
    const now = new Date().toISOString();
    
    // Only add these fields if they exist in the schema
    if (Object.keys(tableInfo?.[0] || {}).includes('created_at')) {
      insertObj.created_at = now;
    }
    
    if (Object.keys(tableInfo?.[0] || {}).includes('updated_at')) {
      insertObj.updated_at = now;
    }
    
    console.log('Final insert object:', insertObj);
    
    const { data, error } = await supabase
      .from('listings')
      .insert(insertObj);
      
    if (error) {
      console.error(`Error inserting listing: ${error.message}`);
      return false;
    }
    
    console.log('Successfully imported listing!');
    return true;
    
  } catch (error) {
    console.error(`Error importing test listing: ${error.message}`);
    return false;
  }
}

/**
 * Run the test import process
 */
async function runTestImport() {
  console.log('Starting test import process...');
  
  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < testListings.length; i++) {
    try {
      console.log(`\nProcessing listing ${i+1}/${testListings.length}`);
      
      const result = await importTestListing(testListings[i]);
      
      if (result) {
        successCount++;
      } else {
        // Check if it was a duplicate
        const exists = await listingExists(testListings[i]);
        if (exists) {
          duplicateCount++;
        } else {
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing listing ${i+1}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n=== Import Complete ===');
  console.log(`- ${testListings.length} total listings processed`);
  console.log(`- ${successCount} listings successfully imported`);
  console.log(`- ${duplicateCount} duplicate listings skipped`);
  console.log(`- ${errorCount} listings had errors`);
}

// Run the test
runTestImport()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test error:', err)); 