/**
 * Supabase client utility
 * 
 * This module provides Supabase client instances for both anonymous and admin access.
 */

const { createClient } = require('@supabase/supabase-js');

// Table names
const TABLES = {
  LISTINGS: 'listings',
};

// Storage bucket names
const STORAGE_BUCKETS = {
  LISTING_IMAGES: 'listing-images',
};

/**
 * Get a Supabase client with admin privileges
 * 
 * @returns {Object} Supabase Admin client
 */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Get a Supabase client with anonymous privileges
 * 
 * @returns {Object} Supabase Anonymous client
 */
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

module.exports = {
  getAdminClient,
  getAnonClient,
  TABLES,
  STORAGE_BUCKETS,
}; 