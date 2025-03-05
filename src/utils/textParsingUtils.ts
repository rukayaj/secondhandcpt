/**
 * Shared text parsing utilities for extracting information from listing messages
 */

/**
 * Extracts the condition from a message text
 */
export function extractCondition(text: string): string | null {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('new condition') || lowerText.includes('brand new') || 
      lowerText.includes('never used') || lowerText.includes('new with tags') || 
      lowerText.includes('nwt') || lowerText.includes('new')) {
    return 'New';
  } else if (lowerText.includes('excellent condition') || lowerText.includes('like new') || 
             lowerText.includes('gently used') || lowerText.includes('barely used')) {
    return 'Excellent';
  } else if (lowerText.includes('good condition')) {
    return 'Good';
  } else if (lowerText.includes('fair condition') || lowerText.includes('used condition')) {
    return 'Fair';
  } else if (lowerText.includes('well loved') || lowerText.includes('well used') || 
             lowerText.includes('worn')) {
    return 'Well-loved';
  }
  return null;
}

/**
 * Extracts the size from a message text
 */
export function extractSize(text: string): string | null {
  const sizeMatch = text.match(/size\s*:?\s*([0-9-]+(?:\s*(?:months|m|years|y|yrs))?)/i) || 
                    text.match(/([0-9-]+\s*(?:months|m|years|y|yrs))/i) ||
                    text.match(/size\s*([0-9]+)/i) ||
                    text.match(/\b(newborn|preemie|premature|small|medium|large|xl|xxl)\b/i);
  
  if (sizeMatch && sizeMatch[1]) {
    return sizeMatch[1].trim();
  }
  return null;
}

/**
 * Extracts the location from a message text
 */
export function extractLocation(text: string): string | null {
  const locationMatch = text.match(/\b(?:collection|collect|pickup|available)\s*(?:in|from|at)?\s*([A-Za-z\s]+(?:Point|Town|Park|Heights|Village|Estate|Bay|View|Gardens|Hills|Valley|Beach|CBD|City|Centre|Center)?)/i);
  
  if (locationMatch && locationMatch[1]) {
    return locationMatch[1].trim();
  }
  return null;
}

/**
 * Extracts the price from a message text
 */
export function extractPrice(text: string): number | null {
  const priceMatch = text.match(/R\s*(\d+(?:\s*\d+)*)/i);
  if (priceMatch && priceMatch[1]) {
    // Remove spaces and convert to number
    return parseInt(priceMatch[1].replace(/\s+/g, ''), 10);
  }
  return null;
}

/**
 * Determines if a message is an ISO (In Search Of) post
 */
export function isISOPost(text: string, hasImages: boolean = false): boolean {
  const lowerText = text.toLowerCase();
  
  // If there are explicit ISO indicators in the text, it's an ISO post
  if (lowerText.includes('iso') || 
      lowerText.includes('in search of') || 
      lowerText.includes('looking for')) {
    return true;
  }
  
  // If there are no images and the text suggests looking for something, it's likely an ISO post
  if (!hasImages && (
    lowerText.includes('anyone selling') ||
    lowerText.includes('anyone have') ||
    lowerText.includes('does anyone') ||
    lowerText.startsWith('looking for') ||
    lowerText.startsWith('wanted')
  )) {
    return true;
  }
  
  return false;
}

// Categories for baby items with their keywords
export const categories = [
  { name: 'Clothing', keywords: ['dress', 'outfit', 'clothes', 'clothing', 'shorts', 'pants', 'top', 'shirt', 'jumper', 'jersey', 'jacket', 'dungarees', 'pjs', 'pajamas', 'pyjamas', 'leggings', 'tracksuit', 'babygrow', 'onesie', 'bodysuit', 'romper', 'sleepsuit', 'cardigan', 'gown'] },
  { name: 'Footwear', keywords: ['shoes', 'shoe', 'sandals', 'sandal', 'crocs', 'takkies', 'boots', 'boot', 'slippers', 'slipper', 'footwear', 'sneakers', 'sneaker', 'trainers', 'trainer', 'socks'] },
  { name: 'Toys', keywords: ['toy', 'toys', 'puzzle', 'puzzles', 'game', 'games', 'play', 'teddy', 'plush', 'soft toy', 'blocks', 'lego', 'duplo', 'doll', 'stuffed', 'playmat'] },
  { name: 'Furniture', keywords: ['bed', 'cot', 'crib', 'chair', 'table', 'furniture', 'playpen', 'camp cot', 'campcot', 'mattress', 'dresser', 'wardrobe', 'storage'] },
  { name: 'Gear', keywords: ['carrier', 'pram', 'stroller', 'buggy', 'pushchair', 'walker', 'seat', 'monitor', 'gate', 'gates', 'safety', 'car seat', 'sling', 'wrap', 'backpack'] },
  { name: 'Feeding', keywords: ['feeding', 'spoon', 'bottle', 'breast', 'milk', 'food', 'highchair', 'high chair', 'bib', 'formula', 'breast pump', 'sterilizer', 'nursing'] },
  { name: 'Accessories', keywords: ['headband', 'hat', 'cap', 'beanie', 'mittens', 'gloves', 'scarf', 'sunglasses', 'bag', 'backpack', 'blanket'] },
  { name: 'Swimming', keywords: ['swim', 'swimming', 'swimsuit', 'armbands', 'puddle jumper', 'pool', 'beach', 'float', 'life jacket'] },
  { name: 'Bedding', keywords: ['bedding', 'blanket', 'sheet', 'pillow', 'sleeping bag', 'swaddle', 'duvet', 'comforter'] },
  { name: 'Diapers', keywords: ['diaper', 'nappy', 'changing table', 'changing pad'] },
  { name: 'Books', keywords: ['book', 'reading', 'story'] },
  { name: 'Other', keywords: [] }
];

/**
 * Determines the category of a listing based on its text
 */
export function determineCategory(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }
  
  return null;
} 