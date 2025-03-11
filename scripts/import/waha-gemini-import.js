/**
 * WAHA-Gemini Integration Script
 * 
 * This script integrates with WAHA (WhatsApp API) to fetch messages from WhatsApp groups,
 * then processes them using Google's Gemini API to extract structured listing data,
 * which is then inserted into the database.
 * 
 * Features:
 * - Connects to WAHA API to fetch messages since the last import date
 * - Uses Gemini to extract structured listing data (Sales and ISO)
 * - Handles image downloads and uploads to Supabase Storage
 * - Updates the database with new listings
 * 
 * Usage:
 * node scripts/import/waha-gemini-import.js [options]
 * 
 * Options:
 *   --verbose           Show detailed output
 *   --upload-images     Upload images to Supabase Storage
 *   --check-images      Check for missing images in Supabase Storage
 *   --days=<n>          Number of days of history to fetch (default: 30)
 *   --limit=<n>         Limit number of messages per group
 *   --ignore-last-date  Ignore the last import date and use days parameter
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import utility modules
const { getLastImportDate, updateLastImportDate } = require('../../src/utils/metadataUtils');
const { listingExists, addListing } = require('../../src/utils/dbUtils');

// Import our consolidated utility modules
const { 
  WHATSAPP_GROUPS,
  WAHA_BASE_URL,
  WAHA_SESSION,
  getAdminClient,
  checkWahaSessionStatus,
  startWahaSession,
  waitForWahaAuthentication,
  createDirectories
} = require('./importUtils');

const {
  uploadImageToSupabase,
  checkMissingSupabaseImages,
  downloadImageFromWaha
} = require('../image-handling/imageUtils');

// Create necessary directories
const tmpDir = path.join(process.cwd(), 'tmp');
const wahaImagesDir = path.join(tmpDir, 'waha-images');

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Created directory: ${tmpDir}`);
}

// Ensure waha-images directory exists
if (!fs.existsSync(wahaImagesDir)) {
  fs.mkdirSync(wahaImagesDir, { recursive: true });
  console.log(`Created directory: ${wahaImagesDir}`);
}

// Create group directories
WHATSAPP_GROUPS.forEach(group => {
  const groupDir = path.join(process.cwd(), group.dataDir);
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
    console.log(`Created directory: ${groupDir}`);
  }
});

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--upload-images', 'Upload images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--days <n>', 'Number of days of history to fetch', parseInt, 30)
  .option('--limit <n>', 'Limit number of messages per group', parseInt)
  .option('--ignore-last-date', 'Ignore the last import date and use days parameter')
  .parse(process.argv);

const options = program.opts();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// WhatsApp group mapping (group name to WAHA chat ID)
// Get mapping from importUtils
const GROUP_MAPPING = WHATSAPP_GROUPS.reduce((map, group) => {
  if (group.chatId) {
    map[group.name] = group.chatId;
  }
  return map;
}, {});

/**
 * Main function to import WhatsApp listings
 * This function orchestrates the entire import process
 */
