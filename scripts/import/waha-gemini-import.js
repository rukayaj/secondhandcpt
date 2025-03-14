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

console.log('DEBUG: Script starting execution');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from both project root and local directory
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('DEBUG: Environment variables loaded');

const axios = require('axios');
const { program } = require('commander');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('DEBUG: Dependencies loaded');

// Import utility modules
const { listingExists, addListing, getLatestMessageTimestampsByGroup } = require('../../src/utils/dbUtils');
const { extractPhoneNumber } = require('../../src/utils/listingParser');

// Import our consolidated utility modules
const { 
  WHATSAPP_GROUPS,
  WAHA_BASE_URL,
  getAdminClient,
  checkWahaSessionStatus,
  startWahaSession,
  waitForWahaAuthentication
} = require('./importUtils');

const {
  uploadImageToSupabase,
  downloadImageFromWaha
} = require('../deployment/imageUtils');

// API Prefix for WAHA
const WAHA_API_PREFIX = '/default';

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
  .option('--limit <n>', 'Limit number of messages per group', parseInt, 5)
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

// Configuration
const MIN_AGE_DAYS = 7; // Only expire listings older than 7 days
const VERIFICATION_ENABLED = true; // Verify listings still exist before expiring

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
    extractedListing.isMultiUserMessage = userMessages.length > 1;
    extractedListing.messageCount = userMessages.length;
    
    // Set the raw text from the description or from the combined message text
    extractedListing.rawText = extractedListing.description || 
                              (relatedMessage ? relatedMessage.body : messagesText);
    
    // Add image URLs if available
    if (relatedMessage && relatedMessage.mediaUrl) {
      extractedListing.imageUrls = [relatedMessage.mediaUrl];
    } else if (imageUrls.length > 0) {
      extractedListing.imageUrls = imageUrls;
    }
    
    // Process images and collect hashes if images are available
    if (extractedListing.imageUrls && extractedListing.imageUrls.length > 0) {
      try {
        // Call downloadAndProcessImages with the listing and verbose flag
        const { images, image_hashes } = await downloadAndProcessImages(
          extractedListing, 
          options.verbose || false
        );
        
        // Add the processed images and hashes to the listing
        extractedListing.images = images;
        extractedListing.image_hashes = image_hashes;
      } catch (error) {
        console.error('Error processing images for listing:', error);
        extractedListing.images = [];
        extractedListing.image_hashes = [];
      }
    } else {
      extractedListing.images = [];
      extractedListing.image_hashes = [];
    }
    
    // Check if this listing already exists in the database
    const exists = await listingExists(extractedListing);
    
    if (exists) {
      console.log(`Skipping duplicate listing: ${extractedListing.title || 'Untitled'}`);
      continue;
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
- IMPORTANT: For the title field, extract the specific item name. If you cannot determine a specific name, use a descriptive part of the message instead. NEVER use generic titles like "Unknown Item" or "Untitled". Extract meaningful titles that identify the actual product. DO NOT leave the title field empty.
- CRITICAL: A title must be specific and descriptive enough for users to understand what the item is. For example "Stokke Tripp Trapp high chair" is a good title, but "High chair" is too generic.

IMPORTANT SIZE EXTRACTION GUIDELINES:
1. Extract ALL sizes mentioned for clothing and footwear items into the "sizes" array. 
2. Common clothing size formats: 
   - Age-based: 0-3m, 3-6m, 6-9m, 9-12m, 12-18m, 18-24m, 2-3y, 3-4y, etc.
   - Standard: XXS, XS, S, M, L, XL, XXL, etc.
   - Numeric: 24, 26, 28, 30, 32, etc. (could be waist size in inches)
   - Height-based: 50cm, 56cm, 62cm, 68cm, etc.
3. Common footwear size formats:
   - UK sizes: typically smaller numbers (1, 2, 3, etc.)
   - EU sizes: typically larger numbers (16, 17, 18, 19, 20, etc.)
   - US sizes
   - Age-based: 0-3m, 3-6m, etc.
   - Length in cm
4. If multiple sizes are mentioned (e.g., "size 2 & 3"), include ALL sizes in the array
5. If a size range is mentioned (e.g., "size 3-6 months"), include it as a single entry

IMPORTANT CATEGORIZATION GUIDELINES:
1. Users often are selling books in the "Sense" series (Baby Sense, Weaning Sense, Feeding Sense, Toddler Sense, Sleep Sense, etc.) should always be categorized as "Books"
2. Distinguish between regular "Clothing" and "Maternity Clothing" based on context. Keep a look out for things listed with sizes - these will probably be clothing of one kind or another.
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
  "title": "Brief product title - DO NOT leave this empty or generic. Must be specific and descriptive.",
  "price": "Price with currency symbol (R100, R50, etc.) or 'Free' if item is being given away",
  "condition": "Standardise to either: New, Good, Fair or Used.",
  "collection_areas": "Where to collect (as a string or array of strings)",
  "description": "Full description",
  "is_free": boolean,
  "is_iso": boolean (true if this is an 'In Search Of' post, not a sales listing),
  "is_sold": boolean (true if the item has been marked as sold/taken),
  "sizes": ["Array of size values - include ALL mentioned sizes"],
  "category": "Category of item from the following list: Clothing, Maternity Clothing, Footwear, Toys, Furniture, Books, Feeding, Bath, Safety, Bedding, Diapering, Health, Swimming, Gear, Uncategorised"
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
    "condition": "Good",
    "collection_areas": "Rondebosch",
    "description": "Baby walker, good condition",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "sizes": [],
    "category": "Baby Essentials"
  },
  {
    "title": "Toddler bike with training wheels",
    "price": "R350",
    "condition": "Good",
    "collection_areas": "Rondebosch",
    "description": "Toddler's bike for 3-5 years with training wheels included",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "sizes": ["3-5 years"],
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
    "condition": "Good",
    "collection_areas": "Kirstenhof",
    "description": "H&M maternity jeans, size Large, excellent condition, originally R200, reduced to R150",
    "is_free": false,
    "is_iso": false,
    "is_sold": true,
    "sizes": ["Large"],
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
    "title": "ISO: Baby cot for newborn",
    "price": null,
    "condition": null,
    "collection_areas": "Southern Suburbs",
    "description": "ISO: Baby cot for newborn, willing to collect anywhere in Southern Suburbs",
    "is_free": false,
    "is_iso": true,
    "is_sold": false,
    "sizes": ["Newborn"],
    "category": "Furniture"
  },
  {
    "title": "Toddler's clothes bundle from Woolworths, Cotton On and H&M",
    "price": "R250",
    "condition": "Used",
    "collection_areas": "Kenilworth",
    "description": "Toddler's clothes bundle. 5 items, size 2-3 years, mix of Woolworths, Cotton On and H&M.",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "sizes": ["2-3 years"],
    "category": "Clothing"
  }
]

