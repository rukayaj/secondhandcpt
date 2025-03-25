/**
 * Listing Service
 * 
 * Provides read-only access to listings with group name conversion
 */

import { supabase, TABLES, type ListingRecord } from './supabase';
import { WHATSAPP_GROUPS } from './whatsappGroups';

// Query options for listing retrieval
export interface ListingQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  fetchAll?: boolean;
}

/**
 * Add human-readable group names to listings
 * 
 * @param listings Array of listings from the database
 * @returns Same listings with group_name field added
 */
function addGroupNames(listings: ListingRecord[]): ListingRecord[] {
  return listings.map(listing => {
    // Ensure collection_areas is always an array
    const cleanedListing = { ...listing };
    
    // If collection_areas is a string, try to parse it as JSON
    if (typeof cleanedListing.collection_areas === 'string') {
      try {
        // Need to cast to any first to avoid TypeScript errors
        const parsed = JSON.parse(cleanedListing.collection_areas as any);
        (cleanedListing as any).collection_areas = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If parsing fails, convert to array with the string as single item
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
 * Get all listings from the database with pagination and sorting
 * 
 * @param options Query options for pagination, sorting, etc.
 * @returns Array of listings with group names
 */
export async function getListings(options: ListingQueryOptions = {}): Promise<ListingRecord[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'posted_on',
      ascending = false
    } = options;
    
    // If fetchAll is specified, retrieve all listings with batched requests
    if (options.fetchAll) {
      console.log('Fetching all listings with batched pagination...');
      return await fetchAllListings(orderBy, ascending);
    }
    
    // Standard paginated request
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error getting listings: ${error.message}`);
    }
    
    return addGroupNames(data || []);
  } catch (error) {
    console.error('Error in getListings:', error);
    return [];
  }
}

/**
 * Fetch all listings using batched pagination
 * This is used when we need all listings for filtering operations
 */
async function fetchAllListings(orderBy = 'posted_on', ascending = false): Promise<ListingRecord[]> {
  try {
    // First get count to determine how many batches we need
    const { count, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw new Error(`Error getting listings count: ${countError.message}`);
    }
    
    if (!count) {
      return [];
    }
    
    console.log(`Total listings in database: ${count}`);
    
    // Use a reasonable batch size
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    console.log(`Fetching listings in ${batches} batches of ${batchSize}`);
    
    let allListings: ListingRecord[] = [];
    
    // Fetch all batches in parallel for efficiency
    const batchPromises = Array.from({ length: batches }, async (_, i) => {
      const offset = i * batchSize;
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .select('*')
        .order(orderBy, { ascending })
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error(`Error fetching batch ${i+1}/${batches}:`, error);
        return [];
      }
      
      console.log(`Fetched batch ${i+1}/${batches}: ${data?.length || 0} listings`);
      return data || [];
    });
    
    // Wait for all batches to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Combine all batches
    for (const batch of batchResults) {
      allListings = [...allListings, ...batch];
    }
    
    console.log(`Total listings fetched: ${allListings.length}`);
    
    return addGroupNames(allListings);
  } catch (error) {
    console.error('Error in fetchAllListings:', error);
    return [];
  }
}

/**
 * Get a listing by ID
 * 
 * @param id The listing ID
 * @returns The listing or null if not found
 */
export async function getListingById(id: string): Promise<ListingRecord | null> {
  try {
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching listing by ID:', error);
      return null;
    }
    
    if (data) {
      return addGroupNames([data])[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getListingById: ${error}`);
    return null;
  }
}

/**
 * Search listings by text in title, description, or sender
 * 
 * @param searchTerm The term to search for
 * @param options Query options for pagination, sorting, etc.
 * @returns Array of matching listings
 */
export async function searchListings(
  searchTerm: string, 
  options: ListingQueryOptions = {}
): Promise<ListingRecord[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'posted_on',
      ascending = false
    } = options;
    
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .or(`text.ilike.%${searchTerm}%,sender.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error searching listings: ${error.message}`);
    }
    
    return addGroupNames(data || []);
  } catch (error) {
    console.error('Error in searchListings:', error);
    return [];
  }
}

/**
 * Get listings by category
 * 
 * @param category The category name
 * @param options Query options
 * @returns Array of listings in the category
 */
export async function getListingsByCategory(
  category: string,
  options: ListingQueryOptions = {}
): Promise<ListingRecord[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'posted_on',
      ascending = false
    } = options;
    
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .eq('category', category)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching listings by category:', error);
      return [];
    }
    
    return addGroupNames(data || []);
  } catch (error) {
    console.error(`Error in getListingsByCategory: ${error}`);
    return [];
  }
}

