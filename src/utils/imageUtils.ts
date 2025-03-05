/**
 * Utility functions for handling images
 */

// Map of available images in the public directory
// This will be populated at build time
export const availableImages: Set<string> = new Set([
  // Images from the public/images/listings directory
  'IMG-20241009-WA0016.jpg',
  'IMG-20241117-WA0022.jpg',
  'IMG-20250220-WA0011.jpg',
  'IMG-20250224-WA0019.jpg',
  'IMG-20250224-WA0021.jpg',
  'IMG-20250224-WA0022.jpg',
  'IMG-20250224-WA0023.jpg',
  'IMG-20250224-WA0024.jpg',
  'IMG-20250224-WA0025.jpg',
  'IMG-20250224-WA0029.jpg',
  'IMG-20250225-WA0002.jpg',
  'IMG-20250225-WA0005.jpg',
  'IMG-20250225-WA0020.jpg',
  'IMG-20250225-WA0023.jpg',
  'IMG-20250225-WA0025.jpg',
  'IMG-20250225-WA0027.jpg',
  'IMG-20250225-WA0030.jpg',
  'IMG-20250225-WA0031.jpg',
  'IMG-20250225-WA0032.jpg',
  'IMG-20250225-WA0033.jpg',
  'IMG-20250225-WA0034.jpg',
  'IMG-20250225-WA0035.jpg',
  'IMG-20250225-WA0036.jpg',
  'IMG-20250225-WA0037.jpg',
  'IMG-20250225-WA0038.jpg',
  'IMG-20250225-WA0039.jpg',
  'IMG-20250225-WA0049.jpg',
  'IMG-20250225-WA0050.jpg',
  'IMG-20250225-WA0051.jpg',
  'IMG-20250225-WA0052.jpg',
  'IMG-20250226-WA0001.jpg',
  'IMG-20250226-WA0004.jpg',
  'IMG-20250226-WA0005.jpg',
  'IMG-20250226-WA0006.jpg',
  'IMG-20250226-WA0012.jpg',
  'IMG-20250226-WA0013.jpg',
  'IMG-20250226-WA0014.jpg',
  'IMG-20250226-WA0021.jpg',
  'IMG-20250226-WA0022.jpg',
  'IMG-20250226-WA0027.jpg',
  'IMG-20250226-WA0028.jpg',
  'IMG-20250226-WA0029.jpg',
  'IMG-20250226-WA0030.jpg',
  'IMG-20250226-WA0031.jpg',
  'IMG-20250226-WA0032.jpg',
  'IMG-20250226-WA0034.jpg',
  'IMG-20250226-WA0035.jpg',
  'IMG-20250226-WA0036.jpg',
  'IMG-20250226-WA0037.jpg',
  'IMG-20250226-WA0038.jpg',
  'IMG-20250227-WA0018.jpg',
  'IMG-20250303-WA0018.jpg',
]);

/**
 * Get a valid image path for a listing image
 * @param imagePath The original image path from the listing data
 * @param category The category for the placeholder if needed
 * @returns A valid image path that points to an actual image file
 */
export function getValidImagePath(imagePath: string, category?: string | null): string {
  // If the path is empty or invalid, return a placeholder
  if (!imagePath) {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
  }

  // Extract the filename from the path
  const filename = imagePath.split('/').pop();
  if (!filename) {
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
  }
  
  // Ensure the path starts with /images/listings/
  const basePath = '/images/listings/';
  
  // Check if the exact image exists in our available images set
  if (availableImages.has(filename)) {
    return `${basePath}${filename}`;
  }
  
  // Extract the WA code part (e.g., "WA0018.jpg" from "IMG-20250228-WA0018.jpg")
  const match = filename.match(/WA\d+\.jpg$/);
  if (match) {
    const waCode = match[0];
    
    // Find any image with the same WA code
    for (const availableImage of Array.from(availableImages)) {
      if (availableImage.endsWith(waCode)) {
        console.log(`Found alternative image for ${filename}: ${availableImage}`);
        return `${basePath}${availableImage}`;
      }
    }
  }
  
  // If no matching image found, return a placeholder
  return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
} 