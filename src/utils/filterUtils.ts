import { ListingRecord } from './supabase';
import { getListings, getISOListings } from './listingService';
import { supabase, TABLES } from './supabase';
import { WHATSAPP_GROUPS } from './whatsappGroups';


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
    
    // Apply pagination and ordering
    dataQuery = dataQuery
      .order('posted_on', { ascending: false })
      .range(offset, offset + limit - 1);
  
    // Execute data query
    const { data, error: dataError } = await dataQuery;
  
    if (dataError) {
      console.error('Error filtering listings:', dataError);
      return { listings: [], totalCount: 0 };
    }
  
    // Apply post-processing filters that cannot be done at database level
    let filteredListings = addGroupNames(data || []);
    
    // Filter by location (can't be done in database query efficiently)
    if (filters.location) {
      filteredListings = filteredListings.filter(listing => 
        listing.collection_areas && 
        listing.collection_areas.some((area: string) => 
          area.toLowerCase().includes(filters.location!.toLowerCase())
        )
      );
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
  
    return {
      listings: filteredListings,
      totalCount: count || 0
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
      filteredPosts = filteredPosts.filter(post => 
        post.collection_areas && 
        post.collection_areas.some((area: string) => 
          area.toLowerCase().includes(filters.location!.toLowerCase())
        )
      );
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
export async function getCategoriesWithCounts(filters: FilterCriteria = {}) {
  try {
    // Get all defined categories
    const definedCategories = getAllCategories();
    const categoryNames = Object.keys(definedCategories);
    
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
export async function getLocationsWithCounts(filters: FilterCriteria = {}) {
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
    
    // Get all unique locations
    const locationCounts = new Map<string, number>();
    
    for (const listing of listings) {
      if (listing.collection_areas) {
        for (const area of listing.collection_areas) {
          locationCounts.set(area, (locationCounts.get(area) || 0) + 1);
        }
      }
    }
    
    return Array.from(locationCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getLocationsWithCounts:', error);
    return [];
  }
}

/**
 * Get price ranges with their counts using database-level counting
 */
export async function getPriceRangesWithCounts(filters: FilterCriteria = {}) {
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
export async function getDateRangesWithCounts(filters: FilterCriteria = {}) {
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
export async function getConditionsWithCounts(filters: FilterCriteria = {}) {
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
export async function getSizesWithCounts(filters: FilterCriteria = {}) {
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
    // 1. Get categories with counts
    const categories = await getCategoriesWithCounts(filters);
    
    // 2. Get other filter options with counts
    const locations = await getLocationsWithCounts(filters);
    const priceRanges = await getPriceRangesWithCounts(filters);
    const dateRanges = await getDateRangesWithCounts(filters);
    const conditions = await getConditionsWithCounts(filters);
    const sizes = await getSizesWithCounts(filters);
    
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