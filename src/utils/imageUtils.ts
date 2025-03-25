import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with read-only credentials
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Get a formatted URL for an image path stored in Supabase
 * This will create a publicly accessible URL for the image
 */
export function getFormattedImageUrl(imagePath: string): string {
  if (!imagePath) {
    return 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image';
  }
  
  try {
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Get public URL for Supabase storage
    const { data } = supabase.storage.from('images').getPublicUrl(imagePath);
    
    if (data?.publicUrl) {
      return data.publicUrl;
    }
    
    // Fallback to a placeholder
    return 'https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Error';
  } catch (error) {
    console.error('Error getting image URL:', error);
    return 'https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Error';
  }
} 