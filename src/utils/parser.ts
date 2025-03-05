import { sampleListings, Listing } from './sampleData.public';
import { 
  getCategoriesWithCounts as getDynamicCategoriesWithCounts, 
  getLocationsWithCounts 
} from './filterUtils';

// Export the Listing interface for use in other files
export type { Listing };

// Categories for baby items
const categories = [
  { name: 'Clothing', keywords: ['dress', 'outfit', 'clothes', 'clothing', 'shorts', 'pants', 'top', 'shirt', 'jumper', 'jersey', 'jacket', 'dungarees', 'pjs', 'pajamas', 'leggings', 'tracksuit', 'babygrow', 'onesie', 'cardigan', 'gown'] },
  { name: 'Footwear', keywords: ['shoes', 'shoe', 'sandals', 'sandal', 'crocs', 'takkies', 'boots', 'boot', 'slippers', 'slipper', 'footwear', 'sneakers', 'sneaker', 'trainers', 'trainer'] },
  { name: 'Toys', keywords: ['toy', 'toys', 'puzzle', 'puzzles', 'game', 'games', 'play', 'teddy', 'plush', 'soft toy', 'blocks', 'lego', 'duplo'] },
  { name: 'Furniture', keywords: ['bed', 'cot', 'chair', 'table', 'furniture', 'playpen', 'camp cot', 'campcot', 'mattress'] },
  { name: 'Gear', keywords: ['carrier', 'pram', 'stroller', 'walker', 'seat', 'monitor', 'gate', 'gates', 'safety', 'car seat'] },
  { name: 'Feeding', keywords: ['feeding', 'spoon', 'bottle', 'breast', 'milk', 'food'] },
  { name: 'Accessories', keywords: ['headband', 'hat', 'cap', 'socks', 'blanket', 'bag', 'backpack'] },
  { name: 'Swimming', keywords: ['swim', 'swimming', 'swimsuit', 'armbands', 'puddle jumper'] },
];

// Function to determine the category based on text
const determineCategory = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }
  
  return null;
};

// Function to extract price from text
const extractPrice = (text: string): number | null => {
  const priceMatch = text.match(/R\s*(\d+(?:\s*\d+)*)/i);
  if (priceMatch && priceMatch[1]) {
    // Remove spaces and convert to number
    return parseInt(priceMatch[1].replace(/\s+/g, ''), 10);
  }
  return null;
};

// Function to extract condition from text
const extractCondition = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('new condition') || lowerText.includes('brand new') || lowerText.includes('never used') || lowerText.includes('new')) {
    return 'New';
  } else if (lowerText.includes('excellent condition') || lowerText.includes('like new')) {
    return 'Excellent';
  } else if (lowerText.includes('good condition')) {
    return 'Good';
  } else if (lowerText.includes('fair condition')) {
    return 'Fair';
  } else if (lowerText.includes('well loved')) {
    return 'Well-loved';
  }
  return null;
};

// Function to extract size from text
const extractSize = (text: string): string | null => {
  const sizeMatch = text.match(/size\s*:?\s*([0-9-]+(?:\s*(?:months|m|years|y|yrs))?)/i) || 
                    text.match(/([0-9-]+\s*(?:months|m|years|y|yrs))/i) ||
                    text.match(/size\s*([0-9]+)/i);
  
  if (sizeMatch && sizeMatch[1]) {
    return sizeMatch[1].trim();
  }
  return null;
};

// Function to extract location from text
const extractLocation = (text: string): string | null => {
  const locationMatch = text.match(/collection\s*(?:in|from)?\s*([A-Za-z\s]+)/i) || 
                        text.match(/collect\s*(?:in|from)?\s*([A-Za-z\s]+)/i);
  
  if (locationMatch && locationMatch[1]) {
    return locationMatch[1].trim();
  }
  return null;
};

// Function to check if a message is an ISO post
const isISOPost = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('iso') || 
         lowerText.includes('in search of') || 
         lowerText.includes('looking for') ||
         lowerText.startsWith('anyone selling');
};

// Main function to parse the WhatsApp chat export
export const parseWhatsAppChat = (filePath: string): Listing[] => {
  return sampleListings;
};

// Function to get all categories
export const getAllCategories = () => {
  return categories.map(category => category.name);
};

// Function to get all listings
export const getAllListings = (): Listing[] => {
  return sampleListings;
};

// Function to get listings by category
export const getListingsByCategory = (categoryName: string): Listing[] => {
  return sampleListings.filter(listing => listing.category === categoryName);
};

