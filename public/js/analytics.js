/* global gtag */
/**
 * Google Analytics 4 Event Tracking Utilities
 *
 * This module provides functions to track job application events
 * based on application status changes in the job portal.
 */

/**
 * Track job application status change events
 * @param {string} status - The application status (applied, hired, rejected)
 * @param {string} jobRoleId - The job role ID
 * @param {object} additionalData - Optional additional event parameters
 */
function trackApplicationStatusChange(status, jobRoleId, additionalData = {}) {
  // Check if Google Analytics is loaded
  if (typeof gtag !== 'undefined') {
    const eventData = {
      event_category: 'job_applications',
      event_label: status,
      job_role_id: jobRoleId,
      application_status: status,
      value: 1,
      ...additionalData,
    };

    // Send the event to Google Analytics
    gtag('event', 'application_status_change', eventData);

    // Also send specific event names for easier filtering
    gtag('event', `application_${status}`, eventData);

    console.log(`Analytics: Tracked status change to ${status} for job ${jobRoleId}`, eventData);
  } else {
    console.warn('Google Analytics (gtag) not loaded - tracking event would be:', {
      status,
      jobRoleId,
      additionalData,
    });
  }
}

/**
 * Track when a new job application is created (status: applied)
 * @param {string} jobRoleId - The job role ID
 * @param {string} jobRoleName - Optional job role name for better reporting
 */
function trackApplicationCreated(jobRoleId, jobRoleName = null) {
  const additionalData = {};
  if (jobRoleName) {
    additionalData.job_role_name = jobRoleName;
  }

  trackApplicationStatusChange('applied', jobRoleId, additionalData);
}

/**
 * Track when an application is hired (status: hired)
 * @param {string} jobRoleId - The job role ID
 * @param {string} jobRoleName - Optional job role name for better reporting
 */
function trackApplicationHired(jobRoleId, jobRoleName = null) {
  const additionalData = {};
  if (jobRoleName) {
    additionalData.job_role_name = jobRoleName;
  }

  trackApplicationStatusChange('hired', jobRoleId, additionalData);
}

/**
 * Track when an application is rejected (status: rejected)
 * @param {string} jobRoleId - The job role ID
 * @param {string} jobRoleName - Optional job role name for better reporting
 */
function trackApplicationRejected(jobRoleId, jobRoleName = null) {
  const additionalData = {};
  if (jobRoleName) {
    additionalData.job_role_name = jobRoleName;
  }

  trackApplicationStatusChange('rejected', jobRoleId, additionalData);
}

/**
 * Track custom events related to job applications
 * @param {string} eventName - Custom event name
 * @param {object} eventData - Event data object
 */
function trackCustomJobEvent(eventName, eventData = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      event_category: 'job_applications',
      ...eventData,
    });

    console.log(`Analytics: Tracked custom event ${eventName}`, eventData);
  } else {
    console.warn('Google Analytics (gtag) not loaded - custom event would be:', {
      eventName,
      eventData,
    });
  }
}

/**
 * Initialize Google Analytics with configuration
 * @param {string} measurementId - GA4 Measurement ID
 */
function initializeAnalytics(measurementId) {
  if (typeof gtag !== 'undefined') {
    gtag('config', measurementId, {
      // Enable enhanced measurement for better tracking
      enhanced_measurement: true,
      // Track page views automatically
      page_view: true,
    });

    console.log('Analytics: Initialized with measurement ID:', measurementId);
  } else {
    console.error('Google Analytics (gtag) not loaded - cannot initialize');
  }
}

// Make functions available globally
window.trackApplicationCreated = trackApplicationCreated;
window.trackApplicationHired = trackApplicationHired;
window.trackApplicationRejected = trackApplicationRejected;
window.trackCustomJobEvent = trackCustomJobEvent;
window.trackApplicationStatusChange = trackApplicationStatusChange;
window.initializeAnalytics = initializeAnalytics;
