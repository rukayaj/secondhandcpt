import { createClient } from '@supabase/supabase-js';

// Define table names
export const TABLES = {
  LISTINGS: 'listings',
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
}

// Create a Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
); 