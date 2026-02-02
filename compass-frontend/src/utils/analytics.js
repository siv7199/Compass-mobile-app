/**
 * PostHog Analytics Utility for Compass App
 * 
 * Provides centralized analytics tracking with PostHog.
 * 
 * Environment Behavior:
 * - DEV (__DEV__ = true): Analytics are disabled (opt_out_capturing)
 * - PRODUCTION (__DEV__ = false): Analytics are enabled automatically
 * 
 * Internal users (admin emails) are flagged for exclusion from conversion funnels.
 */

import PostHog from 'posthog-react-native';

// PostHog Configuration
const POSTHOG_API_KEY = 'phc_2cNmdXyxKIX8EqX8t56lFUSbbzzD2Z4vzqGxxrcBb9U';
const POSTHOG_HOST = 'https://us.i.posthog.com';

// Admin/Internal emails - add your admin emails here
// These users will be flagged as 'internal' and excluded from main funnels
const INTERNAL_EMAILS = [
    'sid.vangara@gmail.com',
];

// PostHog client instance
let posthogClient = null;
let isOptedOut = false;

/**
 * Check if an email belongs to an internal user
 */
function isInternalUser(email) {
    if (!email) return false;
    return INTERNAL_EMAILS.some(adminEmail =>
        email.toLowerCase() === adminEmail.toLowerCase()
    );
}

/**
 * Initialize PostHog analytics
 * Call this once at app startup (in App.js)
 * 
 * In DEV mode (__DEV__ = true), capturing is disabled.
 * In PRODUCTION (__DEV__ = false), capturing is enabled automatically.
 */
export async function initAnalytics() {
    try {
        posthogClient = await PostHog.initAsync(POSTHOG_API_KEY, {
            host: POSTHOG_HOST,
            enableSessionReplay: !__DEV__, // Only enable session replay in production
            sessionReplayConfig: {
                maskAllTextInputs: false,
                maskAllImages: false,
            },
        });

        // Gate analytics based on environment
        if (__DEV__) {
            posthogClient.optOut();
            isOptedOut = true;
            console.log('[Analytics] DEV MODE - Analytics disabled (opt_out_capturing)');
        } else {
            console.log('[Analytics] PRODUCTION MODE - Analytics enabled');
        }

        return true;
    } catch (error) {
        console.error('[Analytics] Failed to initialize PostHog:', error);
        return false;
    }
}

/**
 * Identify a user (call after signup/login or profile completion)
 * Internal users are flagged with user_type: 'internal' for funnel exclusion
 * 
 * @param {string} userId - Unique identifier for the user
 * @param {object} properties - User properties (name, email, etc.)
 */
export function identify(userId, properties = {}) {
    if (!posthogClient || isOptedOut) {
        if (__DEV__) console.log('[Analytics] DEV - Skipping identify:', userId);
        return;
    }

    try {
        // Check if this is an internal user
        const isInternal = isInternalUser(properties.email);

        const enrichedProperties = {
            ...properties,
            user_type: isInternal ? 'internal' : 'user',
            is_internal: isInternal,
        };

        posthogClient.identify(userId, enrichedProperties);

        if (isInternal) {
            console.log('[Analytics] Internal user identified (excluded from main funnels):', userId);
        } else {
            console.log('[Analytics] User identified:', userId);
        }
    } catch (error) {
        console.error('[Analytics] Failed to identify user:', error);
    }
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} properties - Event properties
 */
export function track(eventName, properties = {}) {
    if (!posthogClient || isOptedOut) {
        if (__DEV__) console.log('[Analytics] DEV - Skipping track:', eventName);
        return;
    }

    try {
        posthogClient.capture(eventName, properties);
        console.log('[Analytics] Event tracked:', eventName, properties);
    } catch (error) {
        console.error('[Analytics] Failed to track event:', error);
    }
}

/**
 * Reset analytics (call on logout)
 */
export function resetAnalytics() {
    if (!posthogClient) return;

    try {
        posthogClient.reset();
        console.log('[Analytics] Analytics reset');
    } catch (error) {
        console.error('[Analytics] Failed to reset:', error);
    }
}

/**
 * Manually opt in to analytics (e.g., after user consent)
 */
export function optIn() {
    if (!posthogClient) return;
    posthogClient.optIn();
    isOptedOut = false;
    console.log('[Analytics] Opted in to analytics');
}

/**
 * Manually opt out of analytics
 */
export function optOut() {
    if (!posthogClient) return;
    posthogClient.optOut();
    isOptedOut = true;
    console.log('[Analytics] Opted out of analytics');
}

// ===== Event Name Constants =====
// Use these to ensure consistent event naming across the app

export const EVENTS = {
    // Onboarding & User Journey
    ONBOARDING_COMPLETED: 'onboarding_completed',
    USER_PROFILE_CREATED: 'user_profile_created',

    // Search & Discovery
    SEARCH_RESULTS_VIEWED: 'search_results_viewed',
    SCHOOL_PROFILE_ENGAGED: 'school_profile_engaged',

    // Cost Analysis
    COST_ANALYSIS_VIEWED: 'cost_analysis_viewed',

    // Zero-Day Simulator
    ZERO_DAY_SIMULATOR_RUN: 'zero_day_simulator_run',
    SIMULATION_SAVED: 'simulation_saved',

    // Portfolio Actions
    SCHOOL_SAVED: 'school_saved',
    SCHOOL_REMOVED: 'school_removed',
    SCENARIO_CREATED: 'scenario_created',
};

export default {
    initAnalytics,
    identify,
    track,
    resetAnalytics,
    optIn,
    optOut,
    EVENTS,
};
