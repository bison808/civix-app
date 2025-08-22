// Civic engagement analytics for CITZN platform
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Analytics configuration for civic platform
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CIVIC_EVENTS_PREFIX = 'civic_';

// Initialize Google Analytics for civic tracking
export const initializeAnalytics = () => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    custom_map: {
      civic_engagement_type: 'engagement_type',
      political_party: 'party_affiliation',
      user_state: 'state',
      bill_subject: 'legislation_category',
    },
  });
};

// Core civic engagement tracking functions
export const trackCivicEngagement = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParams?: Record<string, any>
) => {
  if (!window.gtag) return;

  window.gtag('event', `${CIVIC_EVENTS_PREFIX}${action}`, {
    event_category: category,
    event_label: label,
    value: value,
    civic_platform: 'CITZN',
    timestamp: new Date().toISOString(),
    ...customParams,
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Civic Analytics]', {
      action: `${CIVIC_EVENTS_PREFIX}${action}`,
      category,
      label,
      value,
      customParams,
    });
  }
};

// Bill interaction tracking
export const trackBillEngagement = (
  billId: string,
  action: 'view' | 'vote_like' | 'vote_dislike' | 'share' | 'favorite' | 'read_full_text' | 'view_voting_record',
  billData?: {
    billNumber?: string;
    title?: string;
    sponsor?: string;
    party?: string;
    chamber?: string;
    subject?: string;
    status?: string;
  }
) => {
  trackCivicEngagement(action, 'Bill_Interaction', billId, 1, {
    bill_number: billData?.billNumber,
    bill_title: billData?.title?.substring(0, 100), // Truncate for analytics
    sponsor_name: billData?.sponsor,
    sponsor_party: billData?.party,
    chamber: billData?.chamber,
    bill_subject: billData?.subject,
    bill_status: billData?.status,
    engagement_depth: getEngagementDepth(action),
  });
};

// Representative interaction tracking
export const trackRepresentativeEngagement = (
  repId: string,
  action: 'view' | 'contact' | 'follow' | 'unfollow' | 'view_voting_record' | 'view_bills' | 'visit_website',
  repData?: {
    name?: string;
    party?: string;
    state?: string;
    chamber?: string;
    district?: string;
  }
) => {
  trackCivicEngagement(action, 'Representative_Interaction', repId, 1, {
    representative_name: repData?.name,
    representative_party: repData?.party,
    representative_state: repData?.state,
    representative_chamber: repData?.chamber,
    representative_district: repData?.district,
    engagement_depth: getEngagementDepth(action),
  });
};

// Search and discovery tracking
export const trackSearchEngagement = (
  query: string,
  resultType: 'bills' | 'representatives' | 'mixed',
  resultsCount: number,
  filters?: Record<string, string>
) => {
  trackCivicEngagement('search', 'Content_Discovery', query, resultsCount, {
    search_type: resultType,
    results_count: resultsCount,
    search_filters: Object.keys(filters || {}).join(','),
    query_length: query.length,
  });
};

// User journey and onboarding tracking
export const trackUserJourney = (
  step: 'zip_entry' | 'registration_start' | 'registration_complete' | 'first_bill_view' | 'first_vote' | 'first_contact',
  zipCode?: string,
  userPreferences?: {
    interests?: string[];
    notifications?: boolean;
  }
) => {
  trackCivicEngagement('journey_step', 'User_Onboarding', step, 1, {
    user_zip_first_three: zipCode?.substring(0, 3), // Privacy: only first 3 digits
    user_interests: userPreferences?.interests?.join(','),
    notifications_enabled: userPreferences?.notifications,
    session_id: getSessionId(),
  });
};

// Civic education tracking
export const trackEducationEngagement = (
  contentType: 'how_bill_becomes_law' | 'understanding_congress' | 'voting_guide' | 'representative_roles',
  action: 'view' | 'complete' | 'share',
  timeSpent?: number
) => {
  trackCivicEngagement('education', 'Civic_Learning', contentType, timeSpent, {
    content_type: contentType,
    education_action: action,
    time_spent_seconds: timeSpent,
    learning_depth: action === 'complete' ? 'high' : action === 'view' ? 'medium' : 'low',
  });
};

// Performance tracking for civic platform
export const trackPerformanceMetric = (
  metric: 'page_load' | 'api_response' | 'search_results' | 'bill_load' | 'rep_load',
  value: number,
  page?: string
) => {
  trackCivicEngagement('performance', 'Site_Performance', metric, Math.round(value), {
    performance_metric: metric,
    page_type: page,
    performance_rating: value < 1000 ? 'good' : value < 3000 ? 'average' : 'poor',
    timestamp: Date.now(),
  });
};

