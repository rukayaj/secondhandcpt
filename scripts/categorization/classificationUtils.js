/**
 * Classification Utilities
 * 
 * This module provides common functions for classifying listings
 * that can be shared across multiple classification scripts.
 */

const { createClient } = require('@supabase/supabase-js');

/**
 * Get a Supabase client with admin privileges
 * @returns {Object} Supabase client
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Regular expressions for ISO post detection
const ISO_PATTERNS = [
  /\b(?:iso|looking for|searching for|in search of|anyone have|anyone selling|does anyone have)\b/i,
  /\b(?:needed|need|want|wanted|looking to buy|looking to purchase)\b/i,
  /\b(?:any.+selling|any.+available|any.+for sale)\b/i,
  /\b(?:please pm|please message|please dm|please share|please let me know)\b/i,
  /\b(?:would like to buy|would love to buy|who sells|who has|who is selling)\b/i,
  /\b(?:can anyone recommend|can anyone suggest|recommendations for)\b/i
];

/**
 * Determine if a message is an ISO post using pattern matching
 * @param {string} text - The message text to analyze
 * @returns {boolean} True if the message is an ISO post
 */
function isISOPostByPattern(text) {
  if (!text) return false;
  
  // If no price is mentioned, it's more likely to be an ISO post
  const hasPricePattern = /\b(?:R\s*\d+|\d+\s*R|\d+\s*rand|\d+\s*ZAR|selling for \d+)\b/i;
  const hasNoPrice = !hasPricePattern.test(text);
  
  // Check for direct ISO patterns
  const hasISOPattern = ISO_PATTERNS.some(pattern => pattern.test(text));
  
  return hasISOPattern || (hasNoPrice && text.length < 100);
}

/**
 * Simple category detection based on keywords
 * @param {string} text - The message text to analyze
 * @returns {string} Detected category or "Uncategorised"
 */
function detectCategoryByKeywords(text) {
  if (!text) return "Uncategorised";
  
  const lowerText = text.toLowerCase();
  
  // Define category patterns
  const categoryPatterns = {
    "Clothing": [
      /\b(?:clothes|clothing|shirt|tshirt|t-shirt|top|jacket|pants|trousers|onesie|vest|sleepsuit|dress|jeans|leggings|sweater|jumper|hoodie|pajamas|pyjamas|socks|shoes|boots|sneakers|trainers|sandals|slippers|hat|beanie|mittens|gloves|outfit|dungarees)\b/i
    ],
    "Toys": [
      /\b(?:toy|toys|game|play|ball|doll|action figure|puzzle|blocks|teddy|soft toy|plush|car|cars|train|truck|activity gym|mat|rattle|stacking|stacker|building|duplo|lego|wooden toy|sensory)\b/i
    ],
    "Bedding": [
      /\b(?:bedding|crib|cot|mattress|sheet|blanket|duvet|pillow|swaddle|sleeping bag|sleep sack|moses basket|bassinet|nest)\b/i
    ],
    "Feeding": [
      /\b(?:feeding|bottle|formula|pump|breast pump|breastfeeding|weaning|bib|burp cloth|highchair|high chair|spoon|bowl|plate|cup|sterilizer|steriliser|sippy|food maker|blender)\b/i
    ],
    "Transport": [
      /\b(?:stroller|pram|buggy|carrier|car seat|carseat|baby carrier|sling|wrap|travel cot|travel system|pushchair)\b/i
    ],
    "Bath & Potty": [
      /\b(?:bath|potty|toilet trainer|diaper|nappy|swim|changing mat|change mat|changing table|baby bath|tub|towel|wash|lotion)\b/i
    ],
    "Furniture": [
      /\b(?:furniture|chair|table|crib|cot|drawer|wardrobe|storage|shelf|bookcase|desk|rocker|bouncer|swing|playpen|play yard|moses basket)\b/i
    ],
    "Books": [
      /\b(?:book|books|reading|story|stories|board book)\b/i
    ],
    "Maternity": [
      /\b(?:maternity|pregnancy|bump|prenatal|nursing|breastfeeding|breast feeding)\b/i
    ],
    "Safety": [
      /\b(?:safety|gate|monitor|guard|lock|plug cover|corner|edge|harness|secure)\b/i
    ]
  };
  
  // Check each category
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => pattern.test(lowerText))) {
      return category;
    }
  }
  
  return "Uncategorised";
}

/**
 * Get uncategorized listings from the database
 * @param {number} limit - Maximum number of listings to retrieve
 * @returns {Promise<Array>} Array of uncategorized listings
 */
async function getUncategorizedListings(limit = 100) {
  try {
    const supabase = getAdminClient();
    
    const { data, error } = await supabase
      .from('listings')
      .select('id, text, category')
      .eq('category', 'Uncategorised')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Error fetching uncategorized listings: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting uncategorized listings:', error);
    return [];
  }
}

/**
 * Update listings with new categories
 * @param {Array} categorizedListings - Array of objects with id and category
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateListingCategories(categorizedListings) {
  try {
    if (!categorizedListings || categorizedListings.length === 0) {
      return { success: true, count: 0 };
    }
    
    const supabase = getAdminClient();
    
    const { error } = await supabase
      .from('listings')
      .upsert(categorizedListings.map(item => ({
        id: item.id,
        category: item.category
      })));
    
    if (error) {
      throw new Error(`Error updating listing categories: ${error.message}`);
    }
    
    return { success: true, count: categorizedListings.length };
  } catch (error) {
    console.error('Error updating listing categories:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get listings with ISO flags from the database
 * @param {boolean} isISO - Whether to get ISO listings (true) or non-ISO listings (false)
 * @param {number} limit - Maximum number of listings to retrieve
 * @returns {Promise<Array>} Array of listings
 */
async function getISOListings(isISO = true, limit = 100) {
  try {
    const supabase = getAdminClient();
    
    const { data, error } = await supabase
      .from('listings')
      .select('id, text, is_iso')
      .eq('is_iso', isISO)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Error fetching ISO listings: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting ISO listings:', error);
    return [];
  }
}

/**
 * Update listings with new ISO flags
 * @param {Array} updatedListings - Array of objects with id and is_iso
 * @returns {Promise<Object>} Result of the update operation
 */
async function updateListingISOFlags(updatedListings) {
  try {
    if (!updatedListings || updatedListings.length === 0) {
      return { success: true, count: 0 };
    }
    
    const supabase = getAdminClient();
    
    const { error } = await supabase
      .from('listings')
      .upsert(updatedListings.map(item => ({
        id: item.id,
        is_iso: item.is_iso
      })));
    
    if (error) {
      throw new Error(`Error updating ISO flags: ${error.message}`);
    }
    
    return { success: true, count: updatedListings.length };
  } catch (error) {
    console.error('Error updating ISO flags:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete listings by IDs
 * @param {Array} listingIds - Array of listing IDs to delete
 * @returns {Promise<Object>} Result of the delete operation
 */
async function deleteListingsByIds(listingIds) {
  try {
    if (!listingIds || listingIds.length === 0) {
      return { success: true, count: 0 };
    }
    
    const supabase = getAdminClient();
    
    const { error } = await supabase
      .from('listings')
      .delete()
      .in('id', listingIds);
    
    if (error) {
      throw new Error(`Error deleting listings: ${error.message}`);
    }
    
    return { success: true, count: listingIds.length };
  } catch (error) {
    console.error('Error deleting listings:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAdminClient,
  isISOPostByPattern,
  detectCategoryByKeywords,
  getUncategorizedListings,
  updateListingCategories,
  getISOListings,
  updateListingISOFlags,
  deleteListingsByIds
}; 