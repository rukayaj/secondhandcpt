import { ListingRecord } from './supabase';
import { getListings, getISOListings } from './listingService';


/**
 * Filter interface to represent all possible filter criteria
 */
export interface FilterCriteria {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: number; // in days
  condition?: string;
  sizes?: string[]; // Change from size to sizes array
  includeISO?: boolean; // New flag to control inclusion of ISO posts
}

/**
 * Filter listings based on multiple criteria
 */
export async function filterListings(filters: FilterCriteria = {}): Promise<ListingRecord[]> {
  // Always fetch fresh listings from the database
  const listings = await getListings();
  let filteredListings = [...listings];
  
  // Debug: Check for problematic ID
  const problematicId = 'false_27787894429-1623257234@g.us_420B3B57A36B89E53F447E681B7F34E8_27729081956@c.us';
  const existsInRaw = filteredListings.some(listing => listing.id === problematicId);
  console.log(`Debug filterListings: Problematic listing exists in raw data: ${existsInRaw}`);
  
  // Filter out ISO posts by default unless explicitly included
  if (filters.includeISO !== true) {
    filteredListings = filteredListings.filter(listing => !listing.is_iso);
    // Debug: Check after ISO filter
    const existsAfterIsoFilter = filteredListings.some(listing => listing.id === problematicId);
    console.log(`Debug filterListings: Problematic listing exists after ISO filter: ${existsAfterIsoFilter}`);
  }
  
  // Filter by category
  if (filters.category) {
    console.log(`Filtering by category: "${filters.category}"`);
    console.log(`Before filter: ${filteredListings.length} listings`);
    
    // Debug: Check if problematic listing has matching category
    const problematicListing = filteredListings.find(listing => listing.id === problematicId);
    if (problematicListing) {
      console.log(`Debug filterListings: Problematic listing category: "${problematicListing.category}"`);
      console.log(`Debug filterListings: Does category match: ${problematicListing.category && filters.category && problematicListing.category.toLowerCase() === filters.category.toLowerCase()}`);
    }
    
    // Updated to use case-insensitive comparison
    const categorizedListings = filteredListings.filter(listing => 
      listing.category && filters.category && listing.category.toLowerCase() === filters.category.toLowerCase()
    );
    
    // Debug: Check after category filter
    const existsAfterCategoryFilter = categorizedListings.some(listing => listing.id === problematicId);
    console.log(`Debug filterListings: Problematic listing exists after category filter: ${existsAfterCategoryFilter}`);
    
    // Log the IDs of the filtered listings
    console.log(`After filter: ${categorizedListings.length} listings`);
    
    // Specifically check for our problematic listings
    const listingIds = [
      'false_120363190438741302@g.us_88C5950E820C8265AAA1D28C6952F506_27835847692@c.us',
      'false_27787894429-1623257234@g.us_420B3B57A36B89E53F447E681B7F34E8_27729081956@c.us'
    ];
    
    for (const id of listingIds) {
      const listing = filteredListings.find(l => l.id === id);
      if (listing) {
        console.log(`Found listing ${id}:`);
        console.log(`- Category: "${listing.category}"`);
        console.log(`- Is it a match?: ${listing.category && filters.category && listing.category.toLowerCase() === filters.category.toLowerCase()}`);
      } else {
        console.log(`Listing ${id} not found in current listings`);
      }
    }
    
    filteredListings = categorizedListings;
  }
  
  // Filter by location/area
  if (filters.location) {
    filteredListings = filteredListings.filter(listing => 
      listing.collection_areas && listing.collection_areas.some((area: string) => 
        area.toLowerCase().includes(filters.location!.toLowerCase())
      )
    );
  }
  
  // Filter by price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filteredListings = filteredListings.filter(listing => {
      // Skip listings without a price
      if (listing.price === null || listing.price === undefined || listing.price === '') {
        return false;
      }
      
      const numericPrice = typeof listing.price === 'string' 
        ? parseFloat(listing.price) 
        : listing.price;
      
      // Check if it's a valid number
      if (isNaN(numericPrice)) {
        return false;
      }
      
      if (filters.minPrice !== undefined && numericPrice < filters.minPrice) {
        return false;
      }
      
      if (filters.maxPrice !== undefined && numericPrice > filters.maxPrice) {
        return false;
      }
      
      return true;
    });
  }
  
  // Filter by date range
  if (filters.dateRange) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
    
    filteredListings = filteredListings.filter(listing => {
      const listingDate = new Date(listing.posted_on);
      return listingDate >= cutoffDate;
    });
  }
  
  // Filter by condition
  if (filters.condition) {
    filteredListings = filteredListings.filter(listing => 
      listing.condition === filters.condition
    );
  }
  
  // Filter by size
  if (filters.sizes && filters.sizes.length > 0) {
    filteredListings = filteredListings.filter(listing => 
      listing.sizes && listing.sizes.some((size: string) => 
        filters.sizes!.includes(size)
      )
    );
  }
  
  return filteredListings;
}

