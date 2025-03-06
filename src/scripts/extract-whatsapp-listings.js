/**
 * WhatsApp Chat Listing Extractor
 * 
 * This utility extracts listings of second-hand items from WhatsApp chat exports.
 * It handles various message formats, multi-line messages, and extracts information
 * such as price, images, and sender details.
 */

const fs = require('fs');
const path = require('path');

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
        
        // Extract price if available
        const priceMatch = text.match(/R(\d+)/) || text.match(/@R(\d+)/);
        if (priceMatch) {
          currentListing.price = parseInt(priceMatch[1], 10);
        }
      } else {
        // This is a system message or other non-message line
        currentListing = null;
      }
    } else if (currentListing) {
      // This is a continuation of the previous message
      currentListing.text += '\n' + line;
      
      // Check for price in continuation lines if not already found
      if (currentListing.price === null) {
        const priceMatch = line.match(/R(\d+)/) || line.match(/@R(\d+)/);
        if (priceMatch) {
          currentListing.price = parseInt(priceMatch[1], 10);
        }
      }
      
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
  
  // Extract condition information
  extractCondition(listing);
  
  // Extract collection areas
  extractCollectionAreas(listing);
  
  // Save the listing
  results.push(listing);
}

/**
 * Extract condition information from the listing text
 * 
 * @param {Object} listing - The listing to extract condition from
 */
function extractCondition(listing) {
  // Define standard condition categories
  const conditionCategories = {
    'NEW': ['brand new', 'new with tags', 'nwt', 'new without tags', 'nwot', 'new', 'never used', 'never worn', 'unused'],
    'LIKE_NEW': ['like new', 'almost new', 'pristine', 'mint', 'worn once', 'used once', 'worn twice', 'used twice'],
    'EXCELLENT': ['excellent', 'pristine', 'perfect'],
    'VERY_GOOD': ['very good', 'great'],
    'GOOD': ['good'],
    'FAIR': ['fair', 'average', 'okay', 'ok'],
    'POOR': ['poor', 'worn', 'used', 'well used', 'well worn']
  };
  
  // Common condition patterns with capture groups for the actual condition
  const conditionPatterns = [
    // Specific condition phrases
    /\b(brand new|new with tags|nwt|new without tags|nwot)\b/i,
    /\b(excellent|mint|pristine)\s+condition\b/i,
    /\b(very good|great)\s+condition\b/i,
    /\bgood\s+condition\b/i,
    /\b(fair|average)\s+condition\b/i,
    /\b(poor|worn|used)\s+condition\b/i,
    
    // "In X condition" format
    /\bin\s+(excellent|very good|good|fair|poor)\s+condition\b/i,
    
    // "Condition: X" or "Condition is X" format
    /\bCondition:\s*([^,\n.]+?)(?=\s*\b(?:Price|Collection|R\d+|Collect|Pick|DM|Cross|X-?posted)\b|\s*$)/i,
    /\bcondition\s*(?:is|:)?\s*([^,\n.]+?)(?=\s*\b(?:Price|Collection|R\d+|Collect|Pick|DM|Cross|X-?posted)\b|\s*$)/i,
    
    // "X to Y condition" format
    /\b(good to very good|fair to good|poor to fair)\s+condition\b/i,
    
    // "X condition except" format
    /\b(good|excellent|very good)\s+condition\s+except\b/i,
    
    // "Never used/worn" format
    /\b(never used|never worn|unused)\b/i,
    
    // "Like new" format
    /\b(like new|almost new)\b/i,
    
    // "Worn once/twice" format
    /\b(worn once|used once|worn twice|used twice)\b/i
  ];
  
  let extractedCondition = null;
  
  // Try to extract condition using patterns
  for (const pattern of conditionPatterns) {
    const match = listing.text.match(pattern);
    if (match) {
      // If the pattern has a capture group, use that, otherwise use the whole match
      let condition = match[1] ? match[1].trim() : match[0].trim();
      
      // For patterns that match the whole phrase like "good condition", extract just the condition part
      if (condition.toLowerCase().endsWith(' condition')) {
        condition = condition.replace(/\s+condition$/i, '').trim();
      }
      
      // Verify it's not a price or other non-condition text
      if (!condition.match(/^R\d+$/) && 
          !condition.match(/^Collection/i) &&
          condition.length > 0) {
        extractedCondition = condition.toLowerCase();
        break;
      }
    }
  }
  
  // If we didn't find a condition using the patterns, try a more general approach
  if (!extractedCondition) {
    // Look for common condition words near the word "condition"
    const generalMatch = listing.text.match(/\b(excellent|very good|good|fair|poor|used|new|mint|pristine|great)(?:\s+to\s+(?:excellent|very good|good|fair|poor))?\s+condition\b/i);
    if (generalMatch) {
      extractedCondition = generalMatch[1].toLowerCase();
    }
  }
  
  // Map the extracted condition to a standard category
  if (extractedCondition) {
    // Check for invalid conditions (dimensions, emojis, etc.)
    if (extractedCondition.match(/^\d+/) || // Starts with a number (likely dimensions)
        extractedCondition.match(/[^\w\s]$/) || // Ends with non-alphanumeric (likely emoji)
        extractedCondition.length > 30 || // Too long to be a valid condition
        extractedCondition.includes('cm') || // Contains dimensions
        extractedCondition.includes('mm') || // Contains dimensions
        extractedCondition.includes('tear') || // Describes damage, not condition
        extractedCondition.includes('small') || // Describes size, not condition
        extractedCondition.includes('large') || // Describes size, not condition
        extractedCondition.includes('thank') || // Thank you message, not condition
        extractedCondition.includes('please') || // Please message, not condition
        extractedCondition.includes('dm') || // DM message, not condition
        extractedCondition.includes('whatsapp')) { // WhatsApp message, not condition
      return; // Skip invalid conditions
    }
    
    // Map to standard categories
    for (const [category, keywords] of Object.entries(conditionCategories)) {
      if (keywords.some(keyword => extractedCondition.includes(keyword))) {
        listing.condition = category;
        return;
      }
    }
    
    // Special case for "good to very good" -> "VERY_GOOD"
    if (extractedCondition.includes('good to very good')) {
      listing.condition = 'VERY_GOOD';
      return;
    }
    
    // Special case for "fair to good" -> "GOOD"
    if (extractedCondition.includes('fair to good')) {
      listing.condition = 'GOOD';
      return;
    }
    
    // If we couldn't map to a standard category but it's a short, valid condition,
    // use the extracted condition but convert to uppercase for consistency
    if (extractedCondition.length < 20) {
      listing.condition = extractedCondition.toUpperCase();
    }
  }
}

