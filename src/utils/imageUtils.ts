import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client for interacting with the storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get a properly formatted image URL
 * @param imagePath The image path or URL
 * @returns A properly formatted URL for use with next/image
 */
export function getFormattedImageUrl(imagePath: string): string {
  if (!imagePath) {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=No%20Image`;
  }

  // Check if the image path is already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a Supabase storage path, create a proper Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      // Handle various path formats correctly
      if (imagePath.startsWith('listings/')) {
        // Path is already prefixed with "listings/"
        return `${supabaseUrl}/storage/v1/object/public/listing-images/${imagePath}`;
      } else if (imagePath.includes('@g.us')) {
        // Path is a WhatsApp message ID format but without "listings/" prefix
        return `${supabaseUrl}/storage/v1/object/public/listing-images/listings/${imagePath}`;
      }
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return `https://placehold.co/600x400/e2e8f0/1e293b?text=Error`;
    }
  }
  
  // If it's a relative path starting with slash, it's a local path
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's a relative path without a leading slash, add one to make it a local path
  if (imagePath) {
    return `/${imagePath}`;
  }
  
  return imagePath;
} 