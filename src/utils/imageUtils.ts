/**
 * Utility functions for handling images
 * This is a simplified version that doesn't actually store images
 */

/**
 * Returns a formatted URL for an image path
 * Since we're making the site read-only, this returns a placeholder image URL
 */
export function getFormattedImageUrl(imagePath: string): string {
  // The site is now read-only, so we return placeholder images
  return `https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Placeholder`;
} 