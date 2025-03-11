/**
 * Consolidated listing parser module
 * 
 * This module handles the extraction and processing of listings from WhatsApp chat exports:
 * - Extracting listings from WhatsApp chat exports
 * - Parsing listing details (price, condition, collection areas)
 * - Detecting ISO (In Search Of) listings
 * - Extracting phone numbers from listing text
 */

const { WHATSAPP_GROUPS } = require('./imageHandler');

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
    
    // Check if this is a new message line (starts with date pattern)
    const dateMatch = line.match(/^\[?(\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4})[,\s]+(\d{1,2}:\d{1,2}(?::\d{1,2})?)\]?\s+-\s+([^:]+):\s*(.*)/);
    
    if (dateMatch) {
      // If we have a current listing, save it before starting a new one
      if (currentListing) {
        results.push(currentListing);
      }
      
      // Extract date, time, sender, and text from the match
      const [, datePart, timePart, sender, text] = dateMatch;
      
      // Create a new listing object
      currentListing = {
        whatsappGroup,
        date: `${datePart} ${timePart}`,
        sender: sender.trim(),
        text: text.trim(),
        images: []
      };
    } else if (line.includes('<attached:') && currentListing) {
      // This is an image attachment line
      const imageMatch = line.match(/<attached:\s*([^>]+)>/);
      if (imageMatch) {
        const imageName = imageMatch[1].trim();
        currentListing.images.push(imageName);
      }
    } else if (line.trim() && currentListing) {
      // This is a continuation of the previous message
      currentListing.text += ' ' + line.trim();
    }
  }
  
  // Don't forget to add the last listing
  if (currentListing) {
    results.push(currentListing);
  }
  
  return results;
}

/**
 * Extract price from listing text
 * 
 * @param {string} text - The listing text
 * @returns {number|null} - The extracted price or null if not found
 */
function extractPrice(text) {
  if (!text) return null;
  
  // Look for price patterns like "R100", "R 100", "100 rand", etc.
  const pricePatterns = [
    /(?:^|\s)R\s?(\d+(?:[,.]\d+)?)/i,  // R100 or R 100
    /(?:^|\s)(\d+(?:[,.]\d+)?)\s?(?:rand|r)/i,  // 100 rand or 100r
    /(?:^|\s)(?:price|selling for|selling at|asking)(?:[:\s]+)R?\s?(\d+(?:[,.]\d+)?)/i,  // Price: 100 or Selling for R100
    /(?:^|\s)(\d+(?:[,.]\d+)?)\s?(?:ZAR|rands)/i  // 100 ZAR or 100 rands
  ];
  
  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Convert the matched price to a number
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  
  return null;
}

/**
 * Extract condition from listing text
 * 
 * @param {string} text - The listing text
 * @returns {string|null} - The extracted condition or null if not found
 */
