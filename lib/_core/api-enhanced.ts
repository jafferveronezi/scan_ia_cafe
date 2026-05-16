/**
 * Enhanced API client with retry logic, error handling, and token management
 */

import { Platform } from 'react-native';
import { getApiBaseUrl } from '@/constants/oauth';
import { authService } from './auth-service';
import { logger } from './logger';
import { AppError, AuthError, NetworkError, classifyHttpError } from './errors';
import { RETRY_CONFIG, AUTH_ERROR_MESSAGES } from '@/constants/auth';

const MODULE_NAME = 'API';

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Sleep for a given duration (helper for retry backoff)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Enhanced API call with retry logic
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retryConfig?: RetryConfig,
): Promise<T> {
  const {
    maxRetries = RETRY_CONFIG.MAX_RETRIES,
    initialDelay = RETRY_CONFIG.INITIAL_DELAY,
    maxDelay = RETRY_CONFIG.MAX_DELAY,
    backoffMultiplier = RETRY_CONFIG.BACKOFF_MULTIPLIER,
  } = retryConfig || {};

  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await makeApiCall<T>(endpoint, options);
    } catch (error) {
      lastError = error as AppError;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (lastError instanceof AppError) {
        const shouldRetry =
          lastError.statusCode === 429 || // Rate limit
          (lastError.statusCode || 0) >= 500; // Server errors

        if (!shouldRetry) {
          throw error;
        }
      }

      // Don't retry if max attempts reached
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate backoff and retry
      const delay = calculateBackoffDelay(attempt + 1, initialDelay, maxDelay, backoffMultiplier);
      logger.warn(MODULE_NAME, `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
        endpoint,
        statusCode: lastError.statusCode,
      });

      await sleep(delay);
    }
  }

  throw lastError || new AppError('API call failed after retries', 'UNKNOWN_ERROR', 'error');
}

/**
 * Internal API call implementation
 */
async function makeApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add authorization header for native platforms
  if (Platform.OS !== 'web') {
    const sessionToken = await authService.getSessionToken();
    logger.debug(MODULE_NAME, 'makeApiCall', {
      endpoint,
      hasToken: !!sessionToken,
      method: options.method || 'GET',
    });

    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
  } else {
    logger.debug(MODULE_NAME, 'makeApiCall', {
      endpoint,
      platform: 'web',
      method: options.method || 'GET',
    });
  }

  const baseUrl = getApiBaseUrl();
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${cleanBaseUrl}${cleanEndpoint}` : endpoint;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    logger.debug(MODULE_NAME, 'Response received', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as is
      }

      const error = classifyHttpError(response.status, errorMessage || 'API call failed');
      logger.error(MODULE_NAME, 'API error response', error, {
        endpoint,
        status: response.status,
      });

      throw error;
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = (text ? JSON.parse(text) : {}) as T;
    }

    logger.debug(MODULE_NAME, 'API response parsed', { endpoint });
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new NetworkError(
        AUTH_ERROR_MESSAGES.NETWORK_ERROR,
        error as Error,
        { endpoint },
      );
      logger.error(MODULE_NAME, 'Network error', networkError);
      throw networkError;
    }

    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }

    // Wrap unknown errors
    const unknownError = new AppError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      'error',
      undefined,
      error as Error,
      { endpoint },
    );
    logger.error(MODULE_NAME, 'Unknown API error', unknownError);
    throw unknownError;
  }
}

/**
 * Exchange OAuth code for session token
 */
export async function exchangeOAuthCode(
  code: string,
  state: string,
): Promise<{ sessionToken: string; expiresIn: number; user: any }> {
  logger.info(MODULE_NAME, 'Exchanging OAuth code for session token');

  try {
    const params = new URLSearchParams({ code, state });
    const endpoint = `/api/oauth/mobile?${params.toString()}`;

    const result = await apiCall<{
      app_session_id: string;
      expires_in: number;
      user: any;
    }>(endpoint);

    logger.info(MODULE_NAME, 'OAuth exchange successful', {
      hasToken: !!result.app_session_id,
      hasUser: !!result.user,
    });

    return {
      sessionToken: result.app_session_id,
      expiresIn: result.expires_in || 86400, // Default 24 hours
      user: result.user,
    };
  } catch (error) {
    logger.error(MODULE_NAME, 'OAuth exchange failed', error);
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    logger.info(MODULE_NAME, 'Logging out user');

    await apiCall<void>('/api/auth/logout', {
      method: 'POST',
    });

    await authService.clearSession();
    logger.info(MODULE_NAME, 'Logout successful');
  } catch (error) {
    logger.error(MODULE_NAME, 'Logout failed', error);
    // Clear session even if API call fails
    await authService.clearSession();
  }
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
} | null> {
  try {
    logger.debug(MODULE_NAME, 'Fetching current user info');

    const result = await apiCall<{ user: any }>('/api/auth/me');
    const user = result.user || null;

    logger.debug(MODULE_NAME, 'Current user info retrieved', {
      hasUser: !!user,
    });

    return user;
  } catch (error) {
    logger.error(MODULE_NAME, 'Failed to get current user', error);
    return null;
  }
}

/**
 * Establish session cookie on backend
 */
export async function establishSession(token: string): Promise<boolean> {
  try {
    logger.info(MODULE_NAME, 'Establishing session cookie on backend');

    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/api/auth/session`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      logger.error(MODULE_NAME, 'Failed to establish session', undefined, {
        status: response.status,
      });
      return false;
    }

    logger.info(MODULE_NAME, 'Session cookie established');
    return true;
  } catch (error) {
    logger.error(MODULE_NAME, 'Error establishing session', error);
    return false;
  }
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<{
  sessionToken: string;
  expiresIn: number;
} | null> {
  try {
    logger.info(MODULE_NAME, 'Refreshing authentication token');

    const result = await apiCall<{
      app_session_id: string;
      expires_in: number;
    }>('/api/auth/refresh', {
      method: 'POST',
    });

    const tokenData = {
      sessionToken: result.app_session_id,
      expiresIn: result.expires_in || 86400,
    };

    await authService.setSessionToken(tokenData.sessionToken, tokenData.expiresIn);

    logger.info(MODULE_NAME, 'Token refresh successful', {
      expiresIn: tokenData.expiresIn,
    });

    return tokenData;
  } catch (error) {
    logger.error(MODULE_NAME, 'Token refresh failed', error);

    // If refresh fails due to auth error, clear session
    if (error instanceof AuthError && error.type === 'UNAUTHORIZED') {
      await authService.clearSession();
    }

    return null;
  }
}