async function importWhatsAppListings() {
  try {
    console.log('Starting WAHA-Gemini WhatsApp import process...\n');
    
    // Step 1: Check WAHA session status
    console.log('Step 1: Checking WAHA session status...');
    const sessionStatus = await checkWahaSessionStatus();
    
    if (!sessionStatus.authenticated) {
      console.log('Starting WAHA session and waiting for QR code scan...');
      const startResult = await startWahaSession();
      if (!startResult.success) {
        console.error('Failed to start WAHA session');
        return;
      }
      
      // Wait for authentication to complete
      const authResult = await waitForWahaAuthentication();
      if (!authResult.authenticated) {
        console.error('Authentication failed or timed out');
        return;
      }
    }
    
    // Step 2: Check if all the WhatsApp group IDs are configured
    console.log('\nStep 2: Checking WhatsApp group IDs...');
    const configuredGroups = WHATSAPP_GROUPS.filter(group => group.chatId);
    if (configuredGroups.length < WHATSAPP_GROUPS.length) {
      console.warn(`Warning: Only ${configuredGroups.length} out of ${WHATSAPP_GROUPS.length} groups have chat IDs configured`);
    } else {
      console.log(`Found ${configuredGroups.length} out of ${WHATSAPP_GROUPS.length} configured groups`);
    }
    
    // Step 3: Fetch messages from all groups
    console.log('\nStep 3: Fetching messages from WhatsApp groups...');
    const allMessages = await fetchAllGroupMessages(options.days, options);
    if (allMessages.length === 0) {
      console.log('No messages found or unable to fetch messages');
      return;
    }
    
    // Step 4: Process messages with Gemini
    console.log('\nStep 4: Processing messages with Gemini API...');
    const processedListings = await processMessagesWithGemini(allMessages, options);
    
    if (processedListings.length === 0) {
      console.log('No listings extracted from messages');
      return;
    }
    
    console.log(`Extracted ${processedListings.length} listings from ${allMessages.length} messages`);
    
    // Step 5: Process images if enabled
    let listings = processedListings;
    if (options.uploadImages) {
      console.log('\nStep 5: Processing and uploading images...');
      listings = await processImages(processedListings, options.verbose);
    } else {
      console.log('\nSkipping image processing (use --upload-images to enable)');
    }
    
    // Step 6: Add new listings to the database
    console.log('\nStep 6: Adding new listings to the database...');
    await addNewListings(listings, options.verbose);
    
    // Step 7: Update the last import date
    updateLastImportDate(new Date());
    console.log('\nCompleted WhatsApp import process');
    
  } catch (error) {
    console.error('Error in import process:', error);
  }
}

/**
 * Fetch messages from all configured WhatsApp groups
 * @param {number} days - Number of days of history to fetch
 * @param {Object} options - Additional options including message limit
 * @returns {Promise<Array>} - Array of messages
 */
