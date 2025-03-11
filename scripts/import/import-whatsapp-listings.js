/**
 * DEPRECATED: This script is deprecated and will be removed in a future version.
 * Please use scripts/import/waha-import.js instead.
 * 
 * Import WhatsApp listings with enhanced categorization
 * 
 * This script:
 * 1. Extracts listings from WhatsApp text files for both groups
 * 2. Uses the enhanced weighted categorization
 * 3. Checks which records are new (not already in the database)
 * 4. Adds only new records to the database
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { processListing } = require('../src/utils/categoryUtils');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// WhatsApp group data
const WHATSAPP_GROUPS = [
  {
    name: 'Nifty Thrifty 0-1 year',
    dataDir: 'nifty-thrifty-0-1-years',
    chatFile: 'WhatsApp Chat with Nifty Thrifty 0-1 year.txt'
  },
  {
    name: 'Nifty Thrifty 1-3 years',
    dataDir: 'nifty-thrifty-1-3-years',
    chatFile: 'WhatsApp Chat with Nifty Thrifty 1-3 years.txt'
  }
];

/**
 * Extract listings from WhatsApp chat content
 * 
 * @param {string} content - The content of the WhatsApp chat export
 * @param {string} whatsappGroup - The name of the WhatsApp group
 * @returns {Array} - Array of extracted listings
 */
function extractListings(content, whatsappGroup) {
  const results = [];
  const lines = content.split('\n');
  let currentListing = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match any line that starts with a date and time
    // Note: There's a special character (8239) between the time and am/pm
    const dateTimeMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) -/i);
    
    if (dateTimeMatch) {
      // Check if it's a message (has a colon after the sender)
      const messageMatch = line.match(/^(\d+\/\d+\/\d+), (\d+:\d+)[\s\u200F]*(am|pm) - (.+?): (.*)$/i);
      
      if (messageMatch) {
        // If we were building a previous listing, save it
        if (currentListing) {
          // Clean up the text before saving
          cleanupAndSaveListing(currentListing, results);
        }
        
        // Start a new listing
        const [_, date, time, ampm, sender, text] = messageMatch;
        
        // Skip system messages
        if (sender === "Messages and calls are end-to-end encrypted" || 
            line.includes("joined using this group's invite link") ||
            line.includes("was added") ||
            line.includes("created group") ||
            line.includes("You joined") ||
            sender.includes("You") ||
            line.includes("The message timer was updated")) {
          currentListing = null;
          continue;
        }
        
        // Skip deleted messages or null messages
        if (text === "This message was deleted" || text === null || text.trim() === "" || text === "null") {
          currentListing = null;
          continue;
        }
        
        let cleanText = text;
        let extractedImages = undefined;
        
        // Extract image information
        if (text.includes('(file attached)')) {
          const imageMatch = text.match(/([^\/\s]+\.jpg)/);
          if (imageMatch) {
            extractedImages = [imageMatch[1]];
            // Remove the image filename and "(file attached)" text
            cleanText = cleanText.replace(/.*\.jpg \(file attached\)/, "").trim();
          }
        }
        
        currentListing = {
          whatsappGroup,
          date: `${date} ${time} ${ampm}`,
          sender,
          text: cleanText,
          images: extractedImages,
          price: null,
          condition: null,
          collectionAreas: []
        };
        
      } else {
        // This is a system message or other non-message line
        currentListing = null;
      }
    } else if (currentListing) {
      // This is a continuation of the previous message
      currentListing.text += '\n' + line;
      
      // Check for image in continuation lines if not already found
      if (!currentListing.images && line.includes('(file attached)')) {
        const imageMatch = line.match(/([^\/\s]+\.jpg)/);
        if (imageMatch) {
          currentListing.images = [imageMatch[1]];
          // Remove the image filename and "(file attached)" text from the continuation line
          currentListing.text = currentListing.text.replace(/.*\.jpg \(file attached\)/, "").trim();
        }
      }
    }
  }
  
  // Don't forget to add the last listing
  if (currentListing) {
    cleanupAndSaveListing(currentListing, results);
  }
  
  return results;
}

/**
 * Clean up the listing text and save it to results if valid
 * 
 * @param {Object} listing - The listing to clean up and save
 * @param {Array} results - The array to save the listing to
 */
