/**
 * Consolidated listing parser module
 * 
 * This module handles the extraction and processing of listings from WhatsApp chat exports:
 * - Extracting listings from WhatsApp chat exports
 * - Parsing listing details (price, condition, collection areas)
 * - Detecting ISO (In Search Of) listings
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
 * @returns {boolean} - Whether the listing is an ISO post
 */
function isISOPost(text) {
  if (!text) return false;
  
  const textLower = text.toLowerCase();
  
  // Common ISO indicators
  const isoPatterns = [
    /\biso\b/i,  // ISO as a standalone word
    /\bin search of\b/i,  // "in search of"
    /\blooking for\b/i,  // "looking for"
    /\bwanted\b/i,  // "wanted"
    /\banyone (?:have|selling|got)\b/i,  // "anyone have/selling/got"
    /\banybody (?:have|selling|got)\b/i  // "anybody have/selling/got"
  ];
  
  for (const pattern of isoPatterns) {
    if (pattern.test(textLower)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Process a raw listing extracted from WhatsApp
 * 
 * @param {Object} rawListing - The raw listing object
 * @returns {Object} - The processed listing with additional fields
 */
function processListing(rawListing) {
  const { text } = rawListing;
  
  // Extract additional information from the listing text
  const price = extractPrice(text);
  const condition = extractCondition(text);
  const collectionAreas = extractCollectionAreas(text);
  const isISO = isISOPost(text);
  
  // Return the processed listing with additional fields
  return {
    ...rawListing,
    price,
    condition,
    collectionAreas,
    isISO
  };
}

module.exports = {
  extractListings,
  extractPrice,
  extractCondition,
  extractCollectionAreas,
  isISOPost,
  processListing
}; 