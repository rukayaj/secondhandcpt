/**
 * Unified Listing Service
 * 
 * This module handles all listing-related operations against the database
 */

import { getAdminClient, TABLES, STORAGE_BUCKETS, ListingRecord } from './supabase';

export interface Listing {
  id?: string;
  whatsapp_group: string;
  title: string;
  text: string;
  sender: string;
  price?: string | number | null;
  condition?: string | null;
  images?: string[];
  collection_areas?: string[];
  category?: string | null;
  is_iso?: boolean;
  is_sold?: boolean;
  sizes?: string[];
  image_hashes?: string[];
  posted_on?: string;
}

// Query options for listing retrieval
export interface ListingQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

// Create a Supabase client for all operations
const supabase = getAdminClient();


/**
 * Get all listings from the database with pagination and sorting
 * 
 * @param options Query options for pagination, sorting, etc.
 * @returns Array of listings
 */
export async function getListings(options: ListingQueryOptions = {}): Promise<Listing[]> {
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
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new Error(`Error getting listings: ${error.message}`);
    }
    
    return data
  } catch (error) {
    console.error('Error in getListings:', error);
    return [];
  }
}

/**
 * Get a listing by ID
 * 
 * @param id The listing ID
 * @returns The listing or null if not found
 */
export async function getListingById(id: string): Promise<Listing | null> {
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
    
    return fromDbFormat(data as ListingRecord);
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
): Promise<Listing[]> {
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
    
    return data;
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
): Promise<Listing[]> {
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
    
    return data;
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
): Promise<Listing[]> {
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
    
    return (data || []).map(fromDbFormat);
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
export async function getISOListings(options: ListingQueryOptions = {}): Promise<Listing[]> {
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
      .eq('is_iso', true)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching ISO listings:', error);
      return [];
    }
    
    return (data || []).map(fromDbFormat);
  } catch (error) {
    console.error(`Error in getISOListings: ${error}`);
    return [];
  }
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