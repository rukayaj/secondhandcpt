import { supabase, TABLES, ListingRecord } from './supabase';

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
  checkedOn: string;
  isISO: boolean; // In Search Of
}

// Convert a Supabase record to the application's Listing format
export function convertRecordToListing(record: ListingRecord): Listing {
  return {
    id: record.id || '',
    whatsappGroup: record.whatsapp_group,
    date: record.date,
    sender: record.sender,
    text: record.text,
    images: record.images,
    price: record.price,
    condition: record.condition,
    collectionAreas: record.collection_areas,
    dateAdded: record.date_added,
    checkedOn: record.checked_on,
    isISO: record.text.toLowerCase().includes('iso') || record.text.toLowerCase().includes('in search of')
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

// Get listings by category (derived from text content)
export async function getListingsByCategory(category: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(TABLES.LISTINGS)
    .select('*')
    .textSearch('text', category, { config: 'english' })
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

// Get categories with counts
export async function getCategoriesWithCounts(): Promise<{ name: string; count: number }[]> {
  // This is a simplified approach - in a real app, you might have a separate categories table
  // or use a more sophisticated text analysis approach
  const listings = await getAllListings();
  
  const categories = [
    'Clothing',
    'Toys',
    'Books',
    'Furniture',
    'Strollers',
    'Car Seats',
    'Cribs',
    'High Chairs',
    'Bottles',
    'Diapers',
    'Shoes'
  ];
  
  return categories.map(category => {
    const count = listings.filter(listing => 
      listing.text.toLowerCase().includes(category.toLowerCase())
    ).length;
    
    return { name: category, count };
  }).sort((a, b) => b.count - a.count);
} 