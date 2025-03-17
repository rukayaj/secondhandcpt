/**
 * Unified Listing Service
 * 
 * This module handles all listing-related operations against the database
 */

import { getAdminClient, TABLES, STORAGE_BUCKETS, ListingRecord } from './supabase';

// Database format - what Gemini should output directly
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
 * Check if a listing already exists in the database 
 * Sales listings checked based on image hashes
 * ISO listings checked based on sender number + raw text
 * 
 * @param sender The WhatsApp sender number
 * @param messageBody The raw message text
 * @param imageHashes Optional array of image hashes
 * @returns Whether the listing already exists
 */
async function listingExists(
  sender: string,
  messageBody: string,
  imageHashes?: string[]
): Promise<boolean> {
  const supabase = getAdminClient();

  try {
    if (!imageHashes?.length) {
      // For ISO listings, check based on sender + text
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .select('id')
        .eq('sender', sender)
        .eq('text', messageBody)
        .eq('is_iso', true)
        .limit(1);

      if (error) throw error;
      return data?.length > 0;

    } else {
      const { data, error } = await supabase
        .from(TABLES.LISTINGS)
        .select('id')
        .eq('is_iso', false)
        .contains('image_hashes', imageHashes)
        .limit(1);

      if (error) throw error;
      return data.length > 0;
    }

  } catch (error) {
    console.error('Error checking if listing exists:', error);
    return false;
  }
}

/**
 * Add multiple listings to the database, skipping duplicates
 * Now accepts listings in DB format directly or in client format
 * 
 * @param listings Array of listings to add (in DB format or client format)
 * @returns Statistics about the operation
 */
export async function addListings(listings: Listing[]) {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .insert(listings);
}

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
 * Delete a listing
 * 
 * @param id The ID of the listing to delete
 * @returns Whether the deletion was successful
 */
export async function deleteListing(id: string): Promise<boolean> {
  try {
    // Get the listing first to find any associated images
    const { data: listing, error: fetchError } = await supabase
      .from(TABLES.LISTINGS)
      .select('images')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching listing ${id} before deletion:`, fetchError);
    } else if (listing && listing.images && listing.images.length > 0) {
      // Delete associated images from storage
      for (const imagePath of listing.images) {
        const { error: storageError } = await supabase
          .storage
          .from(STORAGE_BUCKETS.LISTING_IMAGES)
          .remove([imagePath]);
        
        if (storageError) {
          console.warn(`Warning: Failed to delete image ${imagePath}:`, storageError);
        }
      }
    }
    
    // Delete the listing from the database
    const { error } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting listing: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteListing:', error);
    return false;
  }
}

/**
 * Delete listings that are older than a specified date for a given WhatsApp group
 * 
 * @param groupName The name of the WhatsApp group
 * @param olderThanDate Date to compare against (delete listings older than this)
 * @returns Result of the operation
 */
export async function deleteExpiredListings(
  groupName: string, 
  olderThanDate: string
): Promise<{deleted: number, imagesRemoved: number, error: any}> {
  try {
    // Find listings to delete (for logging purposes)
    const { data: expiredListings, error: countError } = await supabase
      .from(TABLES.LISTINGS)
      .select('id, title, posted_on, images')
      .eq('whatsapp_group', groupName)
      .lt('posted_on', olderThanDate);
    
    if (countError) {
      console.error(`Error finding expired listings: ${countError.message}`);
      return { deleted: 0, imagesRemoved: 0, error: countError };
    }
    
    if (!expiredListings || expiredListings.length === 0) {
      return { deleted: 0, imagesRemoved: 0, error: null };
    }
    
    // Delete all associated images from storage bucket first
    let removedImageCount = 0;
    for (const listing of expiredListings) {
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        for (const imagePath of listing.images) {
          const { error: storageError } = await supabase
            .storage
            .from(STORAGE_BUCKETS.LISTING_IMAGES)
            .remove([imagePath]);
          
          if (!storageError) {
            removedImageCount++;
          } else {
            console.warn(`Warning: Failed to delete image ${imagePath}: ${storageError.message}`);
          }
        }
      }
    }
    
    // Delete the expired listings
    const { error: deleteError } = await supabase
      .from(TABLES.LISTINGS)
      .delete()
      .eq('whatsapp_group', groupName)
      .lt('posted_on', olderThanDate);
    
    if (deleteError) {
      return { 
        deleted: 0, 
        imagesRemoved: removedImageCount, 
        error: deleteError 
      };
    }
    
    console.log(`Deleted ${expiredListings.length} expired listings and ${removedImageCount} associated images for group "${groupName}"`);
    
    return { 
      deleted: expiredListings.length, 
      imagesRemoved: removedImageCount,
      error: null
    };
  } catch (error) {
    console.error(`Error in deleteExpiredListings: ${error instanceof Error ? error.message : String(error)}`);
    return { deleted: 0, imagesRemoved: 0, error };
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