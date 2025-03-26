import { ListingRecord } from './supabase';
import { getListings, getISOListings } from './listingService';
import { supabase, TABLES } from './supabase';
import { WHATSAPP_GROUPS } from './whatsappGroups';
import { isRegion, getSuburbsForRegion, LOCATION_HIERARCHY, SUBURB_TO_REGION } from './locationHierarchy';


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
  page?: number;       // Page number for pagination
  limit?: number;      // Items per page
}

/**
 * Helper function to normalize location strings for comparison
 */
function normalizeLocationString(location: string): string {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')       // Normalize spaces
    .replace(/[^a-z0-9 ]/gi, '') // Remove special characters
    .replace(/\bst\b/gi, 'saint') // Common abbreviations
    .replace(/\bda\b/gi, 'da')   // For "Marina da Gama"
    .replace(/\btown\b/gi, '');  // Remove "town" suffix
}

/**
 * Check if two locations match, accounting for variations
 */
function locationsMatch(locationA: string, locationB: string): boolean {
  if (!locationA || !locationB) return false;
  
  // Direct match
  if (locationA.toLowerCase().trim() === locationB.toLowerCase().trim()) {
    return true;
  }
  
  // Normalized match
  const normalizedA = normalizeLocationString(locationA);
  const normalizedB = normalizeLocationString(locationB);
  
  if (normalizedA === normalizedB) {
    return true;
  }
  
  // Check for presence in comma-separated list
  if (locationA.includes(',')) {
    const partsA = locationA.split(',').map(p => p.trim().toLowerCase());
    return partsA.includes(locationB.toLowerCase().trim());
  }
  
  if (locationB.includes(',')) {
    const partsB = locationB.split(',').map(p => p.trim().toLowerCase());
    return partsB.includes(locationA.toLowerCase().trim());
  }
  
  return false;
}

/**
 * Function to add human-readable group names to listings
 */
function addGroupNames(listings: ListingRecord[]): ListingRecord[] {
  return listings.map(listing => {
    // Ensure collection_areas is always an array
    const cleanedListing = { ...listing };
    
    // If collection_areas is a string, try to parse it as JSON
    if (typeof cleanedListing.collection_areas === 'string') {
      try {
        const parsed = JSON.parse(cleanedListing.collection_areas as any);
        (cleanedListing as any).collection_areas = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        (cleanedListing as any).collection_areas = [cleanedListing.collection_areas];
      }
    }
    
    // If still not an array, initialize as empty array
    if (!Array.isArray(cleanedListing.collection_areas)) {
      (cleanedListing as any).collection_areas = [];
    }
    
    return {
      ...cleanedListing,
      group_name: WHATSAPP_GROUPS[cleanedListing.whatsapp_group] || 'Unknown Group'
    };
  });
}

/**
 * Filter listings based on multiple criteria with efficient pagination
 * This applies filters at the database level where possible
 */