function extractCondition(text) {
  if (!text) return null;
  
  const textLower = text.toLowerCase();
  
  // Define condition patterns with their corresponding standardized values
  const conditionPatterns = [
    { pattern: /\bnew\b|\bbrand new\b|\bnever used\b|\bunused\b|\bstill in box\b|\bstill in packaging\b/i, value: 'NEW' },
    { pattern: /\blike new\b|\balmost new\b|\bbarely used\b|\bhardly used\b/i, value: 'LIKE_NEW' },
    { pattern: /\bvery good\b|\bvery good condition\b|\bexcellent\b|\bexcellent condition\b/i, value: 'VERY_GOOD' },
    { pattern: /\bgood\b|\bgood condition\b|\bwell maintained\b/i, value: 'GOOD' },
    { pattern: /\bfair\b|\bfair condition\b|\baverage\b|\baverage condition\b/i, value: 'FAIR' },
    { pattern: /\bpoor\b|\bpoor condition\b|\bworn\b|\bneeds repair\b|\bneeds fixing\b/i, value: 'POOR' }
  ];
  
  for (const { pattern, value } of conditionPatterns) {
    if (pattern.test(textLower)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extract collection areas from listing text
 * 
 * @param {string} text - The listing text
 * @returns {string[]} - Array of extracted collection areas
 */
function extractCollectionAreas(text) {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  
  // Common Cape Town areas and suburbs
  const capeTownAreas = [
    'Athlone', 'Bellville', 'Bergvliet', 'Bishopscourt', 'Bloubergstrand', 'Bo-Kaap', 
    'Brackenfell', 'Camps Bay', 'Cape Town', 'Century City', 'Claremont', 'Constantia', 
    'Delft', 'Diep River', 'Durbanville', 'Edgemead', 'Fish Hoek', 'Fresnaye', 
    'Gardens', 'Goodwood', 'Green Point', 'Gugulethu', 'Hout Bay', 'Kalk Bay', 
    'Kenilworth', 'Khayelitsha', 'Kommetjie', 'Kraaifontein', 'Kuils River', 
    'Langa', 'Lansdowne', 'Maitland', 'Milnerton', 'Mitchell\'s Plain', 'Muizenberg', 
    'Newlands', 'Noordhoek', 'Observatory', 'Oranjezicht', 'Parow', 'Pinelands', 
    'Plumstead', 'Rondebosch', 'Sea Point', 'Simon\'s Town', 'Somerset West', 
    'Stellenbosch', 'Strand', 'Strandfontein', 'Sun Valley', 'Table View', 
    'Tamboerskloof', 'Thornton', 'Tokai', 'Vredehoek', 'Woodstock', 'Wynberg',
    'Gatesville', 'Ottery', 'Retreat', 'Grassy Park', 'Southfield', 'Heathfield',
    'Parklands', 'Sunningdale', 'Melkbosstrand', 'Bothasig', 'Richwood', 'Panorama',
    'Welgemoed', 'Tygervalley', 'Plattekloof', 'Kuilsriver', 'Eerste River', 'Blackheath',
    'Mowbray', 'Salt River', 'Zonnebloem', 'Walmer Estate', 'University Estate',
    'Paarl', 'Wellington', 'Franschhoek', 'Malmesbury', 'Atlantis', 'Melkbosstrand',
    'Blouberg', 'Big Bay', 'Sunset Beach', 'Milnerton Ridge', 'Joe Slovo', 'Phoenix',
    'Summer Greens', 'Montague Gardens', 'Marconi Beam', 'Rugby', 'Brooklyn', 'Ysterplaat',
    'Bergvliet', 'Meadowridge', 'Kreupelbosch', 'Elfindale', 'Steenberg', 'Lakeside',
    'Muizenberg', 'Marina da Gama', 'Capricorn', 'Vrygrond', 'Lavender Hill', 'Seawinds',
    'Pelican Park', 'Lotus River', 'Parkwood', 'Fairways', 'Wetton', 'Ottery', 'Ferness',
    'Lansdowne', 'Crawford', 'Rondebosch East', 'Belgravia', 'Rylands', 'Penlyn Estate',
    'Pinati', 'Newfields', 'Hanover Park', 'Manenberg', 'Heideveld', 'Vanguard Estate',
    'Welcome Estate', 'Bonteheuwel', 'Bishop Lavis', 'Matroosfontein', 'Elsies River',
    'Cravenby', 'Avonwood', 'Uitsig', 'Ravensmead', 'Florida', 'Parow Valley', 'Beaconvale',
    'Oosterzee', 'De Tijger', 'Vredelust', 'Boston', 'Bellville South', 'Oakdale', 'Stellenberg',
    'Eversdal', 'Stellenridge', 'Protea Valley', 'Ridgeworth', 'Rosendal', 'Durbanville Hills',
    'Vierlanden', 'Sonstraal', 'Sonstraal Heights', 'Rosenpark', 'Kenridge', 'Durbell',
    'Pinehurst', 'Stellenbosch Farms', 'Kuilsriver', 'Sarepta', 'Highbury', 'Greenfields',
    'Blackheath', 'Eerste River', 'Mfuleni', 'Blue Downs', 'Kleinvlei', 'Malibu Village',
    'Hagley', 'Forest Heights', 'Macassar', 'Firgrove', 'Somerset West', 'Strand', 'Gordon\'s Bay',
    'Sir Lowry\'s Pass', 'Nomzamo', 'Lwandle', 'Broadlands', 'Faure', 'Croydon', 'Paarl',
    'Mbekweni', 'Wellington', 'Hermon', 'Gouda', 'Saron', 'Porterville', 'Piketberg',
    'Velddrif', 'Laaiplek', 'Dwarskersbos', 'Eendekuil', 'Aurora', 'Redelinghuys',
    'Bergvliet', 'Diep River', 'Meadowridge', 'Southfield', 'Plumstead', 'Wynberg',
    'Kenilworth', 'Claremont', 'Lansdowne', 'Rondebosch', 'Mowbray', 'Observatory',
    'Salt River', 'Woodstock', 'Cape Town CBD', 'Gardens', 'Vredehoek', 'Devil\'s Peak',
    'University Estate', 'Walmer Estate', 'Zonnebloem', 'District Six', 'Bo-Kaap',
    'De Waterkant', 'Green Point', 'Mouille Point', 'Three Anchor Bay', 'Sea Point',
    'Fresnaye', 'Bantry Bay', 'Clifton', 'Camps Bay', 'Bakoven', 'Llandudno', 'Hout Bay',
    'Noordhoek', 'Kommetjie', 'Scarborough', 'Misty Cliffs', 'Simon\'s Town', 'Glencairn',
    'Welcome Glen', 'Da Gama Park', 'Fish Hoek', 'Clovelly', 'Kalk Bay', 'St James',
    'Muizenberg', 'Marina da Gama', 'Lakeside', 'Westlake', 'Kirstenhof', 'Tokai',
    'Constantia', 'Bishopscourt', 'Fernwood', 'Newlands', 'Rosebank', 'Mowbray',
    'Pinelands', 'Thornton', 'Goodwood', 'Bothasig', 'Edgemead', 'Monte Vista',
    'Panorama', 'Plattekloof', 'Welgemoed', 'Bellville', 'Stikland', 'Parow',
    'Ravensmead', 'Elsies River', 'Matroosfontein', 'Bishop Lavis', 'Bonteheuwel',
    'Valhalla Park', 'Nooitgedacht', 'Belhar', 'Delft', 'Belhar', 'Delft', 'Blue Downs',
    'Kuils River', 'Blackheath', 'Eerste River', 'Melton Rose', 'Mfuleni', 'Faure',
    'Macassar', 'Firgrove', 'Somerset West', 'Strand', 'Gordon\'s Bay', 'Grabouw',
    'Villiersdorp', 'Franschhoek', 'Pniel', 'Kylemore', 'Paarl', 'Wellington',
    'Hermon', 'Gouda', 'Tulbagh', 'Wolseley', 'Ceres', 'Prince Alfred Hamlet',
    'Op-die-Berg', 'Koue Bokkeveld', 'Citrusdal', 'Clanwilliam', 'Graafwater',
    'Lambert\'s Bay', 'Elands Bay', 'Leipoldtville', 'Vredendal', 'Lutzville',
    'Koekenaap', 'Klawer', 'Vanrhynsdorp', 'Nieuwoudtville', 'Loeriesfontein',
    'Calvinia', 'Brandvlei', 'Kenhardt', 'Pofadder', 'Onseepkans', 'Pella',
    'Port Nolloth', 'Alexander Bay', 'Springbok', 'Okiep', 'Nababeep', 'Steinkopf',
    'Vioolsdrif', 'Eksteenfontein', 'Lekkersing', 'Hondeklipbaai', 'Koingnaas',
    'Kleinzee', 'Garies', 'Kamieskroon', 'Bitterfontein', 'Nuwerus', 'Kliprand',
    'Rietpoort', 'Molsvlei', 'Putsekloof', 'Redelinghuys', 'Eendekuil', 'Aurora',
    'Piketberg', 'Porterville', 'Saron', 'Gouda', 'Tulbagh', 'Wolseley', 'Ceres',
    'Prince Alfred Hamlet', 'Op-die-Berg', 'Koue Bokkeveld', 'Citrusdal', 'Clanwilliam',
    'Graafwater', 'Lambert\'s Bay', 'Elands Bay', 'Leipoldtville', 'Vredendal',
    'Lutzville', 'Koekenaap', 'Klawer', 'Vanrhynsdorp', 'Nieuwoudtville',
    'Loeriesfontein', 'Calvinia', 'Brandvlei', 'Kenhardt', 'Pofadder', 'Onseepkans',
    'Pella', 'Port Nolloth', 'Alexander Bay', 'Springbok', 'Okiep', 'Nababeep',
    'Steinkopf', 'Vioolsdrif', 'Eksteenfontein', 'Lekkersing', 'Hondeklipbaai',
    'Koingnaas', 'Kleinzee', 'Garies', 'Kamieskroon', 'Bitterfontein', 'Nuwerus',
    'Kliprand', 'Rietpoort', 'Molsvlei', 'Putsekloof'
  ];
  
  // Look for collection/pickup/meetup patterns
  const collectionPatterns = [
    /(?:collect|pickup|pick up|pick-up|collection|meet|meetup|meeting|available)(?:\s+(?:in|at|from))?\s+([A-Za-z\s']+)/i,
    /(?:based|located)(?:\s+(?:in|at))?\s+([A-Za-z\s']+)/i
  ];
  
  const foundAreas = new Set();
  
  // Check for explicit collection areas using patterns
  for (const pattern of collectionPatterns) {
    const matches = textLower.match(pattern);
    if (matches && matches[1]) {
      const potentialArea = matches[1].trim();
      
      // Check if the potential area contains any known Cape Town areas
      for (const area of capeTownAreas) {
        if (potentialArea.includes(area.toLowerCase())) {
          foundAreas.add(area);
        }
      }
    }
  }
  
  // Also check for direct mentions of areas in the text
  for (const area of capeTownAreas) {
    if (textLower.includes(area.toLowerCase())) {
      foundAreas.add(area);
    }
  }
  
  return Array.from(foundAreas);
}

/**
 * Check if a listing is an "In Search Of" (ISO) post
 * 
 * @param {string} text - The listing text
 * @param {Object} options - Additional options
 * @param {boolean} options.noPriceAsISO - Whether to consider listings without a price as ISO
 * @param {number} options.price - The price of the listing, if known
 * @returns {boolean} - Whether the listing is an ISO post
 */
function isISOPost(text, options = {}) {
  if (!text) return false;
  
  const textLower = text.toLowerCase().trim();
  const { noPriceAsISO = false, price = null } = options;
  
  // If the price is known and there's no price, consider it an ISO (if option is enabled)
  if (noPriceAsISO && price === null) {
    // But only if it doesn't explicitly mention 'selling', 'for sale', or include a price indicator
    if (!textLower.includes('selling') && 
        !textLower.includes('for sale') && 
        !textLower.includes('rand') && 
        !textLower.includes('price') && 
        !/r\s*\d+/.test(textLower) && // R followed by numbers
        !/\d+\s*r/.test(textLower)) { // numbers followed by R
      return true;
    }
  }
  
  // Common ISO indicators with more flexible patterns
  const isoPatterns = [
    /\biso\b/i,  // ISO as a standalone word
    /\bin search of\b/i,  // "in search of"
    /\blooking for\b/i,  // "looking for"
    /\bwanted\b/i,  // "wanted"
    /\bneeding\b/i,  // "needing"
    /\banyone.*\bhave\b/i,  // "anyone... have" - more flexible pattern
    /\banyone.*\bgot\b/i,   // "anyone... got" - more flexible pattern
    /\banyone.*selling/i,   // "anyone... selling" - more flexible pattern
    /\banybody.*\bhave\b/i, // "anybody... have" - more flexible pattern
    /\banybody.*\bgot\b/i,  // "anybody... got" - more flexible pattern
    /\bdoes anyone\b/i,     // "does anyone"
    /\bcan anyone\b/i,      // "can anyone"
    /\bwhere can i\b/i,     // "where can I"
    /\banyone know where\b/i, // "anyone know where"
    /\blooking to\b/i,      // "looking to"
    /\bwant to buy\b/i,     // "want to buy"
    /\bneeded\b/i,          // "needed"
    /\banyone with\b/i,     // "anyone with"
    /\bhelp find\b/i,       // "help find"
    /\bneed urgent\b/i,     // "need urgent"
    /\bsearch\b/i,          // "search"
    /^any /i,               // Starting with "Any"
    /^hello.*anyone/i,      // Starting with "Hello" followed by "anyone"
    /^hi.*anyone/i,         // Starting with "Hi" followed by "anyone"
    /\bcan someone\b/i,     // "can someone"
    /\?$/                   // Ends with a question mark
  ];
  
  for (const pattern of isoPatterns) {
    if (pattern.test(textLower)) {
      return true;
    }
  }
  
  // Check for question-style posts (likely asking for items)
  const questionIndicators = textLower.split(' ').filter(word => 
    ['who', 'what', 'where', 'when', 'why', 'how', 'does', 'is', 'are', 'can', 'could', 'would', 'should'].includes(word)
  );
  
  // If it has multiple question words and ends with a question mark, it's likely an ISO
  if (questionIndicators.length >= 1 && textLower.includes('?')) {
    return true;
  }
  
  return false;
}

/**
 * Process a raw listing to extract additional information
 * 
 * @param {Object} rawListing - The raw listing object
 * @param {Object} options - Additional options
 * @param {boolean} options.noPriceAsISO - Whether to consider listings without a price as ISO
 * @returns {Object} - The processed listing with additional fields
 */
function processListing(rawListing, options = {}) {
  const { text } = rawListing;
  const { noPriceAsISO = true } = options; // Default to true - treat no price as ISO
  
  // Extract additional information from the listing text
  const price = extractPrice(text);
  const condition = extractCondition(text);
  const collectionAreas = extractCollectionAreas(text);
  
  // Pass price information to isISOPost
  const isISO = isISOPost(text, { 
    noPriceAsISO, 
    price 
  });
  
  // Return the processed listing with additional fields
  return {
    ...rawListing,
    price,
    condition,
    collectionAreas,
    isISO
  };
}

/**
 * Extract phone number from listing text
 * 
 * @param {string} text - The listing text to extract phone number from
 * @returns {string|null} - The extracted phone number or null if not found
 */
function extractPhoneNumber(text) {
  if (!text) return null;
  
  // Common South African phone number patterns
  const patterns = [
    // 10-digit numbers with optional spaces, dashes, or dots
    /(?<!\d)0\d{2}[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g,
    
    // Numbers with country code +27
    /(?<!\d)\+27[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g,
    
    // Numbers with country code 27
    /(?<!\d)27[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g,
    
    // WhatsApp format with @ symbol
    /(?<!\d)27\d{9}@(?:s\.whatsapp\.net|c\.us)(?!\d)/g
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean up the phone number (remove spaces, dashes, dots)
      let phoneNumber = matches[0].replace(/[\s.-]/g, '');
      
      // Remove WhatsApp suffix if present
      phoneNumber = phoneNumber.replace(/@(?:s\.whatsapp\.net|c\.us)$/, '');
      
      // Normalize to start with 0 if it starts with 27
      if (phoneNumber.startsWith('27') && phoneNumber.length === 11) {
        phoneNumber = '0' + phoneNumber.substring(2);
      }
      
      // Normalize to start with 0 if it starts with +27
      if (phoneNumber.startsWith('+27') && phoneNumber.length === 12) {
        phoneNumber = '0' + phoneNumber.substring(3);
      }
      
      return phoneNumber;
    }
  }
  
  return null;
}

module.exports = {
  extractListings,
  extractPrice,
  extractCondition,
  extractCollectionAreas,
  isISOPost,
  processListing,
  extractPhoneNumber
}; 