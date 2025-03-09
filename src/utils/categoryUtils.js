/**
 * Consolidated category utilities module
 * 
 * This module handles the categorization of listings:
 * - Categorizing listings based on text content using weighted pattern matching
 * - Providing category definitions and patterns
 * - Handling LLM-based categorization for ambiguous listings
 */

// Define all possible categories with their patterns and weights
const CATEGORIES = {
  'Clothing': {
    patterns: [
      { pattern: /\b(clothing|clothes|dress|shirt|pants|shorts|onesie|romper|outfit|vest|sweater|jumper|pyjamas|bodysuit|sleepsuit|babygrow|bib|jersey)\b/i, weight: 1 },
      { pattern: /\b(size \d+|months|0-3|3-6|6-9|9-12|12-18|18-24)\b/i, weight: 0.5 }, // Size indicators
      { pattern: /\b(cotton|linen|wool|fleece|knit)\b/i, weight: 0.3 }, // Fabric types
      { pattern: /\b(h&m|ackermans|woolworths|woolies|keedo|cotton on|gap|naartjie|next|carters|pep|earthchild|cotton on|cath kid|mothercare)\b/i, weight: 0.7 } // Brand patterns
    ],
    description: 'Baby and toddler clothing items including outfits, dresses, shirts, pants, etc.'
  },
  'Toys': {
    patterns: [
      { pattern: /\b(toy|game|play|puzzle|block|lego|duplo|figurine|doll|stuffed|plush|activity|educational|teddy|bear|wooden|playmat|play-mat|mat)\b/i, weight: 1 },
      { pattern: /\b(wooden|plastic|sensory|music|sound|light|interactive|stacking|sorting|soft|bath toy)\b/i, weight: 0.5 }
    ],
    description: 'Toys, games, puzzles, dolls, and play items for babies and toddlers'
  },
  'Furniture': {
    patterns: [
      { pattern: /\b(furniture|chair|table|desk|cot|crib|bed|drawer|dresser|storage|cabinet|bookshelf|shelf|shelves|changing table|rocker|glider)\b/i, weight: 1 },
      { pattern: /\b(wooden|solid|pine|oak|assembled|ikea)\b/i, weight: 0.3 }
    ],
    description: 'Furniture items for babies and toddlers including cribs, beds, chairs, tables, etc.'
  },
  'Footwear': {
    patterns: [
      { pattern: /\b(shoe|boot|footwear|sandal|slipper|sneaker|trainer|sock|tights|booties)\b/i, weight: 1 },
      { pattern: /\b(size \d+|leather|canvas|velcro|lace)\b/i, weight: 0.4 },
      { pattern: /\b(nike|adidas|puma|new balance|woolworths|ackermans|vans|converse|tomy takkies)\b/i, weight: 0.5 }
    ],
    description: 'Footwear for babies and toddlers including shoes, boots, sandals, socks, etc.'
  },
  'Gear': {
    patterns: [
      { pattern: /\b(stroller|pram|carrier|car seat|highchair|high chair|play pen|playpen|rocker|swing|walker|bouncer|baby monitor|monitor|backpack|travel|cot|camping|portable)\b/i, weight: 1 },
      { pattern: /\b(chicco|graco|peg perego|baby bjorn|ergo|doona|cybex|maxi-cosi|maclaren|bumbo|fisher price|skip hop)\b/i, weight: 0.7 }
    ],
    description: 'Baby gear including strollers, car seats, carriers, high chairs, etc.'
  },
  'Feeding': {
    patterns: [
      { pattern: /\b(bottle|feeding|food|spoon|fork|bowl|cup|sippy|bib|breast pump|pump|sterilizer|formula|weaning|blender|mixer|freezer|storage)\b/i, weight: 1 },
      { pattern: /\b(avent|tommee tippee|dr brown|medela|pigeon|nuk|mam|bamboo|silicone|glass|plastic|bpa free)\b/i, weight: 0.6 }
    ],
    description: 'Feeding items including bottles, bibs, breast pumps, sterilizers, etc.'
  },
  'Accessories': {
    patterns: [
      { pattern: /\b(hat|cap|accessory|accessories|hair|clip|bow|watch|jewelry|sunglasses|glasses|bag|necklace|bracelet|headband|beanie)\b/i, weight: 1 },
      { pattern: /\b(cotton|adjustable|cute|adorable|matching|set|handmade)\b/i, weight: 0.2 }
    ],
    description: 'Accessories for babies and toddlers including hats, hair clips, bags, etc.'
  },
  'Swimming': {
    patterns: [
      { pattern: /\b(swim|swimming|pool|beach|float|life jacket|swimsuit|swimwear|costume|trunks|goggles|towel|rash|vest|sun|hat|protection)\b/i, weight: 1 },
      { pattern: /\b(uv|protection|sun|spf|waterproof)\b/i, weight: 0.4 }
    ],
    description: 'Swimming items including swimsuits, floats, life jackets, etc.'
  },
  'Books': {
    patterns: [
      { pattern: /\b(book|story|read|board book|picture book|children|baby book|toddler book|bedtime|library)\b/i, weight: 1 },
      { pattern: /\b(hardcover|paperback|collection|series|set|educational|learning)\b/i, weight: 0.5 }
    ],
    description: 'Books for babies and toddlers including board books, picture books, etc.'
  },
  'Safety': {
    patterns: [
      { pattern: /\b(safety|gate|lock|guard|corner|edge|protector|socket|cover|monitor|alarm|helmet|harness)\b/i, weight: 1 },
      { pattern: /\b(baby proof|babyproof|childproof|child proof|secure|protection)\b/i, weight: 0.7 }
    ],
    description: 'Safety items including gates, locks, monitors, etc.'
  },
  'Bedding': {
    patterns: [
      { pattern: /\b(bedding|sheet|blanket|duvet|comforter|pillow|mattress|sleep sack|sleeping bag|swaddle|cot|crib)\b/i, weight: 1 },
      { pattern: /\b(cotton|fitted|flat|waterproof|protector|cover|tog|warm|breathable)\b/i, weight: 0.4 }
    ],
    description: 'Bedding items including sheets, blankets, pillows, mattresses, etc.'
  },
  'Diapering': {
    patterns: [
      { pattern: /\b(diaper|nappy|changing|wipe|cloth|disposable|mat|caddy|pail|bin|rash|cream|pampers|huggies|bamboo)\b/i, weight: 1 },
      { pattern: /\b(size \d+|newborn|overnight|swim|travel|reusable|washable)\b/i, weight: 0.5 }
    ],
    description: 'Diapering items including diapers, wipes, changing mats, etc.'
  },
  'Health': {
    patterns: [
      { pattern: /\b(health|medicine|thermometer|nasal|aspirator|humidifier|vaporizer|first aid|band aid|bandage|cream|ointment)\b/i, weight: 1 },
      { pattern: /\b(digital|infrared|forehead|ear|bath|room|baby|kit|set|emergency)\b/i, weight: 0.4 }
    ],
    description: 'Health items including thermometers, humidifiers, first aid kits, etc.'
  },
  'Bath': {
    patterns: [
      { pattern: /\b(bath|tub|towel|washcloth|soap|shampoo|lotion|oil|powder|sponge|hooded|robe|seat|support|rinser|spout)\b/i, weight: 1 },
      { pattern: /\b(baby|infant|toddler|gentle|mild|tear-free|natural|organic|sensitive|skin)\b/i, weight: 0.3 }
    ],
    description: 'Bath items including tubs, towels, soaps, shampoos, etc.'
  }
};