export async function filterListings(filters: FilterCriteria = {}): Promise<{
  listings: ListingRecord[];
  totalCount: number;
}> {
  try {
    // Set defaults for pagination
    const page = filters.page || 1;
    const limit = filters.limit || 16;
    const offset = (page - 1) * limit;
  
    // Build the base query parameters
    const baseQueryParams: any = {};
    
    // Filter by category (case-insensitive)
    if (filters.category) {
      baseQueryParams.category = filters.category;
    }
  
    // Filter by ISO status
    if (filters.includeISO !== true) {
      baseQueryParams.is_iso = false;
    }
  
    // Filter by condition
    if (filters.condition) {
      baseQueryParams.condition = filters.condition;
    }
  
    // Get count of matching records (for non-location filters only)
    let countQuery = supabase
      .from(TABLES.LISTINGS)
      .select('id', { count: 'exact', head: true });
    
    // Apply filters to count query
    for (const [key, value] of Object.entries(baseQueryParams)) {
      if (key === 'category') {
        countQuery = countQuery.ilike(key, value as string);
      } else {
        countQuery = countQuery.eq(key, value);
      }
    }
    
    // Apply price range filters
    if (filters.minPrice !== undefined) {
      countQuery = countQuery.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      countQuery = countQuery.lte('price', filters.maxPrice);
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
      countQuery = countQuery.gte('posted_on', cutoffDate.toISOString());
    }
    
    // Execute count query
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting count:', countError);
      return { listings: [], totalCount: 0 };
    }
  
    // Build data query with same filters
    let dataQuery = supabase
      .from(TABLES.LISTINGS)
      .select('*');
    
    // Apply filters to data query
    for (const [key, value] of Object.entries(baseQueryParams)) {
      if (key === 'category') {
        dataQuery = dataQuery.ilike(key, value as string);
      } else {
        dataQuery = dataQuery.eq(key, value);
      }
    }
    
    // Apply price range filters
    if (filters.minPrice !== undefined) {
      dataQuery = dataQuery.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      dataQuery = dataQuery.lte('price', filters.maxPrice);
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
      dataQuery = dataQuery.gte('posted_on', cutoffDate.toISOString());
    }
    
    // For locations, we need to do client-side filtering, so fetch all records first (no pagination yet)
    let allListings;
    
    // Only apply pagination if we don't need to filter by location
    if (filters.location) {
      dataQuery = dataQuery.order('posted_on', { ascending: false });
      
      const { data, error: dataError } = await dataQuery;
      if (dataError) {
        console.error('Error filtering listings:', dataError);
        return { listings: [], totalCount: 0 };
      }
      
      allListings = addGroupNames(data || []);
    } else {
      // No location filter, apply pagination on the server
      dataQuery = dataQuery
        .order('posted_on', { ascending: false })
        .range(offset, offset + limit - 1);
      
      const { data, error: dataError } = await dataQuery;
      if (dataError) {
        console.error('Error filtering listings:', dataError);
        return { listings: [], totalCount: 0 };
      }
      
      allListings = addGroupNames(data || []);
    }
  
    // Apply post-processing filters that cannot be done at database level
    let filteredListings = allListings;
    
    // Filter by location (can't be done in database query efficiently)
    if (filters.location) {
      // Debug: log the location filter and the first few listings
      console.log(`Filtering by location: "${filters.location}"`);
      if (allListings.length > 0) {
        const sampleListing = allListings[0];
        console.log(`Sample listing collection_areas:`, 
          typeof sampleListing.collection_areas, 
          Array.isArray(sampleListing.collection_areas) ? 
            sampleListing.collection_areas : 
            String(sampleListing.collection_areas)
        );
      }
      
      const locationToMatch = filters.location!.trim();
      
      // Check if the location is a region
      if (isRegion(locationToMatch)) {
        console.log(`Filtering by region: ${locationToMatch}`);
        // Get all suburbs for this region
        const suburbsForRegion = getSuburbsForRegion(locationToMatch);
        console.log(`Suburbs in ${locationToMatch}:`, suburbsForRegion);
        
        // Filter listings that match any suburb in this region
        filteredListings = filteredListings.filter(listing => {
          // Make sure collection_areas is usable
          if (!listing.collection_areas || !Array.isArray(listing.collection_areas)) {
            return false;
          }
          
          const normalizedAreas = listing.collection_areas.map(area => 
            typeof area === 'string' ? area.trim() : String(area)
          );
          
          // Check if any collection area matches any suburb in the region
          return normalizedAreas.some(area => 
            suburbsForRegion.some(suburb => locationsMatch(area, suburb))
          );
        });
      } else {
        // Regular location filtering for specific suburbs
        filteredListings = filteredListings.filter(listing => {
          // Make sure collection_areas is usable
          if (!listing.collection_areas || !Array.isArray(listing.collection_areas)) {
            return false;
          }
          
          // Normalize collection areas for matching
          const normalizedAreas = listing.collection_areas.map(area => 
            typeof area === 'string' ? area.trim() : String(area)
          );
          
          // For specific problem locations, add extra debugging
          if (locationToMatch.toLowerCase() === "constantia" || 
              locationToMatch.toLowerCase() === "durbanville") {
            console.log(`Checking ${locationToMatch} against:`, normalizedAreas);
          }

          // Use our new matching function that handles standardized locations
          return normalizedAreas.some(area => locationsMatch(area, locationToMatch));
        });
      }
      
      // Debug: log the results of filtering
      console.log(`Found ${filteredListings.length} listings matching location "${filters.location}"`);
    }
  
    // Filter by sizes (can't be done in database query efficiently)
    if (filters.sizes && filters.sizes.length > 0) {
      filteredListings = filteredListings.filter(listing => 
        listing.sizes && 
        listing.sizes.some((size: string) => 
          filters.sizes!.includes(size)
        )
      );
    }
    
    // Get actual total count after client-side filtering
    const totalCount = filters.location ? filteredListings.length : (count || 0);
    
    // Apply pagination for location filter (client-side)
    let paginatedListings = filteredListings;
    if (filters.location) {
      paginatedListings = filteredListings.slice(offset, offset + limit);
    }
    
    return {
      listings: paginatedListings,
      totalCount: totalCount
    };
  } catch (error) {
    console.error('Error in filterListings:', error);
    return { listings: [], totalCount: 0 };
  }
}

