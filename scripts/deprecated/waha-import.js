/**
 * WAHA Integration Script
 * 
 * This script integrates with WAHA (WhatsApp API) to fetch messages from WhatsApp groups,
 * then processes them and adds them to the database.
 * 
 * Advantages over the previous approach:
 * - No need to scan QR code every time (persistent session)
 * - No manual export step needed
 * - More reliable than browser automation
 * - Uses last import date to avoid re-importing deleted messages
 * 
 * Usage:
 * node scripts/import/waha-import.js [options]
 * 
 * Options:
 *   --verbose           Show detailed output
 *   --upload-images     Upload images to Supabase Storage
 *   --check-images      Check for missing images in Supabase Storage
 *   --days=<n>          Number of days of history to fetch (default: 30)
 *   --ignore-last-date  Ignore the last import date and use days parameter
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');

// Import utility modules
const { processListing } = require('../../src/utils/listingParser');
const { processListing: categorizeListing } = require('../../src/utils/categoryUtils');
const { listingExists, addListing } = require('../../src/utils/dbUtils');
const { getLastImportDate, updateLastImportDate } = require('../../src/utils/metadataUtils');

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
  checkMissingSupabaseImages
} = require('../image-handling/imageUtils');

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--upload-images', 'Upload images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--days <n>', 'Number of days of history to fetch', parseInt, 30)
  .option('--ignore-last-date', 'Ignore the last import date and use days parameter')
  .parse(process.argv);

const options = program.opts();

// WhatsApp group mapping (group name to WAHA chat ID)
// Get mapping from importUtils
const GROUP_MAPPING = WHATSAPP_GROUPS.reduce((map, group) => {
  if (group.chatId) {
    map[group.name] = group.chatId;
  }
  return map;
}, {});

/**
 * Main function to run the import process
 */
async function importWhatsAppListings() {
  try {
    console.log('Starting WAHA WhatsApp import process...');
    
    // Step 1: Check WAHA session status
    console.log('\nStep 1: Checking WAHA session status...');
    
    // First check if WAHA API is responding
    try {
      await axios.get(`${WAHA_BASE_URL}/sessions`);
      console.log('✅ WAHA API is running.');
    } catch (error) {
      throw new Error('Unable to connect to WAHA API. Make sure WAHA is running at ' + WAHA_BASE_URL);
    }
    
    // Now check session status
    const sessionStatus = await checkWahaSessionStatus();
    
    if (!sessionStatus.authenticated) {
      // If session exists but is not authenticated
      if (sessionStatus.exists) {
        console.log('⚠️ Session already exists but is not authenticated.');
        console.log('You may need to restart the WAHA Docker container with:');
        console.log('docker stop $(docker ps -q --filter "ancestor=devlikeapro/waha")');
        console.log('And then run this script again with the --update flag.');
        throw new Error('Session exists but is not authenticated');
      }
      
      // Try to start a new session
      console.log('Starting a new WAHA session...');
      try {
        const qrCode = await startWahaSession();
        
        if (qrCode) {
          console.log('Please scan this QR code with your WhatsApp app:');
          console.log(qrCode);
          console.log('\nWaiting for session authentication...');
          
          // Wait for session to be authenticated
          await waitForWahaAuthentication();
          console.log('✅ Session authenticated successfully!');
        } else {
          // No QR code but we were successful (rare case)
          console.log('✅ Session started successfully without QR code.');
        }
      } catch (error) {
        if (error.response && error.response.status === 422 && 
            error.response.data && error.response.data.message &&
            error.response.data.message.includes('already started')) {
          console.log('Session is already started. Trying to use existing session...');
          
          // Try to get the status again to see if we're authenticated
          const updatedStatus = await checkWahaSessionStatus();
          if (updatedStatus.authenticated) {
            console.log('✅ Using existing authenticated session.');
          } else {
            console.log('⚠️ Existing session is not authenticated.');
            console.log('Please restart the WAHA Docker container with:');
            console.log('docker stop $(docker ps -q --filter "ancestor=devlikeapro/waha")');
            console.log('And then run this script again.');
            throw new Error('Session exists but is not authenticated');
          }
        } else {
          console.error('Error starting session:', error.message);
          if (error.response && error.response.data) {
            console.error('Response data:', JSON.stringify(error.response.data));
          }
          throw new Error(`Failed to start session: ${error.message}`);
        }
      }
    } else {
      console.log('✅ WAHA session is already authenticated.');
    }
    
    // Step 2: Check if we have group IDs configured
    console.log('\nStep 2: Checking WhatsApp group IDs...');
    
    // Count how many groups have valid IDs
    const configuredGroups = Object.entries(GROUP_MAPPING).filter(([_, id]) => id).length;
    console.log(`Found ${configuredGroups} out of ${Object.keys(GROUP_MAPPING).length} configured groups`);
    
    if (configuredGroups === 0) {
      console.log('\n❌ No group IDs configured. You need to manually set the chat IDs in the GROUP_MAPPING object.');
      console.log('Since the free version of WAHA does not support the /api/chats endpoint for automatic discovery,');
      console.log('you need to know the chat IDs from another source or by looking at the WhatsApp Web network requests.');
      console.log('\nPlease update the WHATSAPP_GROUPS in importUtils.js with your chat IDs.');
      throw new Error('No group IDs configured');
    }
    
    // Step 3: Fetch messages from all groups
    console.log('\nStep 3: Fetching messages from WhatsApp groups...');
    const allListings = await fetchAllGroupMessages(options.days);
    console.log(`Found ${allListings.length} total listings`);
    
    // Step 4: Add new listings to the database
    console.log('\nStep 4: Adding new listings to the database...');
    const addedListings = await addNewListings(allListings, options.verbose);
    console.log(`Added ${addedListings.length} new listings to the database`);
    
    // Step 5: Process images
    console.log('\nStep 5: Processing images...');
    // TODO: Implement image download from WAHA
    console.log('Image processing not yet implemented for WAHA');
    
    // Step 6: Check for missing images
    if (options.checkImages) {
      console.log('\nStep 6: Checking for missing images in Supabase Storage...');
      // Use the utility function directly
      const missingImages = await checkForMissingImages(options.verbose);
      console.log(`Found ${missingImages.length} missing images`);
    }
    
    // Step 7: Update the last import date if we added any listings
    if (addedListings.length > 0) {
      console.log('\nStep 7: Updating last import date...');
      // Use the current date as the last import date
      const now = new Date();
      updateLastImportDate(now, { count: addedListings.length });
      console.log(`Updated last import date to ${now.toISOString()}`);
    } else {
      console.log('\nNo new listings added, last import date not updated.');
    }
    
    console.log('\n===== WhatsApp Import Process Complete =====');
    
  } catch (error) {
    console.error('Error in import process:', error);
    process.exit(1);
  }
}

