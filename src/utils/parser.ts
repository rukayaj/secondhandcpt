import { sampleListings, Listing } from './sampleData.public';
import { 
  getCategoriesWithCounts as getDynamicCategoriesWithCounts, 
  getLocationsWithCounts 
} from './filterUtils';
import {
  extractCondition,
  extractSize,
  extractLocation,
  extractPrice,
  isISOPost,
  determineCategory,
  categories
} from './textParsingUtils';

// Export the Listing interface for use in other files
export type { Listing };

// Re-export the utility functions for backward compatibility
export {
  extractCondition,
  extractSize,
  extractLocation,
  extractPrice,
  isISOPost,
  determineCategory
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

// Helper function to normalize text for comparison
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // normalize whitespace
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // remove punctuation
    .replace(/\n/g, ' ');  // replace newlines with spaces
};

// Function to determine if a listing is a duplicate
export const isDuplicate = (newListing: Listing, existingListings: Listing[]): boolean => {
  return existingListings.some(existing => 
    existing.sender === newListing.sender && 
    normalizeText(existing.text) === normalizeText(newListing.text)
  );
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