/**
 * Get ISO posts with filtering and pagination
 */
export async function filterISOPosts(filters: FilterCriteria = {}): Promise<{
  listings: ListingRecord[];
  totalCount: number;
}> {
  try {
    // Set defaults for pagination
    const page = filters.page || 1;
    const limit = filters.limit || 16;
    const offset = (page - 1) * limit;
  
    // Build the base query parameters
    const baseQueryParams: any = {
      is_iso: true // All ISO posts
    };
    
    // Filter by category
    if (filters.category) {
      baseQueryParams.category = filters.category;
    }
    
    // Filter by condition
    if (filters.condition) {
      baseQueryParams.condition = filters.condition;
    }
    
    // Get count of matching records
    let countQuery = supabase
      .from(TABLES.LISTINGS)
      .select('id', { count: 'exact', head: true });
    
    // Apply filters to count query
    for (const [key, value] of Object.entries(baseQueryParams)) {
      if (key === 'category') {
        countQuery = countQuery.ilike(key, value as string);
      } else {
        countQuery = countQuery.eq(key, value);
      }
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
      countQuery = countQuery.gte('posted_on', cutoffDate.toISOString());
    }
    
    // Execute count query
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting ISO posts count:', countError);
      return { listings: [], totalCount: 0 };
    }
    
    // Build data query with same filters
    let dataQuery = supabase
      .from(TABLES.LISTINGS)
      .select('*');
    
    // Apply filters to data query
    for (const [key, value] of Object.entries(baseQueryParams)) {
      if (key === 'category') {
        dataQuery = dataQuery.ilike(key, value as string);
      } else {
        dataQuery = dataQuery.eq(key, value);
      }
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
      dataQuery = dataQuery.gte('posted_on', cutoffDate.toISOString());
    }
    
    // Apply pagination and ordering
    dataQuery = dataQuery
      .order('posted_on', { ascending: false })
      .range(offset, offset + limit - 1);
  
    // Execute data query
    const { data, error: dataError } = await dataQuery;
  
    if (dataError) {
      console.error('Error filtering ISO posts:', dataError);
      return { listings: [], totalCount: 0 };
    }
  
    // Apply post-processing filters
    let filteredPosts = addGroupNames(data || []);
  
    // Filter by location (can't be done in database query efficiently)
    if (filters.location) {
      const locationToMatch = filters.location!.trim();
      
      // Check if the location is a region
      if (isRegion(locationToMatch)) {
        // Get all suburbs for this region
        const suburbsForRegion = getSuburbsForRegion(locationToMatch);
        
        // Filter posts that match any suburb in this region
        filteredPosts = filteredPosts.filter(post => {
          // Make sure collection_areas is usable
          if (!post.collection_areas || !Array.isArray(post.collection_areas)) {
            return false;
          }
          
          const normalizedAreas = post.collection_areas.map(area => 
            typeof area === 'string' ? area.trim() : String(area)
          );
          
          // Check if any collection area matches any suburb in the region
          return normalizedAreas.some(area => 
            suburbsForRegion.some(suburb => locationsMatch(area, suburb))
          );
        });
      } else {
        // Regular suburb-level filtering
        filteredPosts = filteredPosts.filter(post => {
          // Make sure collection_areas is usable
          if (!post.collection_areas || !Array.isArray(post.collection_areas)) {
            return false;
          }

          // Normalize collection areas for matching
          const normalizedAreas = post.collection_areas.map(area => 
            typeof area === 'string' ? area.trim() : String(area)
          );
          
          // Use our new matching function that handles standardized locations
          return normalizedAreas.some(area => locationsMatch(area, locationToMatch));
        });
      }
    }
  
    return {
      listings: filteredPosts,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error in filterISOPosts:', error);
    return { listings: [], totalCount: 0 };
  }
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
 * Get categories with their counts using database queries for accuracy
 */
export async function getCategoriesWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Get all defined categories
    const definedCategories = getAllCategories();
    const categoryNames = Object.keys(definedCategories);
    
    // If we have pre-filtered listings (e.g., from location filter), count from those
    if (preFilteredListings && preFilteredListings.length > 0) {
      // Count categories in the pre-filtered listings
      const categoryCounts = new Map<string, number>();
      
      // Count each category
      preFilteredListings.forEach(listing => {
        const category = listing.category;
        if (category) {
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      });
      
      // Format and return category counts
      return categoryNames
        .filter(categoryName => categoryCounts.has(categoryName) && categoryCounts.get(categoryName)! > 0)
        .map(categoryName => ({
          name: categoryName,
          count: categoryCounts.get(categoryName) || 0
        }))
        .sort((a, b) => b.count - a.count);
    }
    
    // Otherwise use database queries as before
    // Create a copy of filters without the category
    const { category, ...otherFilters } = filters;
    
    // Create a base query with all other filters applied (except category)
    // This way we can count categories while respecting other filters
    let baseQuery = supabase
      .from(TABLES.LISTINGS)
      .select('category', { count: 'exact', head: true });
    
    // Apply other filters
    if (otherFilters.includeISO !== true) {
      baseQuery = baseQuery.eq('is_iso', false);
    }
    
    if (otherFilters.condition) {
      baseQuery = baseQuery.eq('condition', otherFilters.condition);
    }
    
    if (otherFilters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
      baseQuery = baseQuery.gte('posted_on', cutoffDate.toISOString());
    }
    
    if (otherFilters.minPrice !== undefined) {
      baseQuery = baseQuery.gte('price', otherFilters.minPrice);
    }
    
    if (otherFilters.maxPrice !== undefined) {
      baseQuery = baseQuery.lte('price', otherFilters.maxPrice);
    }
    
    // Get total count (for "All" category or if user has filtered by category)
    const { count: totalCount, error: totalError } = await baseQuery;
    
    if (totalError) {
      console.error('Error getting total category count:', totalError);
      return [];
    }
    
    // Now get counts for each specific category
    const categoryPromises = categoryNames.map(async categoryName => {
      // Clone the base query and add category filter
      const categoryQuery = supabase
        .from(TABLES.LISTINGS)
        .select('category', { count: 'exact', head: true });
      
      // Apply category filter
      categoryQuery.ilike('category', categoryName);
      
      // Apply other filters
      if (otherFilters.includeISO !== true) {
        categoryQuery.eq('is_iso', false);
      }
      
      if (otherFilters.condition) {
        categoryQuery.eq('condition', otherFilters.condition);
      }
      
      if (otherFilters.dateRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
        categoryQuery.gte('posted_on', cutoffDate.toISOString());
      }
      
      if (otherFilters.minPrice !== undefined) {
        categoryQuery.gte('price', otherFilters.minPrice);
      }
      
      if (otherFilters.maxPrice !== undefined) {
        categoryQuery.lte('price', otherFilters.maxPrice);
      }
      
      const { count, error } = await categoryQuery;
      
      if (error) {
        console.error(`Error getting count for category ${categoryName}:`, error);
        return { name: categoryName, count: 0 };
      }
      
      return {
        name: categoryName,
        count: count || 0
      };
    });
    
    // Wait for all category count queries to complete
    const categoryResults = await Promise.all(categoryPromises);
    
    // Format and return categories with counts
    return categoryResults
      .filter(item => item.count > 0)
      .sort((a, b) => {
        // Sort by count (descending)
        return b.count - a.count;
      });
  } catch (error) {
    console.error('Error in getCategoriesWithCounts:', error);
    return [];
  }
}

