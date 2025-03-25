# Analytics Setup for Nifty Thrifty

This project uses Vercel Analytics to track usage and performance metrics. Here's how it's set up:

## 1. Configuration

- Vercel Analytics is enabled in `next.config.js`
- The `@vercel/analytics` and `@vercel/speed-insights` packages have been installed

## 2. Components Added

- `src/components/Analytics.tsx` - Core component that includes Vercel Analytics and Speed Insights
- `src/utils/useAnalytics.ts` - Custom hook for tracking events

## 3. Integration Points

The analytics have been integrated at these key points:

- **Layout Component** - Base analytics tracking for all pages
- **Listings Page** - Event tracking for:
  - Search events
  - Filter usage
  - Pagination
  - Listing views

## 4. Custom Events Being Tracked

- `'page_view'` - Automatic page views 
- `'listing_view'` - When users click on a listing
- `'listing_search'` - When search queries are executed
- `'search_results'` - After search results are returned
- `'contact_seller'` - When users contact a seller
- `'filter_use'` - When users adjust filters
- `'pagination_use'` - When users navigate between pages

## 5. How to Access Analytics

1. Log into the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Click on "Analytics" in the sidebar
4. View metrics on:
   - Page views
   - Visitors
   - Countries
   - Devices
   - Custom events

## 6. Add Custom Tracking

You can add custom event tracking to any component using the `useAnalytics` hook:

```tsx
import { useAnalytics } from '@/utils/useAnalytics';

function YourComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleAction = () => {
    trackEvent('custom', {
      action: 'button_click',
      buttonName: 'contact_form_submit'
    });
    
    // Rest of your code
  };
  
  return <button onClick={handleAction}>Click Me</button>;
}
```

## 7. Additional Analytics Options

If you need more advanced analytics, consider:

1. **Google Analytics** - For more detailed user journey tracking
2. **Hotjar** - For heatmaps and session recordings
3. **Mixpanel** - For event-based analytics and funnels
4. **PostHog** - Open-source product analytics 