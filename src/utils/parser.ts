import { Listing } from './listingUtils';
import { supabase, TABLES, ListingRecord } from '@/utils/supabase';

// Re-export the Listing interface
export type { Listing };

// Function to convert a Supabase record to the application's Listing format
function convertRecordToListing(record: ListingRecord): Listing {
  return {
    id: record.id || '',
    whatsappGroup: record.whatsapp_group,
    date: record.date,
    sender: record.sender,
    text: record.text,
    images: record.images || [],
    price: record.price,
    condition: record.condition,
    collectionAreas: record.collection_areas || [],
    dateAdded: record.date_added || '',
    checkedOn: record.checked_on || null,
    isISO: record.text.toLowerCase().includes('iso') || record.text.toLowerCase().includes('in search of'),
    category: record.category || 'Uncategorised'
  };
}

/**
 * Search listings by a search term - Synchronous version (wrapper around the async version)
 * This function is kept for backwards compatibility but now uses searchListingsAsync
 * It returns an empty array and logs a console warning, since it should be replaced with the async version
 * @deprecated Use searchListingsAsync instead which queries the database
 */
export function searchListings(searchTerm: string): Listing[] {
  console.warn('searchListings is deprecated and returns an empty array. Use searchListingsAsync instead which queries the database.');
  return [];
}

/**
 * Search listings by a search term - Async version that queries the database
 * This function searches through the listings based on the provided search term
 * It looks for matches in the text, sender, and other fields
 */
export async function searchListingsAsync(searchTerm: string): Promise<Listing[]> {
  if (!searchTerm) {
    return [];
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .or(`text.ilike.%${normalizedSearchTerm}%,sender.ilike.%${normalizedSearchTerm}%`)
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error searching listings:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
} 