/**
 * Get locations with their counts using database-level filtering where possible
 * Note: We still need to post-process locations since they are stored as arrays in the database
 */
export async function getLocationsWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Create a copy of filters without the location
    const { location, ...otherFilters } = filters;
    
    // Build base query with all other filters
    let query = supabase.from(TABLES.LISTINGS).select('*');
    
    // Apply other filters
    if (otherFilters.includeISO !== true) {
      query = query.eq('is_iso', false);
    }
    
    if (otherFilters.category) {
      query = query.ilike('category', otherFilters.category);
    }
    
    if (otherFilters.condition) {
      query = query.eq('condition', otherFilters.condition);
    }
    
    if (otherFilters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
      query = query.gte('posted_on', cutoffDate.toISOString());
    }
    
    if (otherFilters.minPrice !== undefined) {
      query = query.gte('price', otherFilters.minPrice);
    }
    
    if (otherFilters.maxPrice !== undefined) {
      query = query.lte('price', otherFilters.maxPrice);
    }
    
    // Execute query to get listings
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
    
    // Process listings to get locations (still need client-side processing)
    const listings = addGroupNames(data || []);
    
    // Get all unique suburb locations
    const suburbCounts = new Map<string, number>();
    
    // Function to normalize and process each location
    const processLocation = (area: string) => {
      if (!area || typeof area !== 'string') return;
      
      // Trim and normalize the location
      const normalizedArea = area.trim();
      if (normalizedArea.length === 0) return;
      
      // Add the exact location
      suburbCounts.set(normalizedArea, (suburbCounts.get(normalizedArea) || 0) + 1);
      
      // Also add individual parts from comma-separated locations
      if (normalizedArea.includes(',')) {
        normalizedArea.split(',').forEach(part => {
          const trimmedPart = part.trim();
          if (trimmedPart && trimmedPart.toLowerCase() !== 'cape town') {
            suburbCounts.set(trimmedPart, (suburbCounts.get(trimmedPart) || 0) + 1);
          }
        });
      }
    };
    
    // Process all locations
    for (const listing of listings) {
      if (listing.collection_areas) {
        // Handle both string and array formats
        if (typeof listing.collection_areas === 'string') {
          try {
            // Try to parse JSON string
            const parsed = JSON.parse(listing.collection_areas);
            if (Array.isArray(parsed)) {
              parsed.forEach(processLocation);
            } else if (parsed) {
              processLocation(String(parsed));
            }
          } catch (e) {
            // If not valid JSON, treat as plain string
            processLocation(listing.collection_areas);
          }
        } else if (Array.isArray(listing.collection_areas)) {
          listing.collection_areas.forEach(area => processLocation(String(area)));
        }
      }
    }
    
    // Calculate region counts based on suburb counts
    const regionCounts = new Map<string, number>();
    
    // Add region counts
    Object.entries(LOCATION_HIERARCHY).forEach(([region, suburbs]) => {
      let count = 0;
      // Count unique listings in this region by suburbs
      const suburbsInRegion = new Set();
      
      suburbs.forEach(suburb => {
        if (suburbCounts.has(suburb)) {
          count += suburbCounts.get(suburb) || 0;
          suburbsInRegion.add(suburb);
        }
      });
      
      // Only add regions that have at least one suburb with listings
      if (suburbsInRegion.size > 0) {
        regionCounts.set(region, count);
      }
    });
    
    // Combine suburb and region counts
    const combinedCounts = new Map<string, number>();
    // Add all suburb counts to combined counts
    suburbCounts.forEach((count, name) => {
      combinedCounts.set(name, count);
    });
    // Add all region counts to combined counts
    regionCounts.forEach((count, name) => {
      combinedCounts.set(name, count);
    });
    
    return Array.from(combinedCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        // Sort regions first, then by count (descending)
        const aIsRegion = isRegion(a.name);
        const bIsRegion = isRegion(b.name);
        
        if (aIsRegion && !bIsRegion) return -1;
        if (!aIsRegion && bIsRegion) return 1;
        
        // If both are the same type, sort by count
        return b.count - a.count;
      });
  } catch (error) {
    console.error('Error in getLocationsWithCounts:', error);
    return [];
  }
}