/**
 * Extract collection areas from the listing text
 * 
 * @param {Object} listing - The listing to extract collection areas from
 */
function extractCollectionAreas(listing) {
  // Initialize collection areas array
  listing.collectionAreas = [];
  
  // Curated list of Cape Town locations
  const capeLocations = [
    // Major areas
    "Athlone", "Bellville", "Bergvliet", "Bishopscourt", "Brackenfell", 
    "Cape Town", "CBD", "Century City", "Claremont", "Constantia", 
    "Crawford", "Diep River", "Durbanville", "Edgemead", "Fish Hoek", 
    "Gardens", "Gatesville", "Goodwood", "Grassy Park", "Green Point", 
    "Harfield Village", "Heathfield", "Hout Bay", "Kenilworth", "Kirstenhof", 
    "Kuils River", "Loevenstein", "Malmesbury", "Milnerton", "Mitchells Plain", 
    "Mowbray", "Muizenberg", "Newlands", "Observatory", "Ottery", "Parow", 
    "Parklands", "Pinelands", "Plattekloof", "Plumstead", "Retreat", "Rondebosch", 
    "Sea Point", "Somerset West", "Stellenbosch", "Strandfontein", "Sunningdale", 
    "Table View", "Tokai", "Vredehoek", "West Beach", "Wetton", "Woodstock", "Wynberg",
    "Zeekoevlei", "Belgravia", "Southern Suburbs", "Rondebosch East", "Claremont Upper",
    "Wynberg Upper", "Little Mowbray", "Parow Valley", "Cape Gate", "Constantia Village",
    "Stonehurst"
  ];
  
  // Create a map of lowercase location names to their proper capitalization
  const locationMap = {};
  capeLocations.forEach(location => {
    locationMap[location.toLowerCase()] = location;
  });
  
  // Function to check if a word is a location
  const isLocation = (word) => {
    return locationMap[word.toLowerCase()] !== undefined;
  };
  
  // Clean up the text for processing
  const cleanText = listing.text
    .replace(/\bCollection:?\b/gi, '') // Remove "Collection:" to avoid false positives
    .replace(/\bCollect(?:ion)?\s+(?:from|at|in)\b/gi, '') // Remove "Collect from/at/in"
    .replace(/\bPick(?:\s*up|\s*-\s*up)(?:\s*from|\s*at|\s*in)\b/gi, '') // Remove "Pick up from/at/in"
    .replace(/\bMeet(?:\s*up)?\s+(?:in|at)\b/gi, ''); // Remove "Meet in/at"
  
  // Split the text into sentences
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
  
  // Process each sentence
  for (const sentence of sentences) {
    // Split the sentence into words
    const words = sentence.split(/\s+/);
    
    // Check for single-word locations
    for (const word of words) {
      const cleanWord = word.replace(/[,;:]/g, '').trim();
      if (isLocation(cleanWord)) {
        listing.collectionAreas.push(locationMap[cleanWord.toLowerCase()]);
      }
    }
    
    // Check for multi-word locations (e.g., "Sea Point", "Table View")
    for (let i = 0; i < words.length - 1; i++) {
      for (let j = 2; j > 0; j--) { // Check for 2-word and 3-word locations
        if (i + j < words.length) {
          const phrase = words.slice(i, i + j + 1).join(' ').replace(/[,;:]/g, '').trim();
          if (isLocation(phrase)) {
            listing.collectionAreas.push(locationMap[phrase.toLowerCase()]);
            i += j; // Skip the words we just matched
            break;
          }
        }
      }
    }
  }
  
  // Remove duplicates
  listing.collectionAreas = [...new Set(listing.collectionAreas)];
}

/**
 * Extract listings from a WhatsApp chat file
 * 
 * @param {string} filePath - Path to the WhatsApp chat export file
 * @param {string} whatsappGroup - The name of the WhatsApp group
 * @returns {Array} - Array of extracted listings
 */
function extractListingsFromFile(filePath, whatsappGroup) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return extractListings(content, whatsappGroup);
  } catch (error) {
    console.error(`Error extracting listings from file ${filePath}:`, error);
    return [];
  }
}

/**
 * Process all WhatsApp chat files in the specified directories
 * 
 * @param {Object} config - Configuration object with paths to chat files
 * @returns {Array} - Array of all extracted listings
 */
function processAllWhatsAppChats(config) {
  const allListings = [];
  
  // Process each chat file specified in the config
  for (const chatConfig of config.chatFiles) {
    const { filePath, groupName } = chatConfig;
    console.log(`Processing WhatsApp chat: ${groupName}`);
    
    const listings = extractListingsFromFile(filePath, groupName);
    console.log(`Extracted ${listings.length} listings from ${groupName}`);
    
    allListings.push(...listings);
  }
  
  return allListings;
}

module.exports = {
  extractListings,
  extractListingsFromFile,
  processAllWhatsAppChats
}; 