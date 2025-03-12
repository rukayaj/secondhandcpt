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
 *   --skip-images       Skip processing and uploading images to Supabase Storage
 *   --check-images      Check for missing images in Supabase Storage
 *   --days=<n>          Number of days of history to fetch (default: 30)
 *   --limit=<n>         Limit number of messages per group
 *   --ignore-last-date  Ignore the last import date and use days parameter
 *   --skip-sync         Skip synchronization of expired listings
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import utility modules
const { getLastImportDate, updateLastImportDate } = require('../../src/utils/metadataUtils');
const { listingExists, addListing, getLatestMessageTimestampsByGroup, deleteExpiredListings } = require('../../src/utils/dbUtils');
const { extractPhoneNumber } = require('../../src/utils/listingParser');

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
  .option('--skip-images', 'Skip processing and uploading images to Supabase Storage')
  .option('--check-images', 'Check for missing images in Supabase Storage')
  .option('--days <n>', 'Number of days of history to fetch', parseInt, 30)
  .option('--limit <n>', 'Limit number of messages per group', parseInt)
  .option('--ignore-last-date', 'Ignore the last import date and use days parameter')
  .option('--skip-sync', 'Skip synchronization of expired listings')
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
 * Group related messages by sender and message context
 * This helps identify when multiple messages belong to the same conversation thread
 * 
 * @param {Array} messages - All fetched messages
 * @param {number} timeThresholdHours - Time window in hours to consider messages from the same user as potentially related (default: 72 = 3 days)
 * @returns {Array} - Array of user message groups, each containing all messages from a single user within the timeframe
 */
async function groupRelatedMessages(messages, timeThresholdHours = 72) {
  // First, group all messages by sender and whatsapp group
  const senderGroups = {};
  
  messages.forEach(message => {
    // Get the proper sender ID from the message author field if available
    // This is critical because the author field contains the actual phone number
    let sender = message.sender || 'unknown';
    
    // Extract from _data.author field if available, which is more reliable than the top-level sender field
    if (message._data && message._data.author && message._data.author._serialized) {
      sender = message._data.author._serialized;
      // Also set it on the message object for future reference
      message.sender = sender;
    }
    
    const key = `${sender}_${message.whatsappGroup}`;
    if (!senderGroups[key]) {
      senderGroups[key] = [];
    }
    senderGroups[key].push(message);
  });
  
  // Sort each sender's messages by timestamp
  Object.keys(senderGroups).forEach(key => {
    senderGroups[key].sort((a, b) => a.timestamp - b.timestamp);
  });
  
  // Process each sender's messages to identify reply chains and related messages
  const userMessageGroups = [];
  Object.values(senderGroups).forEach(senderMessages => {
    if (senderMessages.length === 0) return;
    
    // Extract quoted message info when available
    senderMessages.forEach(message => {
      // Add a property to track if this message is a reply to another message
      message.isReply = Boolean(message.quotedMsg);
      message.quotedMsgId = message.quotedMsg?.id;
      
      // Check if message contains an "x" or "sold" marker
      message.containsSoldMarker = 
        (message.body?.toLowerCase().trim() === 'x') || 
        (message.body?.toLowerCase().includes('sold')) ||
        (message.body?.toLowerCase().includes(' x ')) ||
        (message.body?.toLowerCase().endsWith(' x'));
    });
    
    // Add this sender's message group to the result
    userMessageGroups.push(senderMessages);
  });
  
  console.log(`Grouped messages into ${userMessageGroups.length} user message groups`);
  return userMessageGroups;
}

/**
 * Process message groups with Gemini API to extract structured listing data
 * @param {Array} userMessageGroups - Array of user message groups from groupRelatedMessages
 * @param {Object} options - Additional options for processing
 * @returns {Promise<Array>} - Array of processed listings
 */