/**
 * Get price ranges with their counts using database-level counting
 */
export async function getPriceRangesWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Define price ranges
    const ranges = [
      { range: 'Under R100', min: 0, max: 99.99 },
      { range: 'R100 - R200', min: 100, max: 200 },
      { range: 'R200 - R500', min: 200, max: 500 },
      { range: 'R500 - R1000', min: 500, max: 1000 },
      { range: 'R1000 - R2000', min: 1000, max: 2000 },
      { range: 'Over R2000', min: 2000, max: 100000 }
    ];
    
    // If we have pre-filtered listings, count from those
    if (preFilteredListings && preFilteredListings.length > 0) {
      // Calculate counts for each price range from the pre-filtered listings
      return ranges.map(range => {
        const count = preFilteredListings.filter(listing => {
          const price = typeof listing.price === 'string' 
            ? parseFloat(listing.price) 
            : (listing.price || 0);
          return price >= range.min && price <= range.max;
        }).length;
        
        return { ...range, count };
      });
    }
    
    // Create a copy of filters without the price range
    const { minPrice, maxPrice, ...otherFilters } = filters;
    
    // Execute a count query for each price range
    const priceRangePromises = ranges.map(async range => {
      // Build base query
      let query = supabase
        .from(TABLES.LISTINGS)
        .select('price', { count: 'exact', head: true })
        .gte('price', range.min)
        .lte('price', range.max);
      
      // Apply other filters
      if (otherFilters.includeISO !== true) {
        query = query.eq('is_iso', false);
      }
      
      if (otherFilters.category) {
        query = query.ilike('category', otherFilters.category);
      }
      
      if (otherFilters.condition) {
        query = query.eq('condition', otherFilters.condition);
      }
      
      if (otherFilters.dateRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
        query = query.gte('posted_on', cutoffDate.toISOString());
      }
      
      // Execute the count query
      const { count, error } = await query;
      
      if (error) {
        console.error(`Error getting count for price range ${range.range}:`, error);
        return { ...range, count: 0 };
      }
      
      return { ...range, count: count || 0 };
    });
    
    // Wait for all price range queries to complete
    return await Promise.all(priceRangePromises);
  } catch (error) {
    console.error('Error in getPriceRangesWithCounts:', error);
    return [];
  }
}

