import { Listing } from './sampleData.public';

/**
 * Combine listings from multiple sources
 * @param sources An object mapping source names to arrays of listings
 * @returns A combined array of listings
 */
export function combineListings(sources: Record<string, Listing[]>): Listing[] {
  const combinedListings: Listing[] = [];
  
  // Process each source
  Object.entries(sources).forEach(([sourceName, listings]) => {
    // Add each listing to the combined array
    listings.forEach(listing => {
      // Ensure the listing has a unique ID by prefixing with the source name if needed
      if (!listing.id.startsWith(sourceName)) {
        listing.id = `${sourceName}-${listing.id}`;
      }
      
      combinedListings.push(listing);
    });
    
    console.log(`Added ${listings.length} listings from source: ${sourceName}`);
  });
  
  console.log(`Combined ${combinedListings.length} listings from ${Object.keys(sources).length} sources`);
  
  return combinedListings;
}

/**
 * Deduplicate listings based on similarity
 * @param listings Array of listings to deduplicate
 * @param options Options for deduplication
 * @returns Deduplicated array of listings
 */
export function deduplicateListings(
  listings: Listing[],
  options: {
    textSimilarityThreshold?: number;
    timeDifferenceThreshold?: number; // in milliseconds
    ignoreCase?: boolean;
  } = {}
): Listing[] {
  const {
    textSimilarityThreshold = 0.8,
    timeDifferenceThreshold = 24 * 60 * 60 * 1000, // 24 hours
    ignoreCase = true
  } = options;
  
  // Helper function to calculate similarity between two strings
  function calculateSimilarity(str1: string, str2: string): number {
    if (ignoreCase) {
      str1 = str1.toLowerCase();
      str2 = str2.toLowerCase();
    }
    
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Calculate Levenshtein distance
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    // Convert distance to similarity score (0 to 1)
    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }
  
  // Sort listings by date (oldest first)
  const sortedListings = [...listings].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const uniqueListings: Listing[] = [];
  const duplicateIds: Set<string> = new Set();
  
  // Check each listing against all previously added unique listings
  for (const listing of sortedListings) {
    // Skip if already marked as duplicate
    if (duplicateIds.has(listing.id)) continue;
    
    let isDuplicate = false;
    
    for (const uniqueListing of uniqueListings) {
      // Skip comparison if listings are from different categories
      if (listing.category !== uniqueListing.category && 
          listing.category !== null && 
          uniqueListing.category !== null) {
        continue;
      }
      
      // Check time difference
      const timeDiff = Math.abs(
        new Date(listing.date).getTime() - new Date(uniqueListing.date).getTime()
      );
      
      if (timeDiff > timeDifferenceThreshold) continue;
      
      // Check text similarity
      const textSimilarity = calculateSimilarity(listing.text, uniqueListing.text);
      
      if (textSimilarity >= textSimilarityThreshold) {
        isDuplicate = true;
        duplicateIds.add(listing.id);
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueListings.push(listing);
    }
  }
  
  console.log(`Removed ${duplicateIds.size} duplicate listings`);
  console.log(`Kept ${uniqueListings.length} unique listings`);
  
  return uniqueListings;
}

export default {
  combineListings,
  deduplicateListings
}; 