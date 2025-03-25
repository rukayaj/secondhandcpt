/**
 * Utility Functions
 * 
 * A collection of various utility functions used throughout the application
 * for formatting, display, and other common operations.
 */

/**
 * Format a price for display
 * 
 * @param price The price as a number or string
 * @returns Formatted price string with R symbol
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === '') {
    return 'Price not specified';
  }
  
  // Convert string to number if needed
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number
  if (isNaN(numericPrice)) {
    return 'Price not specified';
  }
  
  return `R${numericPrice.toFixed(2)}`;
}

/**
 * Format a date for display
 * 
 * @param dateStr ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "No date";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

/**
 * Get a color based on the condition of an item
 * 
 * @param condition The condition string
 * @returns A CSS color class or hex color
 */
export function getConditionColor(condition: string | null | undefined): string {
  if (!condition) return '#6B7280'; // Default gray
  
  const colorMap: Record<string, string> = {
    'New': '#10B981',      // Green for new
    'Like New': '#22C55E', // Light green for like new
    'Good': '#3B82F6',     // Blue for good
    'Fair': '#F59E0B',     // Amber for fair
    'Poor': '#EF4444',     // Red for poor
  };
  
  return colorMap[condition] || '#6B7280'; // Default to gray if condition not found
} 