Example 4 (Multiple sizes in one listing):
Message 1 (7/15/2023, 10:30:45 AM):
Baby shoes for sale, sizes 2 & 3, excellent condition, R100 for both pairs. Collection from Sea Point.

OUTPUT:
[
  {
    "title": "Baby shoes sizes 2 & 3",
    "price": "R100",
    "condition": "Good",
    "collection_areas": "Sea Point",
    "description": "Baby shoes for sale, sizes 2 & 3, excellent condition, R100 for both pairs",
    "is_free": false,
    "is_iso": false,
    "is_sold": false,
    "sizes": ["2", "3"],
    "category": "Footwear"
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
      
      // Filter out listings with missing or generic titles and try again
      const invalidTitleListings = validListings.filter(listing => 
        !listing.title || 
        listing.title.trim() === '' || 
        listing.title === 'Unknown Item' || 
        listing.title === 'Untitled' || 
        listing.title === 'Item for sale'
      );
      
      if (invalidTitleListings.length > 0) {
        console.log(`Found ${invalidTitleListings.length} listings with missing or generic titles. Requesting better titles...`);
        
        // Create a more focused prompt for each listing without a valid title
        for (let i = 0; i < invalidTitleListings.length; i++) {
          const listing = invalidTitleListings[i];
          
          const retryPrompt = `
I need a specific, descriptive title for this WhatsApp listing. DO NOT generate a generic title like "Unknown Item" or "Item for sale".
The title should clearly identify what the product is, including brand names, models, and distinctive features if mentioned.

Here's the listing description:
${listing.description || messageData.body}

Please provide ONLY a concise, specific title for this item:`;
          
          try {
            const titleResult = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: retryPrompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 100,
              },
            });
            
            const titleText = titleResult.response.text().trim();
            
            // Update the listing title if we got a valid response
            if (titleText && titleText !== '' && !titleText.includes('I cannot')) {
              // Find the index of this listing in the original array
              const indexInOriginal = validListings.findIndex(l => 
                l.description === listing.description
              );
              
              if (indexInOriginal !== -1) {
                validListings[indexInOriginal].title = titleText;
                console.log(`Updated title for listing: "${titleText}"`);
              }
            }
          } catch (titleError) {
            console.error(`Error getting better title: ${titleError.message}`);
          }
        }
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
 * Uses the improved method that includes all messages
 * @param {string} chatId - The chat ID of the WhatsApp group
 * @returns {Promise<number|null>} - Unix timestamp in seconds of the oldest message, or null if error
 */
