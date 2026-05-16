/**
 * Authentication constants and configuration
 */

/**
 * Storage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  SESSION_TOKEN: 'app_session_token',
  REFRESH_TOKEN: 'app_refresh_token',
  USER_INFO: 'manus-runtime-user-info',
  AUTH_STATE: 'app_auth_state',
  LAST_ACTIVITY: 'app_last_activity',
} as const;

/**
 * Session timeout configuration (in milliseconds)
 */
export const SESSION_TIMEOUTS = {
  // Inactivity timeout: 30 minutes
  INACTIVITY: 30 * 60 * 1000,
  
  // Absolute timeout: 24 hours
  ABSOLUTE: 24 * 60 * 60 * 1000,
  
  // Token warning: show warning 5 minutes before expiry
  WARNING: 5 * 60 * 1000,
  
  // Token refresh: refresh when 10 minutes remaining
  REFRESH_THRESHOLD: 10 * 60 * 1000,
} as const;

/**
 * API endpoints for authentication
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  SESSION: '/api/auth/session',
  OAUTH_MOBILE: '/api/oauth/mobile',
  OAUTH_CALLBACK: '/api/oauth/callback',
} as const;

/**
 * OAuth configuration
 */
export const OAUTH_CONFIG = {
  RESPONSE_TYPE: 'code',
  SCOPE: 'openid profile email',
  GRANT_TYPE: 'authorization_code',
} as const;

/**
 * Default retry configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * HTTP status codes that should trigger token refresh
 */
export const REFRESH_TRIGGER_STATUS_CODES = [401, 403] as const;

/**
 * Error messages
 */
export const AUTH_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You are not authenticated. Please login.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Type helpers
 */
export type StorageKey = typeof AUTH_STORAGE_KEYS[keyof typeof AUTH_STORAGE_KEYS];
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
