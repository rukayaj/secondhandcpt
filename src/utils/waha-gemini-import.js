/**
 * WAHA-Gemini Integration Script
 * 
 * This script integrates with WAHA (WhatsApp API) to fetch messages from WhatsApp groups,
 * then processes them using Google's Gemini API to extract structured listing data,
 * which is then inserted into the database.
 * 
 * Workflow:
 * - Connects to WAHA API to fetch messages since the last import time, which is taken to be the timestamp of the most recent message in the database
 * - Uses Gemini to extract structured listing data (Sales and ISO)
 * - Handles image downloads and uploads to Supabase Storage
 * - Updates the database with new listings
 * - Connects to WAHA API to fetch the oldest message timestamp for each group, this is necessary as different groups have different message expiry settings
 * - Deletes all older messages for each group
 * 
 * Usage:
 * node scripts/import/waha-gemini-import.js [options]
 * 
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });


// Import the consolidated listing service
const { getLatestMessageTimestamp, addListings } = require('./listingService');

const WAHA_BASE_URL = 'http://localhost:3001/api/default/';

// Import imageUtils functions
const { uploadImage, uploadMultipleImages } = require('./imageUtils');

// Create necessary directories
const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Extract multiple listings from user messages using Gemini API
 * @param {Object} combinedMessage - Combined message data to process
 * @returns {Promise<Array|null>} - Array of extracted listings or null
 */
