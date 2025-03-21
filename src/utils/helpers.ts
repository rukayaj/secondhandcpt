/**
 * Helper Utilities
 * 
 * A collection of various helper functions used throughout the application
 */

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