// Default category when no strong match is found
const DEFAULT_CATEGORY = 'Other';

/**
 * Calculate the category score for a text based on pattern matching
 * 
 * @param {string} text - The text to categorize
 * @param {Array} patterns - Array of pattern objects with pattern and weight properties
 * @returns {number} - The calculated score
 */
function calculateCategoryScore(text, patterns) {
  if (!text) return 0;
  
  const textLower = text.toLowerCase();
  let score = 0;
  
  for (const { pattern, weight } of patterns) {
    // Count occurrences of the pattern in the text
    const matches = textLower.match(pattern);
    if (matches) {
      // Add the weight for each match
      score += matches.length * weight;
    }
  }
  
  return score;
}

/**
 * Categorize a listing based on its text content using weighted pattern matching
 * 
 * @param {string} text - The listing text to categorize
 * @returns {Object} - Object containing the category and confidence score
 */
function categorizeByKeywords(text) {
  if (!text) return { category: DEFAULT_CATEGORY, confidence: 0 };
  
  // Calculate scores for each category
  const scores = {};
  let maxScore = 0;
  let bestCategory = DEFAULT_CATEGORY;
  
  for (const [category, { patterns }] of Object.entries(CATEGORIES)) {
    const score = calculateCategoryScore(text, patterns);
    scores[category] = score;
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  // If the max score is too low, use the default category
  const confidence = maxScore;
  if (maxScore < 0.5) {
    return { category: DEFAULT_CATEGORY, confidence, scores };
  }
  
  return { category: bestCategory, confidence, scores };
}

/**
 * Process a listing to extract category and other information
 * 
 * @param {Object} listing - The listing object
 * @returns {Object} - The processed listing with category information
 */
function processListing(listing) {
  const { text } = listing;
  
  // Categorize the listing
  const { category, confidence } = categorizeByKeywords(text);
  
  // Return the processed listing with category information
  return {
    ...listing,
    category,
    categoryConfidence: confidence
  };
}

/**
 * Get all available categories with their descriptions
 * 
 * @returns {Object} - Object with category names as keys and descriptions as values
 */
function getAllCategories() {
  const result = {};
  
  for (const [category, { description }] of Object.entries(CATEGORIES)) {
    result[category] = description;
  }
  
  // Add the default category
  result[DEFAULT_CATEGORY] = 'Miscellaneous items that don\'t fit into other categories';
  
  return result;
}

/**
 * Get listings that need better categorization (low confidence or 'Other' category)
 * 
 * @param {Array} listings - Array of listing objects
 * @param {number} confidenceThreshold - Minimum confidence threshold (default: 0.7)
 * @returns {Array} - Array of listings that need better categorization
 */
function getListingsNeedingBetterCategorization(listings, confidenceThreshold = 0.7) {
  return listings.filter(listing => 
    listing.category === DEFAULT_CATEGORY || 
    (listing.categoryConfidence && listing.categoryConfidence < confidenceThreshold)
  );
}

module.exports = {
  categorizeByKeywords,
  processListing,
  getAllCategories,
  getListingsNeedingBetterCategorization,
  CATEGORIES,
  DEFAULT_CATEGORY
}; 