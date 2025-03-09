import { supabase } from '@/utils/supabase';

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param listingId The ID of the listing the image belongs to
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, listingId: string): Promise<string | null> {
  try {
    // Get file extension
    const fileExt = file.name.split('.').pop();
    // Create a unique filename
    const fileName = `${listingId}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file);
      
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
 * Upload multiple images to Supabase Storage
 * @param files The files to upload
 * @param listingId The ID of the listing the images belong to
 * @returns An array of public URLs of the uploaded images
 */
export async function uploadMultipleImages(files: File[], listingId: string): Promise<string[]> {
  const uploadPromises = Array.from(files).map(file => uploadImage(file, listingId));
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
  // Check if the image path is a valid URL or starts with a slash
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's a relative path without a leading slash, add one
  if (imagePath && !imagePath.startsWith('/')) {
    return `/${imagePath}`;
  }
  
  // If it's a test image, use a placeholder
  if (imagePath.includes('test-image')) {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=No%20Image`;
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