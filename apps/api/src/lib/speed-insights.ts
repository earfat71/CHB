/**
 * Vercel Speed Insights Integration
 * 
 * Note: Speed Insights is designed for frontend applications to measure Web Vitals
 * (LCP, FID, CLS, TTFB, etc.). Since this is a backend Express API, the Speed Insights
 * package is installed but not actively used.
 * 
 * If this API needs to serve HTML pages in the future, you can use the following
 * approaches:
 * 
 * 1. For server-rendered HTML pages, inject the Speed Insights script:
 *    - Add the script tag to your HTML templates
 *    - Use the injectSpeedInsights() function if serving static HTML
 * 
 * 2. For API responses that include HTML content:
 *    - Consider using the @vercel/speed-insights package to track performance
 * 
 * For now, this module serves as a placeholder and documentation for future use.
 * 
 * If you want to track frontend performance, install Speed Insights in the
 * web application (apps/web) instead, which uses Next.js and is better suited
 * for Speed Insights integration.
 */

import { logger } from './logger';

/**
 * Initialize Speed Insights (placeholder function)
 * Currently not used since this is a backend API
 */
export function initSpeedInsights(): void {
  logger.info('Speed Insights package is installed but not actively used in this backend API');
  logger.info('For frontend performance monitoring, install Speed Insights in apps/web');
}

/**
 * Middleware to inject Speed Insights script into HTML responses
 * Only use if this API starts serving HTML pages
 */
export function speedInsightsMiddleware() {
  return (req: any, res: any, next: any) => {
    // This middleware is a placeholder for potential future use
    // when the API needs to serve HTML content with Speed Insights
    next();
  };
}
