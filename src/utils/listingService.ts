import { ListingRecord } from './supabase';

// Sample data for demo purposes
const MOCK_LISTINGS: ListingRecord[] = [
  {
    id: '1',
    title: 'Baby Clothes Bundle 0-3 months',
    description: 'Gently used baby clothes in excellent condition.',
    price: 150,
    category: 'Clothing',
    condition: 'Good',
    posted_on: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    collection_areas: ['Sea Point', 'Green Point'],
    is_sold: false,
    is_iso: false,
    whatsapp_group: 'nifty_thrifty_0_1',
    group_name: 'Nifty Thrifty 0-1 years'
  },
  {
    id: '2',
    title: 'Toddler Shoes Size 5',
    description: 'Barely worn toddler shoes, still in box.',
    price: 100,
    category: 'Footwear',
    condition: 'Like New',
    posted_on: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    collection_areas: ['Rondebosch', 'Claremont'],
    is_sold: false,
    is_iso: false,
    whatsapp_group: 'nifty_thrifty_1_3',
    group_name: 'Nifty Thrifty 1-3 years'
  },
  {
    id: '3',
    title: 'Looking for: Baby Monitor',
    description: 'Looking for a gently used baby monitor.',
    category: 'Safety',
    posted_on: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_sold: false,
    is_iso: true,
    whatsapp_group: 'nifty_thrifty_0_1',
    group_name: 'Nifty Thrifty 0-1 years'
  },
  {
    id: '4',
    title: 'Kids Bike for 5-6 year old',
    description: 'Kids bike in good condition, suitable for 5-6 year old.',
    price: 300,
    category: 'Toys',
    condition: 'Good',
    posted_on: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    collection_areas: ['Constantia', 'Tokai'],
    is_sold: true,
    is_iso: false,
    whatsapp_group: 'nifty_thrifty_5_8',
    group_name: 'Nifty Thrifty 5-8 years'
  }
];

/**
 * Get all listings (with optional filtering)
 */
export async function getListings(category?: string): Promise<ListingRecord[]> {
  // Return filtered or all mock listings
  if (category) {
    return MOCK_LISTINGS.filter(listing => 
      listing.category?.toLowerCase() === category.toLowerCase() && !listing.is_iso
    );
  }
  return MOCK_LISTINGS.filter(listing => !listing.is_iso);
}

/**
 * Get ISO listings
 */
export async function getISOListings(): Promise<ListingRecord[]> {
  return MOCK_LISTINGS.filter(listing => listing.is_iso);
}

/**
 * Get a single listing by ID
 */
export async function getListingById(id: string): Promise<ListingRecord | null> {
  const listing = MOCK_LISTINGS.find(item => item.id === id);
  return listing || null;
}

/**
 * Search listings by title or description
 */
export async function searchListings(query: string): Promise<ListingRecord[]> {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_LISTINGS.filter(listing => 
    listing.title.toLowerCase().includes(lowercaseQuery) || 
    (listing.description && listing.description.toLowerCase().includes(lowercaseQuery))
  );
} 