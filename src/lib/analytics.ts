// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) return;

  // Create dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Initialize GA
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_title: title || document.title,
    page_location: url,
  });
};

// Custom event tracking
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export const trackEvent = ({ action, category, label, value, custom_parameters }: AnalyticsEvent) => {
  if (!GA_TRACKING_ID || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_parameters,
  });
};

// Predefined event tracking functions
export const trackArticleView = (articleId: string, title: string, category?: string) => {
  trackEvent({
    action: 'view_article',
    category: 'engagement',
    label: title,
    custom_parameters: {
      article_id: articleId,
      article_category: category,
    },
  });
};

export const trackArticleShare = (articleId: string, title: string, platform: string) => {
  trackEvent({
    action: 'share_article',
    category: 'engagement',
    label: title,
    custom_parameters: {
      article_id: articleId,
      share_platform: platform,
    },
  });
};

export const trackNewsletterSignup = (source: string) => {
  trackEvent({
    action: 'newsletter_signup',
    category: 'conversion',
    label: source,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultsCount,
  });
};

export const trackFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent({
    action: 'use_filter',
    category: 'navigation',
    label: `${filterType}: ${filterValue}`,
  });
};

export const trackReadingProgress = (articleId: string, percentage: number) => {
  // Only track at 25%, 50%, 75%, and 100%
  if (percentage % 25 !== 0) return;

  trackEvent({
    action: 'reading_progress',
    category: 'engagement',
    label: `${percentage}%`,
    value: percentage,
    custom_parameters: {
      article_id: articleId,
    },
  });
};

export const trackDownload = (fileName: string, fileType: string) => {
  trackEvent({
    action: 'download',
    category: 'engagement',
    label: fileName,
    custom_parameters: {
      file_type: fileType,
    },
  });
};

export const trackOutboundLink = (url: string, linkText?: string) => {
  trackEvent({
    action: 'click_outbound_link',
    category: 'engagement',
    label: linkText || url,
    custom_parameters: {
      outbound_url: url,
    },
  });
};

// E-commerce tracking (for future premium features)
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  trackEvent({
    action: 'purchase',
    category: 'ecommerce',
    custom_parameters: {
      transaction_id: transactionId,
      value: value,
      currency: currency,
    },
  });
};

// User engagement metrics
export const trackTimeOnPage = (seconds: number, pageType: string) => {
  trackEvent({
    action: 'time_on_page',
    category: 'engagement',
    value: seconds,
    custom_parameters: {
      page_type: pageType,
    },
  });
};