/**
 * Get date ranges with their counts using database-level counting
 */
export async function getDateRangesWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Define date ranges
    const ranges = [
      { range: 'Last 24 hours', days: 1 },
      { range: 'Last 3 days', days: 3 },
      { range: 'Last week', days: 7 },
      { range: 'Last month', days: 30 },
      { range: 'Last 3 months', days: 90 },
      { range: 'All time', days: 3650 }
    ];
    
    // If we have pre-filtered listings, count from those
    if (preFilteredListings && preFilteredListings.length > 0) {
      // Calculate counts for each date range from the pre-filtered listings
      return ranges.map(range => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - range.days);
        
        const count = preFilteredListings.filter(listing => {
          const postedDate = new Date(listing.posted_on);
          return postedDate >= cutoffDate;
        }).length;
        
        return { ...range, count };
      });
    }
    
    // Create a copy of filters without the date range
    const { dateRange, ...otherFilters } = filters;
    
    // Execute a count query for each date range
    const dateRangePromises = ranges.map(async range => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - range.days);
      
      // Build base query
      let query = supabase
        .from(TABLES.LISTINGS)
        .select('posted_on', { count: 'exact', head: true })
        .gte('posted_on', cutoffDate.toISOString());
      
      // Apply other filters
      if (otherFilters.includeISO !== true) {
        query = query.eq('is_iso', false);
      }
      
      if (otherFilters.category) {
        query = query.ilike('category', otherFilters.category);
      }
      
      if (otherFilters.condition) {
        query = query.eq('condition', otherFilters.condition);
      }
      
      if (otherFilters.minPrice !== undefined) {
        query = query.gte('price', otherFilters.minPrice);
      }
      
      if (otherFilters.maxPrice !== undefined) {
        query = query.lte('price', otherFilters.maxPrice);
      }
      
      // Execute the count query
      const { count, error } = await query;
      
      if (error) {
        console.error(`Error getting count for date range ${range.range}:`, error);
        return { ...range, count: 0 };
      }
      
      return { ...range, count: count || 0 };
    });
    
    // Wait for all date range queries to complete
    return await Promise.all(dateRangePromises);
  } catch (error) {
    console.error('Error in getDateRangesWithCounts:', error);
    return [];
  }
}