async function fetchAllGroupMessages(days, options = {}) {
  const allMessages = [];
  
  // Set a fixed recent date based on days parameter
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = Math.floor(startDate.getTime() / 1000); // Convert to seconds for WAHA
  
  console.log(`Using fixed date range: Last ${days} days (from ${startDate.toISOString()})`);
  console.log(`Unix timestamp: ${startTimestamp}`);
  
  // First, check if the session is authenticated
  try {
    const sessionStatus = await axios.get(`${WAHA_BASE_URL}/api/sessions/default`);
    console.log(`Session status: ${sessionStatus.data.status}`);
    
    if (sessionStatus.data.status !== 'WORKING') {
      console.log('Session is not in WORKING state. Starting session...');
      await axios.post(`${WAHA_BASE_URL}/api/sessions/default/start`);
      console.log('Session started. Please authenticate in the WhatsApp Web interface.');
      return [];
    }
  } catch (error) {
    console.error('Error checking session status:', error.message);
    return [];
  }
  
  // Process each WhatsApp group
  for (const group of WHATSAPP_GROUPS) {
    if (!group.chatId) {
      console.log(`Skipping group "${group.name}" - no chat ID configured`);
      continue;
    }
    
    console.log(`Fetching messages from group "${group.name}" (${group.chatId})...`);
    
    try {
      // Determine API limit (use options.limit if defined, otherwise default to 100)
      const apiLimit = options.limit || 100;
      
      // Make the API call to get messages
      const response = await axios.get(`${WAHA_BASE_URL}/api/messages`, {
        params: {
          session: 'default',
          chatId: group.chatId,
          limit: apiLimit,
          fromMe: false,
          fromTimestamp: startTimestamp
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const messages = response.data;
        
        // Add group name to each message for easier processing later
        const messagesWithGroup = messages.map(msg => ({
          ...msg,
          whatsappGroup: group.name
        }));
        
        // Apply limit if specified
        let processedMessages = messagesWithGroup;
        if (options.limit && messagesWithGroup.length > options.limit) {
          processedMessages = messagesWithGroup.slice(0, options.limit);
          console.log(`Limiting to ${options.limit} messages from "${group.name}" (found ${messagesWithGroup.length})`);
        }
        
        console.log(`Found ${processedMessages.length} messages in "${group.name}"`);
        
        if (processedMessages.length > 0) {
          // Sample message for debugging
          console.log(`Sample message from ${group.name}:`, JSON.stringify(processedMessages[0], null, 2));
          allMessages.push(...processedMessages);
        }
      } else {
        console.log(`No messages found for ${group.name}`);
      }
    } catch (error) {
      console.error(`Error fetching messages for ${group.name}:`, error.message);
    }
  }
  
  console.log(`Found ${allMessages.length} total messages`);
  
  // Sort messages by timestamp in ascending order
  return allMessages.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Process messages using Gemini API to extract structured listing data
 * @param {Array} messages - Array of messages from WAHA API
 * @param {Object} options - Additional options for processing
 * @returns {Promise<Array>} - Array of processed listings
 */
async function processMessagesWithGemini(messages, options = {}) {
  const results = [];
  const batchSize = 5; // Reduce batch size to 5 to minimize rate limiting
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(messages.length/batchSize)}...`);
    
    for (const message of batch) {
      // Skip messages with no text content
      if (!message.body || message.body.trim() === '') {
        console.log('Skipping message with no text content');
        continue;
      }
      
      console.log(`\nProcessing message from ${message.sender} in ${message.whatsappGroup}:`);
      console.log(`"${message.body.substring(0, 100)}${message.body.length > 100 ? '...' : ''}"`);
      
      const extractedData = await extractListingWithGemini(message);
      
      if (extractedData) {
        // Skip conversation type messages from results
        if (extractedData.type === 'CONVERSATION') {
          console.log(`Skipping conversation message from ${message.sender} in ${message.whatsappGroup}`);
          continue;
        }
        
        // Add message metadata to the extracted data
        extractedData.messageId = message.id;
        extractedData.timestamp = message.timestamp; // Keep the original timestamp
        // Also add a date field for compatibility with the database functions
        // This converts the Unix timestamp (seconds) to an ISO date string
        extractedData.date = message.timestamp ? new Date(message.timestamp * 1000) : new Date(); 
        extractedData.sender = message.sender;
        extractedData.whatsappGroup = message.whatsappGroup;
        extractedData.hasImages = message.mediaUrl || message.quotedMsg?.mediaUrl;
        extractedData.imageUrls = [message.mediaUrl, message.quotedMsg?.mediaUrl].filter(url => url);
        extractedData.rawText = message.body;
        
        results.push(extractedData);
      } else {
        console.log(`Null result from Gemini for message from ${message.sender} in ${message.whatsappGroup}`);
      }
      
      // Increase delay between individual message processing to 2 seconds
      console.log('Waiting 2 seconds before processing next message...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Add a longer delay between batches to avoid rate limiting (10 seconds)
    if (i + batchSize < messages.length) {
      console.log(`Waiting 10 seconds before processing next batch...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  return results.filter(item => item && item.type !== 'CONVERSATION');
}

/**
 * Extract listing data from message using Gemini API
 * @param {Object} messageData - Message data to process
 * @returns {Promise<Object|null>} - Extracted listing data or null if not a listing
 */
async function extractListingWithGemini(message) {
  if (!message.body || message.body.trim() === '') {
    console.debug('Skipping message with no text content');
    return null;
  }

  try {
    // Use gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create a simple, direct prompt
    const prompt = `
Extract product listing information from this WhatsApp message. If it is NOT a product for sale/giveaway, return null.

WhatsApp Message:
${message.body}

Media: ${message.hasMedia ? 'Yes' : 'No'}
Group: ${message.whatsappGroup || 'Unknown'}

Return a JSON object with these fields (or null if not a product listing):
{
  "title": "Brief product title",
  "price": "Price with currency symbol (R100, R50, etc.) or 'Free' if item is being given away",
  "condition": "New, Used, etc.",
  "collection_areas": "Where to collect",
  "description": "Full description",
  "is_free": boolean,
  "size": "Size if mentioned",
  "category": "Category of item"
}

EXAMPLES:

Example 1:
"H&M joggers, very comfortable size large, good condition R150, collection in Kirstenhof"
{
  "title": "H&M joggers",
  "price": "R150",
  "condition": "Good condition",
  "collection_areas": "Kirstenhof",
  "description": "H&M joggers, very comfortable size large, good condition",
  "is_free": false,
  "size": "Large",
  "category": "Clothing"
}

Example 2: 
"I have a large baby cot in storage that I'm giving away. The cot has 2 x removable sides and a toddler guard which can be used for older children with one of the cot sides removed. Free to whoever can collect from Hout Bay."
{
  "title": "Baby cot",
  "price": "Free",
  "condition": "Used - damaged",
  "collection_areas": "Hout Bay",
  "description": "Large baby cot with 2 removable sides and toddler guard",
  "is_free": true,
  "size": "Large",
  "category": "Furniture"
}

Example 3:
"*Cotton on kids Bucket Swim Hat -R100* Size XS/S (52cm head circumference) Size of M/L (54cm head circumference) Brand new | XPosted | Collection Marina Da Gama, Muizenberg."
{
  "title": "Cotton on kids Bucket Swim Hat",
  "price": "R100",
  "condition": "Brand new",
  "collection_areas": "Marina Da Gama, Muizenberg",
  "description": "Cotton on kids Bucket Swim Hat, available in size XS/S (52cm) and M/L (54cm)",
  "is_free": false,
  "size": "XS/S (52cm) and M/L (54cm)",
  "category": "Kids Accessories"
}
`;

    // Set temperature higher to allow for more flexibility
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    let jsonStr = text.trim();
    
    // Remove any markdown formatting if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }
    
    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(jsonStr);
      if (jsonResponse === null) {
        console.debug(`Message identified as not a product listing`);
        return null;
      }
      
      console.log(`Extracted listing: ${JSON.stringify(jsonResponse, null, 2)}`);
      return jsonResponse;
    } catch (parseError) {
      console.error(`Error parsing JSON response: ${parseError.message}`);
      console.debug(`Response was: ${jsonStr}`);
      return null;
    }
  } catch (error) {
    console.error(`Error with Gemini API: ${error.message}`);
    return null;
  }
}

/**
 * Process images from listings
 * @param {Array} listings - Processed listings with image data
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<void>}
 */
async function processImages(listings, verbose = false) {
  console.log(`Processing images for ${listings.length} listings...`);
  
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  
  for (const listing of listings) {
    // Skip listings without images
    if (!listing.images || listing.images.length === 0) {
      continue;
    }
    
    // Create a directory for storing temporary images
    const tmpDir = path.join(process.cwd(), 'tmp', 'waha-images');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    processedCount++;
    
    // Process each image
    for (let i = 0; i < listing.images.length; i++) {
      const imageUrl = listing.images[i];
      
      if (verbose) {
        console.log(`Processing image ${i + 1}/${listing.images.length} for listing: ${listing.title || 'Untitled'}`);
      }
      
      try {
        // Download the image from WAHA
        const localPath = path.join(tmpDir, `image_${Date.now()}_${i}.jpg`);
        await downloadImageFromWaha(imageUrl, localPath);
        
        // Upload to Supabase
        const imagePath = `listings/${listing.id}_${i}.jpg`;
        await uploadImageToSupabase(localPath, imagePath);
        
        // Update the listing's image path
        const supabase = getAdminClient();
        await supabase
          .from('listings')
          .update({
            images: supabase.rpc('array_append', { arr: listing.images, item: imagePath })
          })
          .eq('id', listing.id);
        
        // Delete the temporary file
        fs.unlinkSync(localPath);
        
        successCount++;
      } catch (error) {
        console.error(`Error processing image: ${error.message}`);
        errorCount++;
      }
    }
    
    if (verbose && processedCount % 10 === 0) {
      console.log(`Processed ${processedCount} listings with images (${successCount} successful, ${errorCount} errors)`);
    }
  }
  
  console.log(`Finished processing images: ${processedCount} listings, ${successCount} successful uploads, ${errorCount} errors`);
}

/**
 * Add new listings to the database
 * @param {Array} listings - Processed listings to add
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Array of added listings
 */
async function addNewListings(listings, verbose = false) {
  const addedListings = [];
  
  // Add statistics tracking
  const stats = {
    total: listings.length,
    added: 0,
    skipped: {
      total: 0,
      alreadyExists: 0,
      invalidData: 0,
      dbErrors: 0
    }
  };
  
  console.log(`Processing ${listings.length} listings for database insertion...`);
  
  for (const listing of listings) {
    if (verbose) {
      console.log(`\nProcessing listing: ${listing.title || 'Untitled'}`);
      // Format timestamp for display - convert Unix timestamp to readable date
      const dateString = listing.timestamp ? new Date(listing.timestamp * 1000).toISOString() : 'Unknown date';
      console.log(`Group: ${listing.whatsappGroup}, Date: ${dateString}`);
      if (listing.price) console.log(`Price: R${listing.price}`);
      if (listing.condition) console.log(`Condition: ${listing.condition}`);
    }
    
    try {
      // Basic validation
      if (!listing.title || listing.title.trim() === '') {
        console.log(`Skipping listing with no title: "${listing.rawText.substring(0, 50)}..."`);
        stats.skipped.total++;
        stats.skipped.invalidData++;
        continue;
      }
      
      // Check if listing already exists to avoid duplicates
      const exists = await listingExists(listing, verbose);
      
      if (exists) {
        if (verbose) {
          console.log(`Listing already exists in database, skipping`);
        }
        stats.skipped.total++;
        stats.skipped.alreadyExists++;
        continue;
      }
      
      // Format the listing for database insertion
      const dbListing = {
        title: listing.title,
        price: listing.price 
          ? (listing.price.toLowerCase() === 'free' 
             ? 0 
             : parseFloat(listing.price.replace(/r/gi, '').trim().split(' ')[0].replace(/,/g, '')) || 0)
          : 0,
        description: listing.description,
        whatsapp_group: listing.whatsappGroup,
        date: listing.date,
        sender: listing.sender,
        text: listing.rawText,
        images: [], // Will be updated when images are processed
        condition: listing.condition,
        collectionAreas: Array.isArray(listing.collection_areas) ? listing.collection_areas : 
          (typeof listing.collection_areas === 'string' ? [listing.collection_areas] : []),
        isISO: listing.is_iso || false,
        category: listing.category || 'Other',
        phone_number: listing.phone_number || null
      };
      
      // Add to database
      const id = await addListing(dbListing);
      
      if (id) {
        if (verbose) {
          console.log(`Added listing with ID: ${id}`);
        }
        
        stats.added++;
        addedListings.push({
          ...dbListing,
          id,
          images: listing.images,
          mediaUrls: listing.imageUrls
        });
      } else {
        console.log(`Failed to add listing: ${listing.title}`);
        stats.skipped.total++;
        stats.skipped.dbErrors++;
      }
    } catch (error) {
      console.error(`Error adding listing: ${error.message}`);
      stats.skipped.total++;
      stats.skipped.dbErrors++;
    }
  }
  
  // Log summary statistics
  console.log("\n===== Database Insertion Statistics =====");
  console.log(`Total listings processed: ${stats.total}`);
  console.log(`Successfully added: ${stats.added}`);
  console.log(`Skipped: ${stats.skipped.total}`);
  console.log(`  - Already exists: ${stats.skipped.alreadyExists}`);
  console.log(`  - Invalid data: ${stats.skipped.invalidData}`);
  console.log(`  - Database errors: ${stats.skipped.dbErrors}`);
  
  return addedListings;
}

importWhatsAppListings();