async function processGroupsWithGemini(userMessageGroups, options = {}) {
  const results = [];
  const batchSize = 3; // Process only 3 user groups at a time to avoid rate limiting
  
  console.log(`Processing ${userMessageGroups.length} user message groups...`);
  
  for (let i = 0; i < userMessageGroups.length; i += batchSize) {
    const batch = userMessageGroups.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(userMessageGroups.length/batchSize)}...`);
    
    for (const userMessages of batch) {
      if (userMessages.length === 0) continue;
      
      // Process all messages from this user as a group
      const extractedListings = await processUserMessageGroup(userMessages);
      
      if (extractedListings && extractedListings.length > 0) {
        results.push(...extractedListings);
      }
      
      // Increase delay between user groups to 5 seconds
      console.log('Waiting 5 seconds before processing next user group...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Add a longer delay between batches to avoid rate limiting (15 seconds)
    if (i + batchSize < userMessageGroups.length) {
      console.log(`Waiting 15 seconds before processing next batch...`);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
  
  return results.filter(item => item);
}

/**
 * Process all messages from a single user to extract listings
 * @param {Array} userMessages - All messages from a single user
 * @returns {Promise<Array>} - Array of listings extracted from the user's messages
 */
async function processUserMessageGroup(userMessages) {
  const sender = userMessages[0].sender;
  const whatsappGroup = userMessages[0].whatsappGroup;
  
  console.log(`Processing ${userMessages.length} messages from ${sender} in ${whatsappGroup}`);
  
  // Join message bodies with clear separators for context
  const messagesText = userMessages.map((msg, i) => {
    // Convert Unix timestamp to readable date
    const dateStr = new Date(msg.timestamp * 1000).toLocaleString();
    
    // Add information about replies
    let replyInfo = '';
    if (msg.isReply) {
      replyInfo = ' (REPLY TO PREVIOUS MESSAGE)';
    }
    
    // Add sold marker info
    let soldInfo = '';
    if (msg.containsSoldMarker) {
      soldInfo = ' (MARKED AS SOLD)';
    }
    
    return `Message ${i+1} (${dateStr})${replyInfo}${soldInfo}:\n${msg.body}`;
  }).join('\n\n---\n\n');
  
  // Collect all media URLs from all messages
  const imageUrls = userMessages
    .map(msg => [msg.mediaUrl, msg.quotedMsg?.mediaUrl])
    .flat()
    .filter(url => url);
  
  // Create a synthetic message object containing all user messages
  const combinedMessageData = {
    body: messagesText,
    sender,
    whatsappGroup,
    mediaUrl: userMessages.find(msg => msg.mediaUrl)?.mediaUrl,
    imageUrls,
    isMultiUserMessage: true,
    messageCount: userMessages.length
  };
  
  // Process the combined user messages with Gemini
  const extractedData = await extractListingsWithGemini(combinedMessageData);
  
  if (!extractedData || !Array.isArray(extractedData)) {
    console.log(`No valid listings extracted from messages by ${sender}`);
    return [];
  }
  
  // Process each extracted listing
  const processedListings = [];
  
  for (let i = 0; i < extractedData.length; i++) {
    const extractedListing = extractedData[i];
    
    // Skip invalid listings
    if (!extractedListing || extractedListing.type === 'CONVERSATION') {
      continue;
    }
    
    // Find the most likely message that this listing came from
    // This is a heuristic based on matching content
    const relatedMessage = findRelatedMessage(extractedListing, userMessages);
    
    // Add metadata to the listing
    extractedListing.messageId = relatedMessage?.id || userMessages[0].id;
    extractedListing.timestamp = relatedMessage?.timestamp || userMessages[0].timestamp;
    extractedListing.date = new Date((relatedMessage?.timestamp || userMessages[0].timestamp) * 1000);
    extractedListing.sender = sender;
    extractedListing.whatsappGroup = whatsappGroup;
    
    // Handle images
    if (relatedMessage?.mediaUrl) {
      extractedListing.imageUrls = [relatedMessage.mediaUrl];
    } else {
      extractedListing.imageUrls = imageUrls;
    }
    extractedListing.hasImages = extractedListing.imageUrls.length > 0;
    
    // Add the raw message text
    extractedListing.rawText = relatedMessage?.body || combinedMessageData.body;
    
    // Add multi-message metadata
    extractedListing.isMultiUserMessage = true;
    extractedListing.messageCount = userMessages.length;
    
    // Handle sold status
    if (extractedListing.is_sold) {
      // Find the message that marked this item as sold, if any
      const soldMessage = userMessages.find(msg => 
        msg.containsSoldMarker
      );
      
      if (soldMessage) {
        extractedListing.soldTimestamp = soldMessage.timestamp;
        extractedListing.soldDate = new Date(soldMessage.timestamp * 1000);
      }
    }
    
    processedListings.push(extractedListing);
  }
  
  return processedListings;
}

/**
 * Find the most relevant message that a listing came from
 * @param {Object} listing - Extracted listing data
 * @param {Array} messages - Array of messages to search
 * @returns {Object} - The most relevant message
 */
function findRelatedMessage(listing, messages) {
  if (!listing || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }
  
  // If there's only one message, return it
  if (messages.length === 1) {
    return messages[0];
  }
  
  // Try to find a message that contains the listing title
  if (listing.title) {
    const matchByTitle = messages.find(msg => 
      msg.body && msg.body.toLowerCase().includes(listing.title.toLowerCase())
    );
    
    if (matchByTitle) {
      return matchByTitle;
    }
  }
  
  // Try to find a message that contains the price
  if (listing.price) {
    const priceStr = listing.price.toString();
    const matchByPrice = messages.find(msg => 
      msg.body && msg.body.includes(priceStr)
    );
    
    if (matchByPrice) {
      return matchByPrice;
    }
  }
  
  // If no specific match found, return the first message with media if available
  const messageWithMedia = messages.find(msg => msg.mediaUrl);
  if (messageWithMedia) {
    return messageWithMedia;
  }
  
  // Default to the first message
  return messages[0];
}

/**
 * Extract multiple listings from user messages using Gemini API
 * @param {Object} messageData - Combined message data to process
 * @returns {Promise<Array|null>} - Array of extracted listings or null
 */
async function extractListingsWithGemini(messageData) {
  if (!messageData.body || messageData.body.trim() === '') {
    console.debug('Skipping message with no text content');
    return null;
  }

  const isMultiMessage = messageData.body.includes('Message 1 (') && messageData.body.includes('---');

  try {
    // Use gemini-1.5-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create the prompt for multi-user message analysis
    const prompt = `
I'll provide a sequence of WhatsApp messages from the same user in a buy/sell group. These messages may contain:
1. Multiple separate product listings
2. Updates to previous listings (price changes, additional info)
3. Messages marking items as sold (often just an "x" or "sold" comment)
4. Replies to previous messages with additional details

Please analyze all messages together and extract ALL product listings, returning them as an ARRAY of listings.
A single user might be selling multiple items at once through separate messages.

IMPORTANT RULES:
- Return an ARRAY of listings, even if there's just one listing.
- For each listing, if you see "x" or "sold" in a follow-up message related to that item, set is_sold to true and include the timestamp.
- If you see price updates like "Reduced to R100", use the latest price.
- If a message is marked as a REPLY TO PREVIOUS MESSAGE, consider it as additional info for the previous listing.
- If a message is explicitly marked as MARKED AS SOLD, consider the item sold.
- If a post is asking for an item (e.g. "ISO: looking for a car seat"), set is_iso to true.
- If there are no valid product listings at all, return an empty array [].
- A valid listing must at minimum have a title and indicate if it's for sale or ISO.

IMPORTANT CATEGORIZATION GUIDELINES:
1. Users often are selling books in the "Sense" series (Baby Sense, Weaning Sense, Feeding Sense, Toddler Sense, Sleep Sense, etc.) should always be categorized as "Books"
2. Distinguish between regular "Clothing" and "Maternity Clothing" based on context
3. Footwear (shoes, sandals, boots, etc.) should be categorized as "Footwear" not "Clothing"
4. "Gear" includes strollers, car seats, carriers, high chairs, playpens, etc.
5. "Feeding" includes bottles, breast pumps, sterilizers, baby food makers, etc.
6. "Bath" includes tubs, towels, bath toys, bath safety items, etc.
7. Default to "Uncategorised" only when no other category clearly applies

User's WhatsApp Messages:
${messageData.body}

Media: ${messageData.imageUrls?.length > 0 ? 'Yes' : 'No'}
Group: ${messageData.whatsappGroup || 'Unknown'}

Return an ARRAY of listings, where each listing has these fields:
{
  "title": "Brief product title",
  "price": "Price with currency symbol (R100, R50, etc.) or 'Free' if item is being given away",
  "condition": "New, Used, etc.",
  "collection_areas": "Where to collect (as a string or array of strings)",
  "description": "Full description",
  "is_free": boolean,
  "is_iso": boolean (true if this is an 'In Search Of' post, not a sales listing),
  "is_sold": boolean (true if the item has been marked as sold/taken),
  "size": "Size if mentioned",
  "category": "Category of item from the following list: Clothing, Maternity Clothing, Footwear, Toys, Furniture, Books, Feeding, Bath, Safety, Bedding, Diapering, Health, Swimming, Gear, Accessories, Uncategorised"
}

EXAMPLES:

Example 1 (Multiple items in separate messages):
Message 1 (7/15/2023, 10:30:45 AM):
Baby walker, good condition, R200. Collection from Rondebosch.

---

Message 2 (7/15/2023, 2:45:20 PM):
Selling my toddler's bike for R350. 3-5 years. Used but in excellent condition. Collection from Rondebosch.

---

Message 3 (7/16/2023, 9:12:33 AM) (REPLY TO PREVIOUS MESSAGE):
The bike has training wheels included.

OUTPUT:
[
  {
    "title": "Baby walker",
    "price": "R200",
    "condition": "Good condition",
    "collection_areas": "Rondebosch",
    "description": "Baby walker, good condition",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "size": null,
    "category": "Baby Essentials"
  },
  {
    "title": "Toddler bike",
    "price": "R350",
    "condition": "Used - Excellent condition",
    "collection_areas": "Rondebosch",
    "description": "Toddler's bike for 3-5 years with training wheels included",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "size": "3-5 years",
    "category": "Toys"
  }
]

Example 2 (Price update and sold marker):
Message 1 (7/15/2023, 10:30:45 AM):
H&M maternity jeans, size Large, excellent condition, R200. Collection from Kirstenhof.

---

Message 2 (7/15/2023, 4:32:15 PM):
Reduced to R150

---

Message 3 (7/16/2023, 8:45:20 AM) (MARKED AS SOLD):
x

OUTPUT:
[
  {
    "title": "H&M maternity jeans",
    "price": "R150",
    "condition": "Excellent condition",
    "collection_areas": "Kirstenhof",
    "description": "H&M maternity jeans, size Large, excellent condition, originally R200, reduced to R150",
    "is_free": false,
    "is_iso": false,
    "is_sold": true,
    "size": "Large",
    "category": "Clothing"
  }
]

Example 3 (Mixed ISO and selling items):
Message 1 (7/15/2023, 10:30:45 AM):
ISO: Baby cot for newborn, willing to collect anywhere in Southern Suburbs

---

Message 2 (7/15/2023, 2:45:20 PM):
Selling my toddler's clothes bundle. 5 items, size 2-3 years, mix of Woolworths, Cotton On and H&M. R250 for all. Collection from Kenilworth.

OUTPUT:
[
  {
    "title": "Looking for Baby cot for newborn",
    "price": null,
    "condition": null,
    "collection_areas": "Southern Suburbs",
    "description": "ISO: Baby cot for newborn, willing to collect anywhere in Southern Suburbs",
    "is_free": false,
    "is_iso": true,
    "is_sold": false,
    "size": "Newborn",
    "category": "Furniture"
  },
  {
    "title": "Toddler's clothes bundle",
    "price": "R250",
    "condition": "Used",
    "collection_areas": "Kenilworth",
    "description": "Toddler's clothes bundle. 5 items, size 2-3 years, mix of Woolworths, Cotton On and H&M.",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "size": "2-3 years",
    "category": "Clothing"
  }
]
`;

    // Set temperature higher to allow for more flexibility
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000, // Increase token limit for multiple listings
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
      // Attempt to parse as an array of listings
      const jsonResponse = JSON.parse(jsonStr);
      
      if (!Array.isArray(jsonResponse)) {
        // If not an array, wrap in an array if it's a valid object
        if (jsonResponse && typeof jsonResponse === 'object') {
          console.log(`Received a single listing object instead of an array, converting to array`);
          return [jsonResponse];
        } else if (jsonResponse === null) {
          console.log(`Message identified as not containing any product listings`);
          return [];
        } else {
          console.error(`Invalid response format (not an array or object):`, jsonResponse);
          return [];
        }
      }
      
      console.log(`Extracted ${jsonResponse.length} listings from user messages`);
      
      // Filter out any null entries
      const validListings = jsonResponse.filter(listing => listing !== null);
      
      if (validListings.length === 0) {
        console.log(`No valid listings found in the extracted data`);
        return [];
      }
      
      return validListings;
    } catch (parseError) {
      console.error(`Error parsing JSON response: ${parseError.message}`);
      console.debug(`Response was: ${jsonStr}`);
      return [];
    }
  } catch (error) {
    console.error(`Error with Gemini API: ${error.message}`);
    return [];
  }
}

/**
 * Find the oldest message still available in a WhatsApp group
 * @param {string} chatId - The chat ID of the WhatsApp group
 * @returns {Promise<number|null>} - Unix timestamp in seconds of the oldest message, or null if error
 */
async function findOldestMessageTimestamp(chatId) {
  try {
    console.log(`Finding oldest message for chat ID: ${chatId}...`);
    
    // Get the oldest messages from the group (using sort=asc and limit=1)
    const response = await axios.get(`${WAHA_BASE_URL}/api/messages`, {
      params: {
        session: 'default',
        chatId: chatId,
        limit: 1,
        fromMe: false,
        sort: 'asc' // Sort ascending to get the oldest message first
      }
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const oldestMessage = response.data[0];
      console.log(`Oldest message found from ${new Date(oldestMessage.timestamp * 1000).toISOString()}`);
      return oldestMessage.timestamp;
    } else {
      console.warn(`No messages found for chat ID: ${chatId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error finding oldest message: ${error.message}`);
    return null;
  }
}

/**
 * Sync listings by removing ones whose WhatsApp messages have expired
 * @param {Object} options - Options for the sync process
 * @returns {Promise<Object>} - Statistics on the sync process
 */
async function syncExpiredListings(options = {}) {
  const stats = {
    groupsProcessed: 0,
    totalListingsDeleted: 0,
    totalImagesRemoved: 0,
    errors: 0
  };
  
  console.log('Syncing expired listings...');
  
  for (const group of WHATSAPP_GROUPS) {
    if (!group.chatId) {
      console.log(`Skipping group "${group.name}" - no chat ID configured`);
      continue;
    }
    
    try {
      // Find the oldest message timestamp for this group
      const oldestTimestamp = await findOldestMessageTimestamp(group.chatId);
      
      if (!oldestTimestamp) {
        console.log(`Could not determine oldest message for "${group.name}", skipping sync`);
        continue;
      }
      
      // Delete listings older than the oldest message
      const { deleted, imagesRemoved, error, expiredListings } = await deleteExpiredListings(group.name, oldestTimestamp);
      
      if (error) {
        console.error(`Error syncing expired listings for "${group.name}": ${error.message}`);
        stats.errors++;
      } else {
        if (options.verbose && deleted > 0 && expiredListings) {
          console.log(`Deleted ${deleted} expired listings and ${imagesRemoved || 0} images from "${group.name}":`);
          expiredListings.forEach(listing => {
            console.log(`- "${listing.title}" (${listing.date})`);
          });
        } else {
          console.log(`Deleted ${deleted} expired listings and ${imagesRemoved || 0} images from "${group.name}"`);
        }
        
        stats.totalListingsDeleted += deleted;
        stats.totalImagesRemoved += (imagesRemoved || 0);
      }
      
      stats.groupsProcessed++;
    } catch (error) {
      console.error(`Error processing group "${group.name}" for sync: ${error.message}`);
      stats.errors++;
    }
  }
  
  console.log('Sync complete:');
  console.log(`- Groups processed: ${stats.groupsProcessed}`);
  console.log(`- Total listings deleted: ${stats.totalListingsDeleted}`);
  console.log(`- Total images removed: ${stats.totalImagesRemoved}`);
  console.log(`- Errors: ${stats.errors}`);
  
  return stats;
}

/**
 * Main function to import WhatsApp listings
 * This function orchestrates the entire import process
 */
async function importWhatsAppListings() {
  try {
    console.log('Starting WAHA-Gemini WhatsApp import and sync process...\n');
    
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
    
    // NEW STEP: Sync listings by removing expired ones
    if (!options.skipSync) {
      console.log('\nStep 2.1: Syncing listings by removing expired ones...');
      await syncExpiredListings(options);
    } else {
      console.log('\nSkipping listing sync (--skip-sync flag was used)');
    }
    
    // Step 2.5: Get latest message timestamps from database
    console.log('\nStep 2.5: Getting latest message timestamps from database...');
    const latestTimestamps = await getLatestMessageTimestampsByGroup();
    
    const groupsWithTimestamps = Object.keys(latestTimestamps).length;
    console.log(`Found timestamps for ${groupsWithTimestamps} groups in database`);
    
    // Step 3: Fetch messages from all groups
    console.log('\nStep 3: Fetching messages from WhatsApp groups...');
    const allMessages = await fetchAllGroupMessages(options.days, latestTimestamps, options);
    if (allMessages.length === 0) {
      console.log('No messages found or unable to fetch messages');
      return;
    }
    
    // Step 3.5: Group related messages
    console.log('\nStep 3.5: Grouping related messages...');
    const messageGroups = await groupRelatedMessages(allMessages, 72); // 72-hour window
    console.log(`Grouped ${allMessages.length} messages into ${messageGroups.length} message groups`);
    
    // Step 4: Process message groups with Gemini
    console.log('\nStep 4: Processing message groups with Gemini API...');
    const processedListings = await processGroupsWithGemini(messageGroups, options);
    
    if (processedListings.length === 0) {
      console.log('No listings extracted from messages');
      return;
    }
    
    console.log(`Extracted ${processedListings.length} listings from ${allMessages.length} messages`);
    
    // Step 5: Process images if listings have images (always do this unless explicitly disabled)
    let listings = processedListings;
    const skipImageProcessing = options.skipImages === true;
    
    if (skipImageProcessing) {
      console.log('\nSkipping image processing (--skip-images flag was used)');
    } else {
      console.log('\nStep 5: Processing and uploading images...');
      listings = await processImages(processedListings, options.verbose);
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
async function fetchAllGroupMessages(days, latestTimestamps = {}, options = {}) {
  const allMessages = [];
  
  // Set a fallback date based on days parameter
  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() - days);
  const fallbackTimestamp = Math.floor(fallbackDate.getTime() / 1000); // Convert to seconds for WAHA
  
  console.log(`Using fallback date range: Last ${days} days (from ${fallbackDate.toISOString()})`);
  console.log(`Fallback Unix timestamp: ${fallbackTimestamp}`);
  
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
      
      // Use group-specific timestamp if available, otherwise use fallback
      let fromTimestamp = fallbackTimestamp;
      
      if (latestTimestamps[group.name]) {
        // Convert database timestamp to Unix timestamp and subtract 1 hour buffer
        // The buffer ensures we don't miss any messages due to timezone or slight time differences
        const dbDate = new Date(latestTimestamps[group.name]);
        const bufferMs = 60 * 60 * 1000; // 1 hour in milliseconds
        const timestampWithBuffer = Math.floor((dbDate.getTime() - bufferMs) / 1000);
        
        // Use the more recent timestamp between the fallback and the database timestamp
        fromTimestamp = Math.max(fallbackTimestamp, timestampWithBuffer);
        
        console.log(`Using last message timestamp for "${group.name}": ${new Date(fromTimestamp * 1000).toISOString()}`);
      } else {
        console.log(`No previous messages found for "${group.name}", using fallback date`);
      }
      
      // Make the API call to get messages
      const response = await axios.get(`${WAHA_BASE_URL}/api/messages`, {
        params: {
          session: 'default',
          chatId: group.chatId,
          limit: apiLimit,
          fromMe: false,
          fromTimestamp: fromTimestamp
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
        
        console.log(`Found ${processedMessages.length} messages in "${group.name}" since ${new Date(fromTimestamp * 1000).toISOString()}`);
        
        if (processedMessages.length > 0) {
          // Sample message for debugging
          console.log(`Sample message from ${group.name}:`, JSON.stringify(processedMessages[0], null, 2));
          allMessages.push(...processedMessages);
        }
      } else {
        console.warn(`No valid message data returned for group "${group.name}"`);
      }
    } catch (error) {
      console.error(`Error fetching messages for group "${group.name}":`, error.message);
    }
  }
  
  console.log(`Found ${allMessages.length} total messages`);
  return allMessages;
}

/**
 * Process images from listings
 * @param {Array} listings - Processed listings with image data
 * @param {boolean} verbose - Whether to show detailed output
 * @returns {Promise<Array>} - Updated listings with image paths
 */
async function processImages(listings, verbose = false) {
  console.log(`Processing images for ${listings.length} listings...`);
  
  // Create a copy of the listings to avoid modifying the original
  const updatedListings = [...listings];
  
  let listingsWithImages = 0;
  let processedImageCount = 0;
  let successCount = 0;
  let errorCount = 0;
  
  // Create a directory for storing temporary images
  const tmpDir = path.join(process.cwd(), 'tmp', 'waha-images');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  for (let j = 0; j < updatedListings.length; j++) {
    const listing = updatedListings[j];
    
    // Check for images from WAHA message
    const imageUrls = listing.imageUrls || [];
    
    if (imageUrls.length === 0) {
      if (verbose) {
        console.log(`No images found for listing: ${listing.title || 'Untitled'}`);
      }
      continue;
    }
    
    listingsWithImages++;
    const supabaseImagePaths = [];
    
    // Process each image
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      if (!imageUrl) continue;
      
      processedImageCount++;
      
      if (verbose) {
        console.log(`Processing image ${i + 1}/${imageUrls.length} for listing: ${listing.title || 'Untitled'}`);
      }
      
      try {
        // Generate a unique ID for the image
        const imageId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        // Download the image from WAHA
        const localPath = path.join(tmpDir, `image_${imageId}.jpg`);
        await downloadImageFromWaha(imageUrl, localPath);
        
        // Create a structured path for the image within the listings folder
        // Use format: listings/groupName_messageId_index_uniqueId.jpg
        // This is more manageable and consistent than the previous approach
        const groupNameForPath = listing.whatsappGroup.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        const imagePath = `listings/${groupNameForPath}_${listing.messageId || j}_${i}_${imageId}.jpg`;
        
        // Upload with direct path to avoid nesting issues
        await uploadImageToSupabase(localPath, imagePath, true);
        
        // Add the image path to the listing's images
        supabaseImagePaths.push(imagePath);
        
        // Delete the temporary file
        fs.unlinkSync(localPath);
        
        successCount++;
      } catch (error) {
        console.error(`Error processing image: ${error.message}`);
        errorCount++;
      }
    }
    
    // Update the listing's images with the Supabase Storage paths
    if (supabaseImagePaths.length > 0) {
      updatedListings[j].images = supabaseImagePaths;
    }
  }
  
  console.log(`Finished processing images:`);
  console.log(`- ${listingsWithImages} listings had images`);
  console.log(`- ${processedImageCount} total images processed`);
  console.log(`- ${successCount} successful uploads`);
  console.log(`- ${errorCount} errors`);
  
  return updatedListings;
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
    soldItems: 0,
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
      if (listing.price) console.log(`Price: ${listing.price}`);
      if (listing.condition) console.log(`Condition: ${listing.condition}`);
      if (listing.is_sold) {
        console.log(`Status: SOLD (Date: ${listing.soldDate ? listing.soldDate.toISOString() : 'Unknown'})`);
      }
      if (listing.isMultiUserMessage) console.log(`Multi-message: Yes (${listing.messageCount} messages)`);
    }
    
    try {
      // Basic validation
      if (!listing.title || listing.title.trim() === '') {
        console.log(`Skipping listing with no title: "${listing.rawText?.substring(0, 50)}..."`);
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
      
      // Handle price formatting - ensure it's in the correct format for the database
      let price = 0;
      if (listing.price) {
        if (typeof listing.price === 'number') {
          // If it's already a number, use it directly
          price = listing.price;
        } else if (typeof listing.price === 'string') {
          // If it's a string, extract the numeric part
          if (listing.price.toLowerCase() === 'free') {
            price = 0;
          } else {
            // Extract numeric value, handling different formats (R100, 100, R 100)
            const matches = listing.price.match(/(?:r\s*)?(\d+(?:\.\d+)?)/i);
            price = matches ? parseFloat(matches[1]) : 0;
          }
        }
      }
      
      // Handle collection areas - ensure it's always an array
      let collectionAreas = [];
      if (listing.collection_areas) {
        if (Array.isArray(listing.collection_areas)) {
          collectionAreas = listing.collection_areas;
        } else if (typeof listing.collection_areas === 'string') {
          // Split by comma if it's a comma-separated string
          collectionAreas = listing.collection_areas.split(',').map(area => area.trim());
        } else {
          collectionAreas = [String(listing.collection_areas)];
        }
      }
      
      // Format the listing for database insertion
      const dbListing = {
        title: listing.title,
        price: price,
        description: listing.description || listing.rawText,
        whatsappGroup: listing.whatsappGroup,
        date: listing.date,
        sender: listing.sender,
        text: listing.rawText,
        images: listing.images || [], // Will have been populated by processImages if images exist
        condition: listing.condition || 'Unknown',
        collectionAreas: collectionAreas,
        isISO: listing.is_iso || false, // Use the is_iso field from Gemini
        category: listing.category || 'Other',
        // Add fields for multi-message listings
        isMultiUserMessage: listing.isMultiUserMessage || false,
        messageCount: listing.messageCount || 1,
        // Add sold status and date
        isSold: listing.is_sold || false,
        soldDate: listing.soldDate || null
      };
      
      // Extract phone number from the message text
      let phoneNumber = null;
      try {
        phoneNumber = extractPhoneNumber(listing.rawText);
      } catch (error) {
        console.warn(`Error extracting phone number from text: ${error.message}`);
      }
      
      // If no phone number found in text, try to extract from sender
      if (!phoneNumber && listing.sender) {
        // Sender is often in format "XXXXXXXXXXXX@c.us"
        const senderMatch = listing.sender.match(/(\d+)@c\.us$/);
        if (senderMatch && senderMatch[1]) {
          // Normalize to ensure it starts with the proper format for South Africa
          // Convert WhatsApp format (27XXXXXXXXXX) to local format (0XXXXXXXXX)
          phoneNumber = senderMatch[1];
          if (phoneNumber.startsWith('27') && phoneNumber.length >= 11) {
            phoneNumber = '0' + phoneNumber.substring(2);
          }
        }
      }
      
      // Always set both sender and phone_number in the database
      // This ensures we have the original WhatsApp ID in sender
      // and the formatted phone number in phone_number
      if (listing.sender) {
        dbListing.sender = listing.sender;
      }
      
      // Add phone number to the listing if available
      if (phoneNumber) {
        dbListing.phone_number = phoneNumber;
      } else if (listing.sender) {
        // If we still don't have a phone number but do have a sender
        // Try one more time to extract it with a more permissive pattern
        const lastChanceSenderMatch = listing.sender.match(/(\d+)/);
        if (lastChanceSenderMatch && lastChanceSenderMatch[1]) {
          phoneNumber = lastChanceSenderMatch[1];
          if (phoneNumber.startsWith('27') && phoneNumber.length >= 11) {
            phoneNumber = '0' + phoneNumber.substring(2);
            dbListing.phone_number = phoneNumber;
          }
        }
      }
      
      // Add to database
      const id = await addListing(dbListing);
      
      if (id) {
        if (verbose) {
          console.log(`Added listing with ID: ${id}`);
        }
        
        if (listing.is_sold) {
          stats.soldItems++;
        } else {
          stats.added++;
        }
        
        addedListings.push({
          ...dbListing,
          id
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
  console.log(`Sold items added: ${stats.soldItems}`);
  console.log(`Skipped: ${stats.skipped.total}`);
  console.log(`  - Already exists: ${stats.skipped.alreadyExists}`);
  console.log(`  - Invalid data: ${stats.skipped.invalidData}`);
  console.log(`  - Database errors: ${stats.skipped.dbErrors}`);
  
  return addedListings;
}

importWhatsAppListings();