/**
 * Get conditions with their counts using database-level counting
 */
export async function getConditionsWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Define common conditions
    const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
    
    // Create a copy of filters without the condition
    const { condition, ...otherFilters } = filters;
    
    // Execute a count query for each condition
    const conditionPromises = conditions.map(async conditionValue => {
      // Build base query
      let query = supabase
        .from(TABLES.LISTINGS)
        .select('condition', { count: 'exact', head: true })
        .eq('condition', conditionValue);
      
      // Apply other filters
      if (otherFilters.includeISO !== true) {
        query = query.eq('is_iso', false);
      }
      
      if (otherFilters.category) {
        query = query.ilike('category', otherFilters.category);
      }
      
      if (otherFilters.dateRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
        query = query.gte('posted_on', cutoffDate.toISOString());
      }
      
      if (otherFilters.minPrice !== undefined) {
        query = query.gte('price', otherFilters.minPrice);
      }
      
      if (otherFilters.maxPrice !== undefined) {
        query = query.lte('price', otherFilters.maxPrice);
      }
      
      // Execute the count query
      const { count, error } = await query;
      
      if (error) {
        console.error(`Error getting count for condition ${conditionValue}:`, error);
        return { name: conditionValue, count: 0 };
      }
      
      return { name: conditionValue, count: count || 0 };
    });
    
    // Wait for all condition count queries to complete
    const results = await Promise.all(conditionPromises);
    
    // Filter out conditions with zero count
    return results.filter(item => item.count > 0);
  } catch (error) {
    console.error('Error in getConditionsWithCounts:', error);
    return [];
  }
}

/**
 * Get sizes with counts based on other filters
 * Note: Since sizes are stored in an array, we still need to use client-side filtering
 */
