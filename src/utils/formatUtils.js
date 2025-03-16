/**
 * Format Utilities
 * 
 * This module provides functions for formatting and displaying data
 * in a user-friendly way throughout the application.
 */

// WhatsApp group ID to name mapping
// This should be kept in sync with the WHATSAPP_GROUPS in importUtils.js
const WHATSAPP_GROUP_NAMES = {
  '120363139582792913@g.us': 'Nifty Thrifty Modern Cloth Nappies',
  '120363190438741302@g.us': 'Nifty Thrifty 0-1 year (2)',
  '120363068687931519@g.us': 'Nifty Thrifty Bumps & Boobs',
  '27787894429-1623257234@g.us': 'Nifty Thrifty 0-1 year (1)',
  '120363172946506359@g.us': 'Nifty Thrifty 1-3 years',
  '120363315487735378@g.us': 'Nifty Thrifty Kids (3-8 years) 2'
};

/**
 * Convert a WhatsApp group ID to its display name
 * @param {string} groupId - WhatsApp group ID
 * @returns {string} - Display name for the group
 */
export function formatWhatsAppGroupName(groupId) {
  return WHATSAPP_GROUP_NAMES[groupId] || 'Unknown Group';
}

/**
 * Format a price string to a consistent format
 * @param {string|number} price - Price value
 * @returns {string} - Formatted price string
 */
export function formatPrice(price) {
  if (!price && price !== 0) return 'Price not specified';
  
  // If price is a number or can be converted to a number
  const numericPrice = typeof price === 'number' ? price : Number(price.replace(/[^\d.-]/g, ''));
  
  if (!isNaN(numericPrice)) {
    // Format with R currency symbol if it doesn't already have one
    if (numericPrice === 0) return 'Free';
    return price.toString().includes('R') ? price : `R${numericPrice}`;
  }
  
  // If price couldn't be converted to a number, return as is
  return price;
}

/**
 * Format a date to a user-friendly string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'Unknown date';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  // Calculate how long ago the date was
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    // Format as readable date for older listings
    return dateObj.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 