async function extractListingsWithGemini(combinedMessage) {
  if (!combinedMessage.body || combinedMessage.body.trim() === '') {
    console.debug('Skipping message with no text content');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
I'll provide a sequence of WhatsApp messages from the same user in a buy/sell group. These messages may contain:
1. Multiple separate product listings
2. Updates to previous listings (price changes, additional info)
3. Duplicates of earlier product listings
4. Messages marking items as sold (often just an "x" or "sold" comment)
5. Replies to previous messages with additional details
6. Irrelevant/social messages

Please analyze all messages together and extract ALL product listings, returning them as an ARRAY of listings.
A single user might be selling multiple items at once through separate messages.

IMPORTANT RULES:
- Return an ARRAY of listings, even if there's just one listing.
- VERY IMPORTANT: If a message is marked as a REPLY TO PREVIOUS MESSAGE, consider it as additional info, HOWEVER, if you don't see the earlier message included in this list, you can safely ignore this message and do not add it as a listing.
- For each listing, if you see "x" or "sold" in a follow-up message related to that item, set is_sold to true and include the timestamp.
- If you see price updates like "Reduced to R100", use the latest price.
- If a message is explicitly marked as MARKED AS SOLD, consider the item sold.
- If a post is asking for an item (e.g. "ISO: looking for a car seat"), set is_iso to true.
- If there are no valid product listings at all, return an empty array [].
- A valid listing must at minimum have a title and indicate if it's for sale or ISO.
- Combine duplicate product listings into one, and include information from all the duplicate messages for it.
- IMPORTANT: A title must be specific and descriptive enough for users to understand what the item is. For example "Stokke Tripp Trapp high chair" is a good title, but "High chair" is too generic. NEVER use generic titles like "Unknown Item" or "Untitled".

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
${combinedMessageBody}

Return an ARRAY of listings, where each listing has these fields:
{
  "title": "Brief product title - DO NOT leave this empty or generic. Must be specific and descriptive.",
  "price": "Integer - price without "R" currency symbol or 0 if item is being given away or if this is an In Search Of (ISO) listing",
  "image_hashes": "An array of image hashes for this listing. Always use an Array even if there is only one hash.",
  "condition": "Standardise to either: New, Good, Fair or Used.",
  "collection_areas": "Where to collect (as a string or array of strings)",
  "is_iso": boolean (true if this is an 'In Search Of' post, not a sales listing),
  "is_sold": boolean (true if the item has been marked as sold/taken),
  "sizes": ["Array of size values - include ALL mentioned sizes"],
  "category": "Category of item from the following list: Clothing, Maternity Clothing, Footwear, Toys, Furniture, Books, Feeding, Bath, Safety, Bedding, Diapering, Health, Swimming, Gear, Uncategorised",
  "posted_on": "Current timestamp - will be used to record when this listing was posted, if multiple messages contribute to a listing, use the timestamp of the first message."
}`;

    // Generate content from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array from the response
    let extractedData = null;
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        extractedData = JSON.parse(match[0]);
      } else {
        console.error('No JSON array found in Gemini response');
        return null;
      }
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      console.debug('Raw response:', text);
      return null;
    }
    
    return extractedData;
  } catch (error) {
    console.error('Error in extractListingsWithGemini:', error);
    return null;
  }
}

/**
 * Main function to import WhatsApp listings
 * @returns {Promise<void>}
 */
async function importWhatsAppListings() {
  try {
    const lastMessageTimestamp = await getLatestMessageTimestamp();
    const newMessagesPerGroup = await fetchNewGroupMessages(lastMessageTimestamp);
    for (const [groupId, newMessages] of Object.entries(newMessagesPerGroup)) {
      if (!newMessages || newMessages.length === 0) {
        console.log(`No new messages found, last message was on ${lastMessageTimestamp}`);
        return;
      }
      console.log(`Found ${newMessages.length} new messages. Grouping by sender...`);

      // Group messages by sender
      let senderGroups = {};
      newMessages.forEach(message => {
        const key = `${message._data.author.user}`;
        if (!senderGroups[key]) {
          senderGroups[key] = [];
        }
        senderGroups[key].push(message);
      });
    }
    
    // Process each sender's messages
    for (const [key, messages] of Object.entries(senderGroups)) {
      let combinedMessageBody = '';
      const [sender, group] = key.split('_');
      
      messages.forEach(message => {
        // Add the combined message body
        combinedMessageBody += `MESSAGE ID: ${message.id}\nTIMESTAMP: ${message.timestamp}\n`;
        if (message._data.quotedMsg) {
          combinedMessageBody += `REPLY TO PREVIOUS MESSAGE: ${message._data.quotedStanzaID}\n`;
        }
        combinedMessageBody += `${message.body || ''}\n\n`;
        
        // Collect image hashes if available
        if (message.hasMedia && message._data.filehash) {
          combinedMessageBody += `IMAGE HASH: ${message._data.filehash}\n\n`;
        }
      });
      
      // Extract listings using Gemini
      const extractedListings = await extractListingsWithGemini({ 
        body: combinedMessageBody
      });
      if (!extractedListings || extractedListings.length === 0) {
        console.log(`No valid listings extracted for sender ${sender} in group ${group}`);
        continue;
      }
      
      console.log(`Successfully extracted ${extractedListings.length} listings from sender ${sender} in group ${group}`);
      
      // Add sender and group info to each listing
      const enrichedListings = extractedListings.map(listing => ({
        ...listing,
        sender: sender,
        whatsapp_group: group,
        posted_on: new Date().toISOString()
      }));
      
      // Add new listings to the database
      const addedListings = await addListings(enrichedListings);
      console.log(`Added ${addedListings.length} new listings to the database from sender ${sender}`);
    }
    
    console.log('Import process completed successfully.');
  } catch (error) {
    console.error('Error in import process:', error);
    throw error;
  }
}

/**
 * Process images for a listing
 * @param {Object} listing - Listing with image URLs
 * @returns {Promise<Array>} - Array of image paths in Supabase
 */
async function processImages(listing) {
  if (!listing.images || listing.images.length === 0) {
    return [];
  }
  
  const imageBuffers = [];
  const imageOptions = [];
  
  // Download all images as buffers first
  for (const imageUrl of listing.images) {
    try {
      // Get the image from WAHA  
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      // Determine content type from response headers
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const fileExt = contentType.split('/').pop() || 'jpg';
      
      imageBuffers.push(buffer);
      imageOptions.push({
        contentType,
        filename: `${Date.now()}.${fileExt}`
      });
    } catch (error) {
      console.error(`Error downloading image: ${error.message}`);
    }
  }
  
  if (imageBuffers.length === 0) {
    return [];
  }
  
  // Use the bulk upload function from imageUtils
  try {
    const listingId = listing.id || `temp-${Date.now()}`;
    const uploadedUrls = await uploadMultipleImages(imageBuffers, listingId, imageOptions);
    console.log(`Successfully uploaded ${uploadedUrls.length} images to Supabase`);
    return uploadedUrls;
  } catch (error) {
    console.error(`Error uploading images to Supabase: ${error.message}`);
    return [];
  }
}

// Execute the import process
importWhatsAppListings()
  .then(() => {
    console.log('Import process completed successfully');
  })
  .catch(error => {
    console.error('Error in import process:', error);
  });