/**
 * Utility functions for categorizing listings using a weighted approach
 */

/**
 * Categorize a listing based on its text content using weighted pattern matching
 * @param {string} text The listing text to categorize
 * @returns {string} The determined category
 */
function categorizeListingByKeywords(text) {
  if (!text) return 'Other';
  
  const textLower = text.toLowerCase();
  
  // Category-specific patterns with weighted scoring
  const categoryPatterns = {
    'Clothing': [
      { pattern: /\b(clothing|clothes|dress|shirt|pants|shorts|onesie|romper|outfit|vest|sweater|jumper|pyjamas|bodysuit|sleepsuit|babygrow|bib|jersey)\b/i, weight: 1 },
      { pattern: /\b(size \d+|months|0-3|3-6|6-9|9-12|12-18|18-24)\b/i, weight: 0.5 }, // Size indicators
      { pattern: /\b(cotton|linen|wool|fleece|knit)\b/i, weight: 0.3 }, // Fabric types
      { pattern: /\b(h&m|ackermans|woolworths|woolies|keedo|cotton on|gap|naartjie|next|carters|pep|earthchild|cotton on|cath kid|mothercare)\b/i, weight: 0.7 } // Brand patterns
    ],
    'Toys': [
      { pattern: /\b(toy|game|play|puzzle|block|lego|duplo|figurine|doll|stuffed|plush|activity|educational|teddy|bear|wooden|playmat|play-mat|mat)\b/i, weight: 1 },
      { pattern: /\b(wooden|plastic|sensory|music|sound|light|interactive|stacking|sorting|soft|bath toy)\b/i, weight: 0.5 }
    ],
    'Furniture': [
      { pattern: /\b(furniture|chair|table|desk|cot|crib|bed|drawer|dresser|storage|cabinet|bookshelf|shelf|shelves|changing table|rocker|glider)\b/i, weight: 1 },
      { pattern: /\b(wooden|solid|pine|oak|assembled|ikea)\b/i, weight: 0.3 }
    ],
    'Footwear': [
      { pattern: /\b(shoe|boot|footwear|sandal|slipper|sneaker|trainer|sock|tights|booties)\b/i, weight: 1 },
      { pattern: /\b(size \d+|leather|canvas|velcro|lace)\b/i, weight: 0.4 },
      { pattern: /\b(nike|adidas|puma|new balance|woolworths|ackermans|vans|converse|tomy takkies)\b/i, weight: 0.5 }
    ],
    'Gear': [
      { pattern: /\b(stroller|pram|carrier|car seat|highchair|high chair|play pen|playpen|rocker|swing|walker|bouncer|baby monitor|monitor|backpack|travel|cot|camping|portable)\b/i, weight: 1 },
      { pattern: /\b(chicco|graco|peg perego|baby bjorn|ergo|doona|cybex|maxi-cosi|maclaren|bumbo|fisher price|skip hop)\b/i, weight: 0.7 }
    ],
    'Feeding': [
      { pattern: /\b(bottle|feeding|food|spoon|fork|bowl|cup|sippy|bib|breast pump|pump|sterilizer|formula|weaning|blender|mixer|freezer|storage)\b/i, weight: 1 },
      { pattern: /\b(avent|tommee tippee|dr brown|medela|pigeon|nuk|mam|bamboo|silicone|glass|plastic|bpa free)\b/i, weight: 0.6 }
    ],
    'Accessories': [
      { pattern: /\b(hat|cap|accessory|accessories|hair|clip|bow|watch|jewelry|sunglasses|glasses|bag|necklace|bracelet|headband|beanie)\b/i, weight: 1 },
      { pattern: /\b(cotton|adjustable|cute|adorable|matching|set|handmade)\b/i, weight: 0.2 }
    ],
    'Swimming': [
      { pattern: /\b(swim|swimming|pool|beach|float|life jacket|swimsuit|swimwear|costume|trunks|goggles|towel|rash|vest|sun|hat|protection)\b/i, weight: 1 },
      { pattern: /\b(uv|protection|sun|spf|waterproof)\b/i, weight: 0.4 }
    ],
    'Bedding': [
      { pattern: /\b(bedding|sheet|blanket|comforter|duvet|pillow|mattress|sleep bag|sleeping bag|sleep sack|cot|fitted|cover|protector|bassinet|moses basket)\b/i, weight: 1 },
      { pattern: /\b(cotton|organic|soft|cozy|warm|winter|summer|breathable)\b/i, weight: 0.3 }
    ],
    'Diapers': [
      { pattern: /\b(diaper|nappy|cloth|wipe|changing|change|mat|pad|cream|rash|potty|training|toilet|disposable)\b/i, weight: 1 },
      { pattern: /\b(pampers|huggies|bamboo|organic|reusable|eco|biodegradable)\b/i, weight: 0.6 }
    ],
    'Books': [
      { pattern: /\b(book|story|read|picture|board book|baby book|toddler book|educational|learning|alphabet|number|animal|bedtime)\b/i, weight: 1 },
      { pattern: /\b(set|collection|series|hardcover|paperback|illustrated|pages)\b/i, weight: 0.4 }
    ]
  };
  
  // Calculate score for each category
  const scores = {};
  Object.entries(categoryPatterns).forEach(([category, patterns]) => {
    scores[category] = patterns.reduce((score, { pattern, weight }) => {
      return score + (pattern.test(textLower) ? weight : 0);
    }, 0);
  });
  
  // Get category with highest score above threshold
  const highestScore = Math.max(...Object.values(scores));
  const highestCategory = Object.keys(scores).find(key => scores[key] === highestScore);
  
  // Only return category if score is above threshold
  const THRESHOLD = 0.5;
  return highestScore >= THRESHOLD ? highestCategory : 'Other';
}