/**
 * Get ISO posts with filtering
 * This function works specifically with ISO posts and applies the same filtering options
 */
export async function filterISOPosts(filters: FilterCriteria = {}): Promise<ListingRecord[]> {
  // Get ISO posts (which uses the database is_iso field)
  const isoPosts = await getISOListings();
  let filteredPosts = [...isoPosts];
  
  // Apply the same filters but skip the ISO check since we know these are all ISO
  
  // Filter by category
  if (filters.category) {
    filteredPosts = filteredPosts.filter(post => 
      post.category && filters.category && post.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Filter by location
  if (filters.location) {
    filteredPosts = filteredPosts.filter(
      post => post.collection_areas && post.collection_areas.some((area: string) => 
        area.toLowerCase().includes(filters.location!.toLowerCase())
      )
    );
  }
  
  // Filter by date range (in days)
  if (filters.dateRange) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
    
    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.posted_on);
      return postDate >= cutoffDate;
    });
  }
  
  return filteredPosts;
}

/**
 * Helper function to count occurrences by a specified property
 */
export function countBy<T>(
  array: T[],
  property: keyof T,
  filterNulls = true
): { [key: string]: number } {
  return array.reduce((acc, item) => {
    const value = item[property];
    if (filterNulls && (value === null || value === undefined)) {
      return acc;
    }
    
    const key = String(value);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
}

/**
 * Helper function to get all categories
 * (temporary replacement for missing getAllCategories function)
 */
function getAllCategories(): Record<string, string> {
  return {
    'Clothing': 'Clothing',
    'Maternity Clothing': 'Maternity Clothing',
    'Footwear': 'Footwear',
    'Toys': 'Toys',
    'Furniture': 'Furniture',
    'Books': 'Books',
    'Feeding': 'Feeding',
    'Bath': 'Bath',
    'Safety': 'Safety',
    'Sleep': 'Sleep',
    'Diapering': 'Diapering',
    'Health': 'Health',
    'Outdoor & Swimming': 'Outdoor & Swimming',
    'Transport & Carriers': 'Transport & Carriers',
    'Uncategorised': 'Uncategorised'
  };
}

/**
 * Get categories with their counts, optionally filtered by other criteria
 */
export async function getCategoriesWithCounts(filters: FilterCriteria = {}) {
  try {
    // Get all defined categories from categoryUtils for consistent ordering
    const definedCategories = getAllCategories();
    const categoryNames = Object.keys(definedCategories);
    
    // Create a copy of filters without the category
    const { category, ...otherFilters } = filters;
    
    // Ensure includeISO is set to false by default to exclude ISO posts from counts
    // This makes the counts match what's displayed on the listings page
    const filtersWithoutISO = {
      ...otherFilters,
      includeISO: filters.includeISO === true
    };
    
    // Always use filterListings to ensure consistent filtering behavior
    const filteredListings = await filterListings(filtersWithoutISO);
    
    // Count occurrences of each category
    const categoryCounts: Record<string, number> = {};
    
    // Initialize with zero counts for all defined categories
    for (const cat of categoryNames) {
      categoryCounts[cat] = 0;
    }
    
    // Count category occurrences in the filtered listings
    for (const listing of filteredListings) {
      const cat = listing.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    
    // Convert to required format with proper ordering
    return categoryNames
      .map(name => ({ name, count: categoryCounts[name] || 0 }))
      .filter(item => item.name !== 'Other' || item.count > 0) // Only include Other if it has counts
      .sort((a, b) => {
        // Sort by predefined order, with Other at the end
        if (a.name === 'Other') return 1;
        if (b.name === 'Other') return -1;
        return b.count - a.count; // Then by count
      });
  } catch (error) {
    console.error('Error in getCategoriesWithCounts:', error);
    return [];
  }
}

/**
 * Get locations with their counts, optionally filtered by other criteria
 */
export async function getLocationsWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the location
  const { location, ...otherFilters } = filters;
  
  // Ensure includeISO is set to false by default to exclude ISO posts from counts
  const filtersWithoutISO = {
    ...otherFilters,
    includeISO: filters.includeISO === true
  };
  
  const filteredListings = await filterListings(filtersWithoutISO);
  
  // Get all unique locations
  const allLocations = new Set<string>();
  filteredListings.forEach(listing => {
    if (listing.collection_areas) {
      listing.collection_areas.forEach((area: string) => allLocations.add(area));
    }
  });
  
  return Array.from(allLocations).map(loc => {
    const count = filteredListings.filter(listing => 
      listing.collection_areas && listing.collection_areas.includes(loc)
    ).length;
    
    return { name: loc, count };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Get price ranges with their counts, optionally filtered by other criteria
 */
export async function getPriceRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the price range
  const { minPrice, maxPrice, ...otherFilters } = filters;
  
  // Ensure includeISO is set to false by default to exclude ISO posts from counts
  // This makes the counts match what's displayed on the listings page
  const filtersWithoutISO = {
    ...otherFilters,
    includeISO: filters.includeISO === true
  };
  
  const filteredListings = await filterListings(filtersWithoutISO);
  
  // Define price ranges
  const ranges = [
    { range: 'Under R100', min: 0, max: 99.99 },
    { range: 'R100 - R200', min: 100, max: 200 },
    { range: 'R200 - R500', min: 200, max: 500 },
    { range: 'R500 - R1000', min: 500, max: 1000 },
    { range: 'R1000 - R2000', min: 1000, max: 2000 },
    { range: 'Over R2000', min: 2000, max: 100000 }
  ];
  
  return ranges.map(range => {
    const count = filteredListings.filter(listing => {
      if (listing.price === null || listing.price === undefined || listing.price === '') {
        return false;
      }
      
      const numericPrice = typeof listing.price === 'string' 
        ? parseFloat(listing.price) 
        : listing.price;
      
      // Check if it's a valid number
      if (isNaN(numericPrice)) {
        return false;
      }
      
      return numericPrice >= range.min && numericPrice <= range.max;
    }).length;
    
    return { ...range, count };
  });
}

/**
 * Get date ranges with their counts, optionally filtered by other criteria
 */
export async function getDateRangesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the date range
  const { dateRange, ...otherFilters } = filters;
  
  // Ensure includeISO is set to false by default to exclude ISO posts from counts
  const filtersWithoutISO = {
    ...otherFilters,
    includeISO: filters.includeISO === true
  };
  
  const filteredListings = await filterListings(filtersWithoutISO);
  
  // Define date ranges
  const ranges = [
    { range: 'Last 24 hours', days: 1 },
    { range: 'Last 3 days', days: 3 },
    { range: 'Last week', days: 7 },
    { range: 'Last month', days: 30 },
    { range: 'Last 3 months', days: 90 },
    { range: 'All time', days: 3650 }
  ];
  
  const now = new Date();
  
  return ranges.map(range => {
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - range.days);
    
    const count = filteredListings.filter(listing => {
      const listingDate = new Date(listing.posted_on);
      return listingDate >= cutoffDate;
    }).length;
    
    return { ...range, count };
  });
}

/**
 * Get conditions with their counts, optionally filtered by other criteria
 */
export async function getConditionsWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the condition
  const { condition, ...otherFilters } = filters;
  
  // Ensure includeISO is set to false by default to exclude ISO posts from counts
  const filtersWithoutISO = {
    ...otherFilters,
    includeISO: filters.includeISO === true
  };
  
  const filteredListings = await filterListings(filtersWithoutISO);
  
  // Define common conditions
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  return conditions.map(cond => {
    const count = filteredListings.filter(listing => 
      listing.condition === cond
    ).length;
    
    return { name: cond, count };
  }).filter(item => item.count > 0);
}

/**
 * Get sizes with counts based on other filters
 */
export async function getSizesWithCounts(filters: FilterCriteria = {}) {
  // Create a copy of filters without the sizes
  const { sizes, ...otherFilters } = filters;
  
  // Ensure includeISO is set to false by default to exclude ISO posts from counts
  const filtersWithoutISO = {
    ...otherFilters,
    includeISO: filters.includeISO === true
  };
  
  const filteredListings = await filterListings(filtersWithoutISO);
  
  // Define common sizes to look for
  const commonSizes = [
    // Clothing sizes
    'Newborn', '0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m',
    '2-3y', '3-4y', '4-5y', '5-6y',
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    // Numeric sizes (could be clothing or shoe sizes)
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    // EU shoe sizes
    '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'
  ];
  
  const sizeObjects = commonSizes.map(sizeName => {
    // Count listings with this size in the sizes array or in the text
    const count = filteredListings.filter(listing => {
      // Check in the sizes array first
      if (listing.sizes && listing.sizes.length > 0) {
        return listing.sizes.some(s => 
          s.toLowerCase().includes(sizeName.toLowerCase()) ||
          sizeName.toLowerCase().includes(s.toLowerCase())
        );
      }
      // Fallback to text search
      return listing.text && listing.text.toLowerCase().includes(sizeName.toLowerCase());
    }).length;
    
    return { name: sizeName, count };
  });
  
  // Only return sizes that have at least one listing
  return sizeObjects.filter(item => item.count > 0);
}

/**
 * Get all filter options with counts
 */
export async function getAllFilterOptions(filters: FilterCriteria = {}) {
  return {
    categories: await getCategoriesWithCounts(filters),
    locations: await getLocationsWithCounts(filters),
    priceRanges: await getPriceRangesWithCounts(filters),
    dateRanges: await getDateRangesWithCounts(filters),
    conditions: await getConditionsWithCounts(filters),
    sizes: await getSizesWithCounts(filters)
  };
} 