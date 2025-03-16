import { supabase } from '@/utils/supabase';

/**
 * Upload an image buffer to Supabase Storage
 * @param buffer The buffer to upload
 * @param listingId The ID of the listing the image belongs to
 * @param options Additional upload options
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  buffer: Buffer, 
  listingId: string, 
  options?: { 
    filename?: string, 
    contentType?: string 
  }
): Promise<string | null> {
  try {
    // Get file extension from options or default to jpg
    const fileExt = options?.filename ? options.filename.split('.').pop() : 'jpg';
    const fileName = `${listingId}-${Date.now()}.${fileExt}`;
    const contentType = options?.contentType || 'image/jpeg';
    const filePath = `listings/${fileName}`;
    
    // Upload the buffer to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, buffer, {
        contentType,
        upsert: false
      });
      
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Get the public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

/**
 * Upload multiple image buffers to Supabase Storage
 * @param buffers Array of buffers to upload
 * @param listingId The ID of the listing the images belong to
 * @param options Additional upload options for each buffer
 * @returns An array of public URLs of the uploaded images
 */
export async function uploadMultipleImages(
  buffers: Buffer[], 
  listingId: string,
  options?: { filename?: string, contentType?: string }[]
): Promise<string[]> {
  const uploadPromises = buffers.map((buffer, index) => {
    const itemOptions = options?.[index];
    return uploadImage(buffer, listingId, itemOptions);
  });
  
  const results = await Promise.all(uploadPromises);
  
  // Filter out null values (failed uploads)
  return results.filter(url => url !== null) as string[];
}

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
    // Handle various path formats correctly
    if (imagePath.startsWith('listings/')) {
      // Path is already prefixed with "listings/"
      return `${supabaseUrl}/storage/v1/object/public/listing-images/${imagePath}`;
    } else if (imagePath.includes('@g.us')) {
      // Path is a WhatsApp message ID format but without "listings/" prefix
      return `${supabaseUrl}/storage/v1/object/public/listing-images/listings/${imagePath}`;
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

/**
 * Delete an image from Supabase Storage
 * @param imageUrl The public URL of the image to delete
 * @returns Whether the deletion was successful
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract the path from the URL
    // Example URL: https://your-project.supabase.co/storage/v1/object/public/listing-images/listings/abc-123.jpg
    const urlParts = imageUrl.split('/');
    const bucketName = urlParts[urlParts.indexOf('public') + 1];
    const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
} 