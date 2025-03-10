import { supabase, TABLES, ListingRecord } from '@/utils/supabase';

// Interface for the listing data used in the application
export interface Listing {
  id: string;
  whatsappGroup: string;
  date: string;
  sender: string;
  text: string;
  images: string[];
  price: number | null;
  condition: string | null;
  collectionAreas: string[];
  dateAdded: string;
  checkedOn: string | null;
  isISO: boolean; // In Search Of
  category: string; // Add category field
}

// Convert a Supabase record to the application's Listing format
export function convertRecordToListing(record: ListingRecord): Listing {
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
    category: record.category || 'Other' // Use the database category or default to 'Other'
  };
}

// Get all listings from Supabase
export async function getAllListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
}

// Get listings by category (using the category column)
export async function getListingsByCategory(category: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .eq('category', category) // Use the category column directly
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error fetching listings by category:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
}

// Get listings by location
export async function getListingsByLocation(location: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .contains('collection_areas', [location])
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error fetching listings by location:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
}

// Get listings by price range
export async function getListingsByPriceRange(minPrice: number, maxPrice: number): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error fetching listings by price range:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
}

// Get ISO (In Search Of) posts
export async function getISOPosts(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .or('text.ilike.%iso%,text.ilike.%in search of%')
    .order('date_added', { ascending: false });

  if (error) {
    console.error('Error fetching ISO posts:', error);
    return [];
  }

  return (data as ListingRecord[]).map(convertRecordToListing);
}

// Get categories with counts (using the category column)
export async function getCategoriesWithCounts(): Promise<{ name: string; count: number }[]> {
  try {
    // Use SQL to get category counts directly from the database
    const { data, error } = await supabase
      .rpc('get_category_counts');
    
    if (error) {
      console.error('Error fetching category counts:', error);
      
      // Fallback: Query and count categories manually
      console.log('Falling back to manual category counting...');
      const { data: listings, error: listingsError } = await supabase
        .from(TABLES.LISTINGS)
        .select('category');
      
      if (listingsError) {
        console.error('Error in fallback category counting:', listingsError);
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
    }
    
    // If RPC call succeeded, return its results
    return data;
  } catch (error) {
    console.error('Unexpected error in getCategoriesWithCounts:', error);
    return [];
  }
}

// Get a listing by ID
export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching listing by ID:', error);
    return null;
  }

  return convertRecordToListing(data as ListingRecord);
} 