async function findOldestMessageTimestamp(chatId) {
  try {
    if (options.verbose) console.log(`Finding oldest message for chat ID: ${chatId}...`);
    
    // Get the oldest messages from the group (using sort=asc and limit=1)
    // Note: We don't use fromMe: false to include all messages
    const response = await axios.get(`${WAHA_BASE_URL}${WAHA_API_PREFIX}/chats/${chatId}/messages`, {
      params: {
        limit: 1,
        sort: 'asc' // Sort ascending to get the oldest message first
      }
    });
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const oldestMessage = response.data[0];
      if (options.verbose) {
        console.log(`Oldest message found from ${new Date(oldestMessage.timestamp * 1000).toISOString()}`);
        console.log(`Message fromMe: ${oldestMessage.fromMe}`);
        console.log(`Message body: "${oldestMessage.body ? oldestMessage.body.substring(0, 50) + '...' : 'No body'}"`);
      }
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
 * Check if a listing still exists in WhatsApp
 * @param {string} chatId - The chat ID to search in
 * @param {Object} listing - The listing to check
 * @returns {Promise<boolean>} - Whether the listing still exists
 */
async function checkIfListingExistsInWhatsApp(chatId, listing) {
  try {
    if (options.verbose) console.log(`Checking if listing "${listing.title}" still exists in WhatsApp...`);
    
    // Get a larger batch of messages to search through
    const response = await axios.get(`${WAHA_BASE_URL}${WAHA_API_PREFIX}/chats/${chatId}/messages`, {
      params: {
        limit: 200 // Get a larger batch to search through
      }
    });
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      // If we can't get messages, assume the listing might still exist (conservative approach)
      if (options.verbose) console.log(`No messages retrieved from chat ${chatId}, assuming listing still exists`);
      return true;
    }
    
    // Create search terms from listing title and text
    const searchTerms = [
      listing.title,
      // Extract a few keywords from the text
      ...(listing.text ? listing.text.split(/\s+/).filter(word => word.length > 4).slice(0, 5) : [])
    ].filter(Boolean);
    
    if (options.verbose) console.log(`Search terms: ${searchTerms.join(', ')}`);
    
    // Search for any of the search terms
    const matchingMessages = response.data.filter(msg => {
      if (!msg.body) return false;
      
      // Check if any search term is found in the message body
      return searchTerms.some(term => 
        msg.body.toLowerCase().includes(term.toLowerCase())
      );
    });
    
    if (matchingMessages.length > 0) {
      if (options.verbose) console.log(`Found ${matchingMessages.length} messages matching listing "${listing.title}"`);
      return true;
    } else {
      if (options.verbose) console.log(`No messages found matching listing "${listing.title}"`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking if listing exists in WhatsApp: ${error.message}`);
    // If we can't check, assume the listing might still exist (conservative approach)
    return true;
  }
}

/**
 * Delete listings that are older than a specified timestamp for a given WhatsApp group
 * With improvements to avoid premature deletion
 * 
 * @param {string} groupName - The name of the WhatsApp group
 * @param {number} timestampSeconds - Unix timestamp in seconds of the oldest message still in the group
 * @returns {Promise<{deleted: number, imagesRemoved: number, error: any, expiredListings: Array}>} - Result object
 */
async function deleteExpiredListings(groupName, timestampSeconds) {
  try {
    // Convert Unix timestamp (seconds) to ISO string for database comparison
    const oldestMessageDate = new Date(timestampSeconds * 1000).toISOString();
    const chatId = WHATSAPP_GROUPS.find(g => g.name === groupName)?.chatId;
    
    if (!chatId) {
      console.warn(`Cannot find chat ID for group "${groupName}"`);
      return { deleted: 0, imagesRemoved: 0, error: new Error('Chat ID not found'), expiredListings: [] };
    }
    
    console.log(`Finding listings older than ${oldestMessageDate} for group "${groupName}"...`);
    
    const supabase = getAdminClient();
    
    // Find listings to delete (for logging purposes)
    const { data: potentiallyExpiredListings, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, title, date, text, images')
      .eq('whatsapp_group', groupName)
      .lt('date', oldestMessageDate);
    
    if (countError) {
      console.error(`Error finding expired listings: ${countError.message}`);
      return { deleted: 0, imagesRemoved: 0, error: countError, expiredListings: [] };
    }
    
    // If no expired listings found, return early
    if (!potentiallyExpiredListings || potentiallyExpiredListings.length === 0) {
      console.log(`No expired listings found for group "${groupName}"`);
      return { deleted: 0, imagesRemoved: 0, error: null, expiredListings: [] };
    }
    
    console.log(`Found ${potentiallyExpiredListings.length} potentially expired listings for group "${groupName}"`);
    
    // Add minimum age check
    const now = new Date();
    const minAgeMs = MIN_AGE_DAYS * 24 * 60 * 60 * 1000;
    
    // Filter listings based on minimum age
    const agedListings = potentiallyExpiredListings.filter(listing => {
      const listingDate = new Date(listing.date);
      const ageMs = now.getTime() - listingDate.getTime();
      const isOldEnough = ageMs > minAgeMs;
      
      if (!isOldEnough) {
        if (options.verbose) console.log(`Skipping listing "${listing.title}" - not old enough (${Math.floor(ageMs / (1000 * 60 * 60 * 24))} days old)`);
      }
      
      return isOldEnough;
    });
    
    if (agedListings.length === 0) {
      console.log(`No listings meet the minimum age requirement (${MIN_AGE_DAYS} days) for group "${groupName}"`);
      return { deleted: 0, imagesRemoved: 0, error: null, expiredListings: [] };
    }
    
    // Verify listings have actually expired from WhatsApp (if enabled)
    let verifiedExpiredListings = agedListings;
    
    if (VERIFICATION_ENABLED) {
      console.log(`Verifying listings have actually expired from WhatsApp...`);
      
      verifiedExpiredListings = [];
      
      for (const listing of agedListings) {
        // Check if the listing still exists in WhatsApp
        const stillExists = await checkIfListingExistsInWhatsApp(chatId, listing);
        
        if (stillExists) {
          if (options.verbose) console.log(`Listing "${listing.title}" (${listing.date}) still exists in WhatsApp - not deleting`);
        } else {
          if (options.verbose) console.log(`Verified: Listing "${listing.title}" (${listing.date}) has expired from WhatsApp`);
          verifiedExpiredListings.push(listing);
        }
      }
      
      if (verifiedExpiredListings.length === 0) {
        console.log(`No listings have actually expired from WhatsApp for group "${groupName}"`);
        return { deleted: 0, imagesRemoved: 0, error: null, expiredListings: [] };
      }
    }
    
    // Delete all associated images from storage first
    let removedImageCount = 0;
    for (const listing of verifiedExpiredListings) {
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        for (const imagePath of listing.images) {
          // Delete the image from storage
          const { error: storageError } = await supabase
            .storage
            .from('listing-images')
            .remove([imagePath]);
          
          if (storageError) {
            console.warn(`Warning: Failed to delete image ${imagePath}: ${storageError.message}`);
          } else {
            removedImageCount++;
          }
        }
      }
    }
    
    // Delete the verified expired listings
    const listingIds = verifiedExpiredListings.map(listing => listing.id);
    
    const { error: deleteError } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .in('id', listingIds);
    
    if (deleteError) {
      console.error(`Error deleting expired listings: ${deleteError.message}`);
      return { deleted: 0, imagesRemoved: removedImageCount, error: deleteError, expiredListings: [] };
    }
    
    console.log(`Deleted ${verifiedExpiredListings.length} expired listings and ${removedImageCount} associated images for group "${groupName}"`);
    
    return { 
      deleted: verifiedExpiredListings.length, 
      imagesRemoved: removedImageCount,
      error: null,
      expiredListings: verifiedExpiredListings
    };
  } catch (error) {
    console.error(`Error in deleteExpiredListings: ${error.message}`);
    return { deleted: 0, imagesRemoved: 0, error, expiredListings: [] };
  }
}

/**
 * Sync listings by removing expired ones
 * This function checks the oldest message in each WhatsApp group and deletes
 * listings older than that message since they've expired from WhatsApp
 * 
 * @param {Object} options - Options for synchronization
 * @returns {Promise<Object>} - Statistics about the sync operation
 */
async function syncExpiredListings(options = {}) {
  const verbose = options.verbose || false;
  const stats = {
    total: 0,
    deleted: 0,
    errors: 0,
    groups: {}
  };
  
  try {
    if (verbose) console.log('Starting to sync expired listings...');
    
    // Process each WhatsApp group with a chat ID
    for (const group of WHATSAPP_GROUPS) {
      if (!group.chatId) {
        if (verbose) console.log(`Skipping ${group.name} - no chat ID configured`);
        continue;
      }
      
      stats.groups[group.name] = {
        processed: 0,
        deleted: 0,
        errors: 0
      };
      
      try {
        // Find the oldest message timestamp in this group
        if (verbose) console.log(`Finding oldest message timestamp for ${group.name}...`);
        const oldestTimestamp = await findOldestMessageTimestamp(group.chatId);
        
        if (!oldestTimestamp) {
          if (verbose) console.log(`Could not find oldest message for ${group.name}, skipping`);
          continue;
        }
        
        if (verbose) console.log(`Oldest message timestamp for ${group.name}: ${new Date(oldestTimestamp * 1000).toISOString()}`);
        
        // Delete expired listings for this group
        const result = await deleteExpiredListings(group.name, oldestTimestamp);
        
        // Update statistics
        stats.total += result.deleted;
        stats.deleted += result.deleted;
        stats.groups[group.name].deleted = result.deleted;
        stats.groups[group.name].processed = result.deleted + (result.expiredListings?.length || 0);
        
        if (result.error) {
          stats.errors++;
          stats.groups[group.name].errors++;
        }
      } catch (error) {
        console.error(`Error syncing ${group.name}: ${error.message}`);
        stats.errors++;
        stats.groups[group.name].errors++;
      }
    }
    
    if (verbose) {
      console.log('\nSync statistics:');
      console.log(`Total listings processed: ${stats.total}`);
      console.log(`Deleted: ${stats.deleted}`);
      console.log(`Errors: ${stats.errors}`);
      
      for (const groupName in stats.groups) {
        console.log(`\n${groupName}:`);
        console.log(`  Processed: ${stats.groups[groupName].processed}`);
        console.log(`  Deleted: ${stats.groups[groupName].deleted}`);
        console.log(`  Errors: ${stats.groups[groupName].errors}`);
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error in syncExpiredListings:', error);
    throw error;
  }
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
      // Determine API limit (use options.limit if defined, otherwise default to 5)
      const apiLimit = options.limit || 5;
      console.log(`Limiting to ${apiLimit} messages per group`);
      
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
        if (apiLimit && messagesWithGroup.length > apiLimit) {
          processedMessages = messagesWithGroup.slice(0, apiLimit);
          console.log(`Limiting to ${apiLimit} messages from "${group.name}" (found ${messagesWithGroup.length})`);
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
  let skippedCount = 0;
  
  // Create a directory for storing temporary images
  const tmpDir = path.join(process.cwd(), 'tmp', 'waha-images');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log(`Created temporary directory for images: ${tmpDir}`);
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
      
      if (!imageUrl) {
        console.log('Skipping empty image URL');
        skippedCount++;
        continue;
      }
      
      processedImageCount++;
      
      if (verbose) {
        console.log(`Processing image ${i + 1}/${imageUrls.length}`);
        console.log(`Image URL: ${imageUrl}`);
      } else {
        console.log(`Processing image ${i + 1}/${imageUrls.length}`);
      }
      
      try {
        // Generate a unique ID for this image
        const imageId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const localPath = path.join(tmpDir, `image_${imageId}.jpg`);
        
        // Download the image from WAHA
        console.log(`Downloading image from WAHA: ${imageUrl}`);
        const downloadSuccess = await downloadImageFromWaha(imageUrl, localPath);
        
        if (!downloadSuccess) {
          console.log(`Failed to download image from ${imageUrl}`);
          errorCount++;
          continue;
        }
        
        // Verify the file exists before proceeding
        if (!fs.existsSync(localPath)) {
          console.error(`Downloaded file does not exist at path: ${localPath}`);
          errorCount++;
          continue;
        }
        
        // Check if file is empty or too small to be a valid image
        const fileStats = fs.statSync(localPath);
        if (fileStats.size < 100) { // Less than 100 bytes is likely invalid
          console.error(`Downloaded file is too small to be a valid image: ${fileStats.size} bytes`);
          
          // Remove invalid file
          try {
            fs.unlinkSync(localPath);
            console.log(`Removed invalid image file: ${localPath}`);
          } catch (unlinkError) {
            console.warn(`Could not remove invalid image file: ${unlinkError.message}`);
          }
          
          errorCount++;
          continue;
        }
        
        console.log(`Successfully downloaded image to ${localPath} (${fileStats.size} bytes)`);
        
        // Create a structured path for the image within the listings folder
        // Format: listings/groupName_index_timestamp_uniqueId.jpg
        // This avoids using the messageId which can have varying formats
        const groupNameForPath = listing.whatsappGroup?.replace(/\s+/g, '_').replace(/[^\w-]/g, '') || 'unknown-group';
        
        // Use a consistent format for the image path that doesn't rely on message ID format
        const imagePath = `listings/${groupNameForPath}_${i}_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
        
        // Upload the image to Supabase
        console.log(`Uploading image to Supabase with path: ${imagePath}`);
        
        // Upload with direct path to avoid nesting issues
        const uploadSuccess = await uploadImageToSupabase(localPath, imagePath, true);
        
        if (uploadSuccess) {
          console.log(`Successfully uploaded image to Supabase`);
          // Add the image path to the listing's images
          supabaseImagePaths.push(imagePath);
          successCount++;
        } else {
          console.error(`Failed to upload image to Supabase`);
          errorCount++;
        }
        
        // Delete the temporary file after successful upload
        try {
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            console.log(`Deleted temporary file: ${localPath}`);
          }
        } catch (unlinkError) {
          console.warn(`Warning: Could not delete temporary file: ${unlinkError.message}`);
        }
      } catch (error) {
        console.error(`Error processing image for ${listing.title || 'Untitled'}: ${error.message}`);
        console.error(error.stack);
        errorCount++;
      }
    }
    
    // Update the listing's images with the Supabase Storage paths
    if (supabaseImagePaths.length > 0) {
      updatedListings[j].images = supabaseImagePaths;
      console.log(`Added ${supabaseImagePaths.length} images to listing: ${listing.title || 'Untitled'}`);
    } else {
      console.log(`No successful image uploads for listing: ${listing.title || 'Untitled'}`);
    }
  }
  
  console.log(`Finished processing images:`);
  console.log(`- ${listingsWithImages} listings had images`);
  console.log(`- ${processedImageCount} total images processed`);
  console.log(`- ${successCount} successful uploads`);
  console.log(`- ${errorCount} errors`);
  console.log(`- ${skippedCount} skipped (empty URLs)`);
  
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
        soldDate: listing.soldDate || null,
        // Add sizes array 
        sizes: listing.sizes || []
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

/**
 * Generate a hash of an image buffer for duplicate detection
 * @param {Buffer} buffer - The image buffer to hash
 * @returns {string} - The hash string
 */
function generateImageHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Download and process images for a listing
 * @param {Object} listing - The listing to process images for
 * @param {boolean} verbose - Whether to show detailed logs
 * @returns {Promise<{images: string[], image_hashes: string[]}>} - Processed images and their hashes
 */
async function downloadAndProcessImages(listing, verbose = false) {
  try {
    if (!listing || !listing.imageUrls || !Array.isArray(listing.imageUrls) || listing.imageUrls.length === 0) {
      if (verbose) console.log('No images to process for listing');
      return { images: [], image_hashes: [] };
    }
    
    if (verbose) console.log(`Processing ${listing.imageUrls.length} images for listing: ${listing.title}`);
    
    const processedImages = [];
    const imageHashes = [];
    
    for (let i = 0; i < listing.imageUrls.length; i++) {
      const imageUrl = listing.imageUrls[i];
      if (!imageUrl) continue;
      
      try {
        if (verbose) console.log(`Processing image ${i+1}/${listing.imageUrls.length}: ${imageUrl}`);
        
        // Get WhatsApp group directory for storage
        const groupDirName = listing.whatsappGroup.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();
        
        // Create a unique filename for the image
        const extension = 'jpg';  // Assume JPEG for WhatsApp images
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const imageName = `${groupDirName}_${i}_${timestamp}_${randomId}.${extension}`;
        const storagePath = `listings/${imageName}`;
        
        // Create the correct WAHA URL for the image download
        // The image URL from WAHA messages is usually a relative path or media ID
        const finalUrl = `${WAHA_BASE_URL}/api/files${WAHA_API_PREFIX}/${imageUrl.split('/').pop()}`;
        
        if (verbose) console.log(`Downloading image from: ${finalUrl}`);
        
        // Download the image from WAHA
        const imageBuffer = await downloadImageFromWaha(finalUrl);
        
        if (!imageBuffer) {
          console.error(`Failed to download image from ${finalUrl}`);
          continue;
        }
        
        // Generate a hash for the image (for duplicate detection)
        const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
        
        // Upload the image to Supabase Storage
        const uploadSuccess = await uploadImageToSupabase(imageBuffer, storagePath);
        
        if (uploadSuccess) {
          if (verbose) console.log(`Successfully uploaded image to ${storagePath}`);
          processedImages.push(storagePath);
          imageHashes.push(hash);
        } else {
          console.error(`Failed to upload image to Supabase Storage: ${storagePath}`);
        }
      } catch (error) {
        console.error(`Error processing image ${i+1}: ${error.message}`);
      }
    }
    
    if (verbose) {
      console.log(`Finished processing images for listing: ${listing.title}`);
      console.log(`- ${processedImages.length}/${listing.imageUrls.length} images successfully processed`);
    }
    
    return { images: processedImages, image_hashes: imageHashes };
  } catch (error) {
    console.error(`Error in downloadAndProcessImages: ${error.message}`);
    return { images: [], image_hashes: [] };
  }
}

// Execute the import process
console.log('DEBUG: Starting import process');
importWhatsAppListings()
  .then(() => {
    console.log('DEBUG: Import process completed successfully');
  })
  .catch(error => {
    console.error('DEBUG: Error in import process:', error);
  });

console.log('DEBUG: Script execution complete');