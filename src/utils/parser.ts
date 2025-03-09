import { Listing } from './listingUtils';
import { supabase, TABLES, ListingRecord } from '@/utils/supabase';
import listingsData from '@/listings.json';

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
    isISO: record.text.toLowerCase().includes('iso') || record.text.toLowerCase().includes('in search of')
  };
}

// Convert JSON data to Listing format for development
function convertJsonToListing(item: any, index: number): Listing {
  return {
    id: String(index),
    whatsappGroup: item.whatsappGroup || '',
    date: item.date || '',
    sender: item.sender || '',
    text: item.text || '',
    images: item.images || [],
    price: item.price || null,
    condition: item.condition || null,
    collectionAreas: item.collectionAreas || [],
    dateAdded: item.date || '',
    checkedOn: null,
    isISO: item.isISO || false
  };
}

/**
 * Search listings by a search term
 * This function searches through the listings based on the provided search term
 * It looks for matches in the text, sender, and collection areas
 */
export function searchListings(searchTerm: string): Listing[] {
  if (!searchTerm) {
    return [];
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  // For development, use the JSON data
  const allListings: Listing[] = listingsData.map(convertJsonToListing);
  
  // Filter listings based on search term
  return allListings.filter(listing => {
    return (
      listing.text.toLowerCase().includes(normalizedSearchTerm) ||
      listing.sender.toLowerCase().includes(normalizedSearchTerm) ||
      listing.whatsappGroup.toLowerCase().includes(normalizedSearchTerm) ||
      (listing.collectionAreas && listing.collectionAreas.some(area => 
        area.toLowerCase().includes(normalizedSearchTerm)
      ))
    );
  });
}

/**
 * Actual implementation of searchListings that would be used in production
 * This is async and would need to be used with getServerSideProps
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