function cleanupAndSaveListing(listing, results) {
  // Skip deleted messages, empty messages, or "null" messages
  if (listing.text === "This message was deleted" || 
      listing.text === null || 
      listing.text.trim() === "" ||
      listing.text === "null") {
    return;
  }
  
  // Remove "<This message was edited>" from the text
  listing.text = listing.text.replace(/<This message was edited>/g, "").trim();
  
  // Remove "<Media omitted>" from the text
  listing.text = listing.text.replace(/<Media omitted>/g, "").trim();
  
  // Clean up the text: remove leading/trailing whitespace and normalize line breaks
  listing.text = listing.text.trim().replace(/\n+/g, '\n');
  
  // Process the listing to extract additional information
  const enhancedListing = processListing(listing);
  
  // Save the enhanced listing
  results.push(enhancedListing);
}

/**
 * Check if two listings are the same based on key fields
 * 
 * @param {Object} a - First listing
 * @param {Object} b - Second listing
 * @returns {boolean} - True if the listings are the same
 */
function isSameListing(a, b) {
  return (
    a.whatsappGroup === b.whatsapp_group &&
    a.date === b.date &&
    a.sender === b.sender &&
    a.text === b.text
  );
}

/**
 * Format a listing for the database
 * 
 * @param {Object} listing - The listing to format
 * @returns {Object} - The formatted listing for database insertion
 */
function formatListingForDB(listing) {
  return {
    whatsapp_group: listing.whatsappGroup,
    date: listing.date,
    sender: listing.sender,
    text: listing.text,
    images: listing.images || [],
    price: listing.price,
    condition: listing.condition,
    collection_areas: listing.collectionAreas || [],
    category: listing.category || 'Other',
    is_iso: listing.isISO || false,
    date_added: new Date().toISOString()
  };
}

/**
 * Main function to process WhatsApp chats and import new listings
 */
async function importWhatsAppListings() {
  try {
    console.log('Starting WhatsApp listings import process...');
    
    let allExtractedListings = [];
    
    // Process each WhatsApp group
    for (const group of WHATSAPP_GROUPS) {
      console.log(`\nProcessing ${group.name}...`);
      
      const chatFilePath = path.join(__dirname, '../src/data', group.dataDir, group.chatFile);
      
      // Check if file exists
      if (!fs.existsSync(chatFilePath)) {
        console.error(`Chat file not found: ${chatFilePath}`);
        console.log(`Make sure to export the WhatsApp chat and place it in the correct directory.`);
        continue;
      }
      
      // Read and process the chat file
      console.log(`Reading chat file: ${chatFilePath}`);
      const chatContent = fs.readFileSync(chatFilePath, 'utf8');
      
      // Extract listings
      const extractedListings = extractListings(chatContent, group.name);
      console.log(`Extracted ${extractedListings.length} listings from ${group.name}`);
      
      // Add to combined results
      allExtractedListings = [...allExtractedListings, ...extractedListings];
    }
    
    console.log(`\nTotal extracted listings: ${allExtractedListings.length}`);
    
    // Get existing listings from the database
    console.log('\nFetching existing listings from database...');
    const { data: existingListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, whatsapp_group, date, sender, text');
    
    if (fetchError) {
      console.error('Error fetching existing listings:', fetchError);
      return;
    }
    
    console.log(`Found ${existingListings.length} existing listings in the database`);
    
    // Find new listings (not already in the database)
    const newListings = allExtractedListings.filter(extractedListing => 
      !existingListings.some(existingListing => isSameListing(extractedListing, existingListing))
    );
    
    console.log(`\nFound ${newListings.length} new listings to add to the database`);
    
    if (newListings.length === 0) {
      console.log('No new listings to add. Process complete!');
      return;
    }
    
    // Format new listings for database insertion
    const formattedListings = newListings.map(formatListingForDB);
    
    // Insert in batches to avoid request size limits
    const BATCH_SIZE = 20;
    const batches = [];
    
    for (let i = 0; i < formattedListings.length; i += BATCH_SIZE) {
      batches.push(formattedListings.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`\nInserting ${batches.length} batches of up to ${BATCH_SIZE} listings each...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} listings)...`);
      
      const { data, error } = await supabase
        .from('listings')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`Error inserting batch ${i + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Successfully inserted batch ${i + 1}: ${data.length} listings`);
        successCount += data.length;
      }
    }
    
    console.log('\nImport process complete!');
    console.log(`Successfully added ${successCount} new listings to the database`);
    
    if (errorCount > 0) {
      console.error(`Failed to add ${errorCount} listings`);
    }
    
    // Log some statistics on categorization
    const categoryStats = {};
    newListings.forEach(listing => {
      const category = listing.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log('\nCategory statistics for new listings:');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`- ${category}: ${count} listings (${Math.round(count / newListings.length * 100)}%)`);
      });
    
  } catch (error) {
    console.error('Error in importWhatsAppListings:', error);
  }
}

// Run the function
importWhatsAppListings(); 