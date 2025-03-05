import { format } from 'date-fns';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy');
};

export const getConditionColor = (condition: string): { backgroundColor: string, color: string } => {
  // Use the same blue color for all conditions
  return { backgroundColor: '#3b82f6', color: 'white' }; // blue-500
}; 