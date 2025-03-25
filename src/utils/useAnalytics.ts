import { useCallback } from 'react';

type EventName = 
  | 'page_view'
  | 'listing_view'
  | 'listing_search'
  | 'search_results'
  | 'contact_seller'
  | 'filter_use'
  | 'search_query'
  | 'pagination_use'
  | 'sort_listings'
  | 'custom';

type EventProperties = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Custom hook for tracking analytics events.
 * 
 * Usage:
 * ```
 * const { trackEvent } = useAnalytics();
 * 
 * // Track a search event
 * trackEvent('listing_search', { query: 'stroller', category: 'transport' });
 * ```
 */
export function useAnalytics() {
  /**
   * Track a custom event
   */
  const trackEvent = useCallback((eventName: EventName, properties?: EventProperties) => {
    // Only track in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics Event (DEV)]`, eventName, properties);
      return;
    }

    try {
      // Use Vercel's public tracking API
      if (typeof window !== 'undefined' && window.va) {
        window.va('event', {
          name: eventName,
          ...(properties || {}),
        });
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  return { trackEvent };
}

// Add type definitions for Vercel Analytics
declare global {
  interface Window {
    va?: (event: 'event' | 'pageview' | 'beforeSend', properties?: unknown) => void;
  }
} 