// Accessibility tracking
export const trackAccessibilityUsage = (
  feature: 'keyboard_navigation' | 'screen_reader' | 'high_contrast' | 'text_size_increase',
  action: 'enable' | 'disable' | 'use'
) => {
  trackCivicEngagement('accessibility', 'Platform_Accessibility', feature, 1, {
    accessibility_feature: feature,
    accessibility_action: action,
  });
};

// Error tracking for civic platform
export const trackError = (
  errorType: 'api_error' | 'component_error' | 'network_error' | 'auth_error',
  errorMessage: string,
  context?: string
) => {
  trackCivicEngagement('error', 'Platform_Errors', errorType, 1, {
    error_message: errorMessage.substring(0, 100), // Truncate for privacy
    error_context: context,
    error_severity: getErrorSeverity(errorType),
    user_agent: navigator.userAgent,
  });
};

// A/B test tracking for civic features
export const trackExperiment = (
  experimentName: string,
  variant: string,
  action: 'view' | 'interact' | 'convert'
) => {
  trackCivicEngagement('experiment', 'AB_Testing', experimentName, 1, {
    experiment_name: experimentName,
    experiment_variant: variant,
    experiment_action: action,
  });
};

// Helper functions
function getEngagementDepth(action: string): 'low' | 'medium' | 'high' {
  const highEngagementActions = ['vote_like', 'vote_dislike', 'contact', 'follow', 'share'];
  const mediumEngagementActions = ['read_full_text', 'view_voting_record', 'view_bills'];
  
  if (highEngagementActions.includes(action)) return 'high';
  if (mediumEngagementActions.includes(action)) return 'medium';
  return 'low';
}

function getErrorSeverity(errorType: string): 'low' | 'medium' | 'high' {
  const highSeverityErrors = ['auth_error', 'api_error'];
  const mediumSeverityErrors = ['network_error'];
  
  if (highSeverityErrors.includes(errorType)) return 'high';
  if (mediumSeverityErrors.includes(errorType)) return 'medium';
  return 'low';
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('civic_session_id');
  if (!sessionId) {
    sessionId = `civic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('civic_session_id', sessionId);
  }
  return sessionId;
}

// Custom hooks for tracking
export const useCivicAnalytics = () => {
  const trackPageView = (pageName: string, pageProperties?: Record<string, any>) => {
    if (!window.gtag) return;
    
    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_title: pageName,
      page_location: window.location.href,
      civic_page_type: pageProperties?.type || 'general',
      user_zip: pageProperties?.userZip?.substring(0, 3), // Privacy: first 3 digits only
      ...pageProperties,
    });
  };

  const trackTime = (eventName: string, startTime: number) => {
    const timeSpent = Date.now() - startTime;
    trackCivicEngagement('time_spent', 'User_Engagement', eventName, timeSpent, {
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000),
    });
  };

  return {
    trackPageView,
    trackTime,
    trackBillEngagement,
    trackRepresentativeEngagement,
    trackSearchEngagement,
    trackUserJourney,
    trackEducationEngagement,
    trackPerformanceMetric,
    trackAccessibilityUsage,
    trackError,
    trackExperiment,
  };
};

// Privacy-compliant analytics
export const getCivicInsights = () => {
  // Return aggregated, non-PII insights for the civic platform
  return {
    sessionEngagement: getSessionEngagement(),
    popularBillSubjects: getPopularSubjects(),
    representativeEngagement: getRepresentativeEngagement(),
    searchPatterns: getSearchPatterns(),
  };
};

function getSessionEngagement() {
  const startTime = sessionStorage.getItem('session_start');
  return {
    sessionDuration: startTime ? Date.now() - parseInt(startTime) : 0,
    pagesViewed: parseInt(sessionStorage.getItem('pages_viewed') || '0'),
    billsViewed: parseInt(sessionStorage.getItem('bills_viewed') || '0'),
    votesSubmitted: parseInt(sessionStorage.getItem('votes_submitted') || '0'),
  };
}

function getPopularSubjects() {
  const subjects = JSON.parse(localStorage.getItem('viewed_subjects') || '[]');
  return subjects.slice(0, 5); // Top 5 subjects
}

function getRepresentativeEngagement() {
  return {
    followedCount: JSON.parse(localStorage.getItem('followed_reps') || '[]').length,
    contactedCount: parseInt(localStorage.getItem('contacted_reps_count') || '0'),
  };
}

function getSearchPatterns() {
  const recentSearches = JSON.parse(sessionStorage.getItem('recent_searches') || '[]');
  return {
    searchCount: recentSearches.length,
    mostRecentTopics: recentSearches.slice(0, 3),
  };
}