/**
 * Get listings by location/collection area
 * 
 * @param location The location name
 * @param options Query options
 * @returns Array of listings with the specified location
 */
export async function getListingsByLocation(
  location: string,
  options: ListingQueryOptions = {}
): Promise<ListingRecord[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'posted_on',
      ascending = false
    } = options;
    
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .contains('collection_areas', [location])
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching listings by location:', error);
      return [];
    }
    
    return addGroupNames(data || []);
  } catch (error) {
    console.error(`Error in getListingsByLocation: ${error}`);
    return [];
  }
}

/**
 * Get "In Search Of" listings
 * 
 * @param options Query options
 * @returns Array of ISO listings
 */
export async function getISOListings(options: ListingQueryOptions = {}): Promise<ListingRecord[]> {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'posted_on',
      ascending = false
    } = options;
    
    // If fetchAll is specified, retrieve all ISO listings with batched requests
    if (options.fetchAll) {
      return await fetchAllISOListings(orderBy, ascending);
    }
    
    // Standard paginated request
    const { data, error } = await supabase
      .from(TABLES.LISTINGS)
      .select('*')
      .eq('is_iso', true)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching ISO listings:', error);
      return [];
    }
    
    return addGroupNames(data || []);
  } catch (error) {
    console.error(`Error in getISOListings: ${error}`);
    return [];
  }
}

/**
 * Fetch all ISO listings using batched pagination
 */
async function fetchAllISOListings(orderBy = 'posted_on', ascending = false): Promise<ListingRecord[]> {
  try {
    // First get count to determine how many batches we need
    const { count, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('*', { count: 'exact', head: true })
      .eq('is_iso', true);
    
    if (countError) {
      throw new Error(`Error getting ISO listings count: ${countError.message}`);
    }
    
    if (!count) {
      return [];
    }
    
    console.log(`Total ISO listings in database: ${count}`);
    
    // Use a reasonable batch size
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    console.log(`Fetching ISO listings in ${batches} batches of ${batchSize}`);
    
    let allListings: ListingRecord[] = [];
    
    // Fetch all batches in parallel
    const batchPromises = Array.from({ length: batches }, async (_, i) => {
      const offset = i * batchSize;
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .select('*')
        .eq('is_iso', true)
        .order(orderBy, { ascending })
        .range(offset, offset + batchSize - 1);
      
      if (error) {
        console.error(`Error fetching ISO batch ${i+1}/${batches}:`, error);
        return [];
      }
      
      return data || [];
    });
    
    // Wait for all batches to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Combine all batches
    for (const batch of batchResults) {
      allListings = [...allListings, ...batch];
    }
    
    return addGroupNames(allListings);
  } catch (error) {
    console.error('Error in fetchAllISOListings:', error);
    return [];
  }
}

/**
 * Get listings by price range
 * 
 * @param minPrice Minimum price
 * @param maxPrice Maximum price
 * @param options Optional query options
 * @returns Promise with matching listings
 */
export async function getListingsByPriceRange(
  minPrice: number, 
  maxPrice: number, 
  options: ListingQueryOptions = {}
): Promise<ListingRecord[]> {
  // Get all listings and filter by price client-side
  const allListings = await getListings(options);
  return allListings.filter(listing => {
    const price = typeof listing.price === 'string' 
      ? parseFloat(listing.price) 
      : (listing.price as number);
    
    return !isNaN(price) && price >= minPrice && price <= maxPrice;
  });
}

/**
 * Get a count of listings by category
 * 
 * @returns Array of category counts
 */
export async function getCategoryCounts(): Promise<{ name: string; count: number }[]> {
  try {
    // Try using an RPC function if it exists
    try {
      const { data, error } = await supabase.rpc('get_category_counts');
      if (!error && data) {
        return data;
      }
    } catch (rpcError) {
      console.warn('RPC get_category_counts failed, falling back to manual counting:', rpcError);
    }
    
    // Fallback: Query and count categories manually
    const { data: listings, error: listingsError } = await supabase
      .from(TABLES.LISTINGS)
      .select('category');
    
    if (listingsError) {
      console.error('Error fetching categories:', listingsError);
      return [];
    }
    
    // Count occurrences of each category
    const categoryCounts: Record<string, number> = {};
    for (const listing of listings) {
      const category = listing.category || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
    
    // Convert to required format and sort
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error in getCategoryCounts:', error);
    return [];
  }
} 