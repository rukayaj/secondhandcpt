import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import React from 'react';

interface AnalyticsProps {
  /**
   * Set to false to disable analytics in development
   */
  enabled?: boolean;
}

/**
 * Analytics component that integrates Vercel Analytics and Speed Insights
 * Add this to your root layout component
 */
const Analytics: React.FC<AnalyticsProps> = ({ enabled = true }) => {
  // Only enable analytics in production by default
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldEnable = enabled && isProduction;

  return (
    <>
      <VercelAnalytics debug={!isProduction} />
      <SpeedInsights />
    </>
  );
};

export default Analytics; 