// Function to get listings by location
export const getListingsByLocation = (locationName: string): Listing[] => {
  return sampleListings.filter(
    listing => listing.location && listing.location.toLowerCase().includes(locationName.toLowerCase())
  );
};

// Function to get listings by price range
export const getListingsByPriceRange = (minPrice: number, maxPrice: number): Listing[] => {
  return sampleListings.filter(
    listing => listing.price !== null && listing.price !== undefined && listing.price >= minPrice && listing.price <= maxPrice
  );
};

// Function to get listings by date range
export const getListingsByDateRange = (days: number): Listing[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return sampleListings.filter(
    listing => new Date(listing.date) >= cutoffDate
  );
};

// Function to get a listing by ID
export const getListingById = (id: string): Listing | undefined => {
  return sampleListings.find(listing => listing.id === id);
};

export const getISOPosts = (): Listing[] => {
  return sampleListings.filter(listing => listing.isISO);
};

// Updated to use dynamic counts
export const getCategoriesWithCounts = () => {
  return getDynamicCategoriesWithCounts();
};

// Function to search listings by a search term
export const searchListings = (searchTerm: string): Listing[] => {
  if (!searchTerm) return [];
  
  const searchTermLower = searchTerm.toLowerCase();
  
  return sampleListings.filter(listing => {
    const textMatch = listing.text.toLowerCase().includes(searchTermLower);
    const categoryMatch = listing.category && listing.category.toLowerCase().includes(searchTermLower);
    const locationMatch = listing.location && listing.location.toLowerCase().includes(searchTermLower);
    const conditionMatch = listing.condition && listing.condition.toLowerCase().includes(searchTermLower);
    const sizeMatch = listing.size && listing.size.toLowerCase().includes(searchTermLower);
    
    return textMatch || categoryMatch || locationMatch || conditionMatch || sizeMatch;
  });
};

// Function to determine if a listing is a duplicate
export const isDuplicate = (newListing: Listing, existingListings: Listing[]): boolean => {
  return existingListings.some(existing => 
    existing.sender === newListing.sender && 
    normalizeText(existing.text) === normalizeText(newListing.text)
  );
};

// Helper function to normalize text for comparison
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // normalize whitespace
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // remove punctuation
    .replace(/\n/g, ' ');  // replace newlines with spaces
};

// Function to find duplicate listings in the dataset
export const findDuplicates = (listings: Listing[]): { 
  duplicates: Array<{original: Listing, duplicates: Listing[]}>,
  uniqueListings: Listing[] 
} => {
  const seen = new Map<string, Listing>();
  const duplicates: Array<{original: Listing, duplicates: Listing[]}> = [];
  
  // First pass - identify originals and collect duplicates
  listings.forEach(listing => {
    const key = `${listing.sender}-${normalizeText(listing.text)}`;
    
    if (!seen.has(key)) {
      seen.set(key, listing);
    }
  });
  
  // Second pass - collect all duplicates for each original
  const duplicateGroups = new Map<string, Listing[]>();
  listings.forEach(listing => {
    const key = `${listing.sender}-${normalizeText(listing.text)}`;
    const original = seen.get(key)!;
    
    if (listing !== original) {
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key)!.push(listing);
    }
  });
  
  // Build the results
  Array.from(seen.entries()).forEach(([key, original]) => {
    const dups = duplicateGroups.get(key);
    if (dups && dups.length > 0) {
      duplicates.push({
        original,
        duplicates: dups
      });
    }
  });
  
  // Create unique listings array (keeping only originals)
  const uniqueListings = listings.filter(listing => {
    const key = `${listing.sender}-${normalizeText(listing.text)}`;
    return seen.get(key) === listing;
  });
  
  return { duplicates, uniqueListings };
};

/**
 * Get the correct image path based on the listing ID
 * @param imageName The image filename
 * @param listingId The listing ID
 * @returns The correct path to the image
 */
export function getCorrectImagePath(imageName: string, listingId: string): string {
  // Extract the group name from the listing ID
  if (listingId.includes('nifty-thrifty-0-1-years')) {
    return `/images/nifty-thrifty-0-1-years/${imageName}`;
  } else if (listingId.includes('nifty-thrifty-1-3-years')) {
    return `/images/nifty-thrifty-1-3-years/${imageName}`;
  } else {
    // Default to the listings directory for other images
    return `/images/listings/${imageName}`;
  }
} 