/**
 * Extract the condition of an item from the listing text
 * @param {string} text The listing text
 * @returns {string|null} The condition (NEW, LIKE_NEW, EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR) or null if can't determine
 */
function extractCondition(text) {
  if (!text) return null;
  
  const textLower = text.toLowerCase();
  
  const conditionPatterns = {
    'NEW': [
      /\b(brand new|new with tags|nwt|new without tags|nwot|new|never used|never worn|unused|new in box|nib)\b/i
    ],
    'LIKE_NEW': [
      /\b(like new|almost new|pristine|mint|worn once|used once|worn twice|used twice|practically new|barely used|barely worn)\b/i
    ],
    'EXCELLENT': [
      /\b(excellent|pristine|perfect)\s+condition\b/i,
      /\bin\s+excellent\s+condition\b/i,
      /\bcondition\s*(?:is|:)?\s*excellent\b/i
    ],
    'VERY_GOOD': [
      /\b(very good|great)\s+condition\b/i,
      /\bin\s+(very good|great)\s+condition\b/i,
      /\bcondition\s*(?:is|:)?\s*(very good|great)\b/i
    ],
    'GOOD': [
      /\bgood\s+condition\b/i,
      /\bin\s+good\s+condition\b/i,
      /\bcondition\s*(?:is|:)?\s*good\b/i
    ],
    'FAIR': [
      /\b(fair|average|okay|ok)\s+condition\b/i,
      /\bin\s+(fair|average)\s+condition\b/i,
      /\bcondition\s*(?:is|:)?\s*(fair|average)\b/i
    ],
    'POOR': [
      /\b(poor|worn|used|well used|well worn)\s+condition\b/i,
      /\bin\s+(poor|worn)\s+condition\b/i,
      /\bcondition\s*(?:is|:)?\s*(poor|worn)\b/i
    ]
  };
  
  for (const [condition, patterns] of Object.entries(conditionPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(textLower)) {
        return condition;
      }
    }
  }
  
  return null;
}

/**
 * Extract collection areas from the listing text
 * @param {string} text The listing text
 * @returns {string[]} Array of collection areas
 */
