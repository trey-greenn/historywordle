'use client';

/**
 * Custom hook for tracking user activity with Google Analytics
 */
export function useAnalytics() {
  /**
   * Track a custom event
   * @param action - The event action name
   * @param params - Additional parameters for the event
   */
  const trackEvent = (
    action: string,
    {
      category = '',
      label = '',
      value = '',
    }: {
      category?: string;
      label?: string;
      value?: string | number;
    } = {}
  ) => {
    // Ensure gtag is available
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  /**
   * Track page views
   * @param url - The URL to track
   * @param title - The page title
   */
  const trackPageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-9CE35036GB', {
        page_path: url,
        page_title: title,
      });
    }
  };

  return { trackEvent, trackPageView };
}

// Add TypeScript support for window.gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      actionOrTarget: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
} 