export async function getSizesWithCounts(filters: FilterCriteria = {}, preFilteredListings: ListingRecord[] | null = null) {
  try {
    // Create a copy of filters without the sizes
    const { sizes, ...otherFilters } = filters;
    
    // Build base query with all other filters
    let query = supabase.from(TABLES.LISTINGS).select('*');
    
    // Apply other filters
    if (otherFilters.includeISO !== true) {
      query = query.eq('is_iso', false);
    }
    
    if (otherFilters.category) {
      query = query.ilike('category', otherFilters.category);
    }
    
    if (otherFilters.condition) {
      query = query.eq('condition', otherFilters.condition);
    }
    
    if (otherFilters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - otherFilters.dateRange);
      query = query.gte('posted_on', cutoffDate.toISOString());
    }
    
    if (otherFilters.minPrice !== undefined) {
      query = query.gte('price', otherFilters.minPrice);
    }
    
    if (otherFilters.maxPrice !== undefined) {
      query = query.lte('price', otherFilters.maxPrice);
    }
    
    // Execute query to get listings
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching listings for size counts:', error);
      return [];
    }
    
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
    
    // Process listings to extract size information
    const listings = addGroupNames(data || []);
    
    // Count occurrences of each size
    const sizeObjects = commonSizes.map(sizeName => {
      const count = listings.filter(listing => {
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
  } catch (error) {
    console.error('Error in getSizesWithCounts:', error);
    return [];
  }
}

/**
 * Get all filter options with counts more efficiently
 */
export async function getAllFilterOptions(filters: FilterCriteria = {}) {
  try {
    // When location is selected, we need to pre-filter the dataset
    let preFilteredListings: ListingRecord[] | null = null;
    
    if (filters.location) {
      // Get all listings matching all filters except those we want counts for
      const { location, category, minPrice, maxPrice, dateRange, ...otherFilters } = filters;
      
      // Build query for pre-filtering
      let query = supabase.from(TABLES.LISTINGS).select('*');
      
      // Apply common filters
      if (otherFilters.includeISO !== true) {
        query = query.eq('is_iso', false);
      }
      
      if (otherFilters.condition) {
        query = query.eq('condition', otherFilters.condition);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error('Error pre-filtering for filter options:', error);
      } else if (data) {
        // Apply location filter in memory since it can't be done efficiently in the database
        let listings = addGroupNames(data);
        
        // Apply location filter if specified
        if (location) {
          const locationToMatch = location.trim();
          
          // Check if the location is a region
          if (isRegion(locationToMatch)) {
            // Get all suburbs for this region
            const suburbsForRegion = getSuburbsForRegion(locationToMatch);
            
            // Filter listings that match any suburb in this region
            listings = listings.filter(listing => {
              if (!listing.collection_areas || !Array.isArray(listing.collection_areas)) {
                return false;
              }
              
              const normalizedAreas = listing.collection_areas.map(area => 
                typeof area === 'string' ? area.trim() : String(area)
              );
              
              // Check if any collection area matches any suburb in the region
              return normalizedAreas.some(area => 
                suburbsForRegion.some(suburb => locationsMatch(area, suburb))
              );
            });
          } else {
            // Regular location filtering
            listings = listings.filter(listing => {
              if (!listing.collection_areas || !Array.isArray(listing.collection_areas)) {
                return false;
              }
              
              const normalizedAreas = listing.collection_areas.map(area => 
                typeof area === 'string' ? area.trim() : String(area)
              );
              
              // Use our new matching function that handles standardized locations
              return normalizedAreas.some(area => locationsMatch(area, locationToMatch));
            });
          }
        }
        
        preFilteredListings = listings;
      }
    }
    
    // 1. Get categories with counts (passing pre-filtered listings if we have them)
    const categories = await getCategoriesWithCounts(filters, preFilteredListings);
    
    // 2. Get other filter options with counts (passing pre-filtered listings)
    const locations = await getLocationsWithCounts(filters, preFilteredListings);
    const priceRanges = await getPriceRangesWithCounts(filters, preFilteredListings);
    const dateRanges = await getDateRangesWithCounts(filters, preFilteredListings);
    const conditions = await getConditionsWithCounts(filters, preFilteredListings);
    const sizes = await getSizesWithCounts(filters, preFilteredListings);
    
    return {
      categories,
      locations,
      priceRanges,
      dateRanges,
      conditions,
      sizes
    };
  } catch (error) {
    console.error('Error in getAllFilterOptions:', error);
    return {
      categories: [],
      locations: [],
      priceRanges: [],
      dateRanges: [],
      conditions: [],
      sizes: []
    };
  }
} 