import { createClient } from '@supabase/supabase-js';

// Define table names
export const TABLES = {
  LISTINGS: 'listings',
};

// Define storage bucket names
export const STORAGE_BUCKETS = {
  LISTING_IMAGES: 'listing-images',
};

// Define the Supabase record type for listings
export interface ListingRecord {
  id: string;
  title: string;
  price: string | number | null;
  whatsapp_group: string;
  text: string;
  images: string[];
  condition: string | null;
  collection_areas: string[];
  posted_on: string;
  category: string | null;
  is_iso: boolean;
  is_sold: boolean;
  sender: string;
  sizes: string[];
  image_hashes: string[];
}

/**
 * Get a Supabase client with admin privileges
 * 
 * @returns Supabase Admin client
 */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get a Supabase client with anonymous privileges
 * This client is suitable for client-side usage
 * 
 * @returns Supabase Anonymous client
 */
export function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Create a default Supabase client for client-side usage
export const supabase = getAnonClient(); 