function extractCollectionAreas(text) {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  
  // Common collection areas in Cape Town
  const areaPatterns = [
    { name: 'Athlone', patterns: [/\bathlone\b/i] },
    { name: 'Bellville', patterns: [/\bbellville\b/i] },
    { name: 'Bergvliet', patterns: [/\bbergvliet\b/i] },
    { name: 'Bishopscourt', patterns: [/\bbishopscourt\b/i] },
    { name: 'Brackenfell', patterns: [/\bbrackenfell\b/i] },
    { name: 'Cape Town CBD', patterns: [/\bcbd\b/i, /\bcape town\scbd\b/i, /\bcity center\b/i, /\bcity centre\b/i] },
    { name: 'Century City', patterns: [/\bcentury\s?city\b/i] },
    { name: 'Claremont', patterns: [/\bclaremont\b/i] },
    { name: 'Constantia', patterns: [/\bconstantia\b/i] },
    { name: 'Diep River', patterns: [/\bdiep\s?river\b/i] },
    { name: 'Durbanville', patterns: [/\bdurbanville\b/i] },
    { name: 'Fish Hoek', patterns: [/\bfish\s?hoek\b/i] },
    { name: 'Gatesville', patterns: [/\bgatesville\b/i] },
    { name: 'Goodwood', patterns: [/\bgoodwood\b/i] },
    { name: 'Green Point', patterns: [/\bgreen\s?point\b/i] },
    { name: 'Hout Bay', patterns: [/\bhout\s?bay\b/i] },
    { name: 'Kenilworth', patterns: [/\bkenilworth\b/i] },
    { name: 'Kirstenhof', patterns: [/\bkirstenhof\b/i] },
    { name: 'Kloof', patterns: [/\bkloof\b/i] },
    { name: 'Milnerton', patterns: [/\bmilnerton\b/i] },
    { name: 'Mowbray', patterns: [/\bmowbray\b/i] },
    { name: 'Muizenberg', patterns: [/\bmuizenberg\b/i] },
    { name: 'Newlands', patterns: [/\bnewlands\b/i] },
    { name: 'Observatory', patterns: [/\bobservatory\b/i, /\bobs\b/i] },
    { name: 'Parklands', patterns: [/\bparklands\b/i] },
    { name: 'Parow', patterns: [/\bparow\b/i] },
    { name: 'Pinelands', patterns: [/\bpinelands\b/i] },
    { name: 'Plumstead', patterns: [/\bplumstead\b/i] },
    { name: 'Rondebosch', patterns: [/\brondebosch\b/i] },
    { name: 'Sea Point', patterns: [/\bsea\s?point\b/i] },
    { name: 'Simons Town', patterns: [/\bsimons\s?town\b/i, /\bsimon'?s\s?town\b/i] },
    { name: 'Somerset West', patterns: [/\bsomerset\s?west\b/i] },
    { name: 'Southern Suburbs', patterns: [/\bsouthern\s?suburbs\b/i] },
    { name: 'Stellenbosch', patterns: [/\bstellenbosch\b/i] },
    { name: 'Strand', patterns: [/\bstrand\b/i] },
    { name: 'Strandfontein', patterns: [/\bstrandfontein\b/i] },
    { name: 'Table View', patterns: [/\btable\s?view\b/i] },
    { name: 'Tokai', patterns: [/\btokai\b/i] },
    { name: 'Tyger Valley', patterns: [/\btyger\s?valley\b/i] },
    { name: 'Vredehoek', patterns: [/\bvredehoek\b/i] },
    { name: 'Woodstock', patterns: [/\bwoodstock\b/i] },
    { name: 'Wynberg', patterns: [/\bwynberg\b/i] }
  ];
  
  // Collection-related patterns
  const collectionPatterns = [
    /\bcollection\s*:?\s*([^,\.]*)/i,
    /\bcollect\s*:?\s*([^,\.]*)/i,
    /\bcollect\s+in\s+([^,\.]*)/i,
    /\bcollect\s+from\s+([^,\.]*)/i,
    /\bpickup\s*:?\s*([^,\.]*)/i,
    /\bpick\s*up\s*:?\s*([^,\.]*)/i
  ];
  
  const areas = [];
  
  // First, check for explicit collection phrases
  for (const pattern of collectionPatterns) {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      const collectionText = match[1].trim();
      
      // Check this collection text against area patterns
      for (const area of areaPatterns) {
        if (area.patterns.some(p => p.test(collectionText))) {
          if (!areas.includes(area.name)) {
            areas.push(area.name);
          }
        }
      }
    }
  }
  
  // If no areas found in collection phrases, check the whole text
  if (areas.length === 0) {
    for (const area of areaPatterns) {
      if (area.patterns.some(p => p.test(textLower))) {
        areas.push(area.name);
      }
    }
  }
  
  return areas;
}

/**
 * Extract price from listing text
 * @param {string} text The listing text
 * @returns {number|null} The price as a number, or null if no price found
 */
function extractPrice(text) {
  if (!text) return null;
  
  const textLower = text.toLowerCase();
  
  // Various price patterns
  const pricePatterns = [
    /\bR\s*(\d+[.,]?\d*)\b/i,          // R100 or R100.50
    /\bR(\d+[.,]?\d*)\b/i,             // R100 without space
    /\b@R\s*(\d+[.,]?\d*)\b/i,         // @R100 
    /\b@R(\d+[.,]?\d*)\b/i,            // @R100 without space
    /\bprice\s*:?\s*R\s*(\d+[.,]?\d*)/i, // Price: R100
    /\bprice\s*:?\s*R(\d+[.,]?\d*)/i,   // Price:R100
    /\bcost\s*:?\s*R\s*(\d+[.,]?\d*)/i,  // Cost: R100
    /\bcost\s*:?\s*R(\d+[.,]?\d*)/i      // Cost:R100
  ];
  
  for (const pattern of pricePatterns) {
    const match = textLower.match(pattern);
    if (match && match[1]) {
      // Convert to number, handling both period and comma as decimal separator
      const priceStr = match[1].replace(',', '.');
      const price = parseFloat(priceStr);
      
      if (!isNaN(price)) {
        return price;
      }
    }
  }
  
  return null;
}

/**
 * Detect if a listing is an "In Search Of" (ISO) post
 * @param {string} text The listing text
 * @returns {boolean} True if it's an ISO post
 */
function isISOPost(text) {
  if (!text) return false;
  
  const textLower = text.toLowerCase();
  
  const isoPatterns = [
    /\biso\b/i,
    /\bin\s*search\s*of\b/i,
    /\blooking\s*for\b/i,
    /\banyone\s*(?:have|selling|got|has)\b/i,
    /\banybody\s*(?:have|selling|got|has)\b/i,
    /\banyone\s*know\s*where\b/i,
    /\bneeded\b/i,
    /\bsearching\s*for\b/i,
    /\bwanted\b/i,
    /\bneed\s*to\s*(?:buy|find|get)\b/i
  ];
  
  return isoPatterns.some(pattern => pattern.test(textLower));
}

/**
 * Process a listing to extract all relevant information
 * @param {Object} listing The raw listing object
 * @returns {Object} Enhanced listing with category, condition, price, etc.
 */
function processListing(listing) {
  // Deep clone to avoid modifying the original
  const processedListing = JSON.parse(JSON.stringify(listing));
  
  // Apply each extraction function if not already set
  if (!processedListing.category) {
    processedListing.category = categorizeListingByKeywords(processedListing.text);
  }
  
  if (!processedListing.condition) {
    processedListing.condition = extractCondition(processedListing.text);
  }
  
  if (!processedListing.collectionAreas || processedListing.collectionAreas.length === 0) {
    processedListing.collectionAreas = extractCollectionAreas(processedListing.text);
  }
  
  if (processedListing.price === undefined || processedListing.price === null) {
    processedListing.price = extractPrice(processedListing.text);
  }
  
  if (processedListing.isISO === undefined) {
    processedListing.isISO = isISOPost(processedListing.text);
  }
  
  return processedListing;
}

module.exports = {
  categorizeListingByKeywords,
  extractCondition,
  extractCollectionAreas,
  extractPrice,
  isISOPost,
  processListing
}; 