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
 * 
 * Usage:
 * node scripts/waha-import.js [options]
 * 
 * Options:
 *   --verbose           Show detailed output
 *   --upload-images     Upload images to Supabase Storage
 *   --check-images      Check for missing images in Supabase Storage
 *   --days=<n>          Number of days of history to fetch (default: 30)
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');
const { createClient } = require('@supabase/supabase-js');

// Import utility modules
const { processListing } = require('../src/utils/listingParser');
const { processListing: categorizeListing } = require('../src/utils/categoryUtils');
const { listingExists, addListing } = require('../src/utils/dbUtils');
const { 
  WHATSAPP_GROUPS, 
  uploadImagesToSupabase, 
  checkMissingImages 
} = require('../src/utils/imageHandler');

// WAHA API Configuration
const WAHA_BASE_URL = 'http://localhost:3001/api'; // Your WAHA API URL
const WAHA_SESSION = 'default'; // Default session name

// Parse command line arguments
program
  .option('-v, --verbose', 'Show detailed output')
  .option('--upload-images', 'Upload images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--days <n>', 'Number of days of history to fetch', parseInt, 30)
  .parse(process.argv);

const options = program.opts();

// WhatsApp group mapping (group name to WAHA chat ID)
// You'll need to manually set these chat IDs since automatic discovery 
// is not available in the free version of WAHA
const GROUP_MAPPING = {
  'Nifty Thrifty Modern Cloth Nappies': '120363139582792913@g.us',
  'Nifty Thrifty 0-1 year (2)': '120363190438741302@g.us',
  'Nifty Thrifty Bumps & Boobs': '120363068687931519@g.us',
  'Nifty Thrifty 0-1 year (1)': '27787894429-1623257234@g.us',
  'Nifty Thrifty 1-3 years': '120363172946506359@g.us',
  'Nifty Thrifty Kids (3-8 years) 2': '120363315487735378@g.us'
};

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
    const sessionStatus = await checkSessionStatus();
    
    if (!sessionStatus.authenticated) {
      // If session exists but is not authenticated
      if (sessionStatus.exists) {
        console.log('⚠️ Session already exists but is not authenticated.');
        console.log('You may need to restart the WAHA Docker container with:');
        console.log('docker stop $(docker ps -q --filter "ancestor=devlikeapro/waha")');
        console.log('And then run this script again, or use the --restart-waha flag with the update script.');
        throw new Error('Session exists but is not authenticated. Try restarting WAHA container.');
      }
      
      console.log('⚠️ WAHA session is not authenticated. Please authenticate:');
      
      try {
        const qrCode = await startSession();
        if (qrCode) {
          console.log('Please scan this QR code with your WhatsApp app:');
          console.log(qrCode);
          console.log('\nWaiting for session authentication...');
          
          // Wait for session to be authenticated
          await waitForAuthentication();
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
          const updatedStatus = await checkSessionStatus();
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
      console.log('\nPlease update the GROUP_MAPPING in waha-import.js with your chat IDs.');
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
      const missingImages = await checkMissingImages({ verbose: options.verbose });
      console.log(`Found ${missingImages.length} missing images`);
    }
    
    console.log('\n===== WhatsApp Import Process Complete =====');
    
  } catch (error) {
    console.error('Error in import process:', error);
    process.exit(1);
  }
}

/**
 * Check the status of the WAHA session
 */
async function checkSessionStatus() {
  try {
    const response = await axios.get(`${WAHA_BASE_URL}/sessions/${WAHA_SESSION}`);
    // Check if session is working and connected
    if (response.data && response.data.status === 'WORKING' && 
        response.data.engine && response.data.engine.state === 'CONNECTED') {
      return { authenticated: true, exists: true };
    } else {
      return { 
        authenticated: false, 
        exists: true,
        message: 'Session exists but is not authenticated'
      };
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Session doesn't exist
      return { authenticated: false, exists: false };
    } else if (error.response && error.response.status === 422) {
      // Session exists but might not be authenticated
      return { 
        authenticated: false, 
        exists: true,
        message: error.response.data.message || 'Session exists but status unknown'
      };
    }
    throw error;
  }
}

/**
 * Start a new WAHA session
 */
