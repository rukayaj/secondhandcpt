/**
 * Centralized Supabase client module
 * 
 * This module provides Supabase clients for different contexts:
 * - Regular client: For browser usage with public API key
 * - Admin client: For server-side operations requiring service role key
 */

const { createClient } = require('@supabase/supabase-js');

// Constants
const TABLES = {
  LISTINGS: 'listings',
};

// Storage buckets
const STORAGE_BUCKETS = {
  LISTING_IMAGES: 'listing-images',
};

// Regular client (for browser usage)
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Admin client (for server-side operations)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

module.exports = {
  getClient,
  getAdminClient,
  TABLES,
  STORAGE_BUCKETS
}; 