/**
 * Check for missing images in Supabase Storage
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Array of missing images
 */
async function checkForMissingImages(verbose = false) {
  try {
    console.log('Checking for missing images in Supabase Storage...');
    
    // Get listings with images
    const supabase = getAdminClient();
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, whatsapp_group, images')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');
    
    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }
    
    console.log(`Found ${listings.length} listings with images`);
    
    // Find missing images
    const missingImages = [];
    let processed = 0;
    
    for (const listing of listings) {
      const missing = await checkMissingSupabaseImages(listing);
      missingImages.push(...missing);
      
      processed++;
      if (verbose && processed % 50 === 0) {
        console.log(`Processed ${processed}/${listings.length} listings`);
      }
    }
    
    return missingImages;
  } catch (error) {
    console.error('Error checking for missing images:', error);
    return [];
  }
}

/**
 * Discover WhatsApp chats and update the GROUP_MAPPING
 * 
 * Note: This function is not used in the free version of WAHA since the /api/chats
 * endpoint is not available. The GROUP_MAPPING needs to be configured manually in importUtils.js.
 */
async function discoverChats() {
  console.log('⚠️ Automatic chat discovery is not available in the free version of WAHA.');
  console.log('Using pre-configured group IDs from WHATSAPP_GROUPS in importUtils.js...');
  
  // Just for backward compatibility, we return without doing anything
  return;
}

/**
 * Fetch messages from all WhatsApp groups
 * 
 * @param {number} days - Number of days of history to fetch (used if no last import date)
 * @returns {Promise<Array>} - Array of all extracted listings
 */
