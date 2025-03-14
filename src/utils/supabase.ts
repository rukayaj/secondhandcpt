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
  whatsapp_group: string;
  date: string;
  sender: string;
  text: string;
  images: string[] | undefined;
  price: number | null;
  condition: string | null;
  collection_areas: string[] | undefined;
  date_added: string | undefined;
  checked_on: string | undefined;
  category: string | undefined;
  is_iso: boolean | undefined; // Flag for "In Search Of" listings
  sizes: string[] | undefined; // Array of size values
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