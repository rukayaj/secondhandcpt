import Script from 'next/script';
import React from 'react';

interface AnalyticsProps {
  /**
   * Set to false to disable analytics in development
   */
  enabled?: boolean;
}

/**
 * Analytics component that integrates Cloudflare Web Analytics
 * Add this to your root layout component
 */
const Analytics: React.FC<AnalyticsProps> = ({ enabled = true }) => {
  // Only enable analytics in production by default
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldEnable = enabled && isProduction;

  if (!shouldEnable) {
    return null;
  }

  return (
    <Script
      defer
      src='https://static.cloudflareinsights.com/beacon.min.js'
      data-cf-beacon='{"token": "2611147d2cb541859a111c0d78594b87"}'
    />
  );
};

export default Analytics; 