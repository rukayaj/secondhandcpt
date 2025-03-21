/**
 * Format Utilities
 * 
 * A collection of formatting utilities for display values in the frontend
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
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 