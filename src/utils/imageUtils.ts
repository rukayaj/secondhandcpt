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
]);

/**
 * Get a valid image path or a placeholder
 * @param imagePath The original image path
 * @param category The category for the placeholder
 * @returns A valid image path or a placeholder
 */
export function getValidImagePath(imagePath: string, category?: string | null): string {
  // Extract the filename from the path
  const filename = imagePath.split('/').pop();
  
  // Check if the image exists in our available images
  if (filename && availableImages.has(filename)) {
    return imagePath;
  }
  
  // If we have a similar image (same pattern but different date), use that
  if (filename) {
    const pattern = filename.replace(/IMG-\d{8}-/, '');
    for (const availableImage of Array.from(availableImages)) {
      if (availableImage.endsWith(pattern)) {
        return `/images/listings/${availableImage}`;
      }
    }
  }
  
  // Otherwise, return a placeholder
  return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(category || 'No Image')}`;
} 