async function startSession() {
  try {
    // First check if session already exists
    const status = await checkSessionStatus();
    if (status.exists) {
      console.log('Session already exists. Checking authentication status...');
      
      if (status.authenticated) {
        console.log('✅ Session is already authenticated.');
        return null; // No QR needed
      } else {
        throw new Error('Session exists but is not authenticated. You may need to restart WAHA.');
      }
    }
    
    // Start a new session
    const response = await axios.post(`${WAHA_BASE_URL}/sessions/start`, {
      name: WAHA_SESSION
    });
    if (response.data && response.data.qr) {
      return response.data.qr;
    } else {
      console.log('No QR code returned, but session may have started.');
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 422 && 
        error.response.data && error.response.data.message) {
      // Session already exists or other error
      console.log(`Server response: ${error.response.data.message}`);
      
      if (error.response.data.message.includes('already started')) {
        console.log('Session already exists. Checking authentication status...');
        
        // Check if the session is authenticated
        const sessionStatus = await checkSessionStatus();
        if (sessionStatus.authenticated) {
          console.log('✅ Session is authenticated and ready to use.');
          return null; // Already authenticated, no QR needed
        } else {
          throw new Error('Session exists but is not authenticated. You may need to restart WAHA.');
        }
      } else {
        throw new Error(`WAHA error: ${error.response.data.message}`);
      }
    }
  }
}

/**
 * Wait for the WAHA session to be authenticated
 */
async function waitForAuthentication() {
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkSessionStatus();
    if (status.authenticated) {
      return true;
    }
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write('.');
  }
  throw new Error('Authentication timeout. Please try again.');
}

/**
 * Discover WhatsApp chats and update the GROUP_MAPPING
 * 
 * Note: This function is not used in the free version of WAHA since the /api/chats
 * endpoint is not available. The GROUP_MAPPING needs to be configured manually.
 */
async function discoverChats() {
  console.log('⚠️ Automatic chat discovery is not available in the free version of WAHA.');
  console.log('Using pre-configured group IDs from GROUP_MAPPING...');
  
  // Just for backward compatibility, we return without doing anything
  return;
}

/**
 * Fetch messages from all WhatsApp groups
 * 
 * @param {number} days - Number of days of history to fetch
 * @returns {Promise<Array>} - Array of all extracted listings
 */
async function fetchAllGroupMessages(days) {
  const allListings = [];
  const now = new Date();
  const daysInMilliseconds = days * 24 * 60 * 60 * 1000;
  const startDate = new Date(now.getTime() - daysInMilliseconds);
  const startTime = Math.floor(startDate.getTime());
  
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
        console.log(`⚠️ No valid data returned for group: ${groupName}. Received:`, response.data);
        continue;
      }
      
      const messages = response.data.filter(msg => {
        // Ensure timestamp is in milliseconds for comparison
        const msgTime = typeof msg.timestamp === 'number' ? 
          (msg.timestamp > 9999999999 ? msg.timestamp : msg.timestamp * 1000) : 0;
        
        const isWithinTimeWindow = msgTime >= startTime;
        const isNotFromMe = !msg.fromMe;
        
        if (options.verbose && msg.timestamp) {
          const msgDate = new Date(msgTime);
          console.log(`Message timestamp: ${msg.timestamp} -> ${msgTime} (${msgDate.toISOString()})`);
          console.log(`Start time: ${startTime} (${startDate.toISOString()})`);
          console.log(`Is within time window: ${isWithinTimeWindow}`);
          console.log(`Is not from me: ${isNotFromMe}`);
          console.log(`Message body: ${msg.body ? msg.body.substring(0, 30) : 'No body'}`);
          console.log('---');
        }
        
        return isWithinTimeWindow && isNotFromMe;
      });
      
      console.log(`Found ${messages.length} messages in the last ${days} days`);
      
      if (messages.length > 0) {
        console.log(`First message timestamp: ${new Date(messages[0].timestamp).toISOString()}`);
        console.log(`Sample message body: ${messages[0].body ? messages[0].body.substring(0, 50) : 'No body'}`);
      }
      
      // Convert messages to listings
      const groupListings = messages.map(msg => {
        // Ensure timestamp is in milliseconds
        const msgTime = typeof msg.timestamp === 'number' ? 
          (msg.timestamp > 9999999999 ? msg.timestamp : msg.timestamp * 1000) : 0;
          
        // Create a proper date object
        const messageDate = new Date(msgTime);
        
        // Basic listing structure
        const listing = {
          whatsappGroup: groupName,
          date: messageDate.toISOString(), // Use the correctly formatted timestamp
          sender: msg.author || msg.from,
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