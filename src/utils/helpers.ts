import { format } from 'date-fns';
import { formatDate as formatDateUtil, formatPrice, formatWhatsAppGroupName } from './formatUtils';

// Re-export the formatting functions for backwards compatibility
export { formatPrice, formatWhatsAppGroupName };

// Legacy date formatting - consider migrating to formatUtils.js
export const formatDate = (dateString: string): string => {
  // If the provided dateString is null or undefined, return a default message
  if (!dateString) return 'Unknown date';
  
  try {
    // Use our new utility function for consistency
    return formatDateUtil(dateString);
  } catch (error) {
    // Fallback to the original implementation
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy');
  }
};

export const getConditionColor = (condition: string): { backgroundColor: string, color: string } => {
  if (!condition) {
    return { backgroundColor: '#6B7280', color: 'white' }; // gray-500
  }
  
  const conditionMap: Record<string, { backgroundColor: string, color: string }> = {
    'New': { backgroundColor: '#10B981', color: 'white' }, // emerald-500
    'Good': { backgroundColor: '#3B82F6', color: 'white' }, // blue-500
    'Fair': { backgroundColor: '#F59E0B', color: 'white' }, // amber-500
    'Used': { backgroundColor: '#6B7280', color: 'white' }, // gray-500
  };
  
  return conditionMap[condition] || { backgroundColor: '#6B7280', color: 'white' }; // gray-500
}; 