async function fetchAllGroupMessages(days) {
  const allListings = [];
  
  // Determine the start date for fetching messages
  let startDate;
  let startTime;
  
  // Get the last import date from metadata
  const lastImportDate = getLastImportDate();
  
  if (lastImportDate && !options.ignoreLastDate) {
    // Use the last import date if available
    startDate = lastImportDate;
    startTime = Math.floor(startDate.getTime());
    console.log(`Using last import date: ${startDate.toISOString()}`);
  } else {
    // Fall back to using the days parameter
    const now = new Date();
    const daysInMilliseconds = days * 24 * 60 * 60 * 1000;
    startDate = new Date(now.getTime() - daysInMilliseconds);
    startTime = Math.floor(startDate.getTime());
    console.log(`Using ${days} days of history from ${startDate.toISOString()}`);
  }
  
  if (options.verbose) {
    console.log(`Filtering messages from ${startDate.toISOString()} onwards`);
    console.log(`Start time in ms: ${startTime}`);
  }
  
  // Iterate through each group
  for (const [groupName, chatId] of Object.entries(GROUP_MAPPING)) {
    if (!chatId) {
      console.log(`⚠️ Missing chat ID for group: ${groupName}. Skipping.`);
      continue;
    }
    
    console.log(`Processing group: ${groupName} (${chatId})...`);
    
    try {
      // Get messages for this chat - using the correct API format and increasing limit
      console.log(`Fetching messages from: ${WAHA_BASE_URL}/${WAHA_SESSION}/chats/${chatId}/messages?limit=100`);
      const response = await axios.get(
        `${WAHA_BASE_URL}/${WAHA_SESSION}/chats/${chatId}/messages?limit=100`
      );
      
      // Log the response structure to debug
      console.log(`API Response Status: ${response.status}`);
      console.log(`Response data type: ${typeof response.data}`);
      console.log(`Is array: ${Array.isArray(response.data)}`);
      if (response.data && typeof response.data === 'object') {
        console.log(`Response data keys: ${Object.keys(response.data)}`);
        // If data has a messages property that's an array, it might be wrapped
        if (response.data.messages && Array.isArray(response.data.messages)) {
          console.log(`Found messages array with ${response.data.messages.length} messages`);
          // Use the messages array instead of the whole response
          response.data = response.data.messages;
        }
      }
      
      if (!response.data || !Array.isArray(response.data)) {
        console.log(`⚠️ Unexpected response format for ${groupName}. Skipping.`);
        continue;
      }
      
      // Filter messages by date and not from the user
      const filteredMessages = response.data.filter(msg => {
        // Convert timestamp to date object
        const msgDate = new Date(msg.timestamp * 1000);
        
        // Check if message is after the start date
        const isAfterStartDate = msgDate.getTime() >= startTime;
        
        // Check if message is not from the user
        const isNotFromUser = !msg.fromMe;
        
        if (options.verbose) {
          console.log(`Message timestamp: ${msgDate.toISOString()}, after start date: ${isAfterStartDate}, not from user: ${isNotFromUser}`);
          console.log(`Sample message: ${msg.body ? msg.body.substring(0, 50) : 'No body'}`);
        }
        
        return isAfterStartDate && isNotFromUser;
      });
      
      console.log(`Found ${filteredMessages.length} messages within the last ${days} days`);
      
      if (filteredMessages.length > 0 && options.verbose) {
        const firstMsg = filteredMessages[0];
        const firstDate = new Date(firstMsg.timestamp * 1000);
        console.log(`First message timestamp: ${firstDate.toISOString()}`);
        console.log(`Sample message: ${firstMsg.body ? firstMsg.body.substring(0, 50) : 'No body'}`);
      }
      
      // Convert messages to listings
      const groupListings = filteredMessages.map(msg => {
        // Create a listing object
        const listing = {
          whatsappGroup: groupName,
          date: new Date(msg.timestamp * 1000).toISOString(),
          sender: msg.author || 'Unknown',
          text: msg.body || '',
          images: []
        };
        
        // Handle media
        if (msg.hasMedia && msg.mediaUrl) {
          listing.images.push(msg.mediaUrl);
        } else if (msg.media && msg.media.url) {
          listing.images.push(msg.media.url);
        }
        
        // First process to extract price, condition, collection areas, etc.
        const withDetails = processListing(listing);
        
        // Then categorize the listing
        return categorizeListing(withDetails);
      });
      
      allListings.push(...groupListings);
      
    } catch (error) {
      console.error(`Error fetching messages for ${groupName}:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        console.error(`API endpoint used: ${WAHA_BASE_URL}/${WAHA_SESSION}/chats/${chatId}/messages?limit=100`);
      } else if (error.request) {
        console.error('No response received from API. Check if WAHA is running properly.');
      } else {
        console.error('Error setting up the request:', error.message);
      }
      console.error('Try accessing this endpoint directly in your browser to debug:');
      console.error(`http://localhost:3001/api/${WAHA_SESSION}/chats/${chatId}/messages?limit=2`);
    }
  }
  
  return allListings;
}

/**
 * Add new listings to the database
 * 
 * @param {Array} listings - Array of listings to add
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Array of added listings
 */
async function addNewListings(listings, verbose) {
  const addedListings = [];
  
  for (const listing of listings) {
    try {
      // Check if the listing already exists
      const exists = await listingExists(listing);
      
      if (!exists) {
        // Add the listing to the database
        const addedListing = await addListing(listing);
        addedListings.push(addedListing);
        
        if (verbose) {
          console.log(`Added: ${listing.date} - ${listing.text.substring(0, 50)}...`);
        }
      } else if (verbose) {
        console.log(`Skipped (already exists): ${listing.date} - ${listing.text.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`Error adding listing: ${error.message}`);
    }
  }
  
  return addedListings;
}

// Create necessary data directories if they don't exist
function createDirectories() {
  const directories = [
    'src/data',
    'src/data/nifty-thrifty-0-1-years',
    'src/data/nifty-thrifty-1-3-years',
    'src/data/nifty-thrifty-modern-cloth-nappies',
    'src/data/nifty-thrifty-bumps-and-boobs',
    'src/data/nifty-thrifty-kids-3-8-years'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// Run the script
createDirectories();
importWhatsAppListings().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 